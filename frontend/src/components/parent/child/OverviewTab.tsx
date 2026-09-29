'use client';
import { Progress, Table } from '@mantine/core';
import { useParentData } from '../api';
import { Overview, TermResult } from '../types';
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Section,
  StatCard,
  fmtDate,
  num,
  ordinal,
  pct,
  scoreColor,
  termLabel,
} from '../ui';

const latestWithResults = (terms: TermResult[]) =>
  [...terms].reverse().find((t) => t.percentage !== undefined && t.percentage !== null);

export default function OverviewTab({ studentId }: { studentId: string }) {
  const { data, loading, error, refresh } = useParentData<Overview>(
    `/parent-portal/children/${studentId}/overview`,
  );
  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={() => refresh()} />;
  if (!data) return null;

  const latest = latestWithResults(data.terms);
  const sorted = latest ? [...latest.courses].filter((c) => c.percentage !== undefined) : [];
  sorted.sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));
  const strongest = sorted.slice(0, 2);
  const weakest = sorted
    .filter((c) => c.status === 'FAIL' || (c.percentage ?? 100) < 60)
    .slice(-3)
    .reverse();
  const discipline = latest?.discipline;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label={`Average · ${termLabel(latest?.term.name) || 'no results'}`}
          value={pct(latest?.percentage)}
          hint={latest?.grade ? `Grade ${latest.grade}` : 'Waiting for released marks'}
          tone={
            latest?.percentage === undefined
              ? 'default'
              : (latest.percentage ?? 0) >= 50
                ? 'good'
                : 'bad'
          }
        />
        <StatCard
          label="Class position"
          value={ordinal(latest?.position)}
          hint={
            latest?.classSize
              ? `out of ${latest.classSize} students in ${latest.className ?? 'class'}`
              : undefined
          }
        />
        <StatCard
          label="Courses passed"
          value={
            latest ? `${latest.coursesPassed}/${latest.coursesPassed + latest.coursesFailed}` : '—'
          }
          hint={
            latest && latest.coursesFailed > 0
              ? `${latest.coursesFailed} below pass mark`
              : 'All courses passed'
          }
          tone={latest && latest.coursesFailed > 0 ? 'warn' : 'good'}
        />
        <StatCard
          label="Discipline marks"
          value={discipline ? `${num(discipline.score)}/${discipline.max}` : '—'}
          hint={discipline ? `${discipline.cases} case(s) this term` : undefined}
          tone={discipline ? (discipline.pass ? 'good' : 'bad') : 'default'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title={`Progress across ${data.academicYear ?? 'the year'}`}>
          {data.terms.length === 0 ? (
            <EmptyBlock>No term has started yet.</EmptyBlock>
          ) : (
            <div className="flex flex-col gap-4">
              {data.terms.map((t) => (
                <div key={t.term.id} className="flex flex-col gap-1">
                  <div className="flex flex-row justify-between text-sm">
                    <span className="font-medium">
                      {termLabel(t.term.name)}
                      {t.term.current && (
                        <span className="ml-2 text-xs text-blue-600">current</span>
                      )}
                    </span>
                    <span className="text-gray-600">
                      {pct(t.percentage)}
                      {t.position ? ` · ${ordinal(t.position)} of ${t.classSize}` : ''}
                    </span>
                  </div>
                  <Progress
                    value={t.percentage ?? 0}
                    color={scoreColor(t.percentage)}
                    size="lg"
                    radius="sm"
                  />
                  {t.term.released !== 'EXAM' && (
                    <span className="text-xs text-gray-500">
                      {t.term.released === 'CAT'
                        ? 'CAT marks only so far'
                        : 'Marks not released yet'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Strengths and areas to support">
          {sorted.length === 0 ? (
            <EmptyBlock>Results will appear here once marks are released.</EmptyBlock>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs uppercase text-gray-500 mb-2">Strongest courses</p>
                {strongest.map((c) => (
                  <div key={c.courseId} className="flex flex-row justify-between text-sm py-1">
                    <span>{c.courseName}</span>
                    <span className="font-medium text-teal-700">{pct(c.percentage)}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 mb-2">Needs attention</p>
                {weakest.length === 0 ? (
                  <p className="text-sm text-teal-700">No course is below 60%. Keep it up.</p>
                ) : (
                  weakest.map((c) => (
                    <div key={c.courseId} className="flex flex-row justify-between text-sm py-1">
                      <span>
                        {c.courseName}
                        {c.teacherName && <span className="text-gray-500"> · {c.teacherName}</span>}
                      </span>
                      <span
                        className={`font-medium ${c.status === 'FAIL' ? 'text-red-600' : 'text-orange-600'}`}
                      >
                        {pct(c.percentage)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Recent discipline cases">
          {data.recentDeductions.length === 0 ? (
            <EmptyBlock>No discipline case has been recorded.</EmptyBlock>
          ) : (
            <Table verticalSpacing="xs" striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Case</Table.Th>
                  <Table.Th className="text-right">Marks</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.recentDeductions.map((d) => (
                  <Table.Tr key={d.id}>
                    <Table.Td className="whitespace-nowrap">{fmtDate(d.date)}</Table.Td>
                    <Table.Td>
                      <p className="font-medium">{d.category ?? 'Case'}</p>
                      {d.reason && <p className="text-xs text-gray-500">{d.reason}</p>}
                    </Table.Td>
                    <Table.Td className="text-right text-red-600">-{num(d.marks)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Section>

        <Section title="School announcements">
          {data.news.length === 0 ? (
            <EmptyBlock>No announcement yet.</EmptyBlock>
          ) : (
            <div className="flex flex-col divide-y">
              {data.news.map((n) => (
                <div key={n.id} className="py-2">
                  <p className="font-medium">{n.title}</p>
                  {n.body && <p className="text-sm text-gray-600 line-clamp-3">{n.body}</p>}
                  <p className="text-xs text-gray-400 mt-1">{fmtDate(n.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
