import { Controller, Get, Param, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { IndicatorsService, RegenerativeIndicators } from './indicators.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

/**
 * Controlador de indicadores regenerativos
 * Expone endpoints para cálculo y análisis de métricas de sostenibilidad
 */
@ApiTags('Indicators')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('indicators')
export class IndicatorsController {
  constructor(private indicatorsService: IndicatorsService) {}

  /**
   * Obtener indicadores regenerativos actuales de una finca
   * GET /indicators/farms/:farmId
   */
  @Get('farms/:farmId')
  @ApiOperation({
    summary: 'Obtener indicadores regenerativos de finca',
    description: 'Calcula métricas de salud de pastura, presión, recuperación y sostenibilidad',
  })
  @ApiParam({ name: 'farmId', description: 'ID de la finca' })
  async getFarmIndicators(
    @Param('farmId') farmId: string,
    @Request() req: any,
    @Query('days') daysToAnalyze?: string
  ): Promise<RegenerativeIndicators> {
    if (!farmId) {
      throw new BadRequestException('farmId es requerido');
    }

    const days = daysToAnalyze ? parseInt(daysToAnalyze, 10) : 30;
    if (isNaN(days) || days < 1 || days > 365) {
      throw new BadRequestException('days debe ser entre 1 y 365');
    }

    return this.indicatorsService.calculateFarmIndicators(farmId, req.user.id, days);
  }

  /**
   * Obtener análisis de tendencias de indicadores
   * GET /indicators/farms/:farmId/trends
   */
  @Get('farms/:farmId/trends')
  @ApiOperation({
    summary: 'Análisis de tendencias',
    description: 'Compara indicadores de últimos 30 días contra período anterior',
  })
  @ApiParam({ name: 'farmId', description: 'ID de la finca' })
  async getFarmTrends(
    @Param('farmId') farmId: string,
    @Request() req: any
  ): Promise<any> {
    if (!farmId) {
      throw new BadRequestException('farmId es requerido');
    }

    // Calcular indicadores del período actual y anterior
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const indicators = await this.indicatorsService.calculateFarmIndicators(
      farmId,
      req.user.id,
      30
    );

    return {
      farm: indicators.farm,
      period: indicators.period,
      trends: indicators.trends,
      recommendations: indicators.recommendations,
      analysisDate: new Date(),
    };
  }

  /**
   * Obtener análisis de recuperación por potrero
   * GET /indicators/farms/:farmId/recovery-analysis
   */
  @Get('farms/:farmId/recovery-analysis')
  @ApiOperation({
    summary: 'Análisis de recuperación por potrero',
    description: 'Detalla estado de descanso y recuperación de cada potrero',
  })
  @ApiParam({ name: 'farmId', description: 'ID de la finca' })
  async getRecoveryAnalysis(
    @Param('farmId') farmId: string,
    @Request() req: any
  ): Promise<any> {
    if (!farmId) {
      throw new BadRequestException('farmId es requerido');
    }

    const indicators = await this.indicatorsService.calculateFarmIndicators(
      farmId,
      req.user.id,
      30
    );

    return {
      farm: indicators.farm,
      period: indicators.period,
      paddockAnalysis: indicators.paddockAnalysis,
      recoveryIndexOverall: indicators.pastureHealth.recoveryIndex,
      recommendation: this.getRecoveryRecommendation(indicators.pastureHealth.recoveryIndex),
    };
  }

  /**
   * Obtener score de sostenibilidad general
   * GET /indicators/farms/:farmId/sustainability
   */
  @Get('farms/:farmId/sustainability')
  @ApiOperation({
    summary: 'Score de sostenibilidad',
    description: 'Calcula métrica integral de salud regenerativa (0-1)',
  })
  @ApiParam({ name: 'farmId', description: 'ID de la finca' })
  async getSustainabilityScore(
    @Param('farmId') farmId: string,
    @Request() req: any
  ): Promise<any> {
    if (!farmId) {
      throw new BadRequestException('farmId es requerido');
    }

    const indicators = await this.indicatorsService.calculateFarmIndicators(
      farmId,
      req.user.id,
      30
    );

    const scoreLevel = this.getSustainabilityLevel(indicators.pastureHealth.sustainabilityScore);

    return {
      farm: indicators.farm,
      sustainabilityScore: indicators.pastureHealth.sustainabilityScore,
      scoreLevel,
      factors: {
        pastorePressure: {
          value: indicators.pastureHealth.pastorePressure,
          ideal: '0.5-3.0 UA/ha',
          status: this.getFactorStatus(
            indicators.pastureHealth.pastorePressure,
            0.5,
            3.0
          ),
        },
        recoveryIndex: {
          value: indicators.pastureHealth.recoveryIndex,
          ideal: '≥ 2.0',
          status: indicators.pastureHealth.recoveryIndex >= 2 ? 'ÓPTIMO' : 'BAJO',
        },
        forageLevel: {
          value: indicators.pastureHealth.forageLevelKgMSHa,
          ideal: '≥ 1500 kg MS/ha',
          status: indicators.pastureHealth.forageLevelKgMSHa >= 1500 ? 'ÓPTIMO' : 'BAJO',
        },
      },
      recommendations: indicators.recommendations,
      analysisDate: new Date(),
    };
  }

  /**
   * Helper: Determinar estado de factor
   */
  private getFactorStatus(value: number, min: number, max: number): string {
    if (value >= min && value <= max) return 'ÓPTIMO';
    if (value < min) return 'BAJO';
    return 'ALTO';
  }

  /**
   * Helper: Obtener nivel de sostenibilidad por score
   */
  private getSustainabilityLevel(score: number): string {
    if (score >= 0.8) return 'EXCELENTE';
    if (score >= 0.6) return 'BUENO';
    if (score >= 0.4) return 'REGULAR';
    return 'CRÍTICO';
  }

  /**
   * Helper: Recomendación de recuperación
   */
  private getRecoveryRecommendation(recoveryIndex: number): string {
    if (recoveryIndex >= 3) return 'Excelente recuperación. Considera intensificar rotación';
    if (recoveryIndex >= 2) return 'Recuperación adecuada. Sistema en equilibrio';
    if (recoveryIndex >= 1.5) return 'Recuperación limitada. Aumenta período de descanso';
    return 'Recuperación crítica. Rediseña sistema rotacional';
  }
}
