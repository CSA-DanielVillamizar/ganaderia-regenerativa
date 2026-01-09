import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CalibrationService } from './calibration.service';
import { CreateCalibrationDto } from './dto/calibration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Controlador de Calibración
 * 
 * Endpoints para gestionar calibraciones de fórmulas por finca
 */
@Controller('calibration')
@UseGuards(JwtAuthGuard)
export class CalibrationController {
  constructor(private calibrationService: CalibrationService) {}

  /**
   * Obtiene calibración actual de finca
   */
  @Get('farms/:farmId')
  async getByFarm(@Param('farmId') farmId: string) {
    return this.calibrationService.getByFarm(farmId);
  }

  /**
   * Crea/actualiza calibración manual
   */
  @Post('farms/:farmId')
  async createOrUpdate(
    @Param('farmId') farmId: string,
    @Body() dto: CreateCalibrationDto,
  ) {
    if (dto.divisor < 10000 || dto.divisor > 13000) {
      throw new BadRequestException(
        'Divisor debe estar entre 10000 y 13000',
      );
    }

    return this.calibrationService.upsert(farmId, dto);
  }

  /**
   * Valida calibración después de revisión
   */
  @Put('farms/:farmId/validate')
  async validateCalibration(@Param('farmId') farmId: string) {
    return this.calibrationService.validate(farmId);
  }

  /**
   * Obtiene historial de calibraciones
   */
  @Get('farms/:farmId/history')
  async getHistory(@Param('farmId') farmId: string) {
    return this.calibrationService.getHistory(farmId);
  }

  /**
   * Realiza calibración automática con pesajes reales
   */
  @Post('farms/:farmId/auto-calibrate')
  async autoCalibrate(
    @Param('farmId') farmId: string,
    @Body() dto: { weighings: Array<{
      actualWeight: number;
      chestGirth: number;
      bodyLength: number;
    }> },
  ) {
    if (!dto.weighings || dto.weighings.length === 0) {
      throw new BadRequestException('Se requieren pesajes para calibración');
    }

    return this.calibrationService.performCalibration(
      farmId,
      dto.weighings,
    );
  }
}
