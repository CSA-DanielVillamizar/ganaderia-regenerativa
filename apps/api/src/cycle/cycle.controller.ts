import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CycleService, CreateCycleDto, UpdateCycleDto } from './cycle.service';

/**
 * Controller para gestión de ciclos de rotación
 * Endpoints CRUD y estadísticas de ciclos por lote/finca
 */
@Controller('api/v1/cycles')
@UseGuards(JwtAuthGuard)
export class CycleController {
  constructor(private cycleService: CycleService) {}

  /**
   * Crear nuevo ciclo
   * POST /cycles
   */
  @Post()
  async create(@Body() dto: CreateCycleDto, @Request() req: any) {
    if (!dto.farmId || !dto.herdId || !dto.startDate) {
      throw new BadRequestException('farmId, herdId y startDate son requeridos');
    }

    return this.cycleService.create(dto, req.user.id);
  }

  /**
   * Obtener ciclo por ID
   * GET /cycles/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: any) {
    return this.cycleService.findById(id, req.user.id);
  }

  /**
   * Listar ciclos de una finca
   * GET /cycles?farmId=...&herdId=...&status=ACTIVE
   */
  @Get()
  async findByFarm(
    @Query('farmId') farmId: string,
    @Query('herdId') herdId?: string,
    @Query('status') status?: 'ACTIVE' | 'COMPLETED' | 'PLANNED',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Request() req?: any
  ) {
    if (!farmId) {
      throw new BadRequestException('farmId es requerido');
    }

    return this.cycleService.findByFarm(req.user.id, farmId, {
      herdId,
      status,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  /**
   * Actualizar ciclo
   * PATCH /cycles/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCycleDto,
    @Request() req: any
  ) {
    return this.cycleService.update(id, dto, req.user.id);
  }

  /**
   * Eliminar ciclo
   * DELETE /cycles/:id
   */
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.cycleService.delete(id, req.user.id);
  }

  /**
   * Obtener estadísticas del ciclo
   * GET /cycles/:id/stats
   */
  @Get(':id/stats')
  async getStats(@Param('id') id: string, @Request() req: any) {
    return this.cycleService.getCycleStats(id, req.user.id);
  }

  /**
   * Completar ciclo
   * POST /cycles/:id/complete
   */
  @Post(':id/complete')
  async complete(@Param('id') id: string, @Request() req: any) {
    return this.cycleService.completeCycle(id, req.user.id);
  }
}
