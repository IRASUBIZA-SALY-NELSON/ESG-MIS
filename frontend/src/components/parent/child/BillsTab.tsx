'use client';
import { useParentData } from '@/components/parent/api';
import { StudentAccount } from '@/components/finance/types';
import { BillStatusBadge, categoryLabel, rwf } from '@/components/finance/ui';
import { EmptyBlock, ErrorBlock, LoadingBlock, fmtDate } from '@/components/library/ui';

export default function BillsTab({ studentId }: { studentId: string }) {
  const { data: account, loading, error, refresh } = useParentData<StudentAccount>(
    `/parent-portal/children/${studentId}/bills`,
  );

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={() => refresh()} />;
  if (!account) return null;

  const t = account.totals;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-2xl border p-3">
          <p className="text-xs text-gray-500">Billed</p>
          <p className="text-lg font-semibold text-primary">{rwf(t.billed)}</p>
        </div>
        <div className="bg-white rounded-2xl border p-3">
          <p className="text-xs text-gray-500">Balance</p>
          <p className={`text-lg font-semibold ${t.balance > 0 ? 'text-red-600' : 'text-teal-700'}`}>
            {rwf(t.balance)}
          </p>
        </div>
      </div>

      {!account.bills.length ? (
        <EmptyBlock>No bills yet.</EmptyBlock>
      ) : (
        account.bills.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border p-3 flex flex-col gap-1">
            <div className="flex justify-between gap-2">
              <p className="font-medium">{b.title}</p>
              <BillStatusBadge bill={b} />
            </div>
            <p className="text-xs text-gray-500">
              {categoryLabel(b.category)}
              {b.dueDate ? ` · due ${fmtDate(b.dueDate)}` : ''}
            </p>
            <div className="flex justify-between text-sm pt-1">
              <span>{rwf(b.amount)}</span>
              <span className={b.balance > 0 ? 'text-red-600 font-medium' : 'text-teal-700'}>
                {rwf(b.balance)} left
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
