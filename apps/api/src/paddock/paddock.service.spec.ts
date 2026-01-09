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
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
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
});
