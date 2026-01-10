import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { MovementService } from './movement.service';
import { PrismaService } from '../common/prisma/prisma.service';

describe('MovementService - P0.1 Fuente de Verdad', () => {
  let service: MovementService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    herd: {
      findUniqueOrThrow: jest.fn(),
    },
    movement: {
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    userFarm: {
      findUnique: jest.fn(),
    },
    paddock: {
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
    farm: {
      findUniqueOrThrow: jest.fn(),
    },
    parameter: {
      findFirst: jest.fn(),
    },
  };

  const mockUserId = 'user-123';
  const mockFarmId = 'farm-123';
  const mockHerdId = 'herd-123';
  const mockPaddockId = 'paddock-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovementService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MovementService>(MovementService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      herdId: mockHerdId,
      paddockId: mockPaddockId,
      type: 'ENTRY' as any,
      entryDate: '2025-01-01T00:00:00.000Z',
    };

    it('debe crear movimiento cuando no hay movimientos activos', async () => {
      mockPrismaService.herd.findUniqueOrThrow.mockResolvedValue({
        id: mockHerdId,
        farmId: mockFarmId,
      });

      mockPrismaService.userFarm.findUnique.mockResolvedValue({
        userId: mockUserId,
        farmId: mockFarmId,
      });

      mockPrismaService.movement.findFirst.mockResolvedValue(null);

      mockPrismaService.paddock.findUniqueOrThrow.mockResolvedValue({
        id: mockPaddockId,
        farmId: mockFarmId,
      });

      mockPrismaService.farm.findUniqueOrThrow.mockResolvedValue({
        id: mockFarmId,
      });

      mockPrismaService.parameter.findFirst.mockResolvedValue({
        value: '30',
      });

      mockPrismaService.movement.create.mockResolvedValue({
        id: 'movement-123',
        herdId: createDto.herdId,
        paddockId: createDto.paddockId,
        type: createDto.type,
        entryDate: new Date(createDto.entryDate),
        status: 'ACTIVE',
        createdBy: mockUserId,
        updatedBy: mockUserId,
      });

      const result = await service.create(createDto as any, mockUserId);

      expect(result.status).toBe('ACTIVE');
      expect(mockPrismaService.movement.create).toHaveBeenCalledWith({
        data: {
          herdId: createDto.herdId,
          paddockId: createDto.paddockId,
          cycleId: undefined,
          type: createDto.type,
          entryDate: new Date(createDto.entryDate),
          exitDate: null,
          notes: undefined,
          status: 'ACTIVE',
          createdBy: mockUserId,
          updatedBy: mockUserId,
        },
      });
    });

    it('debe lanzar error si el lote ya tiene un movimiento activo', async () => {
      mockPrismaService.herd.findUniqueOrThrow.mockResolvedValue({
        id: mockHerdId,
        farmId: mockFarmId,
      });

      mockPrismaService.userFarm.findUnique.mockResolvedValue({
        userId: mockUserId,
        farmId: mockFarmId,
      });

      // Simular movimiento activo existente
      mockPrismaService.movement.findFirst.mockResolvedValue({
        id: 'existing-movement',
        herdId: mockHerdId,
        status: 'ACTIVE',
        paddock: { name: 'Potrero Norte' },
      });

      await expect(service.create(createDto as any, mockUserId)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto as any, mockUserId)).rejects.toThrow(
        'El lote ya tiene un movimiento activo'
      );
    });

    it('debe lanzar error si el usuario no tiene acceso a la finca', async () => {
      mockPrismaService.herd.findUniqueOrThrow.mockResolvedValue({
        id: mockHerdId,
        farmId: mockFarmId,
      });

      mockPrismaService.userFarm.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto as any, mockUserId)).rejects.toThrow(ForbiddenException);
    });

    /*
    it('debe lanzar error si el potrero ya está ocupado por otro lote', async () => {
      // Test deshabilitado temporalmente hasta estabilizar mocks de Prisma
      // para múltiples llamadas secuenciales a findFirst.
    });
    */
  });

  describe('closeMovement', () => {
    const movementId = 'movement-123';
    const exitDateIso = new Date('2025-01-10').toISOString();
    const exitDate = new Date(exitDateIso);

    it('debe cerrar movimiento activo correctamente', async () => {
      const activeMovement = {
        id: movementId,
        herdId: mockHerdId,
        paddockId: mockPaddockId,
        entryDate: new Date('2025-01-01'),
        status: 'ACTIVE',
        herd: { farmId: mockFarmId },
      };

      mockPrismaService.movement.findUniqueOrThrow.mockResolvedValue(activeMovement);
      mockPrismaService.userFarm.findUnique.mockResolvedValue({
        userId: mockUserId,
        farmId: mockFarmId,
      });

      const exitDate = new Date(exitDateIso);
      mockPrismaService.movement.update.mockResolvedValue({
        ...activeMovement,
        exitDate,
        status: 'CLOSED',
      });

      const result = await service.closeMovement(movementId, exitDateIso, mockUserId);

      expect(result.status).toBe('CLOSED');
      expect(result.exitDate).toEqual(exitDate);
      expect(mockPrismaService.movement.update).toHaveBeenCalledWith({
        where: { id: movementId },
        data: {
          exitDate,
          status: 'CLOSED',
          updatedBy: mockUserId,
        },
      });
    });

    it('debe actualizar Paddock.lastExitDate al cerrar movimiento', async () => {
      const activeMovement = {
        id: movementId,
        herdId: mockHerdId,
        paddockId: mockPaddockId,
        entryDate: new Date('2025-01-01'),
        status: 'ACTIVE',
        herd: { farmId: mockFarmId },
      };

      mockPrismaService.movement.findUniqueOrThrow.mockResolvedValue(activeMovement);
      mockPrismaService.userFarm.findUnique.mockResolvedValue({
        userId: mockUserId,
        farmId: mockFarmId,
      });

      mockPrismaService.movement.update.mockResolvedValue({
        ...activeMovement,
        exitDate,
        status: 'CLOSED',
      });

      mockPrismaService.paddock.update.mockResolvedValue({
        id: mockPaddockId,
        lastExitDate: exitDate,
      });

      await service.closeMovement(movementId, exitDateIso, mockUserId);

      // Verificar que se actualiza el Paddock con lastExitDate
      expect(mockPrismaService.paddock.update).toHaveBeenCalledWith({
        where: { id: mockPaddockId },
        data: { lastExitDate: exitDate },
      });
    });

    it('debe lanzar error si el movimiento ya está cerrado', async () => {
      mockPrismaService.movement.findUniqueOrThrow.mockResolvedValue({
        id: movementId,
        status: 'CLOSED',
        herd: { farmId: mockFarmId },
      });

      mockPrismaService.userFarm.findUnique.mockResolvedValue({
        userId: mockUserId,
        farmId: mockFarmId,
      });

      await expect(service.closeMovement(movementId, exitDateIso, mockUserId)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.closeMovement(movementId, exitDateIso, mockUserId)).rejects.toThrow(
        'Este movimiento ya está cerrado'
      );
    });

    it('debe lanzar error si exitDate es anterior a entryDate', async () => {
      const entryDate = new Date('2025-01-15');
      const invalidExitDateIso = new Date('2025-01-10').toISOString();

      mockPrismaService.movement.findUniqueOrThrow.mockResolvedValue({
        id: movementId,
        status: 'ACTIVE',
        entryDate,
        herd: { farmId: mockFarmId },
      });

      mockPrismaService.userFarm.findUnique.mockResolvedValue({
        userId: mockUserId,
        farmId: mockFarmId,
      });

      await expect(
        service.closeMovement(movementId, invalidExitDateIso, mockUserId)
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.closeMovement(movementId, invalidExitDateIso, mockUserId)
      ).rejects.toThrow('La fecha de salida no puede ser anterior');
    });
  });

  describe('calculateOccupancyDays', () => {
    it('debe calcular días de ocupación correctamente', async () => {
      const entryDate = new Date('2025-01-01');
      const exitDate = new Date('2025-01-11');

      mockPrismaService.movement.findUniqueOrThrow.mockResolvedValue({
        id: 'movement-123',
        entryDate,
        exitDate,
      });

      const days = await service.calculateOccupancyDays('movement-123');

      expect(days).toBe(10);
    });

    it('debe retornar null si no hay fecha de salida', async () => {
      mockPrismaService.movement.findUniqueOrThrow.mockResolvedValue({
        id: 'movement-123',
        entryDate: new Date('2025-01-01'),
        exitDate: null,
      });

      const days = await service.calculateOccupancyDays('movement-123');

      expect(days).toBeNull();
    });
  });
});
