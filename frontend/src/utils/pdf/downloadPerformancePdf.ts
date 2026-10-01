import { AuthApi } from '@/utils/constants';
import { generateRankingPdf, RankingReport } from '@/utils/pdf/generateRankingPdf';
import { savePdfBlob } from '@/utils/pdf/schoolLetterhead';

function fileSafe(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, '_').replace(/^_+|_+$/g, '');
}

export async function downloadPerformancePdf(opts: {
  termId: string;
  academicYearId?: string;
  classId?: string | null;
  markType: string;
}) {
  const params = new URLSearchParams({
    termId: opts.termId,
    markType: (opts.markType || 'ACADEMIC').toUpperCase(),
  });
  if (opts.academicYearId) params.set('academicYearId', opts.academicYearId);
  if (opts.classId) params.set('classId', opts.classId);

  const response = await AuthApi.get(`/exporting/students/performance/?${params.toString()}`);
  const report = (response.data?.data ?? response.data) as RankingReport & { coursesNumber?: number };

  if (!report || !Array.isArray(report.classes) || report.coursesNumber != null) {
    throw new Error('The server did not return a ranking report. Please try again.');
  }

  const blob = await generateRankingPdf(report);
  const classPart =
    opts.classId && report.classes.length === 1
      ? report.classes[0].className
      : report.classes.length > 1
        ? 'All_classes'
        : 'Performance';
  savePdfBlob(
    blob,
    fileSafe(
      `ESG_${classPart}_${report.termName || 'Term'}_${report.markType || 'Academic'}_ranking.pdf`,
    ),
  );
}
