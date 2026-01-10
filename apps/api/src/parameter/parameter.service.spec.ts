import { Test, TestingModule } from '@nestjs/testing';
import { ParameterService } from './parameter.service';
import { PrismaService } from '../common/prisma/prisma.service';

describe('ParameterService', () => {
  let service: ParameterService;
  let prisma: PrismaService;

  const mockPrismaService = {
    parameter: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
    },
    farmParameter: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    userFarm: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParameterService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ParameterService>(ParameterService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getParameter', () => {
    it('debería retornar valor del parámetro si existe', async () => {
      const farmId = 'farm-1';
      const key = 'ua_weight_kg';
      const value = '450';

      // No hay override en farm, busca en global
      mockPrismaService.farmParameter.findUnique.mockResolvedValue(null);
      mockPrismaService.parameter.findUnique.mockResolvedValue({ value });

      const result = await service.getParameter(farmId, key, '500');

      expect(result).toBe('450');
      expect(prisma.farmParameter.findUnique).toHaveBeenCalledWith({
        where: { farmId_key: { farmId, key } },
      });
      expect(prisma.parameter.findUnique).toHaveBeenCalledWith({
        where: { farmId_key: { farmId, key } },
      });
    });

    it('debería retornar farm parameter override si existe', async () => {
      const farmId = 'farm-1';
      const key = 'ua_weight_kg';
      const farmValue = '480';

      // Tiene override en farm
      mockPrismaService.farmParameter.findUnique.mockResolvedValue({ value: farmValue });

      const result = await service.getParameter(farmId, key, '500');

      expect(result).toBe(farmValue);
      expect(prisma.farmParameter.findUnique).toHaveBeenCalledWith({
        where: { farmId_key: { farmId, key } },
      });
      // No debe buscar en Parameter si lo encontró en FarmParameter
      expect(prisma.parameter.findUnique).not.toHaveBeenCalled();
    });

    it('debería retornar valor default si parámetro no existe', async () => {
      const farmId = 'farm-1';
      const key = 'ua_weight_kg';
      const defaultValue = '500';

      mockPrismaService.farmParameter.findUnique.mockResolvedValue(null);
      mockPrismaService.parameter.findUnique.mockResolvedValue(null);

      const result = await service.getParameter(farmId, key, defaultValue);

      expect(result).toBe(defaultValue);
    });
  });

  describe('getParameterAsNumber', () => {
    it('debería convertir parámetro a número', async () => {
      const farmId = 'farm-1';
      const key = 'ua_weight_kg';

      mockPrismaService.farmParameter.findUnique.mockResolvedValue(null);
      mockPrismaService.parameter.findUnique.mockResolvedValue({ value: '450.5' });

      const result = await service.getParameterAsNumber(farmId, key, 400);

      expect(result).toBe(450.5);
    });

    it('debería retornar default si conversión falla', async () => {
      const farmId = 'farm-1';
      const key = 'ua_weight_kg';

      mockPrismaService.farmParameter.findUnique.mockResolvedValue(null);
      mockPrismaService.parameter.findUnique.mockResolvedValue({ value: 'invalid' });

      const result = await service.getParameterAsNumber(farmId, key, 400);

      expect(result).toBe(400);
    });
  });

  describe('setParameter', () => {
    it('debería crear parámetro si no existe', async () => {
      const farmId = 'farm-1';
      const userId = 'user-1';
      const key = 'ua_weight_kg';
      const value = '450';

      mockPrismaService.parameter.upsert.mockResolvedValue({
        farmId,
        key,
        value,
      });

      await service.setParameter(farmId, key, value, userId);

      expect(prisma.parameter.upsert).toHaveBeenCalledWith({
        where: { farmId_key: { farmId, key } },
        create: { farmId, key, value, description: undefined },
        update: { value, description: undefined, updatedBy: userId },
      });
    });

    it('debería actualizar parámetro si ya existe', async () => {
      const farmId = 'farm-1';
      const userId = 'user-1';
      const key = 'ua_weight_kg';
      const value = '460';
      const description = 'Actualizado';

      mockPrismaService.parameter.upsert.mockResolvedValue({
        farmId,
        key,
        value,
        description,
      });

      await service.setParameter(farmId, key, value, userId, description);

      expect(prisma.parameter.upsert).toHaveBeenCalledWith({
        where: { farmId_key: { farmId, key } },
        create: { farmId, key, value, description },
        update: { value, description, updatedBy: userId },
      });
    });
  });

  describe('listByFarm', () => {
    it('debería listar parámetros de finca', async () => {
      const farmId = 'farm-1';
      const params = [
        { key: 'ua_weight_kg', value: '450' },
        { key: 'utilization_percent', value: '70' },
      ];

      mockPrismaService.parameter.findMany.mockResolvedValue(params);

      const result = await service.listByFarm(farmId);

      expect(result).toEqual(params);
      expect(prisma.parameter.findMany).toHaveBeenCalledWith({
        where: { farmId },
        orderBy: { key: 'asc' },
      });
    });
  });

  describe('initializeDefaults', () => {
    it('debería crear parámetros default para nueva finca', async () => {
      const farmId = 'farm-1';
      const userId = 'user-1';

      mockPrismaService.parameter.findMany.mockResolvedValue([]);
      mockPrismaService.parameter.create.mockResolvedValue({
        farmId,
        key: 'ua_weight_kg',
        value: '450',
      });

      const created = await service.initializeDefaults(farmId, userId);

      expect(created).toBe(5);
    });

    it('debería evitar duplicados si parámetros ya existen', async () => {
      const farmId = 'farm-1';
      const userId = 'user-1';

      mockPrismaService.parameter.findMany.mockResolvedValue([
        { key: 'ua_weight_kg' },
        { key: 'utilization_percent' },
      ]);
      mockPrismaService.parameter.create.mockResolvedValue({
        farmId,
        key: 'intake_percent_of_bw',
        value: '0.025',
      });

      const created = await service.initializeDefaults(farmId, userId);

      expect(created).toBe(3);
    });
  });
});
