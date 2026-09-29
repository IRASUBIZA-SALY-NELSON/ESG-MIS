'use client';
import { useFinance } from '@/components/finance/api';
import StudentPayForm from '@/components/finance/StudentPayForm';
import { Bill, StudentAccount } from '@/components/finance/types';
import { BillStatusBadge, categoryLabel, DepartmentBadge, rwf } from '@/components/finance/ui';
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
import { Button, Modal } from '@mantine/core';
import { useMemo, useState } from 'react';
import { FaFileInvoiceDollar, FaMoneyBillWave } from 'react-icons/fa';

export default function StudentBillsPage() {
  const { data: account, loading, error, refresh } = useFinance<StudentAccount>('/finance/me');
  const [payBill, setPayBill] = useState<Bill | null>(null);

  const unpaid = useMemo(
    () =>
      (account?.bills ?? []).filter(
        (b) => b.status === 'PUBLISHED' && b.balance > 0 && b.paymentStatus !== 'PAID',
      ),
    [account],
  );

  const columns: Column<Bill>[] = [
    {
      key: 'bill',
      header: 'Bill',
      sortValue: (b) => b.billNumber,
      render: (b) => (
        <div>
          <p className="font-medium text-primary">{b.billNumber}</p>
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
    {
      key: 'action',
      header: '',
      render: (b) => {
        const canPay =
          b.status === 'PUBLISHED' && b.balance > 0 && b.paymentStatus !== 'PAID';
        return canPay ? (
          <Button
            size="xs"
            color="#024F3A"
            onClick={(e) => {
              e.stopPropagation();
              setPayBill(b);
            }}
          >
            Pay with proof
          </Button>
        ) : null;
      },
    },
  ];

  if (loading) return <LoadingBlock label="Loading your bills…" />;
  if (error || !account) return <ErrorBlock message={error ?? 'No data'} onRetry={() => refresh()} />;

  const t = account.totals;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="My bills"
        subtitle="School fees, library fines and other charges. Upload proof when you pay at the bank or on Mobile Money."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard label="Total billed" value={rwf(t.billed)} icon={<FaFileInvoiceDollar />} />
        <KpiCard label="Paid so far" value={rwf(t.paid)} tone="teal" icon={<FaMoneyBillWave />} />
        <KpiCard
          label="Still to pay"
          value={rwf(t.balance)}
          hint={unpaid.length ? `${unpaid.length} bill(s) open` : 'All clear'}
          tone={t.balance > 0 ? 'red' : 'teal'}
        />
      </div>

      <Section title="Your bills">
        <DataTable
          rows={account.bills}
          columns={columns}
          empty="You have no published bills right now."
          defaultSort={{ key: 'due', dir: 'asc' }}
        />
      </Section>

      <Modal
        opened={!!payBill}
        onClose={() => setPayBill(null)}
        title={<b className="text-primary">Submit payment proof</b>}
        size="md"
        centered
      >
        {payBill && (
          <StudentPayForm
            bill={payBill}
            onDone={() => {
              setPayBill(null);
              refresh();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
