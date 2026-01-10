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
import { PaddockService } from './paddock.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HeaderAuthGuard } from '../auth/guards/header-auth.guard';
import { CreatePaddockDto } from '@shared/index';

@ApiTags('Potreros')
@Controller('paddocks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaddockController {
  constructor(private paddockService: PaddockService) {}

  @Post()
  @ApiOperation({ summary: 'Crear potrero' })
  @ApiResponse({ status: 201, description: 'Potrero creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  create(@Body() dto: CreatePaddockDto, @Request() req: any) {
    return this.paddockService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar potreros de finca' })
  @ApiResponse({ status: 200, description: 'Listado de potreros' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  findByFarm(@Query('farmId') farmId: string, @Request() req: any) {
    return this.paddockService.findByFarm(farmId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener potrero por ID' })
  @ApiResponse({ status: 200, description: 'Detalle del potrero' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 404, description: 'Potrero no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.paddockService.findOne(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar potrero' })
  @ApiResponse({ status: 200, description: 'Potrero actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 404, description: 'Potrero no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreatePaddockDto>,
    @Request() req: any
  ) {
    return this.paddockService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar potrero' })
  @ApiResponse({ status: 200, description: 'Potrero eliminado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 404, description: 'Potrero no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.paddockService.remove(id, req.user.id);
  }

  @Get(':id/stocking-rate')
  @ApiOperation({ summary: 'Obtener carga animal (UA/ha) del potrero' })
  @ApiResponse({ status: 200, description: 'Carga animal calculada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 404, description: 'Potrero no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @UseGuards(HeaderAuthGuard, JwtAuthGuard)
  getStockingRate(@Param('id') id: string, @Request() req: any) {
    return this.paddockService.getStockingRate(id, req.user.id);
  }

  @Get(':id/recommended-days')
  @ApiOperation({
    summary: 'P0.4 - Calcular días recomendados de pastoreo',
    description: 'Calcula cuántos días puede pastar el hato en el potrero basado en forraje disponible y consumo diario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Días recomendados calculados con consejo de rotación' 
  })
  @ApiResponse({ status: 400, description: 'No hay aforos o hato activo en el potrero' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 404, description: 'Potrero no encontrado' })
  getRecommendedDays(
    @Param('id') id: string,
    @Query('intakePercent') intakePercent?: string,
    @Request() req?: any
  ) {
    const intakePercentNumber = intakePercent ? parseFloat(intakePercent) : 2.0;
    return this.paddockService.getRecommendedDays(id, req.user.id, intakePercentNumber);
  }
}
