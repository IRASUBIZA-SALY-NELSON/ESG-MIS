'use client';
import { useParentData } from '../api';
import { AppealView } from '../types';
import { EmptyBlock, ErrorBlock, LoadingBlock, StatusBadge, fmtDateTime } from '../ui';

export default function AppealsTab({ studentId }: { studentId: string }) {
  const { data, loading, error, refresh } = useParentData<AppealView[]>(
    `/parent-portal/children/${studentId}/appeals`,
  );
  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={() => refresh()} />;
  if (!data || data.length === 0) {
    return <EmptyBlock>No appeals.</EmptyBlock>;
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((a) => (
        <div key={a.id} className="bg-white border rounded-2xl p-3">
          <div className="flex justify-between gap-2">
            <p className="font-medium text-primary">
              {a.kind === 'DS' ? 'Conduct' : 'Marks'}
              {a.courseName ? ` · ${a.courseName}` : ''}
            </p>
            <StatusBadge status={a.status} />
          </div>
          <p className="text-xs text-gray-500">{fmtDateTime(a.createdAt)}</p>
          {a.message && <p className="text-sm mt-2">{a.message}</p>}
          {a.comments[a.comments.length - 1] && (
            <p className="text-sm mt-2 bg-[#EEF5F1] rounded-xl p-2">
              <span className="text-xs text-gray-500">
                {a.comments[a.comments.length - 1].author ?? 'School'} ·{' '}
                {fmtDateTime(a.comments[a.comments.length - 1].createdAt)}
              </span>
              <span className="block">{a.comments[a.comments.length - 1].comment}</span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
