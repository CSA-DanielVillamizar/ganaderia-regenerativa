import { Test, TestingModule } from '@nestjs/testing';
import { PaddockService } from './paddock.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

describe('PaddockService - Stocking Rate', () => {
  let service: PaddockService;
  let prisma: PrismaService;

  const mockPrismaService = {
    paddock: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
    forageSample: {
      findFirst: jest.fn(),
    },
    movement: {
      findFirst: jest.fn(),
    },
    userFarm: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaddockService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PaddockService>(PaddockService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getStockingRate', () => {
    it('debería calcular carga animal: 10 UA en 5 hectáreas = 2 UA/ha', async () => {
      const paddockId = 'paddock-1';
      const farmId = 'farm-1';
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ farmId, userId });
      mockPrismaService.paddock.findUniqueOrThrow.mockResolvedValue({
        id: paddockId,
        farmId,
        hectares: 5,
        name: 'Paddock A',
      });
      mockPrismaService.movement.findFirst.mockResolvedValue({
        herd: {
          currentUA: 10,
          name: 'Herd 1',
        },
        entryDate: new Date('2024-01-15'),
      });

      const result = await service.getStockingRate(paddockId, userId);

      expect(result.ua).toBe(10);
      expect(result.uaPerHectare).toBe(2);
      expect(result.herdName).toBe('Herd 1');
    });

    it('debería retornar 0 UA/ha si no hay movimiento activo', async () => {
      const paddockId = 'paddock-1';
      const farmId = 'farm-1';
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ farmId, userId });
      mockPrismaService.paddock.findUniqueOrThrow.mockResolvedValue({
        id: paddockId,
        farmId,
        hectares: 5,
        name: 'Paddock A',
      });
      mockPrismaService.movement.findFirst.mockResolvedValue(null);

      const result = await service.getStockingRate(paddockId, userId);

      expect(result.ua).toBe(0);
      expect(result.uaPerHectare).toBe(0);
      expect(result.herdName).toBeNull();
    });

    it('debería retornar 0 UA/ha si herd no tiene currentUA', async () => {
      const paddockId = 'paddock-1';
      const farmId = 'farm-1';
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ farmId, userId });
      mockPrismaService.paddock.findUniqueOrThrow.mockResolvedValue({
        id: paddockId,
        farmId,
        hectares: 5,
        name: 'Paddock A',
      });
      mockPrismaService.movement.findFirst.mockResolvedValue({
        herd: {
          currentUA: null,
          name: 'Herd 1',
        },
        entryDate: new Date('2024-01-15'),
      });

      const result = await service.getStockingRate(paddockId, userId);

      expect(result.ua).toBe(0);
      expect(result.uaPerHectare).toBe(0);
    });

    it('debería calcular correctamente con hectáreas por defecto = 1', async () => {
      const paddockId = 'paddock-1';
      const farmId = 'farm-1';
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ farmId, userId });
      mockPrismaService.paddock.findUniqueOrThrow.mockResolvedValue({
        id: paddockId,
        farmId,
        hectares: null,
        name: 'Paddock A',
      });
      mockPrismaService.movement.findFirst.mockResolvedValue({
        herd: {
          currentUA: 5,
          name: 'Herd 1',
        },
        entryDate: new Date('2024-01-15'),
      });

      const result = await service.getStockingRate(paddockId, userId);

      expect(result.ua).toBe(5);
      expect(result.uaPerHectare).toBe(5);
    });

    it('debería rechazar si usuario no tiene acceso a finca', async () => {
      const paddockId = 'paddock-1';
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue(null);

      await expect(service.getStockingRate(paddockId, userId)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('debería buscar movimiento ACTIVE del potrero', async () => {
      const paddockId = 'paddock-1';
      const farmId = 'farm-1';
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ farmId, userId });
      mockPrismaService.paddock.findUniqueOrThrow.mockResolvedValue({
        id: paddockId,
        farmId,
        hectares: 5,
      });
      mockPrismaService.movement.findFirst.mockResolvedValue(null);

      await service.getStockingRate(paddockId, userId);

      expect(prisma.movement.findFirst).toHaveBeenCalledWith({
        where: {
          paddockId,
          status: 'ACTIVE',
        },
        include: {
          herd: true,
        },
      });
    });
  });

  // ============= P0.4 - Recommended Days Tests =============

  describe('getRecommendedDays', () => {
    const userId = 'user-123';
    const paddockId = 'paddock-456';
    const farmId = 'farm-789';
    const herdId = 'herd-001';

    const mockPaddock = {
      id: paddockId,
      farmId,
      name: 'Potrero Norte',
      hectares: 10,
      farm: { id: farmId, name: 'Finca Test' },
    };

    const mockForageSample = {
      id: 'sample-001',
      paddockId,
      availableForageKgMS: 1050, // kg MS/ha
      sampleDate: new Date('2025-01-10T10:00:00Z'),
    };

    const mockHerd = {
      id: herdId,
      name: 'Hato A',
      currentWeight: 5000, // kg
      initialWeight: 4500,
      animalCount: 10,
    };

    const mockActiveMovement = {
      id: 'movement-001',
      paddockId,
      herdId,
      status: 'ACTIVE',
      herd: mockHerd,
    };

    beforeEach(() => {
      mockPrismaService.userFarm.findUnique.mockResolvedValue({ userId, farmId });
    });

    it('1. GET con paddockId y herds → calcula correctamente', async () => {
      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.forageSample.findFirst.mockResolvedValue(mockForageSample);
      mockPrismaService.movement.findFirst.mockResolvedValue(mockActiveMovement);

      const result = await service.getRecommendedDays(paddockId, userId, 2.0);

      expect(result.paddockId).toBe(paddockId);
      expect(result.totalAvailableKgMS).toBe(10500);
      expect(result.totalHerdWeightKg).toBe(5000);
      expect(result.dailyConsumptionKgMS).toBe(100);
      expect(result.recommendedDays).toBe(105);
      expect(result.rotationAdvice).toContain('105');
    });

    it('2. GET sin aforos → 400 BadRequest', async () => {
      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.forageSample.findFirst.mockResolvedValue(null);

      await expect(service.getRecommendedDays(paddockId, userId, 2.0)).rejects.toThrow(
        /No hay aforos registrados/
      );
    });

    it('3. GET con intakePercent custom → usa valor', async () => {
      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.forageSample.findFirst.mockResolvedValue(mockForageSample);
      mockPrismaService.movement.findFirst.mockResolvedValue(mockActiveMovement);

      const result = await service.getRecommendedDays(paddockId, userId, 2.5);

      expect(result.intakePercentDaily).toBe(2.5);
      expect(result.dailyConsumptionKgMS).toBe(125);
      expect(result.recommendedDays).toBe(84);
    });

    it('4. Manejo división por cero (0 herd weight) → BadRequest', async () => {
      const herdWithZeroWeight = { ...mockHerd, currentWeight: 0, initialWeight: 0 };
      const movementWithZeroWeight = { ...mockActiveMovement, herd: herdWithZeroWeight };

      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.forageSample.findFirst.mockResolvedValue(mockForageSample);
      mockPrismaService.movement.findFirst.mockResolvedValue(movementWithZeroWeight);

      await expect(service.getRecommendedDays(paddockId, userId, 2.0)).rejects.toThrow(
        /no tiene peso registrado/
      );
    });

    it('5. Paddock sin movimiento activo → BadRequest', async () => {
      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.forageSample.findFirst.mockResolvedValue(mockForageSample);
      mockPrismaService.movement.findFirst.mockResolvedValue(null);

      await expect(service.getRecommendedDays(paddockId, userId, 2.0)).rejects.toThrow(
        /No hay un hato activo/
      );
    });

    it('6. Auth requerido - sin acceso lanza ForbiddenException', async () => {
      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.userFarm.findUnique.mockResolvedValue(null);

      await expect(service.getRecommendedDays(paddockId, userId, 2.0)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('7. Herd usa initialWeight si currentWeight es null', async () => {
      const herdWithoutCurrentWeight = { ...mockHerd, currentWeight: null, initialWeight: 4800 };
      const movementWithInitialWeight = { ...mockActiveMovement, herd: herdWithoutCurrentWeight };

      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.forageSample.findFirst.mockResolvedValue(mockForageSample);
      mockPrismaService.movement.findFirst.mockResolvedValue(movementWithInitialWeight);

      const result = await service.getRecommendedDays(paddockId, userId, 2.0);

      expect(result.totalHerdWeightKg).toBe(4800);
      expect(result.dailyConsumptionKgMS).toBe(96);
    });
  });
});
