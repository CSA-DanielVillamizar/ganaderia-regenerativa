import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import * as XLSX from 'xlsx';

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'xlsx',
  CSV = 'csv',
  JSON = 'json',
}

export interface ExportOptions {
  format: ExportFormat;
  includeCharts?: boolean;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface ExportResult {
  filename: string;
  mimeType: string;
  buffer: Buffer;
  size: number;
}

/**
 * Servicio de exportación de reportes
 * Proporciona generación de reportes en múltiples formatos (PDF, Excel, CSV, JSON)
 */
@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Exportar reporte de ciclo completo
   */
  async exportCycleReport(
    cycleId: string,
    userId: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    // Obtener datos del ciclo
    const cycle = await this.prisma.cycle.findUnique({
      where: { id: cycleId },
      include: {
        herd: { include: { animals: true } },
        farm: true,
        movements: {
          include: {
            paddock: true,
          },
        },
      },
    });

    if (!cycle) {
      throw new NotFoundException('Ciclo no encontrado');
    }

    // Verificar acceso
    const userFarm = await this.prisma.userFarm.findUnique({
      where: { userId_farmId: { userId, farmId: cycle.farmId } },
    });

    if (!userFarm) {
      throw new BadRequestException('No tienes acceso a esta finca');
    }

    // Preparar datos
    const reportData = this.prepareCycleReportData(cycle);

    // Generar en formato solicitado
    switch (options.format) {
      case ExportFormat.PDF:
        return this.generatePDFReport(reportData, 'cycle');
      case ExportFormat.EXCEL:
        return this.generateExcelReport(reportData, 'cycle');
      case ExportFormat.CSV:
        return this.generateCSVReport(reportData, 'cycle');
      case ExportFormat.JSON:
        return this.generateJSONReport(reportData, 'cycle');
      default:
        throw new BadRequestException('Formato no soportado');
    }
  }

  /**
   * Exportar reporte de pesajes
   */
  async exportWeighingReport(
    farmId: string,
    userId: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    // Verificar acceso
    const userFarm = await this.prisma.userFarm.findUnique({
      where: { userId_farmId: { userId, farmId } },
    });

    if (!userFarm) {
      throw new BadRequestException('No tienes acceso a esta finca');
    }

    // Obtener pesajes
    const weighings = await this.prisma.weighing.findMany({
      where: {
        animal: { herd: { farmId } },
        createdAt: {
          gte: options.dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lte: options.dateRange?.endDate || new Date(),
        },
      },
      include: {
        animal: {
          include: {
            herd: { include: { farm: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const reportData = this.prepareWeighingReportData(weighings, farmId);

    switch (options.format) {
      case ExportFormat.PDF:
        return this.generatePDFReport(reportData, 'weighing');
      case ExportFormat.EXCEL:
        return this.generateExcelReport(reportData, 'weighing');
      case ExportFormat.CSV:
        return this.generateCSVReport(reportData, 'weighing');
      case ExportFormat.JSON:
        return this.generateJSONReport(reportData, 'weighing');
      default:
        throw new BadRequestException('Formato no soportado');
    }
  }

  /**
   * Exportar reporte de movimientos
   */
  async exportMovementReport(
    farmId: string,
    userId: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    // Verificar acceso
    const userFarm = await this.prisma.userFarm.findUnique({
      where: { userId_farmId: { userId, farmId } },
    });

    if (!userFarm) {
      throw new BadRequestException('No tienes acceso a esta finca');
    }

    // Obtener movimientos
    const movements = await this.prisma.movement.findMany({
      where: {
        herd: { farmId },
        entryDate: {
          gte: options.dateRange?.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          lte: options.dateRange?.endDate || new Date(),
        },
      },
      include: {
        herd: { include: { farm: true } },
        paddock: true,
      },
      orderBy: { entryDate: 'desc' },
    });

    const reportData = this.prepareMovementReportData(movements, farmId);

    switch (options.format) {
      case ExportFormat.PDF:
        return this.generatePDFReport(reportData, 'movement');
      case ExportFormat.EXCEL:
        return this.generateExcelReport(reportData, 'movement');
      case ExportFormat.CSV:
        return this.generateCSVReport(reportData, 'movement');
      case ExportFormat.JSON:
        return this.generateJSONReport(reportData, 'movement');
      default:
        throw new BadRequestException('Formato no soportado');
    }
  }

  /**
   * Exportar reporte de aforos
   */
  async exportForageReport(
    farmId: string,
    userId: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    // Verificar acceso
    const userFarm = await this.prisma.userFarm.findUnique({
      where: { userId_farmId: { userId, farmId } },
    });

    if (!userFarm) {
      throw new BadRequestException('No tienes acceso a esta finca');
    }

    // Obtener aforos
    const forageSamples = await this.prisma.forageSample.findMany({
      where: {
        paddock: { farmId },
        createdAt: {
          gte: options.dateRange?.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          lte: options.dateRange?.endDate || new Date(),
        },
      },
      include: {
        paddock: { include: { farm: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const reportData = this.prepareForageReportData(forageSamples, farmId);

    switch (options.format) {
      case ExportFormat.PDF:
        return this.generatePDFReport(reportData, 'forage');
      case ExportFormat.EXCEL:
        return this.generateExcelReport(reportData, 'forage');
      case ExportFormat.CSV:
        return this.generateCSVReport(reportData, 'forage');
      case ExportFormat.JSON:
        return this.generateJSONReport(reportData, 'forage');
      default:
        throw new BadRequestException('Formato no soportado');
    }
  }

  // ============ Métodos de Preparación de Datos ============

  private prepareCycleReportData(cycle: any): any {
    const title = `Reporte de Ciclo: ${cycle.herd.name}`;
    const summary = {
      'ID Ciclo': cycle.id,
      Finca: cycle.farm.name,
      Rebaño: cycle.herd.name,
      Animales: cycle.herd.animals.length,
      Inicio: cycle.startDate.toLocaleDateString('es-ES'),
      Fin: cycle.endDate?.toLocaleDateString('es-ES') || 'En progreso',
      Estado: cycle.status,
    };

    const movementsData = cycle.movements.map((m: any) => ({
      Potrero: m.paddock.name,
      Entrada: m.entryDate.toLocaleDateString('es-ES'),
      Salida: m.exitDate?.toLocaleDateString('es-ES') || 'Activo',
      Días: m.exitDate
        ? Math.floor((m.exitDate.getTime() - m.entryDate.getTime()) / (1000 * 60 * 60 * 24))
        : 'En ocupación',
    }));

    return {
      title,
      summary,
      sections: [
        { name: 'Resumen', data: [summary] },
        { name: 'Movimientos', data: movementsData },
      ],
      exportDate: new Date(),
    };
  }

  private prepareWeighingReportData(weighings: any[], _farmId: string): any {
    const title = 'Reporte de Pesajes';

    const weighingData = weighings.map((w: any) => ({
      Animal: w.animal.id,
      Rebaño: w.animal.herd.name,
      'Peso (kg)': w.weightKg,
      Fecha: w.createdAt.toLocaleDateString('es-ES'),
      Observaciones: w.notes || '-',
    }));

    // Calcular estadísticas
    const weights = weighings.map((w: any) => w.weightKg);
    const avgWeight =
      weights.length > 0 ? weights.reduce((a: number, b: number) => a + b) / weights.length : 0;
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);

    const statistics = {
      'Total Pesajes': weighings.length,
      'Peso Promedio (kg)': avgWeight.toFixed(2),
      'Peso Mínimo (kg)': minWeight,
      'Peso Máximo (kg)': maxWeight,
      'Rango (kg)': (maxWeight - minWeight).toFixed(2),
    };

    return {
      title,
      summary: statistics,
      sections: [
        { name: 'Estadísticas', data: [statistics] },
        { name: 'Pesajes Detallados', data: weighingData },
      ],
      exportDate: new Date(),
    };
  }

  private prepareMovementReportData(movements: any[], _farmId: string): any {
    const title = 'Reporte de Movimientos de Ganado';

    const movementData = movements.map((m: any) => ({
      Rebaño: m.herd.name,
      Potrero: m.paddock.name,
      Entrada: m.entryDate.toLocaleDateString('es-ES'),
      Salida: m.exitDate?.toLocaleDateString('es-ES') || 'Activo',
      'Días Ocupados': m.exitDate
        ? Math.floor((m.exitDate.getTime() - m.entryDate.getTime()) / (1000 * 60 * 60 * 24))
        : 'En ocupación',
      Estado: m.exitDate ? 'Completado' : 'Activo',
    }));

    // Estadísticas
    const completedMovements = movements.filter((m: any) => m.exitDate);
    const avgOccupancy =
      completedMovements.length > 0
        ? completedMovements.reduce((sum: number, m: any) => {
            return (
              sum +
              Math.floor((m.exitDate.getTime() - m.entryDate.getTime()) / (1000 * 60 * 60 * 24))
            );
          }, 0) / completedMovements.length
        : 0;

    const statistics = {
      'Total Movimientos': movements.length,
      Completados: completedMovements.length,
      'En Progreso': movements.length - completedMovements.length,
      'Ocupación Promedio (días)': avgOccupancy.toFixed(1),
      'Potreros Utilizados': new Set(movements.map((m: any) => m.paddock.id)).size,
    };

    return {
      title,
      summary: statistics,
      sections: [
        { name: 'Estadísticas', data: [statistics] },
        { name: 'Movimientos Detallados', data: movementData },
      ],
      exportDate: new Date(),
    };
  }

  private prepareForageReportData(forageSamples: any[], _farmId: string): any {
    const title = 'Reporte de Aforos de Forraje';

    const forageData = forageSamples.map((f: any) => ({
      Potrero: f.paddock.name,
      'MS (kg/ha)': f.kgMSPerHa,
      'CP %': f.cpPercent || '-',
      'IVMS %': f.ivmsPercent || '-',
      Fecha: f.createdAt.toLocaleDateString('es-ES'),
      Notas: f.notes || '-',
    }));

    // Estadísticas
    const msValues = forageSamples.map((f: any) => f.kgMSPerHa || 0).filter((v: number) => v > 0);
    const avgMS =
      msValues.length > 0 ? msValues.reduce((a: number, b: number) => a + b) / msValues.length : 0;

    const statistics = {
      'Total Aforos': forageSamples.length,
      'MS Promedio (kg/ha)': avgMS.toFixed(0),
      'MS Mínimo (kg/ha)': Math.min(...msValues),
      'MS Máximo (kg/ha)': Math.max(...msValues),
      'Potreros Aforizados': new Set(forageSamples.map((f: any) => f.paddock.id)).size,
    };

    return {
      title,
      summary: statistics,
      sections: [
        { name: 'Estadísticas', data: [statistics] },
        { name: 'Aforos Detallados', data: forageData },
      ],
      exportDate: new Date(),
    };
  }

  // ============ Métodos de Generación de Formatos ============

  private generateExcelReport(reportData: any, type: string): ExportResult {
    const workbook = XLSX.utils.book_new();

    // Hoja de resumen
    const summarySheet = XLSX.utils.json_to_sheet([reportData.summary]);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

    // Hojas de secciones
    for (const section of reportData.sections) {
      const worksheet = XLSX.utils.json_to_sheet(section.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, section.name);
    }

    // Generar buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Reporte_${type}_${timestamp}.xlsx`;

    return {
      filename,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: buffer as Buffer,
      size: buffer.length,
    };
  }

  private generateCSVReport(reportData: any, type: string): ExportResult {
    let csvContent = `${reportData.title}\n\n`;

    // Resumen
    csvContent += 'RESUMEN\n';
    for (const [key, value] of Object.entries(reportData.summary)) {
      csvContent += `${key},"${value}"\n`;
    }
    csvContent += '\n';

    // Secciones
    for (const section of reportData.sections) {
      csvContent += `${section.name.toUpperCase()}\n`;
      if (section.data.length > 0) {
        const headers = Object.keys(section.data[0]);
        csvContent += headers.map((h: string) => `"${h}"`).join(',') + '\n';
        for (const row of section.data) {
          csvContent +=
            headers
              .map((h: string) => {
                const value = row[h] || '';
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
              })
              .join(',') + '\n';
        }
      }
      csvContent += '\n';
    }

    const buffer = Buffer.from(csvContent, 'utf-8');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Reporte_${type}_${timestamp}.csv`;

    return {
      filename,
      mimeType: 'text/csv;charset=utf-8',
      buffer,
      size: buffer.length,
    };
  }

  private generatePDFReport(reportData: any, type: string): ExportResult {
    // Para PDF real se necesitaría librería como pdfkit o jsPDF
    // Por ahora, retornamos HTML que puede ser convertido a PDF
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportData.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #2c5f2d; text-align: center; }
    h2 { color: #333; border-bottom: 2px solid #2c5f2d; padding-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #2c5f2d; color: white; }
    .summary { background-color: #f9f9f9; padding: 10px; border-left: 4px solid #2c5f2d; margin: 20px 0; }
    .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${reportData.title}</h1>
  <div class="summary">
    ${Object.entries(reportData.summary)
      .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
      .join('')}
  </div>
  
  ${reportData.sections
    .map(
      (section: any) => `
    <h2>${section.name}</h2>
    <table>
      <thead>
        <tr>
          ${Object.keys(section.data[0] || {})
            .map((h: string) => `<th>${h}</th>`)
            .join('')}
        </tr>
      </thead>
      <tbody>
        ${section.data
          .map(
            (row: any) => `
          <tr>
            ${Object.values(row)
              .map((v: any) => `<td>${v}</td>`)
              .join('')}
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `
    )
    .join('')}
  
  <div class="footer">
    <p>Generado el ${new Date().toLocaleString('es-ES')}</p>
    <p>Sistema de Ganadería Regenerativa</p>
  </div>
</body>
</html>
    `;

    const buffer = Buffer.from(htmlContent, 'utf-8');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Reporte_${type}_${timestamp}.html`;

    return {
      filename,
      mimeType: 'text/html;charset=utf-8',
      buffer,
      size: buffer.length,
    };
  }

  private generateJSONReport(reportData: any, type: string): ExportResult {
    const jsonContent = JSON.stringify(reportData, null, 2);
    const buffer = Buffer.from(jsonContent, 'utf-8');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Reporte_${type}_${timestamp}.json`;

    return {
      filename,
      mimeType: 'application/json',
      buffer,
      size: buffer.length,
    };
  }

  /**
   * Generar CSV de movimientos (REPORTES - Feature B)
   * Incluye: Fecha Entrada, Fecha Salida, Hato, Potrero, Días Ocupación
   */
  async generateMovementsCsv(farmId: string, userId: string): Promise<ExportResult> {
    // Verificar acceso
    const userFarm = await this.prisma.userFarm.findUnique({
      where: { userId_farmId: { userId, farmId } },
    });

    if (!userFarm) {
      throw new BadRequestException('No tienes acceso a esta finca');
    }

    // Consultar movimientos
    const movements = await this.prisma.movement.findMany({
      where: { herd: { farmId } },
      include: {
        herd: true,
        paddock: true,
      },
      orderBy: { entryDate: 'desc' },
    });

    // Construir CSV
    const csvRows: string[] = [];
    csvRows.push('Fecha Entrada,Fecha Salida,Hato,Potrero,Días Ocupación,Estado');

    movements.forEach((movement) => {
      const entryDate = movement.entryDate.toISOString().split('T')[0];
      const exitDate = movement.exitDate
        ? movement.exitDate.toISOString().split('T')[0]
        : 'En curso';
      const herdName = movement.herd.name;
      const paddockName = movement.paddock.name;

      let daysOccupied = 0;
      if (movement.exitDate) {
        daysOccupied = Math.floor(
          (movement.exitDate.getTime() - movement.entryDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      } else {
        daysOccupied = Math.floor(
          (new Date().getTime() - movement.entryDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      const status = movement.status === 'ACTIVE' ? 'Activo' : 'Cerrado';

      csvRows.push(`${entryDate},${exitDate},${herdName},${paddockName},${daysOccupied},${status}`);
    });

    const csvContent = csvRows.join('\n');
    const buffer = Buffer.from('\ufeff' + csvContent, 'utf-8'); // BOM para Excel
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Movimientos_${farmId}_${timestamp}.csv`;

    return {
      filename,
      mimeType: 'text/csv;charset=utf-8',
      buffer,
      size: buffer.length,
    };
  }
}
