import { Module } from '@nestjs/common';
import { CycleService } from './cycle.service';
import { CycleController } from './cycle.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

/**
 * Módulo de Ciclos de Rotación
 * Gestiona ciclos completos de rotación para lotes en una finca
 *
 * Responsabilidades:
 * - Crear/actualizar/eliminar ciclos
 * - Validar ciclos activos por lote
 * - Calcular estadísticas del ciclo (días ocupación, peso ganado)
 * - Completar ciclos con fecha final
 */
@Module({
  imports: [PrismaModule],
  controllers: [CycleController],
  providers: [CycleService],
  exports: [CycleService],
})
export class CycleModule {}
