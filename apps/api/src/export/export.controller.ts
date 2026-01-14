import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ExportService, ExportFormat, ExportOptions } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

/**
 * Controlador de exportación de reportes
 * Maneja generación de reportes en múltiples formatos
 */
@ApiTags('Export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  /**
   * Exportar reporte de ciclo
   * GET /export/cycles/:cycleId?format=excel
   */
  @Get('cycles/:cycleId')
  @ApiOperation({
    summary: 'Exportar reporte de ciclo',
    description: 'Genera reporte completo de ciclo en formato especificado',
  })
  @ApiParam({ name: 'cycleId', description: 'ID del ciclo' })
  @ApiQuery({ name: 'format', enum: ExportFormat, description: 'Formato de exportación' })
  async exportCycle(
    @Param('cycleId') cycleId: string,
    @Query('format') format: string,
    @Request() req: any,
    @Res() res: Response
  ) {
    if (!Object.values(ExportFormat).includes(format as ExportFormat)) {
      throw new BadRequestException('Formato no válido. Opciones: pdf, xlsx, csv, json');
    }

    const options: ExportOptions = {
      format: format as ExportFormat,
    };

    const result = await this.exportService.exportCycleReport(cycleId, req.user.id, options);

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', result.size);

    res.send(result.buffer);
  }

  /**
   * Exportar reporte de pesajes
   * GET /export/weighings?farmId=farm-1&format=excel
   */
  @Get('weighings')
  @ApiOperation({
    summary: 'Exportar reporte de pesajes',
    description: 'Genera reporte de pesajes en formato especificado',
  })
  @ApiQuery({ name: 'farmId', description: 'ID de la finca' })
  @ApiQuery({ name: 'format', enum: ExportFormat, description: 'Formato de exportación' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Fecha inicio (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fecha fin (ISO 8601)' })
  async exportWeighings(
    @Query('farmId') farmId: string,
    @Query('format') format: string,
    @Request() req: any,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    if (!farmId) {
      throw new BadRequestException('farmId es requerido');
    }

    if (!Object.values(ExportFormat).includes(format as ExportFormat)) {
      throw new BadRequestException('Formato no válido. Opciones: pdf, xlsx, csv, json');
    }

    const options: ExportOptions = {
      format: format as ExportFormat,
      dateRange: {
        startDate: startDate
          ? new Date(startDate)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate) : new Date(),
      },
    };

    const result = await this.exportService.exportWeighingReport(farmId, req.user.id, options);

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', result.size);

    res.send(result.buffer);
  }

  /**
   * Exportar reporte de movimientos
   * GET /export/movements?farmId=farm-1&format=csv
   */
  @Get('movements')
  @ApiOperation({
    summary: 'Exportar reporte de movimientos',
    description: 'Genera reporte de movimientos de ganado en formato especificado',
  })
  @ApiQuery({ name: 'farmId', description: 'ID de la finca' })
  @ApiQuery({ name: 'format', enum: ExportFormat, description: 'Formato de exportación' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Fecha inicio (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fecha fin (ISO 8601)' })
  async exportMovements(
    @Query('farmId') farmId: string,
    @Query('format') format: string,
    @Request() req: any,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    if (!farmId) {
      throw new BadRequestException('farmId es requerido');
    }

    if (!Object.values(ExportFormat).includes(format as ExportFormat)) {
      throw new BadRequestException('Formato no válido. Opciones: pdf, xlsx, csv, json');
    }

    const options: ExportOptions = {
      format: format as ExportFormat,
      dateRange: {
        startDate: startDate
          ? new Date(startDate)
          : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate) : new Date(),
      },
    };

    const result = await this.exportService.exportMovementReport(farmId, req.user.id, options);

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', result.size);

    res.send(result.buffer);
  }

  /**
   * Exportar reporte de aforos
   * GET /export/forage?farmId=farm-1&format=pdf
   */
  @Get('forage')
  @ApiOperation({
    summary: 'Exportar reporte de aforos',
    description: 'Genera reporte de aforos de forraje en formato especificado',
  })
  @ApiQuery({ name: 'farmId', description: 'ID de la finca' })
  @ApiQuery({ name: 'format', enum: ExportFormat, description: 'Formato de exportación' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Fecha inicio (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fecha fin (ISO 8601)' })
  async exportForage(
    @Query('farmId') farmId: string,
    @Query('format') format: string,
    @Request() req: any,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    if (!farmId) {
      throw new BadRequestException('farmId es requerido');
    }

    if (!Object.values(ExportFormat).includes(format as ExportFormat)) {
      throw new BadRequestException('Formato no válido. Opciones: pdf, xlsx, csv, json');
    }

    const options: ExportOptions = {
      format: format as ExportFormat,
      dateRange: {
        startDate: startDate
          ? new Date(startDate)
          : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate) : new Date(),
      },
    };

    const result = await this.exportService.exportForageReport(farmId, req.user.id, options);

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', result.size);

    res.send(result.buffer);
  }

  /**
   * Exportar movimientos como CSV (REPORTES - Feature B)
   * GET /export/movements-csv/:farmId
   */
  @Get('movements-csv/:farmId')
  @ApiOperation({
    summary: 'Exportar movimientos a CSV',
    description:
      'Genera archivo CSV con todos los movimientos de la finca: Fecha Entrada, Fecha Salida, Hato, Potrero, Días Ocupación',
  })
  @ApiParam({ name: 'farmId', description: 'ID de la finca' })
  async exportMovementsCsv(
    @Param('farmId') farmId: string,
    @Request() req: any,
    @Res() res: Response
  ) {
    const result = await this.exportService.generateMovementsCsv(farmId, req.user.id);

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', result.size);

    res.send(result.buffer);
  }
}
