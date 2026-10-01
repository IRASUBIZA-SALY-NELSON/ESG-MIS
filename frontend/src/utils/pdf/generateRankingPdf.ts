import jsPDF from 'jspdf';
import {
  MARGIN,
  INK,
  MUTED,
  bwTable,
  drawSchoolFooter,
  drawSchoolHeader,
} from '@/utils/pdf/schoolLetterhead';
import autoTable from 'jspdf-autotable';

export type RankingStudent = {
  rank: number | null;
  studentCode?: string;
  name: string;
  cat?: number | null;
  exam?: number | null;
  total?: number | null;
  max?: number | null;
  deducted?: number | null;
  remaining?: number | null;
  percentage: number | null;
  decision?: string | null;
};

export type RankingClass = {
  className: string;
  classTeacher?: string;
  students: RankingStudent[];
};

export type RankingReport = {
  schoolName?: string;
  academicYear: string;
  termName: string;
  markType: string;
  classes: RankingClass[];
};

export async function generateRankingPdf(report: RankingReport, logoPath = '/logo.png'): Promise<Blob> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const discipline = String(report.markType || '').toUpperCase().includes('DISCIPLINE');
  let y = await drawSchoolHeader(
    doc,
    {
      title: discipline ? 'Discipline ranking' : 'Class performance ranking',
      lines: [
        report.academicYear ? `Academic year ${report.academicYear}` : '',
        report.termName ? report.termName : '',
      ],
    },
    logoPath,
  );

  for (const clazz of report.classes || []) {
    if (y > doc.internal.pageSize.getHeight() - 120) {
      doc.addPage();
      y = MARGIN;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(clazz.className || 'Class', MARGIN, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    const teacher = clazz.classTeacher ? `Class teacher: ${clazz.classTeacher}` : '';
    const count = `${clazz.students?.length ?? 0} student${(clazz.students?.length ?? 0) === 1 ? '' : 's'}`;
    doc.text([teacher, count].filter(Boolean).join('   ·   '), MARGIN, y + 13);
    y += 22;

    const head = discipline
      ? [['Rank', 'Code', 'Student name', 'Deducted', 'Remaining', 'Max', '%', 'Decision']]
      : [['Rank', 'Code', 'Student name', 'CAT', 'Exam', 'Total', '%', 'Decision']];

    const body =
      clazz.students && clazz.students.length
        ? clazz.students.map((s) =>
            discipline
              ? [
                  s.rank ?? '—',
                  s.studentCode || '',
                  s.name || '',
                  num(s.deducted),
                  num(s.remaining),
                  num(s.max),
                  pct(s.percentage),
                  s.decision || '—',
                ]
              : [
                  s.rank ?? '—',
                  s.studentCode || '',
                  s.name || '',
                  num(s.cat),
                  num(s.exam),
                  s.total == null ? '—' : `${num(s.total)}${s.max != null ? ` / ${num(s.max)}` : ''}`,
                  pct(s.percentage),
                  s.decision || '—',
                ],
          )
        : [['—', '', 'No students in this class', '', '', '', '', '']];

    autoTable(doc, {
      head,
      body,
      startY: y,
      ...bwTable,
      columnStyles: {
        0: { cellWidth: 36, halign: 'center' },
        1: { cellWidth: 70 },
        3: { cellWidth: 52, halign: 'right' },
        4: { cellWidth: 52, halign: 'right' },
        5: { cellWidth: 62, halign: 'right' },
        6: { cellWidth: 42, halign: 'right' },
        7: { cellWidth: 50, halign: 'center' },
      },
      margin: { left: MARGIN, right: MARGIN, bottom: 80 },
    });
    y = ((doc as any).lastAutoTable?.finalY || y) + 26;
  }

  drawSchoolFooter(doc);
  return doc.output('blob');
}

function num(value: number | null | undefined) {
  return value == null || Number.isNaN(value) ? '—' : String(value);
}

function pct(value: number | null | undefined) {
  return value == null || Number.isNaN(value) ? '—' : `${value}%`;
}
