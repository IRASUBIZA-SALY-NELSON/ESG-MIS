'use client';
import ReportCard from '@/components/academics/report-cards/ReportCard';
import { useApp } from '@/context/AppContext';
import { useUserContext } from '@/context/Usercontext';
import useGet from '@/hooks/useGet';
import { DsReport, IReportCard } from '@/types/marks.type';
import { ITerm } from '@/types/other.type';
import { AuthApi } from '@/utils/constants';
import { genReportCardQrCode } from '@/utils/funcs/func3';
import { Button, Skeleton } from '@mantine/core';
import { pdf } from '@react-pdf/renderer';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { BiDownload } from 'react-icons/bi';
import { MdOutlineArticle } from 'react-icons/md';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

interface Props {
  reportCardInfo: IReportCard;
  userId: string;
}

const ReportsIndex = ({ reportCardInfo, userId }: Props) => {
  const [pdfUrl, setPdfUrl] = React.useState('');
  const [pdfError, setPdfError] = React.useState('');
  const params = useParams();
  const router = useRouter();
  const { user } = useUserContext();
  const { setReportCard } = useApp();
  const [generating, setGenerating] = React.useState(false);
  const [, setStudentClassTermData] = React.useState<any>(null);

  const { data: terms, loading: termsLoading } = useGet<ITerm[]>(
    `/terms/all/academic-year/${params.id}`,
    {
      defaultData: [],
      paginated: false,
      query: {
        academicYearId: params.id,
      },
    },
  );
  console.log('terms from back', terms);
  const { data: dsMarks, loading: loadingDS } = useGet<DsReport>(
    `/deductions/ds-marks/loggedIn-student`,
    {
      query: {
        academicYearId: params.id,
        userId,
      },
    },
  );
  console.log('dsMarks from back', dsMarks);

  useEffect(() => {
    if (!reportCardInfo) return;
    setReportCard(reportCardInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportCardInfo]);

  const allLoading = termsLoading || loadingDS;

  const downloadReport = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute(
      'download',
      `${reportCardInfo?.studentInfo?.firstName}-${reportCardInfo?.studentInfo?.lastName}-report-card.pdf`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const genReportCard = async () => {
    if (!reportCardInfo || !user) return;
    setGenerating(true);
    setPdfError('');
    try {
      const res2 = await AuthApi.get(
        `/student-class-term/student/${reportCardInfo?.studentInfo?.id}`,
      );

      const res = await AuthApi.get('/academicMarks/report-card/by-student', {
        params: {
          academicYearId: params.id,
          studentId: reportCardInfo?.studentInfo?.id,
        },
      });
      setStudentClassTermData(res2.data.data);
      const qrCode = await genReportCardQrCode({
        studentId: reportCardInfo.studentInfo.id,
        academicYearId: params.id as string,
        token: reportCardInfo.parents?.[0]?.reportCardToken ?? '',
      });
      const blob = await pdf(
        <ReportCard
          qrCodeImageUrl={qrCode}
          info={res.data.data!}
          terms={terms!}
          dsMarks={dsMarks!}
          viewAll={true}
          studentClassTermData={res2.data.data}
        />,
      ).toBlob();

      setPdfUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error(err);
      setPdfError('Unable to generate report card PDF.');
      setPdfUrl('');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (allLoading || !user || !reportCardInfo) return;
    if (reportCardInfo) {
      genReportCard();
    }
  }, [allLoading, user, reportCardInfo]);

  return (
    <div className="w-full overflow-auto  p-2 text-sm border-[2px] rounded-lg">
      <header className="text-[#000000B2] font-semibold flex sm:flex-row flex-col justify-between items-center mx-1 my-2">
        <h1>Report Card for Academic Year {reportCardInfo?.academicYearInfo?.name}</h1>
        <div className="flex items-center gap-2">
          <Button onClick={downloadReport}>
            <BiDownload className="mr-2" />
            Download Report
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/student/report-cards/${params.id}/transcript`)}
            leftSection={<MdOutlineArticle />}
          >
            Transcript
          </Button>
        </div>
      </header>
      {allLoading && (
        <div className="h-[80vh]">
          <Skeleton className="w-full" h={'100%'} />
        </div>
      )}
      <div className="w-fit mx-auto">
        {!allLoading && reportCardInfo && pdfUrl && (
          <>
            <Document file={pdfUrl} onLoadError={(error) => setPdfError(error.message)}>
              <Page pageNumber={1} />
            </Document>
          </>
        )}
        {generating && <span className=" text-center">Generating Report Card ...</span>}
        {pdfError && !generating && <div className="mt-4 text-center text-red-600">{pdfError}</div>}
        {!allLoading && !reportCardInfo && (
          <div className="h-[80vh] flex justify-center items-center">
            <div className="text-[#000000B2] font-semibold mx-1 my-2">
              No report card found for you
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsIndex;
