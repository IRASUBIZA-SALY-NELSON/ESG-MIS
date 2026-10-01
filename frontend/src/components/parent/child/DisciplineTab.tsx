'use client';
import { useParentData } from '../api';
import { DisciplineView } from '../types';
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
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
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto">
        {data.terms.map((t) => (
          <div
            key={t.term.id}
            className={`min-w-[140px] flex-1 bg-white border rounded-2xl p-3 ${t.pass ? '' : 'border-red-300'}`}
          >
            <div className="flex justify-between items-center gap-2">
              <p className="text-sm font-medium">{termLabel(t.term.name)}</p>
              <StatusBadge status={t.pass ? 'PASS' : 'FAIL'} />
            </div>
            <p className="text-2xl font-semibold text-primary mt-1">
              {num(t.score)}
              <span className="text-sm text-gray-500">/40</span>
            </p>
            <p className="text-xs text-gray-500">{t.cases} case(s)</p>
          </div>
        ))}
      </div>

      {data.deductions.length === 0 ? (
        <EmptyBlock>No cases this year.</EmptyBlock>
      ) : (
        data.deductions.map((d) => (
          <div key={d.id} className="bg-white border rounded-2xl p-3">
            <div className="flex justify-between gap-2">
              <p className="font-medium">{d.category ?? 'Case'}</p>
              <span className="text-red-600 font-medium">-{num(d.marks)}</span>
            </div>
            <p className="text-xs text-gray-500">
              {fmtDate(d.date)} · {termLabel(d.termName)}
            </p>
            {d.reason && <p className="text-sm text-gray-700 mt-1">{d.reason}</p>}
          </div>
        ))
      )}
    </div>
  );
}
