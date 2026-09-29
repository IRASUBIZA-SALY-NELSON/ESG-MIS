'use client';
import { useParentData } from '../api';
import { AppealView } from '../types';
import { EmptyBlock, ErrorBlock, LoadingBlock, StatusBadge, fmtDateTime, termLabel } from '../ui';

export default function AppealsTab({ studentId }: { studentId: string }) {
  const { data, loading, error, refresh } = useParentData<AppealView[]>(
    `/parent-portal/children/${studentId}/appeals`,
  );
  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={() => refresh()} />;
  if (!data || data.length === 0) {
    return <EmptyBlock>Your child has not submitted any academic or discipline appeal.</EmptyBlock>;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-600">
        Appeals are submitted by the student when they disagree with marks or a discipline case. You
        can follow each appeal and the staff replies here.
      </p>
      {data.map((a) => (
        <div key={a.id} className="bg-white border rounded-lg p-4">
          <div className="flex flex-row flex-wrap justify-between gap-2">
            <div>
              <p className="font-medium text-primary">
                {a.kind === 'DS' ? 'Discipline appeal' : 'Academic appeal'}
                {a.courseName && ` · ${a.courseName}`}
              </p>
              <p className="text-xs text-gray-500">
                {termLabel(a.termName)} · submitted {fmtDateTime(a.createdAt)}
                {a.teacherName && ` · handled by ${a.teacherName}`}
              </p>
            </div>
            <StatusBadge status={a.status} />
          </div>
          {a.message && <p className="text-sm mt-3 bg-gray-50 rounded-md p-3">{a.message}</p>}
          {a.comments.length > 0 && (
            <div className="mt-3 flex flex-col gap-2 border-l-2 border-primary/20 pl-3">
              {a.comments.map((c, i) => (
                <div key={i}>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{c.author ?? 'Staff'}</span>
                    {c.authorRole && ` (${termLabel(c.authorRole)})`} · {fmtDateTime(c.createdAt)}
                  </p>
                  <p className="text-sm">{c.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
