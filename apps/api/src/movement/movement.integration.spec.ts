import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('MovementController (Integration) - P0.1', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let farmId: string;
  let herdId: string;
  let paddock1Id: string;
  let paddock2Id: string;
  let userId: string;

  // Mock user object for guard override
  const mockUser = { id: '', email: 'test-movement@test.com' };

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
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Setup: Crear usuario, finca, lote y potreros
    const user = await prisma.user.create({
      data: {
        email: 'test-movement@test.com',
        password: '$2a$10$abcdefghijklmnopqrstuv', // hash mock
        name: 'Test User',
        role: 'MANAGER',
      },
    });
    userId = user.id;
    mockUser.id = userId; // Actualizar el ID en el objeto de referencia

    const farm = await prisma.farm.create({
      data: {
        name: 'Finca Test P0.1',
        hectares: 100,
      },
    });
    farmId = farm.id;

    await prisma.userFarm.create({
      data: {
        userId: user.id,
        farmId: farm.id,
      },
    });

    const herd = await prisma.herd.create({
      data: {
        farmId: farm.id,
        name: 'Lote Test',
        initialWeight: 4500,
        animalCount: 10,
      },
    });
    herdId = herd.id;

    const paddock1 = await prisma.paddock.create({
      data: {
        farmId: farm.id,
        name: 'Potrero Norte',
        hectares: 5,
      },
    });
    paddock1Id = paddock1.id;

    const paddock2 = await prisma.paddock.create({
      data: {
        farmId: farm.id,
        name: 'Potrero Sur',
        hectares: 5,
      },
    });
    paddock2Id = paddock2.id;

    // Simular login (simplificado - ajustar según tu auth)
    // En producción esto debería llamar a /auth/login
    authToken = 'Bearer mock-token';
  }, 30000);

  afterAll(async () => {
    // Cleanup
    await prisma.movement.deleteMany();
    await prisma.paddock.deleteMany();
    await prisma.herd.deleteMany();
    await prisma.userFarm.deleteMany();
    await prisma.farm.deleteMany();
    await prisma.user.deleteMany({ where: { email: 'test-movement@test.com' } });
    
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /movements', () => {
    it('debe crear movimiento cuando no hay movimientos activos', async () => {
      const createDto = {
        herdId,
        paddockId: paddock1Id,
        type: 'ROTATION',
        entryDate: new Date().toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/movements')
        .set('Authorization', authToken)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('ACTIVE');
      expect(response.body.herdId).toBe(herdId);
      expect(response.body.paddockId).toBe(paddock1Id);

      // Cleanup
      await prisma.movement.delete({ where: { id: response.body.id } });
    });

    it('debe rechazar crear movimiento si el lote ya tiene uno activo', async () => {
      // Crear primer movimiento
      const movement1 = await prisma.movement.create({
        data: {
          herdId,
          paddockId: paddock1Id,
          type: 'ROTATION',
          status: 'ACTIVE',
          entryDate: new Date(),
          createdBy: 'test-user',
        },
      });

      // Intentar crear segundo movimiento
      const createDto = {
        herdId,
        paddockId: paddock2Id,
        type: 'ROTATION',
        entryDate: new Date().toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/movements')
        .set('Authorization', authToken)
        .send(createDto)
        .expect(409);

      expect(response.body.message).toContain('movimiento activo');
      expect(response.body.message).toContain('Potrero Norte');

      // Cleanup
      await prisma.movement.delete({ where: { id: movement1.id } });
    });
  });

  describe('PATCH /movements/:id/close', () => {
    it('debe cerrar movimiento activo correctamente', async () => {
      const movement = await prisma.movement.create({
        data: {
          herdId,
          paddockId: paddock1Id,
          type: 'ROTATION',
          status: 'ACTIVE',
          entryDate: new Date('2025-01-01'),
          createdBy: 'test-user',
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/movements/${movement.id}/close`)
        .set('Authorization', authToken)
        .send({ exitDate: new Date('2025-01-10').toISOString() })
        .expect(200);

      expect(response.body.status).toBe('CLOSED');
      expect(response.body.exitDate).toBeDefined();

      // Verificar en DB
      const updated = await prisma.movement.findUnique({ where: { id: movement.id } });
      expect(updated?.status).toBe('CLOSED');

      // Cleanup
      await prisma.movement.delete({ where: { id: movement.id } });
    });

    it('debe rechazar cerrar movimiento ya cerrado', async () => {
      const movement = await prisma.movement.create({
        data: {
          herdId,
          paddockId: paddock1Id,
          type: 'ROTATION',
          status: 'CLOSED',
          entryDate: new Date('2025-01-01'),
          exitDate: new Date('2025-01-10'),
          createdBy: 'test-user',
        },
      });

      await request(app.getHttpServer())
        .patch(`/movements/${movement.id}/close`)
        .set('Authorization', authToken)
        .send({ exitDate: new Date('2025-01-15').toISOString() })
        .expect(400);

      // Cleanup
      await prisma.movement.delete({ where: { id: movement.id } });
    });

    it('debe permitir crear nuevo movimiento después de cerrar el anterior', async () => {
      // Crear y cerrar movimiento
      const movement1 = await prisma.movement.create({
        data: {
          herdId,
          paddockId: paddock1Id,
          type: 'ROTATION',
          status: 'ACTIVE',
          entryDate: new Date('2025-01-01'),
          createdBy: 'test-user',
        },
      });

      await request(app.getHttpServer())
        .patch(`/movements/${movement1.id}/close`)
        .set('Authorization', authToken)
        .send({ exitDate: new Date('2025-01-10').toISOString() })
        .expect(200);

      // Ahora debe poder crear nuevo movimiento
      const createDto = {
        herdId,
        paddockId: paddock2Id,
        type: 'ROTATION',
        entryDate: new Date('2025-01-15').toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/movements')
        .set('Authorization', authToken)
        .send(createDto)
        .expect(201);

      expect(response.body.status).toBe('ACTIVE');

      // Cleanup
      await prisma.movement.deleteMany({
        where: { herdId },
      });
    });
  });
});
