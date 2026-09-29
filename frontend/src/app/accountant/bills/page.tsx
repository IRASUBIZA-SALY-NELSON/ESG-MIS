'use client';
import BillForm from '@/components/finance/BillForm';
import BulkBillForm from '@/components/finance/BulkBillForm';
import { useFinance } from '@/components/finance/api';
import { Bill } from '@/components/finance/types';
import {
  BillStatusBadge,
  categoryLabel,
  DepartmentBadge,
  PaidBar,
  rwf,
} from '@/components/finance/ui';
import {
  Column,
  DataTable,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  Section,
  fmtDate,
} from '@/components/library/ui';
import { Button, Modal, Select, TextInput } from '@mantine/core';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { FiPlus, FiSearch, FiUsers } from 'react-icons/fi';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function BillsList() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get('status') ?? 'ALL');
  const [q, setQ] = useState('');
  const [newBill, setNewBill] = useState(false);
  const [bulk, setBulk] = useState(false);

  const qs = new URLSearchParams();
  if (status !== 'ALL') qs.set('status', status);
  const query = qs.toString();
  const { data: bills, loading, error, refresh } = useFinance<Bill[]>(
    `/finance/bills${query ? `?${query}` : ''}`,
  );

  useEffect(() => {
    if (params.get('new') === '1') setNewBill(true);
  }, [params]);

  const visible = useMemo(() => {
    const queryText = q.trim().toLowerCase();
    if (!queryText) return bills ?? [];
    return (bills ?? []).filter((b) =>
      [b.billNumber, b.title, b.studentName, b.className, b.category]
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
      render: (b) => (
        <div className="text-right">
          <p className="font-medium">{rwf(b.amount)}</p>
          {b.status === 'PUBLISHED' && b.balance < b.amount && (
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
      sortValue: (b) => b.status,
      render: (b) => <BillStatusBadge bill={b} />,
    },
  ];

  if (loading) return <LoadingBlock label="Loading bills…" />;
  if (error) return <ErrorBlock message={error} onRetry={() => refresh()} />;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="All bills"
        subtitle="School fees and other charges — drafts, published bills and cancellations."
        actions={
          <>
            <Button component={Link} href="/accountant" variant="default">
              Dashboard
            </Button>
            <Button leftSection={<FiUsers />} variant="light" onClick={() => setBulk(true)}>
              Bill whole class
            </Button>
            <Button leftSection={<FiPlus />} color="#024F3A" onClick={() => setNewBill(true)}>
              New bill
            </Button>
          </>
        }
      />

      <Section title={`${visible.length} bill(s)`}>
        <div className="flex flex-row flex-wrap gap-3 mb-4">
          <TextInput
            className="flex-1 min-w-[200px]"
            placeholder="Search bill, student, class…"
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
          empty="No bills match your filters."
          onRowClick={(b) => router.push(`/accountant/bills/${b.id}`)}
          defaultSort={{ key: 'bill', dir: 'desc' }}
        />
      </Section>

      <Modal
        opened={newBill}
        onClose={() => setNewBill(false)}
        title={<b className="text-primary">New bill</b>}
        size="lg"
        centered
      >
        <BillForm mode="finance" onDone={() => setNewBill(false)} />
      </Modal>

      <Modal
        opened={bulk}
        onClose={() => setBulk(false)}
        title={<b className="text-primary">Bill a whole class</b>}
        size="lg"
        centered
      >
        <BulkBillForm onDone={() => setBulk(false)} />
      </Modal>
    </div>
  );
}

export default function AccountantBillsPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading…" />}>
      <BillsList />
    </Suspense>
  );
}
