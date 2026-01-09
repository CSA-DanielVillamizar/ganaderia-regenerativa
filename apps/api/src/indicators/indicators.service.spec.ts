import { Test, TestingModule } from '@nestjs/testing';
import { IndicatorsService } from './indicators.service';
import { PrismaService } from '../common/prisma/prisma.service';

describe('IndicatorsService', () => {
  let service: IndicatorsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    farm: {
      findUniqueOrThrow: jest.fn(),
    },
    movement: {
      findMany: jest.fn(),
    },
    forageSample: {
      findMany: jest.fn(),
    },
    parameter: {
      findFirst: jest.fn(),
    },
    paddock: {
      findMany: jest.fn(),
    },
    userFarm: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndicatorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<IndicatorsService>(IndicatorsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateFarmIndicators', () => {
    it('debe calcular indicadores para una finca con acceso', async () => {
      const farmId = 'farm-1';
      const userId = 'user-1';

      const mockFarm = {
        id: farmId,
        name: 'Finca Test',
        hectares: 100,
        herds: [
          {
            id: 'herd-1',
            animals: Array(50).fill({ id: 'animal-1' }),
          },
        ],
        paddocks: [
          { id: 'paddock-1', name: 'Potrero 1', movements: [] },
          { id: 'paddock-2', name: 'Potrero 2', movements: [] },
        ],
      };

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ userId, farmId });
      mockPrismaService.farm.findUniqueOrThrow.mockResolvedValue(mockFarm);
      mockPrismaService.movement.findMany.mockResolvedValue([
        {
          id: 'movement-1',
          entryDate: new Date('2024-01-01'),
          exitDate: new Date('2024-01-08'),
          paddockId: 'paddock-1',
          herd: {
            animals: Array(50).fill({ id: 'animal-1' }),
          },
        },
      ]);
      mockPrismaService.forageSample.findMany.mockResolvedValue([
        {
          id: 'sample-1',
          kgMSPerHa: 2000,
        },
      ]);
      mockPrismaService.parameter.findFirst.mockResolvedValue({
        name: 'minRestDays',
        value: '30',
      });
      mockPrismaService.paddock.findMany.mockResolvedValue(mockFarm.paddocks);

      const result = await service.calculateFarmIndicators(farmId, userId, 30);

      expect(result).toBeDefined();
      expect(result.farm).toEqual({ id: farmId, name: mockFarm.name });
      expect(result.pastureHealth).toBeDefined();
      expect(result.pastureHealth.pastorePressure).toBeGreaterThan(0);
      expect(result.pastureHealth.recoveryIndex).toBeGreaterThan(0);
      expect(result.pastureHealth.sustainabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.pastureHealth.sustainabilityScore).toBeLessThanOrEqual(1);
      expect(result.trends).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.paddockAnalysis).toBeInstanceOf(Array);
    });

    it('debe lanzar excepción si no tiene acceso a finca', async () => {
      const farmId = 'farm-1';
      const userId = 'user-1';

      mockPrismaService.userFarm.findUnique.mockResolvedValue(null);

      await expect(
        service.calculateFarmIndicators(farmId, userId, 30)
      ).rejects.toThrow('No tienes acceso a esta finca');
    });

    it('debe calcular presión de pastoreo correctamente', async () => {
      const farmId = 'farm-1';
      const userId = 'user-1';

      const mockFarm = {
        id: farmId,
        name: 'Finca Test',
        hectares: 100,
        herds: [
          {
            id: 'herd-1',
            animals: Array(200).fill({ id: 'animal-1' }), // 200 animales * 0.5 UA = 100 UA
          },
        ],
        paddocks: [{ id: 'paddock-1', name: 'Potrero 1', movements: [] }],
      };

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ userId, farmId });
      mockPrismaService.farm.findUniqueOrThrow.mockResolvedValue(mockFarm);
      mockPrismaService.movement.findMany.mockResolvedValue([]);
      mockPrismaService.forageSample.findMany.mockResolvedValue([]);
      mockPrismaService.parameter.findFirst.mockResolvedValue(null);
      mockPrismaService.paddock.findMany.mockResolvedValue(mockFarm.paddocks);

      const result = await service.calculateFarmIndicators(farmId, userId, 30);

      // 100 UA / 100 ha = 1 UA/ha
      expect(result.pastureHealth.pastorePressure).toBeCloseTo(1, 1);
      expect(result.pastureHealth.details.totalUA).toBeCloseTo(100, 0);
    });

    it('debe generar recomendaciones basadas en indicadores', async () => {
      const farmId = 'farm-1';
      const userId = 'user-1';

      const mockFarm = {
        id: farmId,
        name: 'Finca Test',
        hectares: 100,
        herds: [
          {
            id: 'herd-1',
            animals: Array(50).fill({ id: 'animal-1' }),
          },
        ],
        paddocks: [{ id: 'paddock-1', name: 'Potrero 1', movements: [] }],
      };

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ userId, farmId });
      mockPrismaService.farm.findUniqueOrThrow.mockResolvedValue(mockFarm);
      mockPrismaService.movement.findMany.mockResolvedValue([]);
      mockPrismaService.forageSample.findMany.mockResolvedValue([
        { id: 'sample-1', kgMSPerHa: 2000 },
      ]);
      mockPrismaService.parameter.findFirst.mockResolvedValue({
        name: 'minRestDays',
        value: '30',
      });
      mockPrismaService.paddock.findMany.mockResolvedValue(mockFarm.paddocks);

      const result = await service.calculateFarmIndicators(farmId, userId, 30);

      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
      // Verificar que la recomendación contiene información útil
      expect(result.recommendations[0]).toMatch(/BAJO|ÓPTIMO|ALTO|pastoreo/i);
    });
  });

  describe('Análisis de potreros', () => {
    it('debe analizar estado de potreros correctamente', async () => {
      const farmId = 'farm-1';
      const userId = 'user-1';

      const mockFarm = {
        id: farmId,
        name: 'Finca Test',
        hectares: 100,
        herds: [{ id: 'herd-1', animals: Array(50).fill({ id: 'animal-1' }) }],
        paddocks: [
          { id: 'paddock-1', name: 'Potrero 1' },
          { id: 'paddock-2', name: 'Potrero 2' },
        ],
      };

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ userId, farmId });
      mockPrismaService.farm.findUniqueOrThrow.mockResolvedValue(mockFarm);
      mockPrismaService.movement.findMany.mockResolvedValue([]);
      mockPrismaService.forageSample.findMany.mockResolvedValue([]);
      mockPrismaService.parameter.findFirst.mockResolvedValue(null);

      // Potrero 1: ocupado hace 5 días
      // Potrero 2: descanso hace 30 días
      const now = new Date();
      mockPrismaService.paddock.findMany.mockResolvedValue([
        {
          id: 'paddock-1',
          name: 'Potrero 1',
          movements: [
            {
              id: 'mov-1',
              entryDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
              exitDate: null,
            },
          ],
        },
        {
          id: 'paddock-2',
          name: 'Potrero 2',
          movements: [
            {
              id: 'mov-2',
              entryDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
              exitDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            },
          ],
        },
      ]);

      const result = await service.calculateFarmIndicators(farmId, userId, 30);

      expect(result.paddockAnalysis.length).toBe(2);
      // Potrero 1 debe estar OCCUPIED
      expect(result.paddockAnalysis[0].currentState).toBe('OCCUPIED');
      // Potrero 2 debe estar READY (pasó 30 días)
      expect(result.paddockAnalysis[1].currentState).toBe('READY');
    });
  });

  describe('Score de sostenibilidad', () => {
    it('debe calcular score entre 0 y 1', async () => {
      const farmId = 'farm-1';
      const userId = 'user-1';

      const mockFarm = {
        id: farmId,
        name: 'Finca Test',
        hectares: 100,
        herds: [{ id: 'herd-1', animals: Array(50).fill({ id: 'animal-1' }) }],
        paddocks: [{ id: 'paddock-1', name: 'Potrero 1', movements: [] }],
      };

      mockPrismaService.userFarm.findUnique.mockResolvedValue({ userId, farmId });
      mockPrismaService.farm.findUniqueOrThrow.mockResolvedValue(mockFarm);
      mockPrismaService.movement.findMany.mockResolvedValue([
        {
          entryDate: new Date('2024-01-01'),
          exitDate: new Date('2024-01-08'),
        },
      ]);
      mockPrismaService.forageSample.findMany.mockResolvedValue([
        { kgMSPerHa: 1800 },
      ]);
      mockPrismaService.parameter.findFirst.mockResolvedValue({
        value: '30',
      });
      mockPrismaService.paddock.findMany.mockResolvedValue(mockFarm.paddocks);

      const result = await service.calculateFarmIndicators(farmId, userId, 30);

      expect(result.pastureHealth.sustainabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.pastureHealth.sustainabilityScore).toBeLessThanOrEqual(1);
    });
  });
});
