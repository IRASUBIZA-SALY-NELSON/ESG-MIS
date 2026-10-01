'use client';

import Transcript, { YearSection } from '@/components/academics/report-cards/Transcript';
import useGet from '@/hooks/useGet';
import { IReportCard } from '@/types/marks.type';
import { IAcademicYear } from '@/types/other.type';
import { AuthApi } from '@/utils/constants';
import { Button, Skeleton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { pdf } from '@react-pdf/renderer';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BiArrowBack, BiDownload } from 'react-icons/bi';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Props {
  userId?: string;
  studentId?: string;
  showBackButton?: boolean;
}

const TranscriptPage = ({ userId, studentId, showBackButton = true }: Props) => {
  const router = useRouter();

  const { data: allAcademicYears, loading: loadingYears } = useGet<IAcademicYear[]>(
    '/academic-years/all',
    { defaultData: [], paginated: false },
  );

  const sortedYears = useMemo<IAcademicYear[]>(() => {
    if (!allAcademicYears?.length) return [];
    return [...allAcademicYears].sort((a, b) => Number(a.startYear) - Number(b.startYear));
  }, [allAcademicYears]);

  const [cardsByYearId, setCardsByYearId] = useState<Record<string, IReportCard | null>>({});
  const [studentClassTermData, setStudentClassTermData] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const fetchedForYears = useRef<string>('');

  useEffect(() => {
    if (loadingYears || !sortedYears.length || (!userId && !studentId)) return;

    const studentKey = studentId ? `student:${studentId}` : `user:${userId}`;
    const yearsKey = `${studentKey}|${sortedYears.map((y) => y.id).join(',')}`;
    if (fetchedForYears.current === yearsKey) return;
    fetchedForYears.current = yearsKey;

    const fetchAll = async () => {
      setLoadingCards(true);
      setFetchError(null);
      setCardsByYearId({});
      try {
        const pairs = await Promise.all(
          sortedYears.map(async (year) => {
            const res = await AuthApi.get(
              `/academicMarks/report-card/${studentId ? 'by-student' : 'by-loggedIn-student'}`,
              {
                params: {
                  academicYearId: year.id,
                  ...(studentId ? { studentId } : { userId }),
                },
              },
            );
            const data = (res.data?.data as IReportCard) ?? null;
            // Only treat it as "has data" if courses are actually present
            const hasData = data && data.courses && data.courses.length > 0;
            return { id: year.id, card: hasData ? data : null };
          }),
        );
        const map: Record<string, IReportCard | null> = {};
        pairs.forEach(({ id, card }) => {
          map[id] = card;
        });
        setCardsByYearId(map);

        const studentRecord = pairs.find(({ card }) => card)?.card?.studentInfo;
        if (studentRecord?.id) {
          const classTermsResponse = await AuthApi.get(
            `/student-class-term/student/${studentRecord.id}`,
          );
          setStudentClassTermData(classTermsResponse.data?.data ?? []);
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ?? err?.message ?? 'Failed to load transcript data';
        setFetchError(msg);
        notifications.show({ title: 'Error loading transcript', message: msg, color: 'red' });
      } finally {
        setLoadingCards(false);
      }
    };

    fetchAll();
  }, [sortedYears, userId, studentId, loadingYears]);

  const yearSections: YearSection[] = useMemo(() => {
    if (!sortedYears.length || !Object.keys(cardsByYearId).length) return [];

    return sortedYears
      .map((year) => cardsByYearId[year.id])
      .filter((card): card is IReportCard => Boolean(card?.academicYearInfo))
      .sort((a, b) => Number(a.academicYearInfo.startYear) - Number(b.academicYearInfo.startYear))
      .map((card) => ({
        label:
          studentClassTermData
            .filter((classTerm) => classTerm?.term?.academicYear?.id === card.academicYearInfo.id)
            .at(-1)?.myClazz?.className ??
          card.academicLevel ??
          'Y',
        academicYear: card.academicYearInfo,
        reportCard: card,
      }));
  }, [sortedYears, cardsByYearId, studentClassTermData]);

  const firstCard = useMemo(() => {
    for (const year of sortedYears) {
      const card = cardsByYearId[year.id];
      if (card) return card;
    }
    return null;
  }, [sortedYears, cardsByYearId]);

  const studentName = firstCard
    ? `${firstCard.studentInfo.firstName} ${firstCard.studentInfo.lastName}`
    : '';
  const studentProfilePic = firstCard?.studentInfo?.userProfilePic ?? null;

  const [pdfUrl, setPdfUrl] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateTranscript = useCallback(
    async (sections: YearSection[], name: string, pic: string | null | undefined) => {
      if (!sections.length) return;
      setGenerating(true);
      try {
        const blob = await pdf(
          <Transcript yearSections={sections} studentName={name} studentProfilePic={pic} />,
        ).toBlob();
        setPdfUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error('Failed to generate transcript PDF', err);
        notifications.show({
          title: 'PDF Error',
          message: 'Could not generate transcript PDF. Please try again.',
          color: 'red',
        });
      } finally {
        setGenerating(false);
      }
    },
    [],
  );

  const allLoading = loadingYears || loadingCards;
  const fetchComplete =
    !allLoading &&
    Object.keys(cardsByYearId).length === sortedYears.length &&
    sortedYears.length > 0;

  useEffect(() => {
    if (!fetchComplete || !yearSections.length) return;
    setPdfUrl('');
    generateTranscript(yearSections, studentName, studentProfilePic);
  }, [fetchComplete, cardsByYearId]);

  const downloadTranscript = () => {
    if (!pdfUrl) {
      notifications.show({
        title: 'Not ready',
        message: 'Please wait for the transcript to finish generating.',
        color: 'yellow',
      });
      return;
    }
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', `${studentName || 'student'}-transcript.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="w-full overflow-auto p-2 text-sm border-[2px] rounded-lg">
      {/* Header bar */}
      <header className="text-[#000000B2] font-semibold flex sm:flex-row flex-col justify-between items-center mx-1 my-2 gap-2">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button variant="subtle" size="xs" onClick={() => router.back()}>
              <BiArrowBack className="mr-1" />
              Back to Report Card
            </Button>
          )}
          <h1 className="text-base font-semibold">
            Academic Transcript{studentName ? ` — ${studentName}` : ''}
          </h1>
        </div>
        <Button onClick={downloadTranscript} disabled={!pdfUrl}>
          <BiDownload className="mr-2" />
          Download Transcript
        </Button>
      </header>

      {allLoading && (
        <div className="h-[80vh]">
          <Skeleton className="w-full" h="100%" />
        </div>
      )}

      {!allLoading && fetchError && (
        <div className="h-[60vh] flex justify-center items-center">
          <div className="text-red-600 font-semibold text-center max-w-md">{fetchError}</div>
        </div>
      )}

      {!allLoading && generating && (
        <div className="text-center py-4 text-[#000000B2]">Generating Transcript…</div>
      )}

      <div className="w-fit mx-auto">
        {!allLoading && !generating && pdfUrl && (
          <Document file={pdfUrl} onLoadError={() => {}}>
            <Page pageNumber={1} />
          </Document>
        )}

        {!allLoading && !fetchError && !generating && !pdfUrl && fetchComplete && (
          <div className="h-[60vh] flex justify-center items-center">
            <div className="text-[#000000B2] font-semibold mx-1 my-2 text-center">
              No transcript data available.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptPage;
