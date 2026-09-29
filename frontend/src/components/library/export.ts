'use client';
import dayjs from 'dayjs';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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

async function toDataUrl(path: string): Promise<string | null> {
  try {
    const res = await fetch(path);
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Branded A4 PDF report: school header, title, optional summary lines, then one table per section. */
export async function downloadPdf({
  filename,
  title,
  subtitle,
  summary = [],
  sections,
  landscape = false,
  generatedBy,
  department = 'School Library',
  footer = 'ESG Library Management',
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
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 36;

  const logo = await toDataUrl('/logo.png');
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', margin, 26, 44, 44);
    } catch {
      // Logo is decorative; continue without it.
    }
  }
  doc.setTextColor(2, 79, 58);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ECOLE DES SCIENCES DE GISENYI', margin + 54, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(department, margin + 54, 58);
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(`Generated ${dayjs().format('DD MMM YYYY, HH:mm')}`, width - margin, 42, {
    align: 'right',
  });
  if (generatedBy) doc.text(`By ${generatedBy}`, width - margin, 56, { align: 'right' });

  doc.setDrawColor(2, 79, 58);
  doc.setLineWidth(1.2);
  doc.line(margin, 80, width - margin, 80);

  let y = 104;
  doc.setTextColor(2, 79, 58);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(title, margin, y);
  if (subtitle) {
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(subtitle, margin, y);
  }
  y += 14;

  if (summary.length) {
    autoTable(doc, {
      startY: y,
      body: summary.map(([k, v]) => [k, `${v ?? ''}`]),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', textColor: [2, 79, 58], cellWidth: 170 } },
      margin: { left: margin, right: margin },
      tableWidth: 360,
    });
    y = (doc as any).lastAutoTable.finalY + 14;
  }

  sections.forEach((section, index) => {
    if (sections.length > 1 || section.name) {
      if (y > height - 90) {
        doc.addPage();
        y = margin + 10;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(2, 79, 58);
      doc.text(section.name, margin, y);
      y += 6;
    }
    autoTable(doc, {
      startY: y,
      head: [section.head],
      body: section.rows.length
        ? section.rows.map((r) => r.map((c) => `${c ?? ''}`))
        : [[{ content: 'No records', colSpan: section.head.length, styles: { halign: 'center' } }]],
      styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
      headStyles: { fillColor: [2, 79, 58], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 246, 250] },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + (index < sections.length - 1 ? 22 : 0);
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(`Page ${i} of ${pages}`, width - margin, height - 18, { align: 'right' });
    doc.text(footer, margin, height - 18);
  }
  doc.save(`${filename}_${stamp()}.pdf`);
}
