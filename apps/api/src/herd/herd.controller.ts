import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HerdService } from './herd.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateHerdDto } from '@shared/index';

@ApiTags('Lotes')
@Controller('herds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HerdController {
  constructor(private herdService: HerdService) {}

  @Post()
  @ApiOperation({ summary: 'Crear lote' })
  @ApiResponse({ status: 201, description: 'Lote creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  create(@Body() dto: CreateHerdDto, @Request() req: any) {
    return this.herdService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar lotes de finca' })
  @ApiResponse({ status: 200, description: 'Listado de lotes' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  findByFarm(@Query('farmId') farmId: string, @Request() req: any) {
    return this.herdService.findByFarm(farmId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener lote por ID' })
  @ApiResponse({ status: 200, description: 'Detalle de lote' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.herdService.findOne(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar lote' })
  @ApiResponse({ status: 200, description: 'Lote actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateHerdDto>,
    @Request() req: any
  ) {
    return this.herdService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar lote' })
  @ApiResponse({ status: 200, description: 'Lote eliminado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.herdService.remove(id, req.user.id);
  }
}
