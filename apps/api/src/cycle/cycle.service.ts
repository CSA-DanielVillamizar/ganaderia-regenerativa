import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export interface CreateCycleDto {
  farmId: string;
  herdId: string;
  startDate: Date;
}

export interface UpdateCycleDto {
  startDate?: Date;
  endDate?: Date;
  status?: 'ACTIVE' | 'COMPLETED' | 'PLANNED';
}

/**
 * Servicio de gestión de ciclos de rotación
 * Un ciclo agrupa un conjunto de movimientos de un lote en una finca
 * durante un período específico (ej: mes, temporada, año)
 */
@Injectable()
export class CycleService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear nuevo ciclo
   * Valida que la finca exista y el usuario tenga acceso
   */
  async create(dto: CreateCycleDto, userId: string) {
    // Verificar acceso a finca
    await this.verifyFarmAccess(dto.farmId, userId);

    // Verificar que lote pertenece a finca
    const herd = await this.prisma.herd.findFirst({
      where: {
        id: dto.herdId,
        farmId: dto.farmId,
      },
    });

    if (!herd) {
      throw new BadRequestException('El lote no existe en esta finca');
    }

    // Validar que no haya ciclos activos para el mismo lote
    const activeExists = await this.prisma.cycle.findFirst({
      where: {
        herdId: dto.herdId,
        status: 'ACTIVE',
      },
    });

    if (activeExists) {
      throw new BadRequestException(
        `Ya existe un ciclo activo para este lote. ` +
        `Complétalo antes de crear uno nuevo.`
      );
    }

    return this.prisma.cycle.create({
      data: {
        farmId: dto.farmId,
        herdId: dto.herdId,
        startDate: new Date(dto.startDate),
        status: 'ACTIVE',
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        farm: { select: { name: true } },
        herd: { select: { name: true } },
        movements: {
          select: {
            id: true,
            paddock: { select: { name: true } },
            entryDate: true,
            exitDate: true,
          },
        },
      },
    });
  }

  /**
   * Obtener ciclo por ID con movimientos asociados
   */
  async findById(id: string, userId: string) {
    const cycle = await this.prisma.cycle.findUniqueOrThrow({
      where: { id },
      include: {
        farm: { select: { id: true, name: true } },
        herd: { select: { id: true, name: true } },
        movements: {
          include: {
            paddock: { select: { name: true } },
          },
          orderBy: { entryDate: 'asc' },
        },
      },
    });

    // Verificar acceso
    await this.verifyFarmAccess(cycle.farmId, userId);

    return cycle;
  }

  /**
   * Listar ciclos de una finca (con filtros opcionales)
   */
  async findByFarm(
    userId: string,
    farmId: string,
    filters?: {
      herdId?: string;
      status?: 'ACTIVE' | 'COMPLETED' | 'PLANNED';
      fromDate?: Date;
      toDate?: Date;
    }
  ) {
    // Verificar acceso
    await this.verifyFarmAccess(farmId, userId);

    const where: any = { farmId };

    if (filters?.herdId) where.herdId = filters.herdId;
    if (filters?.status) where.status = filters.status;

    if (filters?.fromDate || filters?.toDate) {
      where.startDate = {};
      if (filters.fromDate) where.startDate.gte = new Date(filters.fromDate);
      if (filters.toDate) where.startDate.lte = new Date(filters.toDate);
    }

    return this.prisma.cycle.findMany({
      where,
      include: {
        farm: { select: { name: true } },
        herd: { select: { name: true } },
        movements: {
          select: {
            id: true,
            paddock: { select: { name: true } },
            entryDate: true,
            exitDate: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Actualizar ciclo
   * Solo permite cambiar status o endDate
   */
  async update(id: string, dto: UpdateCycleDto, userId: string) {
    const cycle = await this.prisma.cycle.findUniqueOrThrow({
      where: { id },
    });

    // Verificar acceso
    await this.verifyFarmAccess(cycle.farmId, userId);

    // Validaciones
    if (dto.status === 'COMPLETED' && !dto.endDate) {
      throw new BadRequestException(
        'Se requiere fecha de finalización para completar el ciclo'
      );
    }

    if (dto.endDate && dto.endDate < cycle.startDate) {
      throw new BadRequestException(
        'La fecha de finalización no puede ser anterior a la fecha de inicio'
      );
    }

    return this.prisma.cycle.update({
      where: { id },
      data: {
        ...dto,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        updatedBy: userId,
      },
      include: {
        farm: { select: { name: true } },
        herd: { select: { name: true } },
        movements: {
          select: {
            id: true,
            paddock: { select: { name: true } },
            entryDate: true,
            exitDate: true,
          },
        },
      },
    });
  }

  /**
   * Eliminar ciclo (solo si no tiene movimientos)
   */
  async delete(id: string, userId: string) {
    const cycle = await this.prisma.cycle.findUniqueOrThrow({
      where: { id },
      include: { movements: true },
    });

    // Verificar acceso
    await this.verifyFarmAccess(cycle.farmId, userId);

    if (cycle.movements.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar un ciclo que contiene movimientos. ' +
        'Elimina los movimientos primero o cambia el status a COMPLETED'
      );
    }

    return this.prisma.cycle.delete({
      where: { id },
    });
  }

  /**
   * Obtener estadísticas del ciclo
   * - Total de días ocupación
   * - Potreros utilizados
   * - Ganancia de peso promedio
   */
  async getCycleStats(id: string, userId: string) {
    const cycle = await this.findById(id, userId);

    // Calcular total días ocupación
    let totalOccupancyDays = 0;
    const paddockSet = new Set<string>();

    for (const movement of cycle.movements) {
      if (movement.exitDate) {
        const days = Math.floor(
          (movement.exitDate.getTime() - movement.entryDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        totalOccupancyDays += days;
        paddockSet.add(movement.paddock.name);
      }
    }

    // Obtener pesajes en el período del ciclo
    const weighings = await this.prisma.weighing.findMany({
      where: {
        herdId: cycle.herdId,
        createdAt: {
          gte: cycle.startDate,
          lte: cycle.endDate || new Date(),
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    let weightGain = 0;
    if (weighings.length >= 2) {
      const firstWeight = weighings[0].realWeightKg || weighings[0].estimatedWeightKg;
      const lastWeight = weighings[weighings.length - 1].realWeightKg ||
                         weighings[weighings.length - 1].estimatedWeightKg;
      if (firstWeight && lastWeight) {
        weightGain = lastWeight - firstWeight;
      }
    }

    return {
      cycleId: cycle.id,
      status: cycle.status,
      startDate: cycle.startDate,
      endDate: cycle.endDate,
      totalMovements: cycle.movements.length,
      totalOccupancyDays,
      paddocksUsed: Array.from(paddockSet),
      weighingRecords: weighings.length,
      estimatedWeightGainKg: Math.round(weightGain * 10) / 10,
    };
  }

  /**
   * Cerrar ciclo (completarlo)
   */
  async completeCycle(id: string, userId: string) {
    return this.update(
      id,
      { status: 'COMPLETED', endDate: new Date() },
      userId
    );
  }

  /**
   * Verificar acceso del usuario a la finca
   */
  private async verifyFarmAccess(farmId: string, userId: string) {
    const userFarm = await this.prisma.userFarm.findUnique({
      where: { userId_farmId: { userId, farmId } },
    });

    if (!userFarm) {
      throw new ForbiddenException('No tienes acceso a esta finca');
    }
  }
}
