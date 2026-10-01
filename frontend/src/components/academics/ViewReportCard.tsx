'use client';
import OfficialReportViewer from '@/components/academics/report-cards/OfficialReportViewer';
import AsyncSelect from '@/components/core/selects/AsyncSelect';
import useGet from '@/hooks/useGet';
import { DsReport, IReportCard, ReportCardDocument } from '@/types/marks.type';
import { ITerm } from '@/types/other.type';
import { Student } from '@/types/student.types';
import { AuthApi, api } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Skeleton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { FC, useEffect, useState } from 'react';

interface Props {
  student: Student | null;
  term?: ITerm;
  customUrl?: string;
  viewAll?: boolean;
  useAuth?: boolean;
  reportCard?: IReportCard;
  defaultAcademicYearId?: string;
  reportCardToken?: string;
  documentUrl?: string;
}

const ViewReportCard: FC<Props> = ({
  student,
  customUrl,
  viewAll,
  useAuth = true,
  reportCard,
  defaultAcademicYearId,
  reportCardToken,
  documentUrl,
}) => {
  const [acadId, setAcadId] = useState(defaultAcademicYearId ?? '');

  const MyReportCard = ({ academicYear }: { academicYear: string }) => {
    const isPM = typeof window !== 'undefined' && /^\/(pm|dos)(\/|$)/.test(window.location.pathname);
    const bundle = useGet<ReportCardDocument>(documentUrl, {
      defaultData: null,
      paginated: false,
      useAuth,
      query: documentUrl
        ? {
            academicYearId: academicYear,
            studentId: student?.id,
            ...(reportCardToken ? { token: reportCardToken } : {}),
          }
        : undefined,
    });
    const [reportCardInfo, setReportCardInfo] = React.useState<IReportCard | null>(
      reportCard ?? null,
    );
    const [studentClassTermData, setStudentClassTermData] = React.useState<unknown>(null);
    const [loading, setLoading] = React.useState(!documentUrl && !reportCard);
    const [error, setError] = React.useState<string | null>(null);
    const { data: terms, loading: termsLoading } = useGet<ITerm[]>(
      documentUrl ? undefined : `/terms/all/academic-year/${academicYear}`,
      {
        defaultData: [],
        paginated: false,
        useAuth,
      },
    );
    const { data: dsMarks, loading: loadingDS } = useGet<DsReport>(
      documentUrl
        ? undefined
        : useAuth
          ? `/deductions/ds-marks/by-studentId`
          : `/deductions/ds-marks/by-parent`,
      {
        query: {
          studentId: student?.id,
          academicYearId: academicYear,
          ...(!useAuth ? { token: reportCardToken } : {}),
        },
        useAuth,
      },
    );

    const fetchApi = useAuth ? AuthApi : api;

    useEffect(() => {
      if (documentUrl) return;
      const getReportCardInfo = async () => {
        if (!academicYear || !student?.id) return;
        setLoading(true);
        try {
          const res = reportCard
            ? { data: { data: reportCard } }
            : await fetchApi.get(customUrl ?? '/academicMarks/report-card/by-student', {
                params: {
                  academicYearId: academicYear,
                  studentId: student?.id,
                  ...(reportCardToken ? { token: reportCardToken } : {}),
                },
              });
          if (useAuth) {
            const res2 = await fetchApi.get(`/student-class-term/student/${student?.id}`);
            setStudentClassTermData(res2.data.data);
          }
          setReportCardInfo(res.data.data);
        } catch (err) {
          notifications.show({
            title: 'Error',
            message: getResError(err),
            color: 'red',
          });
          setError(getResError(err));
        } finally {
          setLoading(false);
        }
      };
      if (!student) return;
      getReportCardInfo();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [student, academicYear, documentUrl]);

    const bundled = documentUrl ? bundle.data : null;
    const info = bundled?.reportCard ?? reportCardInfo;
    const allLoading = documentUrl
      ? bundle.loading || (bundle.data == null && !bundle.error)
      : loading || termsLoading || loadingDS;

    if (allLoading) {
      return (
        <div className="h-[80vh]">
          <Skeleton className="w-full" h="100%" />
        </div>
      );
    }

    if (!info || !student) {
      return (
        <div className="h-[40vh] flex justify-center items-center">
          <p className="text-[#000000B2] font-semibold">
            {error || `No report card found for ${student?.firstName ?? ''} ${student?.lastName ?? ''}`}
          </p>
        </div>
      );
    }

    return (
      <OfficialReportViewer
        info={info}
        terms={bundled?.terms ?? terms}
        dsMarks={bundled?.dsMarks ?? dsMarks}
        studentClassTermData={bundled?.studentClassTermData ?? studentClassTermData}
        viewAll={viewAll}
        isPM={isPM}
        academicYearId={academicYear}
        studentId={student.id}
        token={reportCardToken ?? info.parents?.[0]?.reportCardToken}
        studentName={`${student.firstName} ${student.lastName}`}
      />
    );
  };

  return (
    <div>
      <header className="text-[#000000B2] z-10 font-semibold flex sm:flex-row flex-col justify-between items-center mx-1 my-2 gap-2">
        <h1>
          Report Cards for {student?.firstName} {student?.lastName}
        </h1>
        <AsyncSelect
          placeholder="Select Academic Year"
          onChange={(e) => {
            setAcadId(e as string);
          }}
          width={300}
          variant="default"
          datasrc="/academic-years/all"
          value={acadId}
          useAuth={useAuth}
        />
      </header>
      {acadId && student?.id && <MyReportCard key={acadId} academicYear={acadId} />}
    </div>
  );
};

export default ViewReportCard;
