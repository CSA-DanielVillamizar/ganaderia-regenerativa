import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { CalibrationService } from './calibration.service';
import { CalibrationController } from './calibration.controller';

/**
 * Módulo de Calibración por Finca
 * 
 * Permite ajustar la fórmula de estimación por cinta métrica
 * según características específicas de cada rebaño
 */
@Module({
  imports: [PrismaModule],
  controllers: [CalibrationController],
  providers: [CalibrationService],
  exports: [CalibrationService],
})
export class CalibrationModule {}
