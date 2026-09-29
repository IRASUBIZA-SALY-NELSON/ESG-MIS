'use client';
import { SegmentedControl, Table } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useParentData } from '../api';
import { Score, TermInfo, TermResult } from '../types';
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  ReleaseNote,
  Section,
  StatCard,
  StatusBadge,
  num,
  ordinal,
  pct,
  termLabel,
} from '../ui';

const ScoreCell = ({ score }: { score?: Score }) => {
  if (!score) return <span className="text-gray-400">—</span>;
  return (
    <div className="flex flex-col">
      <span className={score.status === 'FAIL' ? 'text-red-600 font-medium' : ''}>
        {num(score.marks)}/{num(score.weight)}
      </span>
      <span className="text-[11px] text-gray-500">{pct(score.percentage)}</span>
    </div>
  );
};

export default function MarksTab({ studentId }: { studentId: string }) {
  const terms = useParentData<TermInfo[]>(`/parent-portal/children/${studentId}/terms`);
  const [termId, setTermId] = useState<string | null>(null);

  useEffect(() => {
    if (!termId && terms.data && terms.data.length > 0) {
      const current = terms.data.find((t) => t.current) ?? terms.data[terms.data.length - 1];
      setTermId(current.id);
    }
  }, [terms.data, termId]);

  const result = useParentData<TermResult>(
    termId ? `/parent-portal/children/${studentId}/marks?termId=${termId}` : null,
  );

  if (terms.loading) return <LoadingBlock />;
  if (terms.error) return <ErrorBlock message={terms.error} onRetry={() => terms.refresh()} />;
  if (!terms.data || terms.data.length === 0)
    return <EmptyBlock>No term has started in this academic year.</EmptyBlock>;

  const data = result.data;
  const hasSecondSitting = data?.courses.some((c) => c.secondSitting);

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        value={termId ?? ''}
        onChange={setTermId}
        data={terms.data.map((t) => ({
          value: t.id,
          label: termLabel(t.name) + (t.current ? ' (current)' : ''),
        }))}
        className="self-start"
        color="#024F3A"
      />

      {result.loading && <LoadingBlock label="Loading marks…" />}
      {result.error && <ErrorBlock message={result.error} onRetry={() => result.refresh()} />}

      {data && (
        <>
          <ReleaseNote released={data.term.released} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Term average"
              value={pct(data.percentage)}
              hint={data.grade ? `Grade ${data.grade}` : undefined}
            />
            <StatCard
              label="Total marks"
              value={data.max ? `${num(data.obtained)}/${num(data.max)}` : '—'}
              hint={`${data.coursesPassed} passed · ${data.coursesFailed} failed`}
              tone={data.coursesFailed > 0 ? 'warn' : 'default'}
            />
            <StatCard
              label="Class position"
              value={ordinal(data.position)}
              hint={
                data.classSize ? `out of ${data.classSize} · ${data.className ?? ''}` : undefined
              }
            />
            <StatCard
              label="Discipline"
              value={data.discipline ? `${num(data.discipline.score)}/${data.discipline.max}` : '—'}
              tone={data.discipline ? (data.discipline.pass ? 'good' : 'bad') : 'default'}
              hint={data.discipline ? `${data.discipline.cases} case(s)` : undefined}
            />
          </div>

          <Section title={`${termLabel(data.term.name)} results by course`}>
            {data.courses.length === 0 ? (
              <EmptyBlock>No course is registered for this term.</EmptyBlock>
            ) : (
              <Table.ScrollContainer minWidth={720}>
                <Table striped highlightOnHover verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Course</Table.Th>
                      <Table.Th>CAT</Table.Th>
                      <Table.Th>Exam</Table.Th>
                      {hasSecondSitting && <Table.Th>2nd sitting</Table.Th>}
                      <Table.Th>Total</Table.Th>
                      <Table.Th>Grade</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {data.courses.map((c) => (
                      <Table.Tr key={c.courseId}>
                        <Table.Td>
                          <p className="font-medium">{c.courseName}</p>
                          <p className="text-xs text-gray-500">
                            {c.teacherName ? `Teacher: ${c.teacherName}` : 'Teacher not assigned'}
                            {c.credits ? ` · ${c.credits} credits` : ''}
                          </p>
                          {(c.cat?.comment || c.exam?.comment) && (
                            <p className="text-xs text-blue-700 mt-1">
                              “{c.exam?.comment ?? c.cat?.comment}”
                            </p>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <ScoreCell score={c.cat} />
                        </Table.Td>
                        <Table.Td>
                          <ScoreCell score={c.exam} />
                        </Table.Td>
                        {hasSecondSitting && (
                          <Table.Td>
                            <ScoreCell score={c.secondSitting} />
                          </Table.Td>
                        )}
                        <Table.Td>
                          {c.max ? (
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {num(c.obtained)}/{num(c.max)}
                              </span>
                              <span className="text-[11px] text-gray-500">{pct(c.percentage)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </Table.Td>
                        <Table.Td className="font-semibold">{c.grade ?? '—'}</Table.Td>
                        <Table.Td>
                          <StatusBadge status={c.status} />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
