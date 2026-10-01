'use client';
import ReportCard from '@/components/academics/report-cards/ReportCard';
import { DsReport, IReportCard } from '@/types/marks.type';
import { ITerm } from '@/types/other.type';
import { genReportCardQrCode } from '@/utils/funcs/func3';
import { Button, Skeleton } from '@mantine/core';
import { pdf } from '@react-pdf/renderer';
import { useEffect, useRef, useState } from 'react';
import { BiDownload } from 'react-icons/bi';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export interface OfficialReportViewerProps {
  info: IReportCard;
  terms?: ITerm[] | null;
  dsMarks?: DsReport | null;
  studentClassTermData?: unknown;
  viewAll?: boolean;
  isPM?: boolean;
  academicYearId: string;
  studentId: string;
  token?: string;
  studentName?: string;
  compact?: boolean;
}

const OfficialReportViewer = ({
  info,
  terms,
  dsMarks,
  studentClassTermData,
  viewAll,
  isPM,
  academicYearId,
  studentId,
  token,
  studentName,
  compact,
}: OfficialReportViewerProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(320);
  const [pdfUrl, setPdfUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => setPageWidth(Math.max(280, el.clientWidth));
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      if (!info || !studentId || !academicYearId) return;
      setGenerating(true);
      setError('');
      try {
        const qrCode = await genReportCardQrCode({
          studentId,
          academicYearId,
          token: token ?? info.parents?.[0]?.reportCardToken ?? '',
        });
        const blob = await pdf(
          <ReportCard
            qrCodeImageUrl={qrCode}
            info={info}
            terms={terms ?? undefined}
            dsMarks={dsMarks ?? undefined}
            viewAll={viewAll}
            isPM={isPM}
            studentClassTermData={studentClassTermData}
          />,
        ).toBlob();
        if (cancelled) return;
        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Could not open the report card.');
          setPdfUrl('');
        }
      } finally {
        if (!cancelled) setGenerating(false);
      }
    };
    generate();
    return () => {
      cancelled = true;
    };
  }, [info, terms, dsMarks, studentClassTermData, viewAll, isPM, academicYearId, studentId, token]);

  const download = () => {
    if (!pdfUrl) return;
    const first = info.studentInfo?.firstName ?? studentName ?? 'student';
    const last = info.studentInfo?.lastName ?? '';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', `${first}-${last}-report-card.pdf`.replace(/\s+/g, '-'));
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <Button
        onClick={download}
        disabled={!pdfUrl || generating}
        color="#024F3A"
        size={compact ? 'md' : 'lg'}
        fullWidth={compact}
        className={compact ? 'min-h-12' : ''}
      >
        <BiDownload className="mr-2" />
        Download PDF
      </Button>
      {generating && !pdfUrl && (
        <div className="h-[70vh]">
          <Skeleton className="w-full" h="100%" />
          <p className="text-center text-sm text-gray-500 mt-2">Preparing report card…</p>
        </div>
      )}
      {error && !generating && <p className="text-center text-red-600 text-sm">{error}</p>}
      <div ref={wrapRef} className="w-full overflow-x-auto">
        {pdfUrl && (
          <Document file={pdfUrl} className="flex justify-center">
            <Page
              pageNumber={1}
              width={pageWidth}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        )}
      </div>
    </div>
  );
};

export default OfficialReportViewer;
