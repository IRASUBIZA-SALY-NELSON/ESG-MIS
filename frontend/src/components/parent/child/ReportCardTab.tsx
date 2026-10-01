'use client';
import OfficialReportViewer from '@/components/academics/report-cards/OfficialReportViewer';
import { ReportCardDocument } from '@/types/marks.type';
import { NativeSelect } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useParentData } from '../api';
import { AcademicYearOption } from '../types';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../ui';

export default function ReportCardTab({ studentId }: { studentId: string }) {
  const years = useParentData<AcademicYearOption[]>(
    `/parent-portal/children/${studentId}/academic-years`,
  );
  const [yearId, setYearId] = useState<string | null>(null);

  useEffect(() => {
    if (!yearId && years.data && years.data.length > 0) {
      setYearId((years.data.find((y) => y.status === 'ACTIVE') ?? years.data[0]).id);
    }
  }, [years.data, yearId]);

  const doc = useParentData<ReportCardDocument>(
    yearId
      ? `/parent-portal/children/${studentId}/report-card-document?academicYearId=${yearId}`
      : null,
  );

  if (years.loading) return <LoadingBlock />;
  if (years.error) return <ErrorBlock message={years.error} onRetry={() => years.refresh()} />;
  if (!years.data || years.data.length === 0)
    return <EmptyBlock>No report card yet.</EmptyBlock>;

  const info = doc.data?.reportCard;
  const token = info?.parents?.[0]?.reportCardToken;

  return (
    <div className="flex flex-col gap-3">
      <NativeSelect
        label="Year"
        value={yearId ?? ''}
        onChange={(e) => setYearId(e.currentTarget.value)}
        data={years.data.map((y) => ({ value: y.id, label: y.name }))}
        size="md"
      />

      {doc.loading && <LoadingBlock label="Opening report card…" />}
      {doc.error && <ErrorBlock message={doc.error} onRetry={() => doc.refresh()} />}

      {info && yearId && (
        <OfficialReportViewer
          compact
          info={info}
          terms={doc.data?.terms}
          dsMarks={doc.data?.dsMarks}
          studentClassTermData={doc.data?.studentClassTermData}
          academicYearId={yearId}
          studentId={studentId}
          token={token}
        />
      )}

      {!doc.loading && !doc.error && !info && (
        <EmptyBlock>No report card for this year.</EmptyBlock>
      )}
    </div>
  );
}
