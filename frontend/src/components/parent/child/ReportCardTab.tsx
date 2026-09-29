'use client';
import { Button, Select } from '@mantine/core';
import { useEffect, useState } from 'react';
import { FiExternalLink, FiPrinter } from 'react-icons/fi';
import { useParentData } from '../api';
import { AcademicYearOption, ReportCardView, TermResult } from '../types';
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  StatusBadge,
  num,
  ordinal,
  pct,
  termLabel,
} from '../ui';

const decisionText: Record<ReportCardView['decision'], string> = {
  PROMOTED: 'Promoted to the next level',
  SITTING: 'Second sitting required',
  REPEATING: 'Repeating the level',
  IN_PROGRESS: 'Academic year in progress. The decision is made after the third term exams.',
};

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

  const card = useParentData<ReportCardView>(
    yearId ? `/parent-portal/children/${studentId}/report-card?academicYearId=${yearId}` : null,
  );

  if (years.loading) return <LoadingBlock />;
  if (years.error) return <ErrorBlock message={years.error} onRetry={() => years.refresh()} />;
  if (!years.data || years.data.length === 0)
    return <EmptyBlock>No academic year found for this student.</EmptyBlock>;

  const data = card.data;
  const courseNames = data
    ? Array.from(new Set(data.terms.flatMap((t) => t.courses.map((c) => c.courseName)))).sort()
    : [];
  const lineFor = (term: TermResult, course: string) =>
    term.courses.find((c) => c.courseName === course);
  const verifyUrl =
    data?.reportCardToken &&
    `/public/report-cards/verification?token=${data.reportCardToken}&academicYearId=${data.academicYearId}&studentId=${studentId}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row flex-wrap items-end gap-3 print:hidden">
        <Select
          label="Academic year"
          value={yearId}
          onChange={setYearId}
          data={years.data.map((y) => ({ value: y.id, label: y.name }))}
          allowDeselect={false}
          className="w-56"
        />
        <Button
          leftSection={<FiPrinter />}
          color="#024F3A"
          onClick={() => window.print()}
          disabled={!data}
        >
          Print / Save PDF
        </Button>
        {verifyUrl && (
          <Button
            component="a"
            href={verifyUrl}
            target="_blank"
            variant="outline"
            color="#024F3A"
            leftSection={<FiExternalLink />}
          >
            Official verification page
          </Button>
        )}
      </div>

      {card.loading && <LoadingBlock label="Preparing report card…" />}
      {card.error && <ErrorBlock message={card.error} onRetry={() => card.refresh()} />}

      {data && (
        <div
          className="bg-white border rounded-lg p-6 print:border-0 print:p-0"
          id="parent-report-card"
        >
          <div className="flex flex-row items-center justify-between border-b pb-4 mb-4 gap-4">
            <div className="flex flex-row items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="ESG" className="h-14 w-14 object-contain" />
              <div>
                <p className="font-bold text-primary text-lg">Ecole des Sciences de Gisenyi</p>
                <p className="text-sm text-gray-600">Student Report Card · {data.academicYear}</p>
              </div>
            </div>
            <StatusBadge status={data.decision} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
            <div>
              <p className="text-gray-500">Student</p>
              <p className="font-medium">{data.child.fullName}</p>
            </div>
            <div>
              <p className="text-gray-500">Class</p>
              <p className="font-medium">{data.child.className ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Year average</p>
              <p className="font-medium">
                {pct(data.yearPercentage)} {data.yearGrade && `(${data.yearGrade})`}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Decision</p>
              <p className="font-medium">{decisionText[data.decision]}</p>
            </div>
          </div>

          {data.terms.length === 0 ? (
            <EmptyBlock>No results in this academic year yet.</EmptyBlock>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-lightPurple">
                    <th className="border p-2 text-left" rowSpan={2}>
                      Course
                    </th>
                    {data.terms.map((t) => (
                      <th key={t.term.id} className="border p-2 text-center" colSpan={3}>
                        {termLabel(t.term.name)}
                        {t.term.released !== 'EXAM' && (
                          <span className="block text-[10px] font-normal text-gray-500">
                            {t.term.released === 'CAT' ? 'CAT only' : 'not released'}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-lightPurple text-xs">
                    {data.terms.map((t) => (
                      <FragmentHeaders key={t.term.id} />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courseNames.map((course) => (
                    <tr key={course}>
                      <td className="border p-2 font-medium">{course}</td>
                      {data.terms.map((t) => {
                        const line = lineFor(t, course);
                        return (
                          <TermCells
                            key={t.term.id}
                            cat={line?.cat ? `${num(line.cat.marks)}/${num(line.cat.weight)}` : '—'}
                            exam={
                              line?.exam ? `${num(line.exam.marks)}/${num(line.exam.weight)}` : '—'
                            }
                            total={
                              line?.percentage !== undefined
                                ? `${pct(line.percentage)} ${line.grade ?? ''}`
                                : '—'
                            }
                            fail={line?.status === 'FAIL'}
                          />
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="border p-2">Term average</td>
                    {data.terms.map((t) => (
                      <td key={t.term.id} className="border p-2 text-center" colSpan={3}>
                        {pct(t.percentage)} {t.grade && `(${t.grade})`}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border p-2">Class position</td>
                    {data.terms.map((t) => (
                      <td key={t.term.id} className="border p-2 text-center" colSpan={3}>
                        {t.position ? `${ordinal(t.position)} of ${t.classSize}` : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border p-2">Discipline (out of 40)</td>
                    {data.terms.map((t) => (
                      <td
                        key={t.term.id}
                        className={`border p-2 text-center ${t.discipline && !t.discipline.pass ? 'text-red-600' : ''}`}
                        colSpan={3}
                      >
                        {t.discipline ? num(t.discipline.score) : '—'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4">
            Grades: A ≥ 70%, B ≥ 65%, C ≥ 60%, D ≥ 55%, E ≥ 50%, F &lt; 50%. Year decision: promoted
            at 60% or more, second sitting between 50% and 60%, repeating below 50%.
          </p>
        </div>
      )}
    </div>
  );
}

const FragmentHeaders = () => (
  <>
    <th className="border p-1">CAT</th>
    <th className="border p-1">Exam</th>
    <th className="border p-1">Total</th>
  </>
);

const TermCells = ({
  cat,
  exam,
  total,
  fail,
}: {
  cat: string;
  exam: string;
  total: string;
  fail: boolean;
}) => (
  <>
    <td className="border p-2 text-center">{cat}</td>
    <td className="border p-2 text-center">{exam}</td>
    <td className={`border p-2 text-center font-medium ${fail ? 'text-red-600' : ''}`}>{total}</td>
  </>
);
