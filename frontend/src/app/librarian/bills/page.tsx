'use client';
import BillForm from '@/components/finance/BillForm';
import { useFinance } from '@/components/finance/api';
import ProofReviewList from '@/components/finance/ProofReviewList';
import { Bill, FinanceSummary, Payment } from '@/components/finance/types';
import {
  BillStatusBadge,
  categoryLabel,
  PaidBar,
  rwf,
  rwfShort,
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
import { Button, Modal, Select, TextInput } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FaBook, FaMoneyBillWave } from 'react-icons/fa';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { MdPendingActions } from 'react-icons/md';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function LibrarianBillsPage() {
  const router = useRouter();
  const [status, setStatus] = useState('ALL');
  const [q, setQ] = useState('');
  const [newBill, setNewBill] = useState(false);

  const billQs = new URLSearchParams();
  if (status !== 'ALL') billQs.set('status', status);
  const billQuery = billQs.toString();

  const { data: summary, loading: sumLoading, error: sumError, refresh: refreshSum } =
    useFinance<FinanceSummary>('/library/bills/summary');
  const { data: pending, refresh: refreshPending } = useFinance<Payment[]>(
    '/library/bills/payments?status=PENDING_REVIEW',
  );
  const { data: bills, loading: billsLoading, error: billsError, refresh: refreshBills } =
    useFinance<Bill[]>(`/library/bills${billQuery ? `?${billQuery}` : ''}`);

  const loading = sumLoading || billsLoading;
  const error = sumError ?? billsError;

  const refresh = () => {
    refreshSum();
    refreshPending();
    refreshBills();
  };

  const visible = useMemo(() => {
    const queryText = q.trim().toLowerCase();
    if (!queryText) return bills ?? [];
    return (bills ?? []).filter((b) =>
      [b.billNumber, b.title, b.studentName, b.className]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(queryText)),
    );
  }, [bills, q]);

  const columns: Column<Bill>[] = [
    {
      key: 'bill',
      header: 'Bill',
      sortValue: (b) => b.billNumber,
      render: (b) => (
        <div>
          <p className="font-medium text-primary">{b.billNumber}</p>
          <p className="text-xs text-gray-500 truncate max-w-[220px]">{b.title}</p>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      sortValue: (b) => b.studentName,
      render: (b) => (
        <div>
          <p>{b.studentName}</p>
          <p className="text-xs text-gray-500">{b.className ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortValue: (b) => b.category,
      render: (b) => categoryLabel(b.category),
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
      render: (b) => (
        <div className="text-right">
          <p className="font-medium">{rwf(b.amount)}</p>
          {b.status === 'PUBLISHED' && b.balance > 0 && (
            <p className="text-xs text-red-600">Bal {rwf(b.balance)}</p>
          )}
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Paid',
      render: (b) =>
        b.status === 'PUBLISHED' ? <PaidBar paid={b.paidAmount} amount={b.amount} /> : '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => <BillStatusBadge bill={b} />,
    },
  ];

  if (loading) return <LoadingBlock label="Loading library bills…" />;
  if (error || !summary) return <ErrorBlock message={error ?? 'No data'} onRetry={() => refresh()} />;

  const t = summary.totals;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Lost & damaged book bills"
        subtitle="Bill students for lost books and review their payment proofs."
        actions={
          <>
            <Button component={Link} href="/librarian" variant="default">
              Library home
            </Button>
            <Button leftSection={<FiPlus />} color="#024F3A" onClick={() => setNewBill(true)}>
              New lost-book bill
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Outstanding"
          value={rwfShort(t.outstanding)}
          hint={`${t.studentsOwing} student(s) owing`}
          tone="red"
          icon={<FaMoneyBillWave />}
        />
        <KpiCard
          label="Collected this month"
          value={rwfShort(t.collectedThisMonth)}
          hint={`${t.paymentsThisMonth} payment(s)`}
          tone="teal"
          icon={<FaBook />}
        />
        <KpiCard
          label="Proofs to review"
          value={pending?.length ?? t.pendingReviews ?? 0}
          hint="Student uploads for library bills"
          tone="blue"
          icon={<MdPendingActions />}
        />
        <KpiCard
          label="Overdue bills"
          value={t.overdueBills}
          hint={`${Math.round(t.collectionRate)}% collection rate`}
          tone="orange"
        />
      </div>

      <Section title="Payment proofs waiting">
        <ProofReviewList
          payments={pending ?? summary.awaitingReview ?? []}
          basePath="/library/bills"
          empty="No library payment proofs waiting for review."
        />
      </Section>

      <Section title={`${visible.length} bill(s)`}>
        <div className="flex flex-row flex-wrap gap-3 mb-4">
          <TextInput
            className="flex-1 min-w-[200px]"
            placeholder="Search bill or student…"
            leftSection={<FiSearch />}
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
          />
          <Select
            w={180}
            data={STATUS_OPTIONS}
            value={status}
            onChange={(v) => setStatus(v ?? 'ALL')}
            allowDeselect={false}
          />
        </div>
        <DataTable
          rows={visible}
          columns={columns}
          empty="No library bills yet."
          onRowClick={(b) => router.push(`/librarian/bills/${b.id}`)}
          defaultSort={{ key: 'bill', dir: 'desc' }}
        />
      </Section>

      <Modal
        opened={newBill}
        onClose={() => setNewBill(false)}
        title={<b className="text-primary">New lost-book bill</b>}
        size="lg"
        centered
      >
        <BillForm mode="library" onDone={() => setNewBill(false)} />
      </Modal>
    </div>
  );
}
