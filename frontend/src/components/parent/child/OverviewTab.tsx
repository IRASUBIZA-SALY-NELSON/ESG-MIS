'use client';
import { useParentData } from '../api';
import { Overview, TermResult } from '../types';
import { EmptyBlock, ErrorBlock, LoadingBlock, num, ordinal, pct, termLabel } from '../ui';

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
  if (!latest) return <EmptyBlock>No results yet.</EmptyBlock>;

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="bg-white rounded-2xl border py-3 px-2 text-center">
        <p className="text-[11px] text-gray-500">{termLabel(latest.term.name) || 'Average'}</p>
        <p className="text-xl font-semibold text-primary">{pct(latest.percentage)}</p>
      </div>
      <div className="bg-white rounded-2xl border py-3 px-2 text-center">
        <p className="text-[11px] text-gray-500">Position</p>
        <p className="text-xl font-semibold text-primary">{ordinal(latest.position)}</p>
      </div>
      <div className="bg-white rounded-2xl border py-3 px-2 text-center">
        <p className="text-[11px] text-gray-500">Conduct</p>
        <p
          className={`text-xl font-semibold ${latest.discipline && !latest.discipline.pass ? 'text-red-600' : 'text-primary'}`}
        >
          {latest.discipline ? num(latest.discipline.score) : '—'}
        </p>
      </div>
    </div>
  );
}
