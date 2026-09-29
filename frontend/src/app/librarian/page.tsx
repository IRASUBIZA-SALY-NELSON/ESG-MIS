'use client';
import { libraryAction, useLibrary } from '@/components/library/api';
import {
  DonutChart,
  GroupedBar,
  IssuedReturnedLine,
  PALETTE,
  SimpleBar,
} from '@/components/library/charts';
import IssueBookForm from '@/components/library/IssueBookForm';
import LoanActions from '@/components/library/LoanActions';
import ReturnBookForm from '@/components/library/ReturnBookForm';
import { LibraryStats, Loan } from '@/components/library/types';
import {
  EmptyBlock,
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  LoanStatusBadge,
  PageHeader,
  Section,
  daysLeft,
  fmtDate,
  fmtDateTime,
} from '@/components/library/ui';
import { useUserContext } from '@/context/Usercontext';
import { Button, Modal, SegmentedControl } from '@mantine/core';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FaBook, FaBookOpen, FaExclamationTriangle, FaUserFriends } from 'react-icons/fa';
import { FiArrowDownLeft, FiArrowUpRight, FiBell, FiClock, FiPlus } from 'react-icons/fi';
import { MdOutlineTaskAlt } from 'react-icons/md';

export default function LibrarianDashboard() {
  const { profile } = useUserContext();
  const router = useRouter();
  const { data, loading, error, refresh } = useLibrary<LibraryStats>('/library/stats');
  const [dialog, setDialog] = useState<'issue' | 'return' | null>(null);
  const [range, setRange] = useState<'12m' | '30d'>('12m');
  const [reminding, setReminding] = useState(false);

  if (loading) return <LoadingBlock label="Loading library dashboard…" />;
  if (error || !data) return <ErrorBlock message={error ?? 'No data'} onRetry={() => refresh()} />;

  const { totals: t, settings } = data;
  const hour = dayjs().hour();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const remindAll = async () => {
    setReminding(true);
    const res = await libraryAction<{ sent: number; skipped: number }>(
      'post',
      '/library/reminders/bulk?kind=OVERDUE',
      {},
      { silent: true },
    );
    setReminding(false);
    if (res) {
      const { notifications } = await import('@mantine/notifications');
      notifications.show({
        title: 'Overdue reminders',
        message: `${res.sent} sent${res.skipped ? `, ${res.skipped} skipped (already reminded today)` : ''}.`,
        color: res.sent ? 'teal' : 'gray',
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title={`${greeting}${profile?.firstName ? `, ${profile.firstName}` : ''}`}
        subtitle={`Library overview for ${dayjs().format('dddd, DD MMMM YYYY')}`}
        actions={
          <>
            <Button
              leftSection={<FiArrowUpRight />}
              color="#024F3A"
              onClick={() => setDialog('issue')}
            >
              Issue book
            </Button>
            <Button
              leftSection={<FiArrowDownLeft />}
              color="teal"
              onClick={() => setDialog('return')}
            >
              Return book
            </Button>
            <Button
              leftSection={<FiPlus />}
              variant="default"
              onClick={() => router.push('/librarian/books?new=1')}
            >
              Register book
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Collection"
          value={t.titles}
          hint={`${t.copies} copies · ${t.availableCopies} on the shelf`}
          icon={<FaBook />}
          onClick={() => router.push('/librarian/books')}
        />
        <KpiCard
          label="Books out now"
          value={t.activeLoans}
          hint={`${t.borrowersWithBooks} borrowers · ${t.utilizationRate}% of copies in use`}
          icon={<FaBookOpen />}
          tone="blue"
          onClick={() => router.push('/librarian/circulation')}
        />
        <KpiCard
          label="Overdue"
          value={t.overdueLoans}
          hint={`${t.dueSoonLoans} more due within ${settings.dueSoonDays} days`}
          icon={<FaExclamationTriangle />}
          tone={t.overdueLoans ? 'red' : 'teal'}
          onClick={() => router.push('/librarian/reminders')}
        />
        <KpiCard
          label="Readers this month"
          value={t.readersThisMonth}
          hint={`${t.lostLoans} lost book${t.lostLoans === 1 ? '' : 's'} on record`}
          icon={<FaUserFriends />}
          tone="gold"
          onClick={() => router.push('/librarian/borrowers')}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Issued this month" value={t.loansThisMonth} icon={<FiArrowUpRight />} />
        <MiniStat
          label="Returned this month"
          value={t.returnsThisMonth}
          icon={<FiArrowDownLeft />}
        />
        <MiniStat
          label="On-time returns"
          value={`${t.onTimeReturnRate}%`}
          icon={<MdOutlineTaskAlt />}
        />
        <MiniStat label="Avg. loan length" value={`${t.averageLoanDays} days`} icon={<FiClock />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Section
          className="xl:col-span-2"
          title="Borrowing activity"
          action={
            <SegmentedControl
              size="xs"
              value={range}
              onChange={(v) => setRange(v as '12m' | '30d')}
              data={[
                { value: '12m', label: '12 months' },
                { value: '30d', label: '30 days' },
              ]}
            />
          }
        >
          {range === '12m' ? (
            <IssuedReturnedLine
              labels={data.monthly.map((m) => m.label.split(' ')[0])}
              issued={data.monthly.map((m) => m.issued)}
              returned={data.monthly.map((m) => m.returned)}
            />
          ) : (
            <GroupedBar
              labels={data.daily.map((d) => dayjs(d.date).format('DD MMM'))}
              series={[
                { label: 'Issued', values: data.daily.map((d) => d.issued), color: PALETTE.navy },
                {
                  label: 'Returned',
                  values: data.daily.map((d) => d.returned),
                  color: PALETTE.teal,
                },
              ]}
            />
          )}
        </Section>
        <Section title="Copies by status">
          <DonutChart
            labels={['Available', 'Borrowed', 'Damaged', 'Lost', 'Retired']}
            values={[
              data.copyStatus.AVAILABLE ?? 0,
              data.copyStatus.BORROWED ?? 0,
              data.copyStatus.DAMAGED ?? 0,
              data.copyStatus.LOST ?? 0,
              data.copyStatus.RETIRED ?? 0,
            ]}
            colors={[PALETTE.teal, PALETTE.blue, PALETTE.orange, PALETTE.red, PALETTE.gray]}
            height={190}
            center={{ value: t.copies, label: 'copies' }}
          />
        </Section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Section
          title={
            <span className="flex flex-row items-center gap-2">
              Overdue books
              <span className="text-xs font-normal rounded-full bg-red-50 text-red-600 px-2 py-0.5">
                {t.overdueLoans}
              </span>
            </span>
          }
          action={
            <div className="flex flex-row gap-2">
              <Button
                size="xs"
                variant="light"
                color="red"
                leftSection={<FiBell />}
                loading={reminding}
                disabled={!t.overdueLoans}
                onClick={remindAll}
              >
                Remind all
              </Button>
              <Button size="xs" variant="subtle" component={Link} href="/librarian/reminders">
                View all
              </Button>
            </div>
          }
        >
          <LoanList loans={data.overdue} empty="No overdue books — great!" />
        </Section>
        <Section
          title={`Due in the next ${settings.dueSoonDays} days`}
          action={
            <Button
              size="xs"
              variant="subtle"
              component={Link}
              href="/librarian/loans?status=DUE_SOON"
            >
              View all
            </Button>
          }
        >
          <LoanList loans={data.dueSoon} empty="Nothing due soon." />
        </Section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Section title="Most borrowed books">
          {data.topBooks.length ? (
            <SimpleBar
              horizontal
              labels={data.topBooks.map((b) =>
                b.title.length > 26 ? `${b.title.slice(0, 25)}…` : b.title,
              )}
              values={data.topBooks.map((b) => b.loans)}
              label="Loans"
              height={Math.max(180, data.topBooks.length * 30)}
            />
          ) : (
            <EmptyBlock>No loans yet.</EmptyBlock>
          )}
        </Section>
        <Section title="Loans by category">
          {data.categories.length ? (
            <SimpleBar
              horizontal
              labels={data.categories.map((c) => c.category)}
              values={data.categories.map((c) => c.loans)}
              label="Loans"
              color={PALETTE.teal}
              height={Math.max(180, data.categories.length * 26)}
            />
          ) : (
            <EmptyBlock>No categories yet.</EmptyBlock>
          )}
        </Section>
        <Section title="Top readers">
          <ol className="flex flex-col divide-y">
            {data.topBorrowers.map((b, i) => (
              <li key={b.id}>
                <Link
                  href={`/librarian/borrowers/${b.id}`}
                  className="flex flex-row items-center gap-3 py-2 hover:bg-gray-50 rounded px-1"
                >
                  <span
                    className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${
                      i < 3 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate">{b.fullName}</span>
                    <span className="text-xs text-gray-500">{b.className ?? 'Staff'}</span>
                  </span>
                  <span className="text-right text-xs text-gray-500">
                    <b className="text-primary text-sm">{b.loans}</b> loans
                    {b.active ? <div>{b.active} out now</div> : null}
                  </span>
                </Link>
              </li>
            ))}
            {!data.topBorrowers.length && <EmptyBlock>No borrowers yet.</EmptyBlock>}
          </ol>
        </Section>
      </div>

      <Section
        title="Recent activity"
        action={
          <Button size="xs" variant="subtle" component={Link} href="/librarian/loans">
            Full history
          </Button>
        }
      >
        <ul className="flex flex-col divide-y">
          {data.recent.map((l) => {
            const returned = !!l.returnedAt;
            return (
              <li key={l.id} className="flex flex-row items-center gap-3 py-2.5 text-sm">
                <span
                  className={`rounded-full p-2 ${
                    l.status === 'LOST'
                      ? 'bg-red-50 text-red-500'
                      : returned
                        ? 'bg-teal-50 text-teal-600'
                        : 'bg-primary/10 text-primary'
                  }`}
                >
                  {returned ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                </span>
                <span className="flex-1 min-w-0">
                  <b>{l.borrowerName}</b>{' '}
                  {l.status === 'LOST' ? 'lost' : returned ? 'returned' : 'borrowed'}{' '}
                  <Link
                    href={`/librarian/books/${l.bookId}`}
                    className="text-primary hover:underline"
                  >
                    {l.bookTitle}
                  </Link>{' '}
                  <span className="text-gray-400">({l.accessionNumber})</span>
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {fmtDateTime(returned ? l.returnedAt : l.issuedAt)}
                </span>
              </li>
            );
          })}
          {!data.recent.length && <EmptyBlock>No activity yet.</EmptyBlock>}
        </ul>
      </Section>

      <Modal
        opened={dialog === 'issue'}
        onClose={() => setDialog(null)}
        title={<b className="text-primary">Issue a book</b>}
        size="lg"
        centered
      >
        <IssueBookForm onIssued={() => setDialog(null)} />
      </Modal>
      <Modal
        opened={dialog === 'return'}
        onClose={() => setDialog(null)}
        title={<b className="text-primary">Return a book</b>}
        size="lg"
        centered
      >
        <ReturnBookForm onReturned={() => setDialog(null)} />
      </Modal>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border px-4 py-3 flex flex-row items-center gap-3">
      <span className="text-primary/70 text-lg">{icon}</span>
      <div className="flex flex-col">
        <span className="text-lg font-semibold text-primary leading-tight">{value}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
    </div>
  );
}

function LoanList({ loans, empty }: { loans: Loan[]; empty: string }) {
  if (!loans.length) return <EmptyBlock>{empty}</EmptyBlock>;
  return (
    <ul className="flex flex-col divide-y">
      {loans.map((l) => (
        <li key={l.id} className="flex flex-row items-center gap-3 py-2 text-sm">
          <div className="flex flex-col flex-1 min-w-0">
            <Link
              href={`/librarian/books/${l.bookId}`}
              className="font-medium text-primary truncate hover:underline"
            >
              {l.bookTitle}
            </Link>
            <span className="text-xs text-gray-500 truncate">
              <Link href={`/librarian/borrowers/${l.borrowerId}`} className="hover:underline">
                {l.borrowerName}
              </Link>
              {l.className ? ` · ${l.className}` : ''} · {l.accessionNumber}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <LoanStatusBadge loan={l} />
            <span className="text-xs text-gray-500">
              {l.overdue
                ? `due ${fmtDate(l.dueDate)} · ${l.daysOverdue}d late`
                : daysLeft(l.dueDate) === 0
                  ? 'due today'
                  : `due ${fmtDate(l.dueDate)}`}
            </span>
          </div>
          <LoanActions loan={l} compact />
        </li>
      ))}
    </ul>
  );
}
