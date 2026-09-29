import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Left identity block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('REPUBLIC OF RWANDA', margin, y);
  y += 16;
  doc.text('MINISTRY OF EDUCATION', margin, y);
  y += 16;
  doc.text('ECOLE DES SCIENCES DE GISENYI', margin, y);

  // Logo
  try {
    const dataUrl = await toDataUrl(logoPath);
    const img = (doc as any).getImageProperties?.(dataUrl);
    const maxW = 100;
    const maxH = 60;
    const { w, h } = scaleToFit(img?.width || 100, img?.height || 60, maxW, maxH);
    const logoY = margin + 50; // below identity
    doc.addImage(dataUrl, 'PNG', margin, logoY, w, h);

    // contacts under logo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Tel: (+250) 788548000', margin, logoY + h + 12);
    doc.text('Email: info@esg.ac.rw', margin, logoY + h + 26);
  } catch (e) {
    // ignore logo if not found
  }

  // Right metadata block
  const rightX = pageWidth - margin - 260;
  let my = margin;
  const lineGap = 14;
  const rightRow = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(label, rightX, my);
    doc.setFont('helvetica', 'normal');
    doc.text(value || '', rightX + 110, my);
    my += lineGap;
  };
  rightRow('Academic Year: ', meta.academicYear);
  rightRow('Term: ', meta.termName);
  rightRow('Class: ', meta.className);
  rightRow('Subject: ', meta.courseName);
  rightRow('Teacher: ', meta.teacherName || '');
  rightRow("Teacher's Tel: ", meta.teacherTel || '');

  // Table
  const head = [['No.', 'Reg No', 'Student Name', 'CAT', 'Max', 'Exam', 'Max', 'Total', 'Max']];
  autoTable(doc, {
    head,
    body: rows,
    startY: Math.max(margin + 150, my + 20),
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [2, 79, 58], halign: 'left' },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 60 },
      2: { cellWidth: 140 },
      3: { cellWidth: 40 },
      4: { cellWidth: 50 },
      5: { cellWidth: 40 },
      6: { cellWidth: 50 },
      7: { cellWidth: 40 },
      8: { cellWidth: 50 },
    },
    margin: { left: margin, right: margin, bottom: margin + 120 },
  });

  // Draw footer only on the final page
  const totalPages = (doc as any).getNumberOfPages?.() || 1;
  (doc as any).setPage?.(totalPages);
  const lastPageWidth = doc.internal.pageSize.getWidth();
  const lastPageHeight = doc.internal.pageSize.getHeight();
  const footerEstimatedHeight = 60;
  const finalY = (doc as any).lastAutoTable?.finalY || 0;
  if (finalY > lastPageHeight - margin - footerEstimatedHeight - 10) {
    doc.addPage();
  }
  const footerY = doc.internal.pageSize.getHeight() - margin - 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Done at Rubavu', margin, footerY);
  doc.setFont('helvetica', 'normal');
  const today = new Date().toISOString().slice(0, 10);
  doc.text(`Date: ${today}`, margin, footerY + 16);

  const rightBlockX = doc.internal.pageSize.getWidth() - margin - 220;

  const signatureY = footerY;

  // Position 1 (Left-ish): Teacher
  const teacherX = rightBlockX;
  doc.setFont('helvetica', 'bold');
  doc.text('Teacher', teacherX, signatureY);
  doc.setFont('helvetica', 'normal');
  doc.text('Signature', teacherX, signatureY + 16);

  // Position 2 (Right-most): Principal
  const principalX = teacherX + 120;
  doc.setFont('helvetica', 'bold');
  doc.text('Principal', principalX, signatureY);
  doc.setFont('helvetica', 'normal');
  doc.text('Signature & Stamp', principalX, signatureY + 16);

  const blob = doc.output('blob');
  return blob;
}

function scaleToFit(w: number, h: number, maxW: number, maxH: number) {
  const scale = Math.min(maxW / w, maxH / h);
  return { w: w * scale, h: h * scale };
}

async function toDataUrl(path: string): Promise<string> {
  const res = await fetch(path);
  const blob = await res.blob();
  return await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
