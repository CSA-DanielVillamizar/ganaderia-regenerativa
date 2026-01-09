import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { PrismaModule } from '../common/prisma/prisma.module';

/**
 * Módulo de Exportación de Reportes
 * Proporciona servicios de generación de reportes en múltiples formatos
 */
@Module({
  imports: [PrismaModule],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
