import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ParameterService } from './parameter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../common/prisma/prisma.service';

/**
 * Gestión de parámetros globales y por finca
 * P0.3-P0.7 dependen de esta configuración
 */
@Controller('parameters')
@UseGuards(JwtAuthGuard)
export class ParameterController {
  constructor(
    private parameterService: ParameterService,
    private prisma: PrismaService,
  ) {}

  /**
   * Obtener todos los parámetros efectivos de una finca
   * (global + overrides específicos de finca)
   */
  @Get(':farmId')
  @ApiOperation({
    summary: 'Obtener parámetros de finca',
    description: `
      Retorna todos los parámetros configurables para una finca:
      - minRestDays: Mínimo descanso de potreros (default 30)
      - ua_weight_kg: Peso de unidad animal (default 450)
      - utilizationPercent: Porcentaje de utilización (default 80)
      - defaultIntakePercent: % consumo diario (default 2)
      
      Los valores de FarmParameter (override) tienen prioridad sobre global Parameter.
    `,
  })
  @ApiResponse({ status: 200, description: 'Parámetros de finca' })
  @ApiResponse({ status: 403, description: 'Sin acceso a finca' })
  async getFarmParameters(
    @Param('farmId') farmId: string,
    @Request() req: any,
  ) {
    await this.verifyFarmAccess(farmId, req.user.id);

    const params = await this.parameterService.getFarmParameters(farmId);

    return {
      farmId,
      parameters: params,
      source: 'MERGED', // global + farm overrides
    };
  }

  /**
   * Establecer override de parámetro para una finca específica
   */
  @Post(':farmId/override')
  @ApiOperation({
    summary: 'Establecer override de parámetro por finca',
    description: `
      Crea o actualiza un parámetro específico de finca (FarmParameter).
      Este valor tiene prioridad sobre el parámetro global.
      
      Ejemplo: override ua_weight_kg=500 para finca específica.
    `,
  })
  @ApiResponse({ status: 201, description: 'Override creado/actualizado' })
  @ApiResponse({ status: 403, description: 'Sin acceso a finca' })
  async setFarmParameterOverride(
    @Param('farmId') farmId: string,
    @Body() dto: { key: string; value: string; description?: string },
    @Request() req: any,
  ) {
    await this.verifyFarmAccess(farmId, req.user.id);

    const result = await this.parameterService.setFarmParameter(
      farmId,
      dto.key,
      dto.value,
      req.user.id,
      dto.description,
    );

    return {
      farmId,
      key: result.key,
      value: result.value,
      description: result.description,
      source: 'FARM_OVERRIDE',
    };
  }

  /**
   * Usar parámetros globales como defaults
   */
  @Post(':farmId/use-global')
  @ApiOperation({
    summary: 'Usar parámetro global en finca',
    description: `
      Elimina override y usa el valor global para este parámetro.
    `,
  })
  async useGlobalParameter(
    @Param('farmId') farmId: string,
    @Body() dto: { key: string },
    @Request() req: any,
  ) {
    await this.verifyFarmAccess(farmId, req.user.id);

    // Eliminar override
    await this.prisma.farmParameter.deleteMany({
      where: { farmId, key: dto.key },
    });

    // Obtener valor global
    const globalValue = await this.parameterService.getParameter(
      farmId,
      dto.key,
      '(default)',
    );

    return {
      farmId,
      key: dto.key,
      value: globalValue,
      source: 'GLOBAL',
      overrideRemoved: true,
    };
  }

  /**
   * Verificar acceso a finca
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
