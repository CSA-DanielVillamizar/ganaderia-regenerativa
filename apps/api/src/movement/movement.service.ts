import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateMovementDto } from './dto/create-movement.dto';

@Injectable()
export class MovementService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear movimiento (entrada/salida a potrero)
   * Valida que el lote no tenga movimientos activos en otros potreros
   */
  async create(dto: CreateMovementDto, userId: string) {
    const herd = await this.prisma.herd.findUniqueOrThrow({
      where: { id: dto.herdId },
    });

    await this.verifyFarmAccess(herd.farmId, userId);

    const entryDate = new Date(dto.entryDate);
    if (Number.isNaN(entryDate.getTime())) {
      throw new BadRequestException('entryDate no tiene formato ISO válido');
    }

    const exitDateValue = dto.exitDate ? new Date(dto.exitDate) : null;
    if (dto.exitDate && Number.isNaN(exitDateValue?.getTime())) {
      throw new BadRequestException('exitDate no tiene formato ISO válido');
    }
    if (exitDateValue && exitDateValue.getTime() < entryDate.getTime()) {
      throw new BadRequestException('exitDate no puede ser anterior a entryDate');
    }

    // P0.1: Validar que no haya movimientos activos del mismo lote
    await this.validateNoActiveMovements(dto.herdId);

    // P0.1: Bloquear doble ocupación del potrero por otro lote
    await this.validatePaddockNotOccupied(dto.paddockId);

    // P0.5: Validar descanso mínimo del potrero
    const paddock = await this.prisma.paddock.findUniqueOrThrow({
      where: { id: dto.paddockId },
    });
    const farm = await this.prisma.farm.findUniqueOrThrow({
      where: { id: paddock.farmId },
    });
    const minRestDaysParam = await this.prisma.parameter.findFirst({
      where: {
        farmId: farm.id,
        key: 'minRestDays',
      },
    });
    const minRestDays = minRestDaysParam?.value ? parseInt(minRestDaysParam.value, 10) : 30;

    await this.validateMinimumRestDays(dto.paddockId, entryDate, minRestDays);

    return this.prisma.movement.create({
      data: {
        herdId: dto.herdId,
        paddockId: dto.paddockId,
        cycleId: dto.cycleId,
        type: dto.type,
        entryDate,
        exitDate: exitDateValue,
        notes: dto.notes,
        status: 'ACTIVE',
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  /**
   * P0.1: Cerrar movimiento (registrar salida)
   */
  async closeMovement(id: string, exitDateIso: string, userId: string) {
    const movement = await this.prisma.movement.findUniqueOrThrow({
      where: { id },
      include: { herd: true },
    });

    await this.verifyFarmAccess(movement.herd.farmId, userId);

    if (movement.status === 'CLOSED') {
      throw new BadRequestException('Este movimiento ya está cerrado');
    }

    const exitDate = new Date(exitDateIso);
    if (Number.isNaN(exitDate.getTime())) {
      throw new BadRequestException('exitDate no tiene formato ISO válido');
    }

    if (exitDate < movement.entryDate) {
      throw new BadRequestException('La fecha de salida no puede ser anterior a la fecha de entrada');
    }

    // P0.1: Actualizar movement + Paddock.lastExitDate en transacción
    const updatedMovement = await this.prisma.movement.update({
      where: { id },
      data: {
        exitDate,
        status: 'CLOSED',
        updatedBy: userId,
      },
    });

    // P0.1: Actualizar Paddock.lastExitDate para cálculo de descanso
    await this.prisma.paddock.update({
      where: { id: movement.paddockId },
      data: { lastExitDate: exitDate },
    });

    return updatedMovement;
  }

  /**
   * P0.1: Validar que no existan movimientos activos para el lote
   */
  private async validateNoActiveMovements(herdId: string): Promise<void> {
    const activeMovement = await this.prisma.movement.findFirst({
      where: {
        herdId,
        status: 'ACTIVE',
      },
      include: {
        paddock: true,
      },
    });

    if (activeMovement) {
      throw new ConflictException(
        `El lote ya tiene un movimiento activo en el potrero "${activeMovement.paddock.name}". ` +
        'Debe cerrar ese movimiento antes de crear uno nuevo.'
      );
    }
  }

  /**
   * Validar que el potrero no esté ocupado por otro lote
   */
  private async validatePaddockNotOccupied(paddockId: string): Promise<void> {
    const activeInPaddock = await this.prisma.movement.findFirst({
      where: {
        paddockId,
        status: 'ACTIVE',
      },
      include: { herd: true },
    });

    if (activeInPaddock) {
      throw new ConflictException(
        `El potrero ya está ocupado por el lote "${activeInPaddock.herd.name}" con un movimiento activo.`
      );
    }
  }

  /**
   * P0.5: Validar que el potrero ha completado su descanso mínimo
   * Previene entradas prematuras que afecten recuperación del forraje
   */
  /**
   * P0.5 - VALIDACIÓN DESCANSO POTRERO
   * Valida que el potrero ha descansado el tiempo mínimo requerido
   * desde el último movimiento cerrado (exitDate)
   * 
   * @param paddockId - UUID del potrero
   * @param proposedEntryDate - Fecha propuesta de entrada
   * @param minRestDays - Días mínimos de descanso requeridos
   * @throws BadRequestException si no ha descansado suficiente
   */
  private async validateMinimumRestDays(
    paddockId: string,
    proposedEntryDate: Date,
    minRestDays: number
  ): Promise<void> {
    // Buscar último movimiento cerrado con exitDate
    const lastClosedMovement = await this.prisma.movement.findFirst({
      where: {
        paddockId,
        status: 'CLOSED',
        exitDate: { not: null },
      },
      orderBy: { exitDate: 'desc' },
      take: 1,
    });

    if (!lastClosedMovement || !lastClosedMovement.exitDate) {
      // Primer movimiento en este potrero, sin restricción
      return;
    }

    // Calcular días de descanso real
    const actualRestDays = Math.floor(
      (proposedEntryDate.getTime() - lastClosedMovement.exitDate.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    if (actualRestDays < minRestDays) {
      const daysShort = minRestDays - actualRestDays;
      const recommendedDate = new Date(
        lastClosedMovement.exitDate.getTime() + minRestDays * 86400000
      );

      throw new BadRequestException({
        message: `El potrero no ha descansado lo suficiente`,
        details: {
          minRestDaysRequired: minRestDays,
          daysRested: actualRestDays,
          daysShort,
          lastExitDate: lastClosedMovement.exitDate.toISOString(),
          recommendedEntryDate: recommendedDate.toISOString(),
          advice: `El potrero necesita ${daysShort} días más de descanso. ` +
                  `Entrada recomendada: ${recommendedDate.toLocaleDateString('es-CO')}`
        }
      });
    }
  }

  /**
   * Obtener movimientos de lote
   */
  async findByHerd(herdId: string, userId: string) {
    const herd = await this.prisma.herd.findUniqueOrThrow({
      where: { id: herdId },
    });

    await this.verifyFarmAccess(herd.farmId, userId);

    return this.prisma.movement.findMany({
      where: { herdId },
      include: {
        paddock: true,
        cycle: true,
      },
      orderBy: { entryDate: 'desc' },
    });
  }

  /**
   * Actualizar movimiento
   */
  async update(id: string, dto: Partial<CreateMovementDto>, userId: string) {
    const movement = await this.prisma.movement.findUniqueOrThrow({
      where: { id },
      include: { herd: true },
    });

    await this.verifyFarmAccess(movement.herd.farmId, userId);

    return this.prisma.movement.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Calcular días ocupación
   */
  async calculateOccupancyDays(id: string): Promise<number | null> {
    const movement = await this.prisma.movement.findUniqueOrThrow({
      where: { id },
    });

    if (!movement.exitDate) return null;

    const days = Math.floor(
      (movement.exitDate.getTime() - movement.entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return days;
  }

  /**
   * Calcular días de descanso del potrero desde última salida
   */
  async calculatePaddockRestDays(paddockId: string): Promise<number | null> {
    const lastMovement = await this.prisma.movement.findFirst({
      where: {
        paddockId,
        status: 'CLOSED',
        exitDate: { not: null },
      },
      orderBy: { exitDate: 'desc' },
    });

    if (!lastMovement || !lastMovement.exitDate) return null;

    const now = new Date();
    const days = Math.floor(
      (now.getTime() - lastMovement.exitDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return days;
  }

  /**
   * Obtener último movimiento de potrero con fecha de salida
   */
  async getLastPaddockExit(paddockId: string): Promise<{ exitDate: Date; herdName: string } | null> {
    const lastMovement = await this.prisma.movement.findFirst({
      where: {
        paddockId,
        status: 'CLOSED',
        exitDate: { not: null },
      },
      include: { herd: true },
      orderBy: { exitDate: 'desc' },
    });

    if (!lastMovement || !lastMovement.exitDate) return null;

    return {
      exitDate: lastMovement.exitDate,
      herdName: lastMovement.herd.name,
    };
  }

  /**
   * Obtener historial de movimientos con paginación y filtros
   * @param userId - ID del usuario para verificar acceso a la finca
   * @param herdId - Filtro opcional por lote
   * @param paddockId - Filtro opcional por potrero
   * @param status - Filtro opcional por estado (ACTIVE, CLOSED)
   * @param page - Número de página (1-based)
   * @param limit - Registros por página (default 10, max 100)
   */
  async findAll(
    userId: string,
    filters: {
      herdId?: string;
      paddockId?: string;
      status?: 'ACTIVE' | 'CLOSED';
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 10));
    const skip = (page - 1) * limit;

    // Construir objeto where dinámico
    const where: any = {};

    if (filters.herdId) {
      // Verificar acceso a la finca del lote
      const herd = await this.prisma.herd.findUniqueOrThrow({
        where: { id: filters.herdId },
      });
      await this.verifyFarmAccess(herd.farmId, userId);
      where.herdId = filters.herdId;
    }

    if (filters.paddockId) {
      where.paddockId = filters.paddockId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Si no hay filtros, obtener todos de la finca del usuario
    if (!filters.herdId && !filters.paddockId) {
      const userFarms = await this.prisma.userFarm.findMany({
        where: { userId },
        select: { farmId: true },
      });
      const farmIds = userFarms.map(uf => uf.farmId);

      const herds = await this.prisma.herd.findMany({
        where: { farmId: { in: farmIds } },
        select: { id: true },
      });
      const herdIds = herds.map(h => h.id);

      if (herdIds.length === 0) {
        return {
          data: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        };
      }

      where.herdId = { in: herdIds };
    }

    // Obtener total y datos
    const [total, movements] = await Promise.all([
      this.prisma.movement.count({ where }),
      this.prisma.movement.findMany({
        where,
        include: {
          herd: true,
          paddock: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: movements,
      pagination: { total, page, limit, totalPages },
    };
  }

  private async verifyFarmAccess(farmId: string, userId: string) {
    const userFarm = await this.prisma.userFarm.findUnique({
      where: { userId_farmId: { userId, farmId } },
    });

    if (!userFarm) {
      throw new ForbiddenException('No tienes acceso a esta finca');
    }
  }

  /**
   * Obtiene alertas de sobrepastoreo detectando movimientos que exceden días de descanso permitidos.
   * Compara días de ocupación actual contra máximo permitido según temporada.
   * @param userId ID del usuario propietario de la finca
   * @returns Array de alertas con datos del movimiento y métricas de exceso
   */
  async getOvergrazingAlerts(userId: string) {
    try {
      // Obtener la finca del usuario
      const userFarms = await this.prisma.userFarm.findMany({
        where: { userId },
        select: { farmId: true },
      });

      if (!userFarms.length) {
        return { data: [] };
      }

      const farmIds = userFarms.map((uf: any) => uf.farmId);

      // Obtener todos los movimientos activos con relaciones
      const activeMovements = await this.prisma.movement.findMany({
        where: {
          status: 'ACTIVE',
          herd: { farmId: { in: farmIds } },
        },
        include: {
          herd: { select: { id: true, name: true } },
          paddock: { select: { id: true, name: true, minRestDays: true } },
        },
        orderBy: { entryDate: 'asc' },
      });

      // Procesar alertas
      const alerts = activeMovements
        .map((movement: any) => {
          const daysOccupied = this.calculateDaysOccupied(movement.entryDate);
          const maxAllowedDays = movement.paddock?.minRestDays || 30;
          const exceedDays = Math.max(0, daysOccupied - maxAllowedDays);

          return {
            id: movement.id,
            herdId: movement.herdId,
            herdName: movement.herd?.name,
            paddockId: movement.paddockId,
            paddockName: movement.paddock?.name,
            daysOccupied,
            maxAllowedDays,
            exceedDays,
            entryDate: movement.entryDate,
            severity: this.calculateSeverity(daysOccupied, maxAllowedDays),
          };
        })
        .filter((alert: any) => alert.exceedDays > 0) // Solo alertas activas
        .sort((a: any, b: any) => b.exceedDays - a.exceedDays); // Ordenar por gravedad

      return {
        data: alerts,
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter((a: any) => a.severity === 'CRITICAL').length,
        highAlerts: alerts.filter((a: any) => a.severity === 'HIGH').length,
      };
    } catch (error: any) {
      console.error(`Error obteniendo alertas: ${error?.message || 'Unknown error'}`);
      throw new Error('Error al obtener alertas de sobrepastoreo');
    }
  }

  /**
   * Calcula días de ocupación desde la fecha de entrada hasta hoy
   */
  private calculateDaysOccupied(entryDate: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(entryDate).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcula severidad de alerta basado en porcentaje de exceso
   */
  private calculateSeverity(daysOccupied: number, maxAllowedDays: number): 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const percentExceeded = ((daysOccupied - maxAllowedDays) / maxAllowedDays) * 100;

    if (percentExceeded >= 50) return 'CRITICAL';
    if (percentExceeded >= 25) return 'HIGH';
    return 'MEDIUM';
  }
}
