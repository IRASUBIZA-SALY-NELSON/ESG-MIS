'use client';
import { useFinance } from '@/components/finance/api';
import { Payment } from '@/components/finance/types';
import {
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
  LoadingBlock,
  PageHeader,
  Section,
  fmtDate,
} from '@/components/library/ui';
import { Button, Select, TextInput } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING_REVIEW', label: 'Waiting for approval' },
  { value: 'VALID', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'VOIDED', label: 'Voided' },
];

export default function AccountantPaymentsPage() {
  const router = useRouter();
  const [status, setStatus] = useState('ALL');
  const [q, setQ] = useState('');

  const qs = new URLSearchParams();
  if (status !== 'ALL') qs.set('status', status);
  const query = qs.toString();
  const { data: payments, loading, error, refresh } = useFinance<Payment[]>(
    `/finance/payments${query ? `?${query}` : ''}`,
  );

  const visible = useMemo(() => {
    const queryText = q.trim().toLowerCase();
    if (!queryText) return payments ?? [];
    return (payments ?? []).filter((p) =>
      [p.receiptNumber, p.studentName, p.billNumber, p.billTitle, p.reference, p.className]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(queryText)),
    );
  }, [payments, q]);

  const columns: Column<Payment>[] = [
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
      key: 'student',
      header: 'Student',
      sortValue: (p) => p.studentName,
      render: (p) => (
        <div>
          <p>{p.studentName}</p>
          <p className="text-xs text-gray-500">{p.className ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'bill',
      header: 'Bill',
      sortValue: (p) => p.billNumber,
      render: (p) => (
        <div>
          <p>{p.billNumber}</p>
          <p className="text-xs text-gray-500">
            {categoryLabel(p.category)}
            {p.department && (
              <span className="ml-1">
                <DepartmentBadge department={p.department} />
              </span>
            )}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortValue: (p) => p.amount,
      render: (p) => <b className="text-teal-700">{rwf(p.amount)}</b>,
    },
    {
      key: 'method',
      header: 'Paid by',
      render: (p) => (
        <span className="text-sm">
          {METHOD_LABELS[p.method]}
          {p.reference ? ` · ${p.reference}` : ''}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (p) => p.status,
      render: (p) => <PaymentStatusBadge status={p.status} />,
    },
  ];

  if (loading) return <LoadingBlock label="Loading payments…" />;
  if (error) return <ErrorBlock message={error} onRetry={() => refresh()} />;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Payments"
        subtitle="Every receipt recorded at the office or submitted by students."
        actions={
          <Button component={Link} href="/accountant" variant="default">
            Dashboard
          </Button>
        }
      />

      <Section title={`${visible.length} payment(s)`}>
        <div className="flex flex-row flex-wrap gap-3 mb-4">
          <TextInput
            className="flex-1 min-w-[200px]"
            placeholder="Search receipt, student, bill…"
            leftSection={<FiSearch />}
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
          />
          <Select
            w={220}
            data={STATUS_OPTIONS}
            value={status}
            onChange={(v) => setStatus(v ?? 'ALL')}
            allowDeselect={false}
          />
        </div>
        <DataTable
          rows={visible}
          columns={columns}
          empty="No payments match your filters."
          onRowClick={(p) => router.push(`/accountant/bills/${p.billId}`)}
          defaultSort={{ key: 'receipt', dir: 'desc' }}
        />
      </Section>
    </div>
  );
}
