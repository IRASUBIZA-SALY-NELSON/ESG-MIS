'use client';
import { useParentData } from '@/components/parent/api';
import { StudentAccount } from '@/components/finance/types';
import { BillStatusBadge, categoryLabel, DepartmentBadge, rwf } from '@/components/finance/ui';
import {
  Column,
  DataTable,
  EmptyBlock,
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  Section,
  fmtDate,
} from '@/components/library/ui';
import { FaFileInvoiceDollar, FaMoneyBillWave } from 'react-icons/fa';

export default function BillsTab({ studentId }: { studentId: string }) {
  const { data: account, loading, error, refresh } = useParentData<StudentAccount>(
    `/parent-portal/children/${studentId}/bills`,
  );

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={() => refresh()} />;
  if (!account) return null;

  const t = account.totals;

  const columns: Column<(typeof account.bills)[0]>[] = [
    {
      key: 'bill',
      header: 'Bill',
      sortValue: (b) => b.billNumber,
      render: (b) => (
        <div>
          <p className="font-medium">{b.billNumber}</p>
          <p className="text-xs text-gray-500">{b.title}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (b) => (
        <div className="flex flex-col gap-1 items-start">
          {categoryLabel(b.category)}
          <DepartmentBadge department={b.department} />
        </div>
      ),
    },
    {
      key: 'due',
      header: 'Pay by',
      sortValue: (b) => b.dueDate ?? '',
      render: (b) => fmtDate(b.dueDate),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortValue: (b) => b.amount,
      render: (b) => rwf(b.amount),
    },
    {
      key: 'balance',
      header: 'Balance',
      align: 'right',
      sortValue: (b) => b.balance,
      render: (b) => (
        <b className={b.balance > 0 ? 'text-red-600' : 'text-teal-700'}>{rwf(b.balance)}</b>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => <BillStatusBadge bill={b} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard label="Total billed" value={rwf(t.billed)} icon={<FaFileInvoiceDollar />} />
        <KpiCard label="Paid" value={rwf(t.paid)} tone="teal" icon={<FaMoneyBillWave />} />
        <KpiCard
          label="Balance"
          value={rwf(t.balance)}
          hint={
            t.unpaidBills > 0
              ? `${t.unpaidBills} bill(s) not fully paid`
              : 'Nothing outstanding'
          }
          tone={t.balance > 0 ? 'red' : 'teal'}
        />
      </div>

      <Section title="Bills">
        {!account.bills.length ? (
          <EmptyBlock>No bills for this child yet.</EmptyBlock>
        ) : (
          <DataTable
            rows={account.bills}
            columns={columns}
            empty="No bills."
            defaultSort={{ key: 'due', dir: 'desc' }}
          />
        )}
      </Section>

      <p className="text-xs text-gray-500">
        Read-only view. Payments are recorded at school or submitted by your child with proof.
      </p>
    </div>
  );
}
