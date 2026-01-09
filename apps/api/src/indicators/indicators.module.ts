import { Module } from '@nestjs/common';
import { IndicatorsController } from './indicators.controller';
import { IndicatorsService } from './indicators.service';
import { PrismaModule } from '../common/prisma/prisma.module';

/**
 * Módulo de Indicadores Regenerativos
 * Proporciona servicios de cálculo de métricas de sostenibilidad ganadería regenerativa
 */
@Module({
  imports: [PrismaModule],
  controllers: [IndicatorsController],
  providers: [IndicatorsService],
  exports: [IndicatorsService],
})
export class IndicatorsModule {}
