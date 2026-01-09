import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CycleService } from './cycle.service';
import { PrismaService } from '../common/prisma/prisma.service';

describe('CycleService', () => {
  let service: CycleService;
  let prisma: PrismaService;

  const mockPrismaService = {
    cycle: {
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    herd: {
      findFirst: jest.fn(),
    },
    userFarm: {
      findUnique: jest.fn(),
    },
    weighing: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CycleService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CycleService>(CycleService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un ciclo exitosamente', async () => {
      const dto = {
        farmId: 'farm-1',
        herdId: 'herd-1',
        startDate: new Date('2025-12-26'),
      };
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ userId, farmId: 'farm-1' });
      mockPrismaService.herd.findFirst.mockResolvedValue({ id: 'herd-1', farmId: 'farm-1' });
      mockPrismaService.cycle.findFirst.mockResolvedValue(null);
      mockPrismaService.cycle.create.mockResolvedValue({
        id: 'cycle-1',
        farmId: 'farm-1',
        herdId: 'herd-1',
        status: 'ACTIVE',
        startDate: dto.startDate,
        farm: { name: 'Finca Test' },
        herd: { name: 'Lote Test' },
        movements: [],
      });

      const result = await service.create(dto, userId);

      expect(result.id).toBe('cycle-1');
      expect(result.status).toBe('ACTIVE');
      expect(mockPrismaService.cycle.create).toHaveBeenCalled();
    });

    it('debe rechazar si no tiene acceso a la finca', async () => {
      const dto = {
        farmId: 'farm-1',
        herdId: 'herd-1',
        startDate: new Date('2025-12-26'),
      };
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue(null);

      await expect(service.create(dto, userId)).rejects.toThrow(ForbiddenException);
    });

    it('debe rechazar si el lote no existe en la finca', async () => {
      const dto = {
        farmId: 'farm-1',
        herdId: 'herd-invalid',
        startDate: new Date('2025-12-26'),
      };
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ userId, farmId: 'farm-1' });
      mockPrismaService.herd.findFirst.mockResolvedValue(null);

      await expect(service.create(dto, userId)).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar si ya existe ciclo activo', async () => {
      const dto = {
        farmId: 'farm-1',
        herdId: 'herd-1',
        startDate: new Date('2025-12-26'),
      };
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ userId, farmId: 'farm-1' });
      mockPrismaService.herd.findFirst.mockResolvedValue({ id: 'herd-1', farmId: 'farm-1' });
      mockPrismaService.cycle.findFirst.mockResolvedValue({
        id: 'cycle-existing',
        status: 'ACTIVE',
      });

      await expect(service.create(dto, userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('debe actualizar status a COMPLETED con fecha', async () => {
      const cycleId = 'cycle-1';
      const dto = {
        status: 'COMPLETED' as const,
        endDate: new Date('2025-12-31'),
      };
      const userId = 'user-1';

      mockPrismaService.cycle.findUniqueOrThrow.mockResolvedValue({
        id: cycleId,
        farmId: 'farm-1',
        status: 'ACTIVE',
        startDate: new Date('2025-12-26'),
      });
      mockPrismaService.userFarm.findUnique.mockResolvedValue({ userId, farmId: 'farm-1' });
      mockPrismaService.cycle.update.mockResolvedValue({
        id: cycleId,
        status: 'COMPLETED',
        endDate: dto.endDate,
      });

      const result = await service.update(cycleId, dto, userId);

      expect(result.status).toBe('COMPLETED');
      expect(mockPrismaService.cycle.update).toHaveBeenCalled();
    });

    it('debe rechazar COMPLETED sin endDate', async () => {
      const cycleId = 'cycle-1';
      const dto = { status: 'COMPLETED' as const };
      const userId = 'user-1';

      mockPrismaService.cycle.findUniqueOrThrow.mockResolvedValue({
        id: cycleId,
        farmId: 'farm-1',
      });
      mockPrismaService.userFarm.findUnique.mockResolvedValue({ userId, farmId: 'farm-1' });

      await expect(service.update(cycleId, dto, userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCycleStats', () => {
    it('debe calcular estadísticas del ciclo', async () => {
      const cycleId = 'cycle-1';
      const userId = 'user-1';

      mockPrismaService.cycle.findUniqueOrThrow.mockResolvedValue({
        id: cycleId,
        farmId: 'farm-1',
        herdId: 'herd-1',
        status: 'ACTIVE',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-31'),
        movements: [
          {
            entryDate: new Date('2025-12-01'),
            exitDate: new Date('2025-12-08'),
            paddock: { name: 'Potrero A' },
          },
          {
            entryDate: new Date('2025-12-14'),
            exitDate: new Date('2025-12-21'),
            paddock: { name: 'Potrero B' },
          },
        ],
      });
      mockPrismaService.userFarm.findUnique.mockResolvedValue({ userId, farmId: 'farm-1' });
      mockPrismaService.weighing.findMany.mockResolvedValue([
        { realWeightKg: 450, createdAt: new Date('2025-12-01') },
        { realWeightKg: 465, createdAt: new Date('2025-12-31') },
      ]);

      const result = await service.getCycleStats(cycleId, userId);

      expect(result.cycleId).toBe(cycleId);
      expect(result.totalMovements).toBe(2);
      expect(result.totalOccupancyDays).toBe(14); // 7 + 7
      expect(result.paddocksUsed).toContain('Potrero A');
      expect(result.estimatedWeightGainKg).toBe(15);
    });
  });
});
