import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MovementService } from './movement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMovementDto } from './dto/create-movement.dto';
import { CloseMovementDto } from './dto/close-movement.dto';

@ApiTags('Movimientos')
@Controller('movements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MovementController {
  constructor(private movementService: MovementService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar movimiento entrada/salida' })
  @ApiResponse({
    status: 201,
    description: 'Movimiento creado',
    schema: {
      example: {
        id: 'mov-123',
        herdId: 'herd-123',
        paddockId: 'paddock-123',
        type: 'ENTRY',
        status: 'ACTIVE',
        entryDate: '2025-01-01T00:00:00.000Z',
        exitDate: null,
        notes: 'Ingreso programado',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o formato de fecha incorrecto' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 409, description: 'Conflicto: lote o potrero ya ocupado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  create(@Body() dto: CreateMovementDto, @Request() req: any) {
    return this.movementService.create(dto, req.user.id);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Cerrar movimiento (registrar salida del potrero)' })
  @ApiResponse({
    status: 200,
    description: 'Movimiento cerrado',
    schema: {
      example: {
        id: 'mov-123',
        status: 'CLOSED',
        exitDate: '2025-01-10T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Fecha inválida o movimiento ya cerrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto de negocio' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  close(
    @Param('id') id: string,
    @Body() dto: CloseMovementDto,
    @Request() req: any
  ) {
    return this.movementService.closeMovement(id, dto.exitDate, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener historial de movimientos con paginación',
    description: 'Lista movimientos del usuario con opciones de filtro por herdId, paddockId, status y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de movimientos',
    schema: {
      example: {
        data: [
          {
            id: 'mov-123',
            herdId: 'herd-123',
            paddockId: 'paddock-123',
            type: 'ENTRY',
            status: 'ACTIVE',
            entryDate: '2025-01-01T00:00:00.000Z',
            exitDate: null,
            daysOccupied: null,
            notes: 'Ingreso',
            herd: { id: 'herd-123', name: 'Lote A' },
            paddock: { id: 'paddock-123', name: 'Potrero Norte' },
          },
        ],
        pagination: { total: 50, page: 1, limit: 10, totalPages: 5 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  findAll(
    @Query('herdId') herdId?: string,
    @Query('paddockId') paddockId?: string,
    @Query('status') status?: 'ACTIVE' | 'CLOSED',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any
  ) {
    return this.movementService.findAll(req.user.id, {
      herdId,
      paddockId,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id/occupancy')
  @ApiOperation({ summary: 'Calcular días ocupación' })
  @ApiResponse({ status: 200, description: 'Días de ocupación calculados' })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  occupancyDays(@Param('id') id: string) {
    return this.movementService.calculateOccupancyDays(id);
  }

  @Get('alerts/overgrazing')
  @ApiOperation({
    summary: 'Obtener alertas de sobrepastoreo',
    description: 'Detecta movimientos activos que exceden el período recomendado de descanso según la temporada',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alertas de sobrepastoreo',
    schema: {
      example: {
        data: [
          {
            id: 'mov-123',
            herdId: 'herd-123',
            herdName: 'Lote A',
            paddockId: 'paddock-123',
            paddockName: 'Potrero Norte',
            daysOccupied: 45,
            maxAllowedDays: 30,
            exceedDays: 15,
            entryDate: '2025-01-01T00:00:00.000Z',
            severity: 'HIGH',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  getAlerts(@Request() req: any) {
    return this.movementService.getOvergrazingAlerts(req.user.id);
  }
}
