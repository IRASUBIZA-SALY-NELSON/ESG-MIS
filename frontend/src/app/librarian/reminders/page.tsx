'use client';
import LoansTable from '@/components/library/LoansTable';
import { libraryAction, useLibrary } from '@/components/library/api';
import { downloadExcel, downloadPdf } from '@/components/library/export';
import { LibrarySettings, Loan, Reminder } from '@/components/library/types';
import {
  Column,
  DataTable,
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  PageHeader,
  Section,
  fmtDate,
  fmtDateTime,
} from '@/components/library/ui';
import { useUserContext } from '@/context/Usercontext';
import { Badge, Button, Menu, Tabs, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FaExclamationTriangle, FaUserClock } from 'react-icons/fa';
import { FiBell, FiClock, FiDownload, FiSearch, FiSend } from 'react-icons/fi';

const kindColor = { OVERDUE: 'red', DUE_SOON: 'orange', CUSTOM: 'blue' } as const;
const kindLabel = { OVERDUE: 'Overdue', DUE_SOON: 'Due soon', CUSTOM: 'Custom' } as const;

export default function RemindersPage() {
  const { profile } = useUserContext();
  const { data: settings } = useLibrary<LibrarySettings>('/library/settings');
  const overdue = useLibrary<Loan[]>('/library/loans?status=OVERDUE');
  const dueSoon = useLibrary<Loan[]>('/library/loans?status=DUE_SOON');
  const log = useLibrary<Reminder[]>('/library/reminders');
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const bulk = async (kind: 'OVERDUE' | 'DUE_SOON') => {
    setBusy(kind);
    const res = await libraryAction<{ sent: number; skipped: number }>(
      'post',
      `/library/reminders/bulk?kind=${kind}`,
      {},
      { silent: true },
    );
    setBusy(null);
    if (res) {
      notifications.show({
        title: kind === 'OVERDUE' ? 'Overdue reminders' : 'Due-soon reminders',
        message:
          res.sent || res.skipped
            ? `${res.sent} sent${res.skipped ? ` · ${res.skipped} skipped (already reminded today)` : ''}`
            : 'No borrower needed a reminder.',
        color: res.sent ? 'teal' : 'gray',
      });
    }
  };

  const logRows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (log.data ?? []).filter(
      (r) =>
        !query ||
        [r.bookTitle, r.borrowerName, r.accessionNumber, r.message].some((v) =>
          v?.toLowerCase().includes(query),
        ),
    );
  }, [log.data, q]);

  const logColumns: Column<Reminder>[] = [
    {
      key: 'sent',
      header: 'Sent',
      sortValue: (r) => r.sentAt,
      render: (r) => fmtDateTime(r.sentAt),
    },
    {
      key: 'kind',
      header: 'Type',
      sortValue: (r) => r.kind,
      render: (r) => (
        <Badge color={kindColor[r.kind]} variant="light" radius="sm">
          {kindLabel[r.kind]}
        </Badge>
      ),
    },
    {
      key: 'borrower',
      header: 'Borrower',
      sortValue: (r) => r.borrowerName,
      render: (r) => (
        <Link href={`/librarian/borrowers/${r.borrowerId}`} className="font-medium hover:underline">
          {r.borrowerName}
        </Link>
      ),
    },
    {
      key: 'book',
      header: 'Book',
      sortValue: (r) => r.bookTitle,
      render: (r) => (
        <div className="flex flex-col">
          <span>{r.bookTitle}</span>
          <span className="text-xs text-gray-500">
            {r.accessionNumber} · due {fmtDate(r.dueDate)}
          </span>
        </div>
      ),
    },
    {
      key: 'msg',
      header: 'Message',
      render: (r) => (
        <span className="text-xs text-gray-600 line-clamp-2 max-w-[360px]">{r.message}</span>
      ),
    },
    {
      key: 'seen',
      header: 'Read',
      sortValue: (r) => (r.seen ? 1 : 0),
      render: (r) =>
        r.seen ? (
          <Badge color="teal" variant="dot" size="sm">
            Read
          </Badge>
        ) : (
          <Badge color="gray" variant="dot" size="sm">
            Unread
          </Badge>
        ),
    },
  ];

  const overdueList = overdue.data ?? [];
  const borrowersConcerned = new Set(overdueList.map((l) => l.borrowerId)).size;
  const longestOverdue = overdueList.reduce((a, l) => Math.max(a, l.daysOverdue ?? 0), 0);
  const neverReminded = overdueList.filter((l) => !l.remindersSent).length;

  const exportOverdue = (format: 'xlsx' | 'pdf') => {
    const head = ['Book', 'Copy', 'Borrower', 'Class', 'Email', 'Due', 'Days late', 'Reminders'];
    const rows = overdueList.map((l) => [
      l.bookTitle,
      l.accessionNumber,
      l.borrowerName,
      l.className ?? l.borrowerRole,
      l.borrowerEmail,
      fmtDate(l.dueDate),
      l.daysOverdue,
      l.remindersSent ?? 0,
    ]);
    if (format === 'xlsx') return downloadExcel('overdue_books', [{ name: 'Overdue', head, rows }]);
    return downloadPdf({
      filename: 'overdue_books',
      title: 'Overdue books',
      subtitle: `${overdueList.length} books not returned on time`,
      landscape: true,
      generatedBy: profile ? `${profile.firstName} ${profile.lastName}` : undefined,
      summary: [
        ['Overdue books', overdueList.length],
        ['Borrowers concerned', borrowersConcerned],
        ['Longest overdue', `${longestOverdue} days`],
      ],
      sections: [{ name: '', head, rows }],
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Overdue & reminders"
        subtitle="Follow up on late books and notify borrowers. Borrowers see reminders on their Library page."
        actions={
          <>
            <Button
              color="red"
              variant="light"
              leftSection={<FiSend />}
              loading={busy === 'OVERDUE'}
              disabled={!overdueList.length}
              onClick={() => bulk('OVERDUE')}
            >
              Remind all overdue
            </Button>
            <Button
              color="orange"
              variant="light"
              leftSection={<FiBell />}
              loading={busy === 'DUE_SOON'}
              disabled={!dueSoon.data?.length}
              onClick={() => bulk('DUE_SOON')}
            >
              Remind due soon
            </Button>
            <Menu shadow="md" position="bottom-end">
              <Menu.Target>
                <Button
                  variant="default"
                  leftSection={<FiDownload />}
                  disabled={!overdueList.length}
                >
                  Overdue list
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => exportOverdue('xlsx')}>Excel (.xlsx)</Menu.Item>
                <Menu.Item onClick={() => exportOverdue('pdf')}>PDF report</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard
          label="Overdue books"
          value={overdueList.length}
          hint={`${neverReminded} not yet reminded`}
          icon={<FaExclamationTriangle />}
          tone={overdueList.length ? 'red' : 'teal'}
        />
        <KpiCard
          label="Due soon"
          value={dueSoon.data?.length ?? 0}
          hint={`within ${settings?.dueSoonDays ?? 3} days`}
          icon={<FiClock />}
          tone="orange"
        />
        <KpiCard
          label="Borrowers with late books"
          value={borrowersConcerned}
          hint={longestOverdue ? `Longest overdue: ${longestOverdue} days` : 'Nobody is late'}
          icon={<FaUserClock />}
          tone="gold"
        />
      </div>

      <Section>
        <Tabs defaultValue="overdue" color="#024F3A">
          <Tabs.List className="mb-3">
            <Tabs.Tab value="overdue">Overdue ({overdueList.length})</Tabs.Tab>
            <Tabs.Tab value="soon">Due soon ({dueSoon.data?.length ?? 0})</Tabs.Tab>
            <Tabs.Tab value="log">Reminder log ({log.data?.length ?? 0})</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="overdue">
            {overdue.loading ? (
              <LoadingBlock />
            ) : overdue.error ? (
              <ErrorBlock message={overdue.error} />
            ) : (
              <LoansTable
                loans={overdueList}
                show={['book', 'borrower', 'due', 'status', 'reminders', 'actions']}
                defaultSort={{ key: 'due', dir: 'asc' }}
                empty="No overdue books — every loan is on time."
              />
            )}
          </Tabs.Panel>
          <Tabs.Panel value="soon">
            <LoansTable
              loans={dueSoon.data ?? []}
              show={['book', 'borrower', 'issued', 'due', 'status', 'reminders', 'actions']}
              defaultSort={{ key: 'due', dir: 'asc' }}
              empty="Nothing due in the next few days."
            />
          </Tabs.Panel>
          <Tabs.Panel value="log">
            <TextInput
              className="mb-3 max-w-md"
              placeholder="Search reminders…"
              leftSection={<FiSearch />}
              value={q}
              onChange={(e) => setQ(e.currentTarget.value)}
            />
            <DataTable
              rows={logRows}
              columns={logColumns}
              initialPageSize={25}
              defaultSort={{ key: 'sent', dir: 'desc' }}
              empty="No reminders sent yet."
            />
          </Tabs.Panel>
        </Tabs>
      </Section>
    </div>
  );
}
