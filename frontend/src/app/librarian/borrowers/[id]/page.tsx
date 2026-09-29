'use client';
import IssueBookForm from '@/components/library/IssueBookForm';
import LoansTable from '@/components/library/LoansTable';
import { useLibrary } from '@/components/library/api';
import { downloadPdf } from '@/components/library/export';
import { BorrowerDetail, BorrowerOption, LibrarySettings } from '@/components/library/types';
import {
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  RoleBadge,
  Section,
  fmtDate,
  fmtDateTime,
} from '@/components/library/ui';
import { useUserContext } from '@/context/Usercontext';
import { Alert, Badge, Button, Modal, Tabs } from '@mantine/core';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FaBook, FaBookDead, FaBookOpen, FaExclamationTriangle } from 'react-icons/fa';
import { FiArrowLeft, FiArrowUpRight, FiFileText } from 'react-icons/fi';

export default function BorrowerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useUserContext();
  const { data: settings } = useLibrary<LibrarySettings>('/library/settings');
  const { data, loading, error, refresh } = useLibrary<BorrowerDetail>(`/library/borrowers/${id}`);
  const [issue, setIssue] = useState(false);

  const option: BorrowerOption | undefined = useMemo(() => {
    if (!data || !settings) return undefined;
    const b = data.borrower;
    return {
      id: b.id,
      fullName: b.fullName,
      email: b.email,
      role: b.role,
      className: b.className,
      activeLoans: b.activeLoans,
      hasOverdue: b.overdueLoans > 0,
      canBorrow:
        b.activeLoans < settings.maxActiveLoans &&
        !(settings.blockWhenOverdue && b.overdueLoans > 0),
    };
  }, [data, settings]);

  if (loading) return <LoadingBlock label="Loading borrower…" />;
  if (error || !data)
    return <ErrorBlock message={error ?? 'Not found'} onRetry={() => refresh()} />;

  const { borrower: b, loans, reminders } = data;
  const current = loans.filter((l) => l.status === 'ACTIVE');
  const isCleared = b.activeLoans === 0;
  const lateReturns = loans.filter((l) => l.status === 'RETURNED' && l.daysOverdue > 0).length;
  const returned = loans.filter((l) => l.status === 'RETURNED').length;

  const statement = () =>
    downloadPdf({
      filename: `library_statement_${b.fullName.replace(/\W+/g, '_')}`,
      title: `Library statement — ${b.fullName}`,
      subtitle: `${b.className ?? b.role ?? ''} · ${b.email ?? ''}`,
      generatedBy: profile ? `${profile.firstName} ${profile.lastName}` : undefined,
      summary: [
        ['Clearance status', isCleared ? 'CLEARED' : 'NOT CLEARED'],
        ['Books currently held', b.activeLoans],
        ['Overdue books', b.overdueLoans],
        ['Books lost', b.lostBooks],
        ['Total books borrowed', b.totalLoans],
        ['Returned late', `${lateReturns} of ${returned}`],
      ],
      sections: [
        {
          name: 'Books currently held',
          head: ['Book', 'Copy', 'Issued', 'Due', 'Status'],
          rows: current.map((l) => [
            l.bookTitle,
            l.accessionNumber,
            fmtDate(l.issuedAt),
            fmtDate(l.dueDate),
            l.overdue ? `Overdue ${l.daysOverdue}d` : 'On loan',
          ]),
        },
        {
          name: 'Borrowing history',
          head: ['Book', 'Copy', 'Issued', 'Due', 'Returned', 'Status'],
          rows: loans.map((l) => [
            l.bookTitle,
            l.accessionNumber,
            fmtDate(l.issuedAt),
            fmtDate(l.dueDate),
            l.returnedAt ? fmtDate(l.returnedAt) : '—',
            l.status === 'ACTIVE' && l.overdue ? 'OVERDUE' : l.status,
          ]),
        },
      ],
    });

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Link
        href="/librarian/borrowers"
        className="text-sm text-gray-500 hover:text-primary flex items-center gap-1 mt-2"
      >
        <FiArrowLeft /> Back to borrowers
      </Link>
      <div className="bg-white border rounded-lg p-5 flex flex-col md:flex-row gap-4 md:items-center">
        <span className="h-14 w-14 shrink-0 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold">
          {b.fullName
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')}
        </span>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex flex-row flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-primary">{b.fullName}</h1>
            <RoleBadge role={b.role} />
            <Badge color={isCleared ? 'teal' : 'red'} variant="light">
              {isCleared ? 'Cleared' : 'Not cleared'}
            </Badge>
          </div>
          <span className="text-sm text-gray-600">
            {b.className ? `${b.className} · ` : ''}
            {b.email}
            {b.lastBorrowedAt ? ` · last borrowed ${fmtDate(b.lastBorrowedAt)}` : ''}
          </span>
        </div>
        <div className="flex flex-row gap-2">
          <Button
            color="#024F3A"
            leftSection={<FiArrowUpRight />}
            onClick={() => setIssue(true)}
            disabled={!option}
          >
            Issue a book
          </Button>
          <Button variant="default" leftSection={<FiFileText />} onClick={statement}>
            Statement (PDF)
          </Button>
        </div>
      </div>

      {b.overdueLoans > 0 && (
        <Alert color="red" variant="light" icon={<FaExclamationTriangle />}>
          {b.fullName} has {b.overdueLoans} overdue book{b.overdueLoans > 1 ? 's' : ''}
          {settings?.blockWhenOverdue ? ' and cannot borrow until they are returned.' : '.'}
        </Alert>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Books held"
          value={`${b.activeLoans} / ${settings?.maxActiveLoans ?? '—'}`}
          icon={<FaBookOpen />}
          tone="blue"
        />
        <KpiCard
          label="Overdue"
          value={b.overdueLoans}
          icon={<FaExclamationTriangle />}
          tone={b.overdueLoans ? 'red' : 'teal'}
        />
        <KpiCard
          label="Lost books"
          value={b.lostBooks}
          icon={<FaBookDead />}
          tone={b.lostBooks ? 'orange' : 'teal'}
        />
        <KpiCard
          label="Books borrowed"
          value={b.totalLoans}
          hint={
            returned
              ? `${Math.round(((returned - lateReturns) / returned) * 100)}% returned on time`
              : undefined
          }
          icon={<FaBook />}
          tone="gold"
        />
      </div>

      <Section>
        <Tabs defaultValue="current" color="#024F3A">
          <Tabs.List className="mb-3">
            <Tabs.Tab value="current">Holding now ({current.length})</Tabs.Tab>
            <Tabs.Tab value="history">History ({loans.length})</Tabs.Tab>
            <Tabs.Tab value="reminders">Reminders ({reminders.length})</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="current">
            <LoansTable
              loans={current}
              show={['book', 'issued', 'due', 'status', 'reminders', 'actions']}
              empty="Not holding any book."
            />
          </Tabs.Panel>
          <Tabs.Panel value="history">
            <LoansTable
              loans={loans}
              show={['book', 'issued', 'due', 'returned', 'status', 'actions']}
              defaultSort={{ key: 'issued', dir: 'desc' }}
              empty="Has never borrowed a book."
            />
          </Tabs.Panel>
          <Tabs.Panel value="reminders">
            {reminders.length ? (
              <ul className="flex flex-col divide-y">
                {reminders.map((r) => (
                  <li key={r.id} className="py-3 flex flex-col gap-1 text-sm">
                    <div className="flex flex-row flex-wrap items-center gap-2">
                      <Badge
                        size="sm"
                        variant="light"
                        color={
                          r.kind === 'OVERDUE' ? 'red' : r.kind === 'DUE_SOON' ? 'orange' : 'blue'
                        }
                      >
                        {r.kind.replace('_', ' ')}
                      </Badge>
                      <span className="font-medium">{r.bookTitle}</span>
                      <span className="text-xs text-gray-500">
                        {fmtDateTime(r.sentAt)}
                        {r.sentBy ? ` · by ${r.sentBy}` : ''}
                      </span>
                      <Badge size="xs" variant="dot" color={r.seen ? 'teal' : 'gray'}>
                        {r.seen ? 'Read' : 'Unread'}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{r.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No reminders sent to this borrower.
              </p>
            )}
          </Tabs.Panel>
        </Tabs>
      </Section>

      <Modal
        opened={issue}
        onClose={() => setIssue(false)}
        title={<b className="text-primary">Issue a book to {b.fullName}</b>}
        size="lg"
        centered
      >
        <IssueBookForm presetBorrower={option} onIssued={() => setIssue(false)} />
      </Modal>
    </div>
  );
}
