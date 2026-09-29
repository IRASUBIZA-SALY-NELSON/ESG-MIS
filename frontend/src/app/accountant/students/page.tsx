'use client';
import { useFinance } from '@/components/finance/api';
import { StudentBalance } from '@/components/finance/types';
import { rwf } from '@/components/finance/ui';
import {
  Column,
  DataTable,
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  PageHeader,
  Section,
} from '@/components/library/ui';
import { Badge, Button, TextInput } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FaUserClock } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';

export default function AccountantStudentsPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const { data: students, loading, error, refresh } = useFinance<StudentBalance[]>('/finance/students');

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return students ?? [];
    return (students ?? []).filter((s) =>
      [s.studentName, s.studentEmail, s.className]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(query)),
    );
  }, [students, q]);

  const owing = (students ?? []).filter((s) => s.balance > 0);
  const overdue = (students ?? []).filter((s) => s.overdue);

  const columns: Column<StudentBalance>[] = [
    {
      key: 'student',
      header: 'Student',
      sortValue: (s) => s.studentName,
      render: (s) => (
        <div>
          <p className="font-medium text-primary">{s.studentName}</p>
          <p className="text-xs text-gray-500">{s.className ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'billed',
      header: 'Billed',
      align: 'right',
      sortValue: (s) => s.billed,
      render: (s) => rwf(s.billed),
    },
    {
      key: 'paid',
      header: 'Paid',
      align: 'right',
      sortValue: (s) => s.paid,
      render: (s) => rwf(s.paid),
    },
    {
      key: 'balance',
      header: 'Balance',
      align: 'right',
      sortValue: (s) => s.balance,
      render: (s) => (
        <b className={s.balance > 0 ? 'text-red-600' : 'text-teal-700'}>{rwf(s.balance)}</b>
      ),
    },
    {
      key: 'bills',
      header: 'Open bills',
      align: 'center',
      sortValue: (s) => s.openBills,
      render: (s) => s.openBills,
    },
    {
      key: 'flags',
      header: '',
      render: (s) =>
        s.overdue ? (
          <Badge color="red" variant="light" size="sm">
            Overdue
          </Badge>
        ) : null,
    },
  ];

  if (loading) return <LoadingBlock label="Loading students…" />;
  if (error) return <ErrorBlock message={error} onRetry={() => refresh()} />;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Student balances"
        subtitle="Who owes what — open a student for a full account statement."
        actions={
          <Button component={Link} href="/accountant" variant="default">
            Dashboard
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <KpiCard
          label="Students owing"
          value={owing.length}
          hint={`${overdue.length} with overdue bills`}
          tone="red"
          icon={<FaUserClock />}
        />
        <KpiCard
          label="Total outstanding"
          value={rwf(owing.reduce((a, s) => a + s.balance, 0))}
          hint="Across all published bills"
          tone="orange"
        />
      </div>

      <Section title={`${visible.length} student(s)`}>
        <TextInput
          className="mb-4 max-w-md"
          placeholder="Search name, class, email…"
          leftSection={<FiSearch />}
          value={q}
          onChange={(e) => setQ(e.currentTarget.value)}
        />
        <DataTable
          rows={visible.map((s) => ({ ...s, id: s.studentId }))}
          columns={columns as Column<{ id: string } & StudentBalance>[]}
          empty="No students found."
          onRowClick={(s) => router.push(`/accountant/students/${s.studentId}`)}
          defaultSort={{ key: 'balance', dir: 'desc' }}
        />
      </Section>
    </div>
  );
}
