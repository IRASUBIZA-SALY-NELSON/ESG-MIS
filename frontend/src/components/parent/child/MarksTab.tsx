'use client';
import { useEffect, useState } from 'react';
import { useParentData } from '../api';
import { Score, TermInfo, TermResult } from '../types';
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  ReleaseNote,
  StatusBadge,
  num,
  ordinal,
  pct,
  termLabel,
} from '../ui';

const ScoreLine = ({ label, score }: { label: string; score?: Score }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className={score?.status === 'FAIL' ? 'text-red-600 font-medium' : ''}>
      {score ? `${num(score.marks)}/${num(score.weight)}` : '—'}
    </span>
  </div>
);

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
  if (!terms.data || terms.data.length === 0) return <EmptyBlock>No term yet.</EmptyBlock>;

  const data = result.data;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {terms.data.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTermId(t.id)}
            className={`shrink-0 min-h-10 px-3 rounded-full text-sm ${
              termId === t.id ? 'bg-primary text-white font-medium' : 'bg-white border text-gray-700'
            }`}
          >
            {termLabel(t.name)}
          </button>
        ))}
      </div>

      {result.loading && <LoadingBlock label="Loading marks…" />}
      {result.error && <ErrorBlock message={result.error} onRetry={() => result.refresh()} />}

      {data && (
        <>
          <ReleaseNote released={data.term.released} />
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-2xl border p-3 text-center">
              <p className="text-[11px] text-gray-500">Average</p>
              <p className="text-lg font-semibold text-primary">{pct(data.percentage)}</p>
            </div>
            <div className="bg-white rounded-2xl border p-3 text-center">
              <p className="text-[11px] text-gray-500">Position</p>
              <p className="text-lg font-semibold text-primary">{ordinal(data.position)}</p>
            </div>
            <div className="bg-white rounded-2xl border p-3 text-center">
              <p className="text-[11px] text-gray-500">Conduct</p>
              <p className="text-lg font-semibold text-primary">
                {data.discipline ? num(data.discipline.score) : '—'}
              </p>
            </div>
          </div>

          {data.courses.length === 0 ? (
            <EmptyBlock>No courses.</EmptyBlock>
          ) : (
            data.courses.map((c) => (
              <div key={c.courseId} className="bg-white rounded-2xl border p-3 flex flex-col gap-1.5">
                <div className="flex justify-between items-start gap-2">
                  <p className="font-medium text-primary">{c.courseName}</p>
                  <StatusBadge status={c.status} />
                </div>
                <ScoreLine label="CAT" score={c.cat} />
                <ScoreLine label="Exam" score={c.exam} />
                {c.secondSitting && <ScoreLine label="2nd sitting" score={c.secondSitting} />}
                <div className="flex justify-between text-sm font-medium pt-1 border-t">
                  <span>Total</span>
                  <span>
                    {c.max ? `${num(c.obtained)}/${num(c.max)}` : '—'}
                    {c.grade ? ` · ${c.grade}` : ''}
                  </span>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
