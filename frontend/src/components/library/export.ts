'use client';
import dayjs from 'dayjs';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  INK,
  MARGIN,
  bwTable,
  drawSchoolFooter,
  drawSchoolHeader,
} from '@/utils/pdf/schoolLetterhead';

export type Cell = string | number | null | undefined;

export interface ReportSheet {
  name: string;
  head: string[];
  rows: Cell[][];
}

const stamp = () => dayjs().format('YYYY-MM-DD_HHmm');

/** Writes one or more sheets to an .xlsx workbook, with sensible column widths. */
export function downloadExcel(filename: string, sheets: ReportSheet[]) {
  const wb = XLSX.utils.book_new();
  sheets.forEach((sheet) => {
    const ws = XLSX.utils.aoa_to_sheet([
      sheet.head,
      ...sheet.rows.map((r) => r.map((c) => c ?? '')),
    ]);
    ws['!cols'] = sheet.head.map((h, i) => ({
      wch: Math.min(48, Math.max(h.length, ...sheet.rows.map((r) => `${r[i] ?? ''}`.length)) + 2),
    }));
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
  });
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  FileSaver.saveAs(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `${filename}_${stamp()}.xlsx`,
  );
}

/** White A4 report: crest, school name, title, then tables. */
export async function downloadPdf({
  filename,
  title,
  subtitle,
  summary = [],
  sections,
  landscape = false,
  generatedBy,
  department,
  footer,
}: {
  filename: string;
  title: string;
  subtitle?: string;
  summary?: [string, Cell][];
  sections: ReportSheet[];
  landscape?: boolean;
  generatedBy?: string;
  department?: string;
  footer?: string;
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: landscape ? 'l' : 'p' });
  const height = doc.internal.pageSize.getHeight();

  let y = await drawSchoolHeader(doc, {
    title,
    subtitle,
    lines: [department, generatedBy ? `Prepared by ${generatedBy}` : ''].filter(Boolean) as string[],
  });

  if (summary.length) {
    autoTable(doc, {
      startY: y,
      body: summary.map(([k, v]) => [k, `${v ?? ''}`]),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 3, textColor: INK },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 170 } },
      margin: { left: MARGIN, right: MARGIN },
      tableWidth: 360,
    });
    y = (doc as any).lastAutoTable.finalY + 16;
  }

  sections.forEach((section, index) => {
    if (sections.length > 1 || section.name) {
      if (y > height - 90) {
        doc.addPage();
        y = MARGIN;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...INK);
      doc.text(section.name, MARGIN, y);
      y += 8;
    }
    autoTable(doc, {
      startY: y,
      head: [section.head],
      body: section.rows.length
        ? section.rows.map((r) => r.map((c) => `${c ?? ''}`))
        : [[{ content: 'No records', colSpan: section.head.length, styles: { halign: 'center' } }]],
      ...bwTable,
      styles: { ...bwTable.styles, fontSize: 8, overflow: 'linebreak' },
      margin: { left: MARGIN, right: MARGIN, bottom: 48 },
    });
    y = (doc as any).lastAutoTable.finalY + (index < sections.length - 1 ? 22 : 0);
  });

  drawSchoolFooter(doc, { showSignatures: false, leftNote: footer });
  doc.save(`${filename}_${stamp()}.pdf`);
}
