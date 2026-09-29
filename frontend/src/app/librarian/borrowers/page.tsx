'use client';
import { useLibrary } from '@/components/library/api';
import { downloadExcel, downloadPdf } from '@/components/library/export';
import { Borrower } from '@/components/library/types';
import {
  Column,
  DataTable,
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  PageHeader,
  RoleBadge,
  Section,
  fmtDate,
} from '@/components/library/ui';
import { useUserContext } from '@/context/Usercontext';
import { Badge, Button, Menu, Select, TextInput } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FaBookDead, FaUserCheck, FaUserClock, FaUsers } from 'react-icons/fa';
import { FiDownload, FiSearch } from 'react-icons/fi';

const cleared = (b: Borrower) => b.activeLoans === 0;

export default function BorrowersPage() {
  const router = useRouter();
  const { profile } = useUserContext();
  const { data, loading, error, refresh } = useLibrary<Borrower[]>('/library/borrowers');
  const [q, setQ] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [klass, setKlass] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const classes = useMemo(
    () =>
      Array.from(new Set((data ?? []).map((b) => b.className).filter(Boolean) as string[])).sort(),
    [data],
  );

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (data ?? []).filter((b) => {
      if (role && b.role !== role) return false;
      if (klass && b.className !== klass) return false;
      if (filter === 'out' && !b.activeLoans) return false;
      if (filter === 'overdue' && !b.overdueLoans) return false;
      if (filter === 'lost' && !b.lostBooks) return false;
      if (filter === 'never' && b.totalLoans) return false;
      if (filter === 'notcleared' && cleared(b)) return false;
      if (!query) return true;
      return [b.fullName, b.email, b.className].some((v) => v?.toLowerCase().includes(query));
    });
  }, [data, q, role, klass, filter]);

  if (loading) return <LoadingBlock label="Loading borrowers…" />;
  if (error || !data) return <ErrorBlock message={error ?? 'No data'} onRetry={() => refresh()} />;

  const columns: Column<Borrower>[] = [
    {
      key: 'name',
      header: 'Borrower',
      sortValue: (b) => b.fullName.toLowerCase(),
      render: (b) => (
        <div className="flex flex-row items-center gap-3">
          <span className="h-8 w-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
            {b.fullName
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')}
          </span>
          <div className="flex flex-col">
            <span className="font-medium text-primary">{b.fullName}</span>
            <span className="text-xs text-gray-500">{b.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Class / role',
      sortValue: (b) => b.className ?? b.role ?? '',
      render: (b) => (b.className ? b.className : <RoleBadge role={b.role} />),
    },
    {
      key: 'total',
      header: 'Total loans',
      align: 'center',
      sortValue: (b) => b.totalLoans,
      render: (b) => b.totalLoans,
    },
    {
      key: 'active',
      header: 'Out now',
      align: 'center',
      sortValue: (b) => b.activeLoans,
      render: (b) =>
        b.activeLoans ? (
          <Badge variant="light" color={b.overdueLoans ? 'red' : 'blue'}>
            {b.activeLoans}
            {b.overdueLoans ? ` (${b.overdueLoans} late)` : ''}
          </Badge>
        ) : (
          <span className="text-gray-400">0</span>
        ),
    },
    {
      key: 'lost',
      header: 'Lost',
      align: 'center',
      sortValue: (b) => b.lostBooks,
      render: (b) =>
        b.lostBooks ? (
          <span className="font-medium text-red-600">{b.lostBooks}</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: 'last',
      header: 'Last borrowed',
      sortValue: (b) => b.lastBorrowedAt ?? '',
      render: (b) =>
        b.lastBorrowedAt ? fmtDate(b.lastBorrowedAt) : <span className="text-gray-400">Never</span>,
    },
    {
      key: 'clear',
      header: 'Clearance',
      sortValue: (b) => (cleared(b) ? 1 : 0),
      render: (b) =>
        cleared(b) ? (
          <Badge color="teal" variant="dot">
            Cleared
          </Badge>
        ) : (
          <Badge color="red" variant="dot">
            Not cleared
          </Badge>
        ),
    },
  ];

  const head = [
    'Name',
    'Email',
    'Role',
    'Class',
    'Total loans',
    'Out now',
    'Overdue',
    'Lost',
    'Last borrowed',
    'Clearance',
  ];
  const exportRows = rows.map((b) => [
    b.fullName,
    b.email,
    b.role,
    b.className,
    b.totalLoans,
    b.activeLoans,
    b.overdueLoans,
    b.lostBooks,
    b.lastBorrowedAt ? fmtDate(b.lastBorrowedAt) : 'Never',
    cleared(b) ? 'Cleared' : 'Not cleared',
  ]);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Borrowers"
        subtitle="Students, teachers and staff — who has books and who is cleared."
        actions={
          <Menu shadow="md" position="bottom-end">
            <Menu.Target>
              <Button variant="default" leftSection={<FiDownload />}>
                Export
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                onClick={() =>
                  downloadExcel('library_borrowers', [
                    { name: 'Borrowers', head, rows: exportRows },
                  ])
                }
              >
                Excel (.xlsx)
              </Menu.Item>
              <Menu.Item
                onClick={() =>
                  downloadPdf({
                    filename: 'library_clearance',
                    title: 'Library clearance list',
                    subtitle: `${rows.length} borrowers${klass ? ` · ${klass}` : ''}`,
                    landscape: true,
                    generatedBy: profile ? `${profile.firstName} ${profile.lastName}` : undefined,
                    summary: [
                      ['Cleared', rows.filter(cleared).length],
                      ['Not cleared', rows.filter((b) => !cleared(b)).length],
                      ['Books still out', rows.reduce((a, b) => a + b.activeLoans, 0)],
                      ['Books lost', rows.reduce((a, b) => a + b.lostBooks, 0)],
                    ],
                    sections: [{ name: '', head, rows: exportRows }],
                  })
                }
              >
                PDF clearance list
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Members"
          value={data.length}
          hint={`${data.filter((b) => b.totalLoans).length} have borrowed`}
          icon={<FaUsers />}
        />
        <KpiCard
          label="Holding books"
          value={data.filter((b) => b.activeLoans).length}
          hint={`${data.filter((b) => b.overdueLoans).length} with overdue books`}
          icon={<FaUserClock />}
          tone="blue"
          onClick={() => setFilter('out')}
        />
        <KpiCard
          label="Lost books"
          value={data.reduce((a, b) => a + b.lostBooks, 0)}
          hint={`${data.filter((b) => b.lostBooks).length} borrowers lost a book`}
          icon={<FaBookDead />}
          tone="orange"
          onClick={() => setFilter('lost')}
        />
        <KpiCard
          label="Cleared"
          value={data.filter(cleared).length}
          hint="No books out"
          icon={<FaUserCheck />}
          tone="teal"
          onClick={() => setFilter('all')}
        />
      </div>

      <Section>
        <div className="flex flex-row flex-wrap gap-3 mb-3">
          <TextInput
            className="flex-1 min-w-[220px]"
            placeholder="Search name, email, class…"
            leftSection={<FiSearch />}
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
          />
          <Select
            placeholder="All roles"
            clearable
            data={[
              { value: 'STUDENT', label: 'Students' },
              { value: 'TEACHER', label: 'Teachers' },
              { value: 'STAFF', label: 'Staff' },
            ]}
            value={role}
            onChange={setRole}
            w={140}
          />
          <Select
            placeholder="All classes"
            clearable
            data={classes}
            value={klass}
            onChange={setKlass}
            w={150}
          />
          <Select
            value={filter}
            onChange={(v) => setFilter(v ?? 'all')}
            allowDeselect={false}
            w={200}
            data={[
              { value: 'all', label: 'Everyone' },
              { value: 'out', label: 'Holding books' },
              { value: 'overdue', label: 'With overdue books' },
              { value: 'lost', label: 'Lost a book' },
              { value: 'notcleared', label: 'Not cleared' },
              { value: 'never', label: 'Never borrowed' },
            ]}
          />
        </div>
        <DataTable
          rows={rows}
          columns={columns}
          initialPageSize={25}
          defaultSort={{ key: 'active', dir: 'desc' }}
          onRowClick={(b) => router.push(`/librarian/borrowers/${b.id}`)}
          empty="No borrower matches."
        />
      </Section>
    </div>
  );
}
