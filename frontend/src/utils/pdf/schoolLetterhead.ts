import jsPDF from 'jspdf';

export const SCHOOL = {
  name: 'Ecole des Sciences de Gisenyi',
  place: 'Rubavu, Rwanda',
  tel: 'Tel: (+250) 788 548 000',
  email: 'Email: info@esg.ac.rw',
  logoPath: '/logo.png',
};

export const MARGIN = 48;
export const INK: [number, number, number] = [25, 25, 25];
export const MUTED: [number, number, number] = [90, 90, 90];
export const RULE: [number, number, number] = [40, 40, 40];

export const bwTable = {
  styles: {
    font: 'helvetica' as const,
    fontSize: 8.5,
    textColor: INK,
    fillColor: [255, 255, 255] as [number, number, number],
    lineColor: [160, 160, 160] as [number, number, number],
    lineWidth: 0.35,
    cellPadding: 5,
    valign: 'middle' as const,
  },
  headStyles: {
    fillColor: [255, 255, 255] as [number, number, number],
    textColor: INK,
    fontStyle: 'bold' as const,
    lineColor: RULE,
    lineWidth: 0.45,
  },
  theme: 'grid' as const,
};

export async function loadLogo(path = SCHOOL.logoPath): Promise<string | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export type LetterheadOpts = {
  title: string;
  subtitle?: string;
  lines?: string[];
};

/** Centered crest, school name, then the report title. White page, black type, no colour bars. */
export async function drawSchoolHeader(
  doc: jsPDF,
  opts: LetterheadOpts,
  logoPath = SCHOOL.logoPath,
): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  const center = pageWidth / 2;
  let y = 36;

  const logo = await loadLogo(logoPath);
  if (logo) {
    try {
      const img = (doc as any).getImageProperties?.(logo);
      const { w, h } = scaleToFit(img?.width || 120, img?.height || 120, 92, 92);
      doc.addImage(logo, 'PNG', center - w / 2, y, w, h);
      y += h + 10;
    } catch {
      y += 8;
    }
  }

  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(SCHOOL.name.toUpperCase(), center, y, { align: 'center' });
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(SCHOOL.place, center, y, { align: 'center' });
  y += 12;
  doc.text(`${SCHOOL.tel}    ·    ${SCHOOL.email}`, center, y, { align: 'center' });
  y += 14;

  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, pageWidth - MARGIN, y);
  y += 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(opts.title, center, y, { align: 'center' });
  y += 14;

  if (opts.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(opts.subtitle, center, y, { align: 'center' });
    y += 12;
  }

  const extras = (opts.lines || []).filter(Boolean);
  if (extras.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(extras.join('    ·    '), center, y, { align: 'center' });
    y += 12;
  }

  return y + 10;
}

export function drawSchoolFooter(
  doc: jsPDF,
  opts?: { showSignatures?: boolean; leftNote?: string },
) {
  const showSignatures = opts?.showSignatures !== false;
  const totalPages = (doc as any).getNumberOfPages?.() || 1;
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  for (let page = 1; page <= totalPages; page++) {
    (doc as any).setPage?.(page);
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, height - 62, width - MARGIN, height - 62);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(opts?.leftNote || `Done at Rubavu  ·  ${today}`, MARGIN, height - 46);
    doc.text(`Page ${page} of ${totalPages}`, width - MARGIN, height - 46, { align: 'right' });

    if (showSignatures && page === totalPages) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text('Class teacher', MARGIN, height - 28);
      doc.text('Director of Studies', width / 2, height - 28, { align: 'center' });
      doc.text('Principal', width - MARGIN, height - 28, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text('Name & signature', MARGIN, height - 16);
      doc.text('Name & signature', width / 2, height - 16, { align: 'center' });
      doc.text('Signature & stamp', width - MARGIN, height - 16, { align: 'right' });
    }
  }
}

export function savePdfBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function scaleToFit(w: number, h: number, maxW: number, maxH: number) {
  const scale = Math.min(maxW / w, maxH / h);
  return { w: w * scale, h: h * scale };
}
