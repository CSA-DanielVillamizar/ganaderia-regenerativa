import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Obtener resumen del dashboard' })
  @ApiResponse({ status: 200, description: 'Resumen generado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  getSummary(@Query('farmId') farmId: string, @Request() req: any) {
    return this.dashboardService.getSummary(farmId, req.user.id);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Obtener tendencias de peso y UA' })
  @ApiResponse({ status: 200, description: 'Tendencias generadas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  getTrends(@Query('farmId') farmId: string, @Query('herdId') herdId?: string, @Request() req?: any) {
    return this.dashboardService.getTrends(farmId, req.user.id, herdId);
  }

  @Get('rotation-status')
  @ApiOperation({ summary: 'Obtener estado de rotación' })
  @ApiResponse({ status: 200, description: 'Estado calculado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  getRotationStatus(@Query('farmId') farmId: string, @Request() req: any) {
    return this.dashboardService.getRotationStatus(farmId, req.user.id);
  }

  @Get('forage-stats')
  @ApiOperation({ summary: 'Obtener stats de aforos' })
  @ApiResponse({ status: 200, description: 'Estadísticas generadas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  getForageStats(@Query('farmId') farmId: string, @Request() req: any) {
    return this.dashboardService.getForageStats(farmId, req.user.id);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Obtener alertas del sistema' })
  @ApiResponse({ status: 200, description: 'Alertas obtenidas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  getAlerts(@Query('farmId') farmId: string, @Request() req: any) {
    return this.dashboardService.getAlerts(farmId, req.user.id);
  }

  @Get(':farmId/paddock-statuses')
  @ApiOperation({ summary: 'Obtener estado detallado de todos los potreros' })
  @ApiResponse({ status: 200, description: 'Estados obtenidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  getPaddockStatuses(@Param('farmId') farmId: string, @Request() req: any) {
    return this.dashboardService.getPaddockStatuses(farmId, req.user.id);
  }

  @Get(':farmId/decision-today')
  @ApiOperation({
    summary: 'P0.7 - Dashboard de decisión diaria',
    description: `
      Retorna información clave para tomar decisión de rotación hoy:
      - readyPaddocks: Potreros listos para ingresar (descanso >= minRestDays)
      - warnings: Alertas de forraje bajo, descanso insuficiente, rotación retrasada
      - recommendedNextPaddock: Sugerencia del mejor potrero para rotar

      Usa datos de P0.3 (aforos), P0.4 (días recomendados), P0.5 (descanso)
    `,
  })
  @ApiResponse({ status: 200, description: 'Decisión generada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado a la finca' })
  getDecisionToday(@Param('farmId') farmId: string, @Request() req: any) {
    return this.dashboardService.getDecisionToday(farmId, req.user.id);
  }
}
