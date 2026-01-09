import { Test, TestingModule } from '@nestjs/testing';
import { HerdService } from './herd.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { ParameterService } from '../parameter/parameter.service';
import { ForbiddenException } from '@nestjs/common';

describe('HerdService - UA Calculations', () => {
  let service: HerdService;
  let prisma: PrismaService;
  let parameterService: ParameterService;

  const mockPrismaService = {
    herd: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
    weighing: {
      findFirst: jest.fn(),
    },
    userFarm: {
      findUnique: jest.fn(),
    },
  };

  const mockParameterService = {
    getParameterAsNumber: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HerdService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ParameterService,
          useValue: mockParameterService,
        },
      ],
    }).compile();

    service = module.get<HerdService>(HerdService);
    prisma = module.get<PrismaService>(PrismaService);
    parameterService = module.get<ParameterService>(ParameterService);

    jest.clearAllMocks();
  });

  describe('calculateUA', () => {
    it('debería calcular UA correctamente: 4500kg / 450kg = 10 UA', () => {
      const result = service.calculateUA(4500, 450);
      expect(result).toBe(10);
    });

    it('debería calcular UA con peso no estándar: 3000kg / 400kg = 7.5 UA', () => {
      const result = service.calculateUA(3000, 400);
      expect(result).toBe(7.5);
    });

    it('debería retornar 0 si peso es cero', () => {
      const result = service.calculateUA(0, 450);
      expect(result).toBe(0);
    });

    it('debería retornar 0 si ua_weight_kg es cero', () => {
      const result = service.calculateUA(4500, 0);
      expect(result).toBe(0);
    });

    it('debería usar default ua_weight_kg de 450', () => {
      const result = service.calculateUA(4500);
      expect(result).toBe(10);
    });

    it('debería calcular correctamente con decimales: 2250kg / 450kg = 5 UA', () => {
      const result = service.calculateUA(2250, 450);
      expect(result).toBe(5);
    });
  });

  describe('updateCurrentUA', () => {
    it('debería actualizar UA actual en base a último pesaje', async () => {
      const herdId = 'herd-1';
      const farmId = 'farm-1';
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ farmId, userId });
      mockPrismaService.herd.findUniqueOrThrow.mockResolvedValue({
        id: herdId,
        farmId,
        name: 'Herd A',
        animals: [],
        movements: [],
      });
      mockPrismaService.weighing.findFirst.mockResolvedValue({
        weight: 4500,
      });
      mockParameterService.getParameterAsNumber.mockResolvedValue(450);
      mockPrismaService.herd.update.mockResolvedValue({
        id: herdId,
        currentUA: 10,
      });

      const result = await service.updateCurrentUA(herdId, userId);

      expect(result).toBe(10);
      expect(prisma.herd.update).toHaveBeenCalledWith({
        where: { id: herdId },
        data: { currentUA: 10 },
      });
    });

    it('debería usar ua_weight_kg de parámetros', async () => {
      const herdId = 'herd-1';
      const farmId = 'farm-1';
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ farmId, userId });
      mockPrismaService.herd.findUniqueOrThrow.mockResolvedValue({
        id: herdId,
        farmId,
        name: 'Herd A',
        animals: [],
        movements: [],
      });
      mockPrismaService.weighing.findFirst.mockResolvedValue({
        weight: 4000,
      });
      mockParameterService.getParameterAsNumber.mockResolvedValue(400);
      mockPrismaService.herd.update.mockResolvedValue({
        id: herdId,
        currentUA: 10,
      });

      const result = await service.updateCurrentUA(herdId, userId);

      expect(result).toBe(10);
      expect(parameterService.getParameterAsNumber).toHaveBeenCalledWith(
        farmId,
        'ua_weight_kg',
        450
      );
    });

    it('debería limpiar currentUA si no hay pesajes', async () => {
      const herdId = 'herd-1';
      const farmId = 'farm-1';
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ farmId, userId });
      mockPrismaService.herd.findUniqueOrThrow.mockResolvedValue({
        id: herdId,
        farmId,
        name: 'Herd A',
        animals: [],
        movements: [],
      });
      mockPrismaService.weighing.findFirst.mockResolvedValue(null);
      mockPrismaService.herd.update.mockResolvedValue({
        id: herdId,
        currentUA: null,
      });

      const result = await service.updateCurrentUA(herdId, userId);

      expect(result).toBeNull();
      expect(prisma.herd.update).toHaveBeenCalledWith({
        where: { id: herdId },
        data: { currentUA: null },
      });
    });

    it('debería rechazar si usuario no tiene acceso a finca', async () => {
      const herdId = 'herd-1';
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue(null);

      await expect(service.updateCurrentUA(herdId, userId)).rejects.toThrow(ForbiddenException);
    });
  });
});
