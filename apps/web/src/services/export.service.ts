import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Movement } from '@shared/index';

interface MovementExportData {
  id: string;
  herdName: string;
  paddockName: string;
  entryDate: string;
  exitDate: string | null;
  duration: number; // días
  status: string;
  traceId?: string;
}

/**
 * Servicio para exportar datos de movimientos a PDF y Excel.
 * Genera reportes profesionales con información del lote, potrero, fechas y duración.
 * Incluye metadatos de auditoría (fecha de generación, filtros aplicados).
 */
export class ExportService {
  /**
   * Exporta lista de movimientos a PDF.
   * @param movements Array de movimientos a exportar
   * @param filename Nombre del archivo (sin extensión)
   * @param filters Filtros aplicados a mostrar en el reporte
   */
  static exportMovementsAsPDF(
    movements: MovementExportData[],
    filename: string = 'Reporte_Movimientos',
    filters?: { herdId?: string; paddockId?: string; status?: string }
  ): void {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Encabezado
    const title = 'Reporte de Movimientos';
    const subtitle = 'Ganadería Regenerativa - Sistema de Rotación de Potreros';
    const generatedDate = new Date().toLocaleDateString('es-MX');

    doc.setFontSize(16);
    doc.text(title, margin, margin + 5, { maxWidth: pageWidth - 2 * margin });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, margin, margin + 15);
    doc.text(`Generado: ${generatedDate}`, margin, margin + 22);

    // Información de filtros si existen
    let yPosition = margin + 30;
    if (filters && Object.values(filters).some(v => v)) {
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text('Filtros aplicados:', margin, yPosition);
      yPosition += 5;

      const filterText = Object.entries(filters)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' | ');

      doc.setFontSize(8);
      doc.text(filterText, margin + 5, yPosition);
      yPosition += 7;
    }

    // Tabla de datos
    const tableData = movements.map(m => [
      m.herdName,
      m.paddockName,
      m.entryDate,
      m.exitDate || 'En curso',
      m.duration.toString(),
      m.status,
      m.traceId || '-',
    ]);

    autoTable(doc, {
      head: [['Lote', 'Potrero', 'Entrada', 'Salida', 'Duración (días)', 'Estado', 'Ref.']],
      body: tableData,
      startY: yPosition + 5,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { fontSize: 7, textColor: [150, 150, 150] },
      },
      didDrawPage: (data: any) => {
        // Pie de página
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          pageWidth - margin - 20,
          pageHeight - 10
        );
      },
    });

    // Descargar
    doc.save(`${filename}_${generatedDate}.pdf`);
  }

  /**
   * Exporta lista de movimientos a Excel.
   * @param movements Array de movimientos a exportar
   * @param filename Nombre del archivo (sin extensión)
   * @param farmName Nombre de la finca a mostrar en la hoja
   */
  static exportMovementsAsExcel(
    movements: MovementExportData[],
    filename: string = 'Reporte_Movimientos',
    farmName?: string
  ): void {
    // Preparar datos con encabezados
    const exportData = [
      ['Reporte de Movimientos - Ganadería Regenerativa'],
      [farmName ? `Finca: ${farmName}` : ''],
      [`Generado: ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX')}`],
      [],
      ['Lote', 'Potrero', 'Entrada', 'Salida', 'Duración (días)', 'Estado', 'Ref.'],
      ...movements.map(m => [
        m.herdName,
        m.paddockName,
        m.entryDate,
        m.exitDate || 'En curso',
        m.duration,
        m.status,
        m.traceId || '-',
      ]),
    ];

    // Crear worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(exportData);

    // Ajustar anchos de columna
    worksheet['!cols'] = [
      { wch: 15 }, // Lote
      { wch: 18 }, // Potrero
      { wch: 15 }, // Entrada
      { wch: 15 }, // Salida
      { wch: 14 }, // Duración
      { wch: 12 }, // Estado
      { wch: 12 }, // Ref.
    ];

    // Crear workbook y agregar worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

    // Descargar
    const date = new Date().toLocaleDateString('es-MX').replace(/\//g, '-');
    XLSX.writeFile(workbook, `${filename}_${date}.xlsx`);
  }

  /**
   * Calcula duración en días entre dos fechas.
   * @param entryDate Fecha de entrada
   * @param exitDate Fecha de salida (si es null, usa hoy)
   * @returns Número de días
   */
  static calculateDuration(entryDate: Date | string, exitDate?: Date | string | null): number {
    const entry = new Date(entryDate);
    const exit = exitDate ? new Date(exitDate) : new Date();
    const diffTime = Math.abs(exit.getTime() - entry.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Formatea una lista de movimientos para exportación.
   * @param movements Array de movimientos de la API
   * @returns Array de movimientos formateado para exportación
   */
  static formatMovementsForExport(
    movements: any[]
  ): MovementExportData[] {
    return movements.map(m => ({
      id: m.id,
      herdName: m.herd?.name || 'Sin información',
      paddockName: m.paddock?.name || 'Sin información',
      entryDate: new Date(m.entryDate).toLocaleDateString('es-MX'),
      exitDate: m.exitDate ? new Date(m.exitDate).toLocaleDateString('es-MX') : null,
      duration: this.calculateDuration(m.entryDate, m.exitDate),
      status: m.status,
      traceId: m.id.substring(0, 8),
    }));
  }
}
