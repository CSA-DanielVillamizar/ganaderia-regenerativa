import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { WeighingService } from './weighing.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { ParameterService } from '../parameter/parameter.service';

describe('WeighingService - P0.6 Pesajes/UA', () => {
  let service: WeighingService;
  let mockPrismaService: any;
  let mockParameterService: any;

  const mockUserId = 'user-ganadero';
  const mockFarmId = 'farm-magrotec';
  const mockHerdId = 'herd-001';

  beforeEach(async () => {
    mockPrismaService = {
      herd: {
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
      weighing: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      userFarm: {
        findUnique: jest.fn(),
      },
    };

    mockParameterService = {
      getParameter: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeighingService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ParameterService, useValue: mockParameterService },
      ],
    }).compile();

    service = module.get<WeighingService>(WeighingService);
  });

  describe('create - POST /weighings', () => {
    beforeEach(() => {
      mockPrismaService.herd.findUniqueOrThrow.mockResolvedValue({
        id: mockHerdId,
        farmId: mockFarmId,
        name: 'Lote A',
        animalCount: 100,
        farm: { id: mockFarmId },
      });

      mockPrismaService.userFarm.findUnique.mockResolvedValue({
        userId: mockUserId,
        farmId: mockFarmId,
      });

      mockParameterService.getParameter.mockResolvedValue('450');

      mockPrismaService.herd.update.mockResolvedValue({
        id: mockHerdId,
        currentWeight: 500,
        currentUA: 111.11,
      });

      mockPrismaService.weighing.create.mockResolvedValue({
        id: 'weighing-001',
        herdId: mockHerdId,
        weight: 50000,
        animalCount: 100,
        recordedAt: new Date('2025-01-19'),
      });
    });

    it('1. POST con peso total → actualiza herd.currentWeight (promedio)', async () => {
      const dto = {
        herdId: mockHerdId,
        weight: 50000, // 50,000 kg total
        animalCount: 100,
        notes: 'Pesaje mensual',
      };

      await service.create(dto, mockUserId);

      // Verificar que actualiza currentWeight = 50000/100 = 500 kg/animal
      expect(mockPrismaService.herd.update).toHaveBeenCalledWith({
        where: { id: mockHerdId },
        data: {
          currentWeight: 500,
          currentUA: expect.any(Number),
        },
      });
    });

    it('2. POST → recalcula herd.currentUA usando parámetro ua_weight_kg', async () => {
      const dto = {
        herdId: mockHerdId,
        weight: 45000, // 45,000 kg total
        animalCount: 100,
      };

      await service.create(dto, mockUserId);

      // Verificar que consulta parámetro
      expect(mockParameterService.getParameter).toHaveBeenCalledWith(
        mockFarmId,
        'ua_weight_kg',
        '450',
      );

      // Cálculo: avgPerAnimal = 45000/100 = 450 kg
      // totalWeight = 450 * 100 = 45000 kg
      // currentUA = 45000 / 450 = 100 UA
      expect(mockPrismaService.herd.update).toHaveBeenCalledWith({
        where: { id: mockHerdId },
        data: {
          currentWeight: 450,
          currentUA: 100,
        },
      });
    });

    it('3. POST con ua_weight_kg=500 → usa parámetro custom', async () => {
      mockParameterService.getParameter.mockResolvedValue('500'); // Custom

      const dto = {
        herdId: mockHerdId,
        weight: 50000,
        animalCount: 100,
      };

      await service.create(dto, mockUserId);

      // Cálculo: avgPerAnimal = 500, totalWeight = 50000
      // currentUA = 50000 / 500 = 100 UA
      expect(mockPrismaService.herd.update).toHaveBeenCalledWith({
        where: { id: mockHerdId },
        data: {
          currentWeight: 500,
          currentUA: 100,
        },
      });
    });

    it('4. POST método TAPE con medidas → estima peso', async () => {
      const dto = {
        herdId: mockHerdId,
        weight: 0,
        animalCount: 1,
        method: 'TAPE' as any,
        chestGirthCm: 180,
        bodyLengthCm: 150,
      };

      await service.create(dto, mockUserId);

      // Verificar que se creó pesaje (peso estimado)
      expect(mockPrismaService.weighing.create).toHaveBeenCalled();
      const createCall = mockPrismaService.weighing.create.mock.calls[0][0];
      expect(createCall.data.method).toBe('TAPE');
      expect(createCall.data.weight).toBeGreaterThan(0);
    });

    it('5. POST método TAPE sin medidas → BadRequest', async () => {
      const dto = {
        herdId: mockHerdId,
        weight: 0,
        animalCount: 1,
        method: 'TAPE' as any,
        // Sin chestGirthCm ni bodyLengthCm
      };

      await expect(service.create(dto, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(dto, mockUserId)).rejects.toThrow(
        /TAPE se requiere perímetro/,
      );
    });

    it('6. POST sin acceso a finca → ForbiddenException', async () => {
      mockPrismaService.userFarm.findUnique.mockResolvedValue(null);

      const dto = {
        herdId: mockHerdId,
        weight: 50000,
        animalCount: 100,
      };

      await expect(service.create(dto, mockUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('7. POST crea weighing en DB con datos correctos', async () => {
      const dto = {
        herdId: mockHerdId,
        weight: 50000,
        animalCount: 100,
        notes: 'Pesaje de control',
      };

      await service.create(dto, mockUserId);

      expect(mockPrismaService.weighing.create).toHaveBeenCalledWith({
        data: {
          herdId: mockHerdId,
          animalId: null,
          weight: 50000,
          animalCount: 100,
          notes: 'Pesaje de control',
          recordedAt: expect.any(Date),
          createdBy: mockUserId,
          method: 'SCALE',
        },
      });
    });
  });

  describe('getHistory - GET /weighings/herd/:id/history', () => {
    beforeEach(() => {
      mockPrismaService.herd.findUniqueOrThrow.mockResolvedValue({
        id: mockHerdId,
        farmId: mockFarmId,
        name: 'Lote A',
        currentWeight: 520,
        currentUA: 115.56,
        animalCount: 100,
      });

      mockPrismaService.userFarm.findUnique.mockResolvedValue({
        userId: mockUserId,
        farmId: mockFarmId,
      });

      mockParameterService.getParameter.mockResolvedValue('450');
    });

    it('1. GET con paginación → retorna structure completa', async () => {
      mockPrismaService.weighing.count.mockResolvedValue(150);
      mockPrismaService.weighing.findMany.mockResolvedValue([
        {
          id: 'w-001',
          weight: 50000,
          animalCount: 100,
          notes: 'Enero',
          recordedAt: new Date('2025-01-01'),
          method: 'SCALE',
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 'w-002',
          weight: 52000,
          animalCount: 100,
          notes: 'Febrero',
          recordedAt: new Date('2025-02-01'),
          method: 'SCALE',
          createdAt: new Date('2025-02-01'),
        },
      ]);

      const result = await service.getHistory(mockHerdId, mockUserId, {
        page: 1,
        limit: 50,
      });

      expect(result).toMatchObject({
        herdId: mockHerdId,
        herdName: 'Lote A',
        currentWeight: 520,
        currentUA: 115.56,
        totalCount: 150,
        weighings: expect.any(Array),
        pagination: {
          page: 1,
          limit: 50,
          totalPages: 3, // 150/50
          hasMore: true,
        },
      });

      expect(result.weighings).toHaveLength(2);
    });

    it('2. GET page=2 → aplica skip correctamente', async () => {
      mockPrismaService.weighing.count.mockResolvedValue(150);
      mockPrismaService.weighing.findMany.mockResolvedValue([]);

      await service.getHistory(mockHerdId, mockUserId, {
        page: 2,
        limit: 50,
      });

      expect(mockPrismaService.weighing.findMany).toHaveBeenCalledWith({
        where: { herdId: mockHerdId },
        orderBy: { recordedAt: 'desc' },
        skip: 50, // (2-1) * 50
        take: 50,
      });
    });

    it('3. GET con from/to → filtra por rango de fechas', async () => {
      mockPrismaService.weighing.count.mockResolvedValue(10);
      mockPrismaService.weighing.findMany.mockResolvedValue([]);

      await service.getHistory(mockHerdId, mockUserId, {
        from: '2025-01-01',
        to: '2025-01-31',
      });

      expect(mockPrismaService.weighing.findMany).toHaveBeenCalledWith({
        where: {
          herdId: mockHerdId,
          recordedAt: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-01-31'),
          },
        },
        orderBy: { recordedAt: 'desc' },
        skip: 0,
        take: 50,
      });
    });

    it('4. GET sin params → usa defaults (page=1, limit=50)', async () => {
      mockPrismaService.weighing.count.mockResolvedValue(30);
      mockPrismaService.weighing.findMany.mockResolvedValue([]);

      await service.getHistory(mockHerdId, mockUserId);

      expect(mockPrismaService.weighing.findMany).toHaveBeenCalledWith({
        where: { herdId: mockHerdId },
        orderBy: { recordedAt: 'desc' },
        skip: 0,
        take: 50,
      });
    });

    it('5. GET calcula avgWeightPerAnimal y uaValue correctamente', async () => {
      mockPrismaService.weighing.count.mockResolvedValue(1);
      mockPrismaService.weighing.findMany.mockResolvedValue([
        {
          id: 'w-001',
          weight: 45000, // Peso total del sample
          animalCount: 90, // Animales pesados
          notes: null,
          recordedAt: new Date('2025-01-01'),
          method: 'SCALE',
          createdAt: new Date('2025-01-01'),
        },
      ]);

      const result = await service.getHistory(mockHerdId, mockUserId);

      // avgWeightPerAnimal = 45000 / 90 = 500 kg
      // totalHerdWeight = 500 * 100 (herd.animalCount) = 50000 kg
      // uaValue = 50000 / 450 = 111.11 UA
      expect(result.weighings[0]).toMatchObject({
        id: 'w-001',
        weight: 45000,
        animalCount: 90,
        avgWeightPerAnimal: 500,
        uaValue: expect.closeTo(111.11, 0.1),
      });
    });

    it('6. GET con ua_weight_kg=500 → usa parámetro custom', async () => {
      mockParameterService.getParameter.mockResolvedValue('500');
      mockPrismaService.weighing.count.mockResolvedValue(1);
      mockPrismaService.weighing.findMany.mockResolvedValue([
        {
          id: 'w-001',
          weight: 50000,
          animalCount: 100,
          notes: null,
          recordedAt: new Date('2025-01-01'),
          method: 'SCALE',
          createdAt: new Date('2025-01-01'),
        },
      ]);

      const result = await service.getHistory(mockHerdId, mockUserId);

      // avgPerAnimal = 50000/100 = 500
      // totalWeight = 500 * 100 = 50000
      // uaValue = 50000 / 500 = 100 UA
      expect(result.weighings[0].uaValue).toBe(100);
    });

    it('7. GET ordena por recordedAt desc (más reciente primero)', async () => {
      mockPrismaService.weighing.count.mockResolvedValue(2);
      mockPrismaService.weighing.findMany.mockResolvedValue([]);

      await service.getHistory(mockHerdId, mockUserId);

      expect(mockPrismaService.weighing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { recordedAt: 'desc' },
        }),
      );
    });

    it('8. GET sin acceso a finca → ForbiddenException', async () => {
      mockPrismaService.userFarm.findUnique.mockResolvedValue(null);

      await expect(
        service.getHistory(mockHerdId, mockUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('9. GET última página → hasMore=false', async () => {
      mockPrismaService.weighing.count.mockResolvedValue(100);
      mockPrismaService.weighing.findMany.mockResolvedValue([]);

      const result = await service.getHistory(mockHerdId, mockUserId, {
        page: 2,
        limit: 50,
      });

      expect(result.pagination).toMatchObject({
        page: 2,
        totalPages: 2,
        hasMore: false,
      });
    });
  });
});
