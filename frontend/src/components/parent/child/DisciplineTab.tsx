'use client';
import { Progress, Table } from '@mantine/core';
import { useParentData } from '../api';
import { DisciplineView } from '../types';
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Section,
  StatusBadge,
  fmtDate,
  num,
  termLabel,
} from '../ui';

export default function DisciplineTab({ studentId }: { studentId: string }) {
  const { data, loading, error, refresh } = useParentData<DisciplineView>(
    `/parent-portal/children/${studentId}/discipline`,
  );
  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={() => refresh()} />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">
        Each student starts every term with 40 discipline marks. Marks are deducted for recorded
        cases. The pass mark is {data.passMark}% ({num((data.passMark / 100) * 40)} marks).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {data.terms.map((t) => (
          <div
            key={t.term.id}
            className={`bg-white border rounded-lg p-4 ${t.pass ? '' : 'border-red-300'}`}
          >
            <div className="flex flex-row justify-between items-center">
              <p className="font-medium">{termLabel(t.term.name)}</p>
              <StatusBadge status={t.pass ? 'PASS' : 'FAIL'} />
            </div>
            <p className="text-3xl font-semibold text-primary mt-2">
              {num(t.score)}
              <span className="text-base text-gray-500">/{t.max}</span>
            </p>
            <Progress value={t.percentage} color={t.pass ? 'teal' : 'red'} className="mt-2" />
            <p className="text-xs text-gray-500 mt-2">
              {t.cases} case(s) · {num(t.deducted)} marks deducted
            </p>
          </div>
        ))}
      </div>

      <Section title="All recorded cases">
        {data.deductions.length === 0 ? (
          <EmptyBlock>No discipline case has been recorded this academic year.</EmptyBlock>
        ) : (
          <Table.ScrollContainer minWidth={600}>
            <Table striped verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Term</Table.Th>
                  <Table.Th>Case</Table.Th>
                  <Table.Th>Recorded by</Table.Th>
                  <Table.Th className="text-right">Marks</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.deductions.map((d) => (
                  <Table.Tr key={d.id}>
                    <Table.Td className="whitespace-nowrap">{fmtDate(d.date)}</Table.Td>
                    <Table.Td>{termLabel(d.termName)}</Table.Td>
                    <Table.Td>
                      <p className="font-medium">{d.category ?? 'Case'}</p>
                      {d.reason && <p className="text-xs text-gray-500">{d.reason}</p>}
                    </Table.Td>
                    <Table.Td>{d.recordedBy ?? '—'}</Table.Td>
                    <Table.Td className="text-right text-red-600 font-medium">
                      -{num(d.marks)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Section>
    </div>
  );
}
