'use client';
import { useFinance } from '@/components/finance/api';
import { printStatement } from '@/components/finance/documents';
import { StudentAccount } from '@/components/finance/types';
import {
  BillStatusBadge,
  categoryLabel,
  DepartmentBadge,
  METHOD_LABELS,
  PaymentStatusBadge,
  rwf,
} from '@/components/finance/ui';
import {
  Column,
  DataTable,
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  PageHeader,
  Section,
  fmtDate,
} from '@/components/library/ui';
import { useUserContext } from '@/context/Usercontext';
import { Button } from '@mantine/core';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';
import { FaFileInvoiceDollar, FaMoneyBillWave } from 'react-icons/fa';

export default function AccountantStudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useUserContext();
  const { data: account, loading, error, refresh } = useFinance<StudentAccount>(
    id ? `/finance/students/${id}` : null,
  );

  if (loading) return <LoadingBlock label="Loading account…" />;
  if (error || !account)
    return <ErrorBlock message={error ?? 'Student not found'} onRetry={() => refresh()} />;

  const t = account.totals;
  const by = profile ? `${profile.firstName} ${profile.lastName}` : undefined;

  const billColumns: Column<(typeof account.bills)[0]>[] = [
    {
      key: 'bill',
      header: 'Bill',
      sortValue: (b) => b.billNumber,
      render: (b) => (
        <div>
          <p className="font-medium">{b.billNumber}</p>
          <p className="text-xs text-gray-500 truncate max-w-[200px]">{b.title}</p>
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

  const paymentColumns: Column<(typeof account.payments)[0]>[] = [
    {
      key: 'receipt',
      header: 'Receipt',
      sortValue: (p) => p.receiptNumber,
      render: (p) => (
        <div>
          <p className="font-medium">{p.receiptNumber}</p>
          <p className="text-xs text-gray-500">{fmtDate(p.paidOn)}</p>
        </div>
      ),
    },
    {
      key: 'bill',
      header: 'Bill',
      sortValue: (p) => p.billNumber,
      render: (p) => p.billNumber,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortValue: (p) => p.amount,
      render: (p) => rwf(p.amount),
    },
    {
      key: 'method',
      header: 'Method',
      render: (p) => METHOD_LABELS[p.method],
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <PaymentStatusBadge status={p.status} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title={account.studentName}
        subtitle={
          <>
            {account.className ?? 'No class'}
            {account.studentEmail ? ` · ${account.studentEmail}` : ''}
          </>
        }
        actions={
          <>
            <Button
              component={Link}
              href="/accountant/students"
              variant="default"
              leftSection={<FiArrowLeft />}
            >
              All students
            </Button>
            <Button variant="light" leftSection={<FiDownload />} onClick={() => printStatement(account, by)}>
              Statement PDF
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard label="Total billed" value={rwf(t.billed)} icon={<FaFileInvoiceDollar />} />
        <KpiCard label="Total paid" value={rwf(t.paid)} tone="teal" icon={<FaMoneyBillWave />} />
        <KpiCard
          label="Balance"
          value={rwf(t.balance)}
          hint={`${t.unpaidBills} unpaid bill(s)`}
          tone={t.balance > 0 ? 'red' : 'teal'}
        />
        <KpiCard
          label="Overdue bills"
          value={t.overdueBills}
          hint={`${t.bills} bill(s) on account`}
          tone={t.overdueBills > 0 ? 'orange' : 'blue'}
        />
      </div>

      <Section title="Bills">
        <DataTable
          rows={account.bills}
          columns={billColumns}
          empty="No bills for this student."
          onRowClick={(b) => router.push(`/accountant/bills/${b.id}`)}
          defaultSort={{ key: 'due', dir: 'desc' }}
        />
      </Section>

      <Section title="Payments">
        <DataTable
          rows={account.payments}
          columns={paymentColumns}
          empty="No payments yet."
          onRowClick={(p) => router.push(`/accountant/bills/${p.billId}`)}
          defaultSort={{ key: 'receipt', dir: 'desc' }}
        />
      </Section>
    </div>
  );
}
