import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ForageService } from './forage.service';
import { PrismaService } from '../common/prisma/prisma.service';

describe('ForageService - P0.3 getAvailableForage', () => {
  let service: ForageService;
  let prisma: PrismaService;

  const mockPrismaService = {
    paddock: {
      findUnique: jest.fn(),
    },
    forageSample: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    userFarm: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForageService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ForageService>(ForageService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getAvailableForage', () => {
    const userId = 'user-123';
    const paddockId = 'paddock-456';
    const farmId = 'farm-789';

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
      kgPerHectare: 5000,
      measurementType: 'GREEN', // String value instead of enum
      dryMatterPercent: 30,
      utilizationPercent: 70,
      availableForageKgMS: 1050, // 5000 * 0.30 * 0.70
      sampleDate: new Date('2025-01-10T10:00:00Z'),
      notes: 'Test sample',
      createdAt: new Date(),
      createdBy: userId,
    };

    beforeEach(() => {
      // Mock access control by default
      mockPrismaService.userFarm.findUnique.mockResolvedValue({ userId, farmId });
    });

    it('1. GET con paddockId válido → retorna último aforo', async () => {
      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.forageSample.findFirst.mockResolvedValue(mockForageSample);

      const result = await service.getAvailableForage(paddockId, userId);

      expect(result).toBeDefined();
      expect(result.paddockId).toBe(paddockId);
      expect(result.paddockName).toBe('Potrero Norte');
      expect(result.forageSampleId).toBe('sample-001');
      expect(result.measurementType).toBe('GREEN');
      expect(prisma.forageSample.findFirst).toHaveBeenCalledWith({
        where: { paddockId },
        orderBy: { sampleDate: 'desc' },
      });
    });

    it('2. GET con paddockId sin aforos → 404 NotFound', async () => {
      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.forageSample.findFirst.mockResolvedValue(null);

      await expect(service.getAvailableForage(paddockId, userId)).rejects.toThrow(
        NotFoundException
      );
      await expect(service.getAvailableForage(paddockId, userId)).rejects.toThrow(
        /No hay aforos registrados/
      );
    });

    it('3. GET con paddockId inexistente → 404 NotFound', async () => {
      mockPrismaService.paddock.findUnique.mockResolvedValue(null);

      await expect(service.getAvailableForage('invalid-id', userId)).rejects.toThrow(
        NotFoundException
      );
      await expect(service.getAvailableForage('invalid-id', userId)).rejects.toThrow(
        /no encontrado/
      );
    });

    it('4. Cálculo totalAvailableKgMS = availableForageKgMS × hectares', async () => {
      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.forageSample.findFirst.mockResolvedValue(mockForageSample);

      const result = await service.getAvailableForage(paddockId, userId);

      // availableForageKgMS = 1050 kg/ha
      // hectares = 10
      // totalAvailableKgMS = 1050 * 10 = 10500
      expect(result.availableForageKgMS).toBe(1050);
      expect(result.paddockHectares).toBe(10);
      expect(result.totalAvailableKgMS).toBe(10500);
    });

    it('5. remainingDays es null (se calculará en P0.4)', async () => {
      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.forageSample.findFirst.mockResolvedValue(mockForageSample);

      const result = await service.getAvailableForage(paddockId, userId);

      expect(result.remainingDaysOfUse).toBeNull();
    });

    it('6. Retorna aforo GREEN correctamente (con dryMatterPercent)', async () => {
      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.forageSample.findFirst.mockResolvedValue(mockForageSample);

      const result = await service.getAvailableForage(paddockId, userId);

      expect(result.measurementType).toBe('GREEN');
      expect(result.dryMatterPercent).toBe(30);
      expect(result.kgPerHectare).toBe(5000);
      expect(result.availableForageKgMS).toBe(1050);
    });

    it('7. Retorna aforo DRY_MATTER correctamente', async () => {
      const dryMatterSample = {
        ...mockForageSample,
        measurementType: 'DRY_MATTER',
        dryMatterPercent: null, // DRY_MATTER no requiere dryMatterPercent
        kgPerHectare: 1500,
        availableForageKgMS: 1050, // 1500 * 0.70
      };

      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.forageSample.findFirst.mockResolvedValue(dryMatterSample);

      const result = await service.getAvailableForage(paddockId, userId);

      expect(result.measurementType).toBe('DRY_MATTER');
      expect(result.dryMatterPercent).toBeNull();
      expect(result.kgPerHectare).toBe(1500);
      expect(result.availableForageKgMS).toBe(1050);
    });

    it('8. Auth requerido - sin acceso lanza ForbiddenException', async () => {
      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.userFarm.findUnique.mockResolvedValue(null); // Sin acceso

      await expect(service.getAvailableForage(paddockId, userId)).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.getAvailableForage(paddockId, userId)).rejects.toThrow(
        /No tienes acceso/
      );
    });

    it('9. Aforo sin availableForageKgMS calculado → NotFoundException', async () => {
      const incompleteSample = {
        ...mockForageSample,
        availableForageKgMS: null, // Sin cálculo de MS
      };

      mockPrismaService.paddock.findUnique.mockResolvedValue(mockPaddock);
      mockPrismaService.forageSample.findFirst.mockResolvedValue(incompleteSample);

      await expect(service.getAvailableForage(paddockId, userId)).rejects.toThrow(
        NotFoundException
      );
      await expect(service.getAvailableForage(paddockId, userId)).rejects.toThrow(
        /no tiene cálculo de MS disponible/
      );
    });
  });
});
