import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MARGIN, MUTED, bwTable, drawSchoolFooter, drawSchoolHeader } from '@/utils/pdf/schoolLetterhead';

export type MarksPdfMeta = {
  academicYear: string;
  termName: string;
  className: string;
  courseName: string;
  teacherName?: string;
  teacherTel?: string;
};

export async function generateMarksPdf({
  rows,
  meta,
  logoPath = '/logo.png',
}: {
  rows: (string | number)[][];
  meta: MarksPdfMeta;
  logoPath?: string;
}): Promise<Blob> {
  const ranked = [...rows].sort((a, b) => Number(b[7] ?? 0) - Number(a[7] ?? 0));
  let lastTotal: number | null = null;
  let rank = 1;
  const body = ranked.map((row, i) => {
    const total = Number(row[7] ?? 0);
    if (lastTotal != null && total !== lastTotal) rank = i + 1;
    lastTotal = total;
    return [rank, row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8]];
  });

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const y = await drawSchoolHeader(
    doc,
    {
      title: meta.courseName ? `${meta.courseName} marks` : 'Class marks',
      lines: [
        meta.academicYear ? `Academic year ${meta.academicYear}` : '',
        meta.termName || '',
        meta.className || '',
      ],
    },
    logoPath,
  );

  let startY = y;
  if (meta.teacherName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(
      `Teacher: ${meta.teacherName}${meta.teacherTel ? `  ·  ${meta.teacherTel}` : ''}`,
      MARGIN,
      y - 4,
    );
    startY = y + 8;
  }

  autoTable(doc, {
    head: [['Rank', 'Reg No', 'Student name', 'CAT', 'Max', 'Exam', 'Max', 'Total', 'Max']],
    body,
    startY,
    ...bwTable,
    styles: { ...bwTable.styles, fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 36, halign: 'center' },
      1: { cellWidth: 58 },
      3: { cellWidth: 38, halign: 'right' },
      4: { cellWidth: 38, halign: 'right' },
      5: { cellWidth: 38, halign: 'right' },
      6: { cellWidth: 38, halign: 'right' },
      7: { cellWidth: 42, halign: 'right' },
      8: { cellWidth: 38, halign: 'right' },
    },
    margin: { left: MARGIN, right: MARGIN, bottom: 80 },
  });

  drawSchoolFooter(doc);
  return doc.output('blob');
}
