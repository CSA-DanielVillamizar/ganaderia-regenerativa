import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('PaddockController (Integration) - P0.2', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let farmId: string;
  let paddockId: string;
  let herdId: string;
  let userId: string;

  // Mock user object for guard override
  const mockUser = { id: '', email: 'test-p02@example.com' };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Setup data
    const user = await prisma.user.create({
      data: {
        email: `test-p02-${Date.now()}@example.com`,
        password: 'hashed',
        name: 'P0.2 Tester',
        role: 'ADMIN',
      },
    });
    userId = user.id;
    mockUser.id = userId; // Actualizar el ID en el objeto de referencia

    const farm = await prisma.farm.create({
      data: {
        name: 'Test Farm P0.2',
        location: 'Test Farm',
        createdBy: userId,
        updatedBy: userId,
      },
    });
    farmId = farm.id;

    await prisma.userFarm.create({
      data: {
        userId,
        farmId,
      },
    });

    const paddock = await prisma.paddock.create({
      data: {
        name: 'Test Paddock',
        hectares: 5,
        farmId,
        createdBy: userId,
        updatedBy: userId,
      },
    });
    paddockId = paddock.id;

    const herd = await prisma.herd.create({
      data: {
        name: 'Test Herd',
        initialWeight: 5000,
        animalCount: 50,
        farmId,
        createdBy: userId,
        updatedBy: userId,
        currentUA: 10, // 5000kg @ 450kg = 11.11 UA, aproximado a 10 para el test
      },
    });
    herdId = herd.id;

    // Create auth token (mocked JWT for testing)
    authToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
  }, 30000);

  afterAll(async () => {
    // Cleanup
    await prisma.movement.deleteMany({ where: { paddockId } });
    await prisma.paddock.delete({ where: { id: paddockId } });
    await prisma.herd.delete({ where: { id: herdId } });
    await prisma.userFarm.delete({
      where: { userId_farmId: { userId, farmId } },
    });
    await prisma.farm.delete({ where: { id: farmId } });
    await prisma.user.delete({ where: { id: userId } });
    
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /paddocks/:id/stocking-rate', () => {
    it('debería retornar 0 UA/ha cuando no hay movimiento activo', async () => {
      const response = await request(app.getHttpServer())
        .get(`/paddocks/${paddockId}/stocking-rate`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.ua).toBe(0);
      expect(response.body.uaPerHectare).toBe(0);
      expect(response.body.herdName).toBeNull();
    });

    it('debería calcular carga animal cuando hay movimiento activo', async () => {
      // Create active movement
      const movement = await prisma.movement.create({
        data: {
          herdId,
          paddockId,
          type: 'ROTATION',
          status: 'ACTIVE',
          entryDate: new Date(),
          createdBy: userId,
          updatedBy: userId,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/paddocks/${paddockId}/stocking-rate`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.ua).toBe(10);
      expect(response.body.uaPerHectare).toBe(2); // 10 UA / 5 ha = 2 UA/ha
      expect(response.body.herdName).toBe('Test Herd');
      expect(response.body.startDate).toBeDefined();

      // Cleanup
      await prisma.movement.delete({ where: { id: movement.id } });
    });

    it('debería retornar 0 si herd no tiene currentUA', async () => {
      // Create herd without currentUA
      const herdNoUA = await prisma.herd.create({
        data: {
          name: 'Herd Without UA',
          initialWeight: 0,
          animalCount: 30,
          farmId,
          createdBy: userId,
          updatedBy: userId,
          currentUA: null,
        },
      });

      const movement = await prisma.movement.create({
        data: {
          herdId: herdNoUA.id,
          paddockId,
          type: 'ROTATION',
          status: 'ACTIVE',
          entryDate: new Date(),
          createdBy: userId,
          updatedBy: userId,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/paddocks/${paddockId}/stocking-rate`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.ua).toBe(0);
      expect(response.body.uaPerHectare).toBe(0);

      // Cleanup
      await prisma.movement.delete({ where: { id: movement.id } });
      await prisma.herd.delete({ where: { id: herdNoUA.id } });
    });

    it('debería rechazar si usuario no tiene acceso', async () => {
      const _response = await request(app.getHttpServer())
        .get(`/paddocks/${paddockId}/stocking-rate`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
