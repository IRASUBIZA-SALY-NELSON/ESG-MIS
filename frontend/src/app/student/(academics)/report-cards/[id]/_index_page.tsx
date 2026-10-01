'use client';
import OfficialReportViewer from '@/components/academics/report-cards/OfficialReportViewer';
import { useApp } from '@/context/AppContext';
import useGet from '@/hooks/useGet';
import { DsReport, IReportCard } from '@/types/marks.type';
import { ITerm } from '@/types/other.type';
import { Button, Skeleton } from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MdOutlineArticle } from 'react-icons/md';

interface Props {
  reportCardInfo: IReportCard;
  userId: string;
}

const ReportsIndex = ({ reportCardInfo, userId }: Props) => {
  const params = useParams();
  const router = useRouter();
  const { setReportCard } = useApp();
  const academicYearId = params.id as string;

  const { data: terms, loading: termsLoading } = useGet<ITerm[]>(
    `/terms/all/academic-year/${academicYearId}`,
    {
      defaultData: [],
      paginated: false,
    },
  );
  const { data: dsMarks, loading: loadingDS } = useGet<DsReport>(
    `/deductions/ds-marks/loggedIn-student`,
    {
      query: {
        academicYearId,
      },
    },
  );
  const { data: studentClassTermData, loading: loadingClass } = useGet(
    `/student-class-term/student/${reportCardInfo?.studentInfo?.id ?? userId}`,
    { defaultData: [] },
  );

  useEffect(() => {
    if (!reportCardInfo) return;
    setReportCard(reportCardInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportCardInfo]);

  const allLoading = termsLoading || loadingDS || loadingClass;

  return (
    <div className="w-full overflow-auto p-2 text-sm border-[2px] rounded-lg">
      <header className="text-[#000000B2] font-semibold flex sm:flex-row flex-col justify-between items-center mx-1 my-2 gap-2">
        <h1>Report Card for Academic Year {reportCardInfo?.academicYearInfo?.name}</h1>
        <Button
          variant="outline"
          onClick={() => router.push(`/student/report-cards/${academicYearId}/transcript`)}
          leftSection={<MdOutlineArticle />}
        >
          Transcript
        </Button>
      </header>
      {allLoading && (
        <div className="h-[80vh]">
          <Skeleton className="w-full" h="100%" />
        </div>
      )}
      {!allLoading && reportCardInfo && (
        <OfficialReportViewer
          info={reportCardInfo}
          terms={terms}
          dsMarks={dsMarks}
          studentClassTermData={studentClassTermData}
          viewAll={true}
          academicYearId={academicYearId}
          studentId={reportCardInfo.studentInfo.id}
          token={reportCardInfo.parents?.[0]?.reportCardToken ?? ''}
        />
      )}
      {!allLoading && !reportCardInfo && (
        <div className="h-[80vh] flex justify-center items-center">
          <div className="text-[#000000B2] font-semibold mx-1 my-2">No report card found for you</div>
        </div>
      )}
    </div>
  );
};

export default ReportsIndex;
