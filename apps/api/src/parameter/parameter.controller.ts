import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ParameterService } from './parameter.service';

/**
 * Controlador HTTP para exponer parámetros de cálculo por finca.
 * Permite al frontend recuperar configuraciones como días mínimos de descanso.
 */
@ApiTags('Parámetros')
@Controller('parameters')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ParameterController {
  constructor(private readonly parameterService: ParameterService) {}

  /**
   * Obtener parámetros relevantes de la finca en un formato simple.
   * - minimumRestDays: número de días mínimos de descanso entre rotaciones
   */
  @Get()
  @ApiOperation({ summary: 'Obtener parámetros de finca' })
  async getByFarm(
    @Query('farmId') farmId: string,
    @Request() req: any
  ) {
    // Validación de acceso y obtención de valores
    const minimumRestDays = await this.parameterService.getParameterAsNumber(
      farmId,
      'min_rest_days',
      21
    );

    return {
      farmId,
      minimumRestDays,
    };
  }
}
