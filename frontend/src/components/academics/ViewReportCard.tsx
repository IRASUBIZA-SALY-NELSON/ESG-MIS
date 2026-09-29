/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
'use client';
import useGet from '@/hooks/useGet';
import { DsReport, IReportCard } from '@/types/marks.type';
import { ITerm } from '@/types/other.type';
import { Student } from '@/types/student.types';
import { AuthApi, api } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { genReportCardQrCode } from '@/utils/funcs/func3';
import { Button, Skeleton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { pdf } from '@react-pdf/renderer';
import React, { FC, useEffect, useState } from 'react';
import { BiDownload } from 'react-icons/bi';
import { Document, Page, pdfjs } from 'react-pdf';
import ReportCard from './report-cards/ReportCard';
import AsyncSelect from '../core/selects/AsyncSelect';

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

interface Props {
  student: Student | null;
  term?: ITerm;
  customUrl?: string;
  viewAll?: boolean;
  useAuth?: boolean;
  reportCard?: IReportCard;
  defaultAcademicYearId?: string;
  reportCardToken?: string;
}

const ViewReportCard: FC<Props> = ({
  student,
  term,
  customUrl,
  viewAll,
  useAuth = true,
  reportCard,
  defaultAcademicYearId,
  reportCardToken,
}) => {
  const [acadId, setAcadId] = useState(defaultAcademicYearId ?? '');

  const MyReportCard = ({ academicYear }: { academicYear: string }) => {
    const [reportCardInfo, setReportCardInfo] = React.useState<IReportCard | null>(
      reportCard ?? null,
    );
    const isPM = /^\/(pm|dos)(\/|$)/.test(window.location.pathname);
    const [studentClassTermData, setStudentClassTermData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);
    const [generating, setGenerating] = React.useState(false);
    const [pdfUrl, setPdfUrl] = React.useState('');
    const [error, setError] = React.useState(null);
    const { data: terms, loading: termsLoading } = useGet<ITerm[]>(
      `/terms/all/academic-year/${academicYear}`,
      {
        defaultData: [],
        paginated: false,
        useAuth,
      },
    );
    const { data: dsMarks, loading: loadingDS } = useGet<DsReport>(
      useAuth ? `/deductions/ds-marks/by-studentId` : `/deductions/ds-marks/by-parent`,
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
                },
              });
          if (useAuth) {
            const res2 = await fetchApi.get(`/student-class-term/student/${student?.id}`);
            setStudentClassTermData(res2.data.data);
          }
          setReportCardInfo(res.data.data);
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: getResError(error),
            color: 'red',
          });
          console.log(error);
          setError(getResError(error));
        } finally {
          setLoading(false);
        }
      };
      if (!student) return;
      if (student) getReportCardInfo();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [student]);

    const allLoading = loading || termsLoading || loadingDS;

    const downloadReport = () => {
      if (!pdfUrl) {
        notifications.show({
          title: 'Report card not ready',
          message: 'Please wait for the report card to finish loading.',
          color: 'yellow',
        });
        return;
      }

      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `${student?.firstName}-${student?.lastName}-report-card.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    const genReportCard = async () => {
      if (!reportCardInfo || !student) return;
      setGenerating(true);
      try {
        const qrCode = await genReportCardQrCode({
          studentId: student.id,
          academicYearId: academicYear,
          token: reportCardInfo.parents?.[0]?.reportCardToken!,
        });

        const blob = await pdf(
          <ReportCard
            qrCodeImageUrl={qrCode}
            viewAll={viewAll}
            info={reportCardInfo!}
            terms={terms!}
            dsMarks={dsMarks}
            isPM={isPM}
            studentClassTermData={studentClassTermData}
          />,
        ).toBlob();
        setPdfUrl(URL.createObjectURL(blob));
        // const file = new File([blob], 'report-card.pdf', { type: 'application/pdf' });
        // setFile(file);
      } catch (err) {
        console.error(err);
      }
      setGenerating(false);
    };

    useEffect(() => {
      if (allLoading) return;
      if (reportCardInfo) {
        genReportCard();
      }
    }, [reportCardInfo, allLoading]);

    return (
      <>
        <Button onClick={downloadReport}>
          <BiDownload className="mr-2" />
          Download Report
        </Button>
        {allLoading && (
          <div className="h-[80vh]">
            <Skeleton className="w-full" h={'100%'} />
          </div>
        )}
        <div className="w-full flex items-center flex-col">
          {!allLoading && reportCardInfo && pdfUrl && (
            <>
              <Document file={pdfUrl} onLoadError={(error) => {}} className={'z-0'}>
                <Page /* width={800 } height={1020 } */ pageNumber={1} />
              </Document>
            </>
          )}
          {generating && <span className=" text-center">Generating Report Card ...</span>}
          {!allLoading && !reportCardInfo && (
            <div className="h-[80vh] flex justify-center items-center">
              <div className="text-[#000000B2] font-semibold mx-1 my-2">
                No report card found for {student?.firstName} {student?.lastName}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div>
      <header className="text-[#000000B2] z-10 font-semibold flex sm:flex-row flex-col justify-between items-center mx-1 my-2">
        <h1>
          Report Cards for {student?.firstName} {student?.lastName}
        </h1>
        <AsyncSelect
          // label="Academic Year"
          placeholder="Select Academic Year"
          onChange={(e) => {
            setAcadId(e as string);
          }}
          width={300}
          variant="default"
          // error={error.academicYear}
          datasrc="/academic-years/all"
          value={acadId}
        />
      </header>
      {acadId && student?.id && <MyReportCard academicYear={acadId} />}
    </div>
  );
};

export default ViewReportCard;
