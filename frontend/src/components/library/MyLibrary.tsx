'use client';
import { AuthApi } from '@/utils/constants';
import { Alert, Badge, Progress, Select, Table, Tabs, TextInput } from '@mantine/core';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaBook, FaBookOpen, FaExclamationTriangle, FaHistory } from 'react-icons/fa';
import { FiBell, FiCheckCircle, FiSearch } from 'react-icons/fi';
import { refreshLibrary, useLibrary } from './api';
import { CatalogEntry, Loan, MyLibrary as MyLibraryData } from './types';
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
} from './ui';

/** Borrower self-service page: books I hold, due dates, reminders, history, and the catalog. */
export default function MyLibrary() {
  const { data, loading, error, refresh } = useLibrary<MyLibraryData>('/library/me');
  const catalog = useLibrary<CatalogEntry[]>('/library/me/catalog');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const markedRef = useRef(false);

  const unread = data?.reminders.filter((r) => !r.seen).length ?? 0;

  useEffect(() => {
    if (unread > 0 && !markedRef.current) {
      markedRef.current = true;
      const timer = setTimeout(() => {
        AuthApi.put('/library/me/reminders/seen')
          .then(() => refreshLibrary())
          .catch(() => undefined);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [unread]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set((catalog.data ?? []).map((b) => b.category).filter(Boolean) as string[]),
      ).sort(),
    [catalog.data],
  );
  const books = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (catalog.data ?? []).filter(
      (b) =>
        (!category || b.category === category) &&
        (!query || [b.title, b.author, b.category].some((v) => v?.toLowerCase().includes(query))),
    );
  }, [catalog.data, q, category]);

  if (loading) return <LoadingBlock label="Loading your library…" />;
  if (error || !data) return <ErrorBlock message={error ?? 'No data'} onRetry={() => refresh()} />;

  const { summary: s, current, history, reminders } = data;
  const returned = history.filter((l) => l.status === 'RETURNED');
  const onTime = returned.filter((l) => l.daysOverdue === 0).length;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="My library"
        subtitle={`You can hold up to ${s.maxActiveLoans} books for ${s.loanDays} days each. Please return them on time so others can read them too.`}
      />

      {s.overdue > 0 && (
        <Alert
          color="red"
          variant="light"
          icon={<FaExclamationTriangle />}
          title="You have overdue books"
        >
          Please return {s.overdue === 1 ? 'it' : 'them'} to the library as soon as possible — you
          cannot borrow new books until{' '}
          {s.overdue === 1 ? 'it is' : 'they are'} returned.
        </Alert>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Books I have"
          value={`${s.current} / ${s.maxActiveLoans}`}
          icon={<FaBookOpen />}
          tone="blue"
        />
        <KpiCard
          label="Overdue"
          value={s.overdue}
          hint={s.dueSoon ? `${s.dueSoon} due soon` : undefined}
          icon={<FaExclamationTriangle />}
          tone={s.overdue ? 'red' : s.dueSoon ? 'orange' : 'teal'}
        />
        <KpiCard
          label="Returned on time"
          value={returned.length ? `${onTime} / ${returned.length}` : '—'}
          hint={returned.length ? `${Math.round((onTime / returned.length) * 100)}% of my returns` : 'No returns yet'}
          icon={<FiCheckCircle />}
          tone="teal"
        />
        <KpiCard
          label="Books read"
          value={s.totalBorrowed}
          hint="borrowed in total"
          icon={<FaHistory />}
          tone="gold"
        />
      </div>

      {reminders.length > 0 && (
        <Section
          title={
            <span className="flex items-center gap-2">
              <FiBell /> Messages from the library
              {unread > 0 && (
                <Badge color="red" size="sm" circle>
                  {unread}
                </Badge>
              )}
            </span>
          }
        >
          <ul className="flex flex-col gap-2">
            {reminders.slice(0, 5).map((r) => (
              <li
                key={r.id}
                className={`rounded-md border px-3 py-2 text-sm ${
                  !r.seen ? 'border-l-4 border-l-red-400 bg-red-50/40' : 'bg-gray-50/50'
                }`}
              >
                <div className="flex flex-row justify-between gap-2 flex-wrap">
                  <span className="font-medium text-primary">{r.bookTitle}</span>
                  <span className="text-xs text-gray-500">{fmtDateTime(r.sentAt)}</span>
                </div>
                <p className="text-gray-700">{r.message}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={`Books I have now (${current.length})`}>
        {current.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {current.map((l) => (
              <CurrentLoanCard key={l.id} loan={l} />
            ))}
          </div>
        ) : (
          <EmptyBlock>
            You have no library books right now. Browse the catalog below and ask the librarian.
          </EmptyBlock>
        )}
      </Section>

      <Section>
        <Tabs defaultValue="catalog" color="#024F3A">
          <Tabs.List className="mb-3">
            <Tabs.Tab value="catalog">Browse catalog ({catalog.data?.length ?? 0})</Tabs.Tab>
            <Tabs.Tab value="history">My history ({history.length})</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="catalog">
            <div className="flex flex-row flex-wrap gap-3 mb-3">
              <TextInput
                className="flex-1 min-w-[220px]"
                placeholder="Search title, author or subject…"
                leftSection={<FiSearch />}
                value={q}
                onChange={(e) => setQ(e.currentTarget.value)}
              />
              <Select
                placeholder="All subjects"
                data={categories}
                value={category}
                onChange={setCategory}
                clearable
                w={220}
              />
            </div>
            {catalog.loading ? (
              <LoadingBlock />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {books.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-md border px-3 py-2 flex flex-row items-center gap-3"
                  >
                    <span className="rounded bg-primary/10 text-primary p-2">
                      <FaBook />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{b.title}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {b.author ?? 'Unknown author'}
                        {b.shelfLocation ? ` · shelf ${b.shelfLocation}` : ''}
                      </div>
                    </div>
                    <Badge size="sm" variant="light" color={b.availableCopies ? 'teal' : 'gray'}>
                      {b.availableCopies ? `${b.availableCopies} available` : 'All out'}
                    </Badge>
                  </div>
                ))}
                {!books.length && <EmptyBlock>No book matches your search.</EmptyBlock>}
              </div>
            )}
          </Tabs.Panel>
          <Tabs.Panel value="history">
            {history.length ? (
              <Table.ScrollContainer minWidth={640}>
                <Table striped verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Book</Table.Th>
                      <Table.Th>Borrowed</Table.Th>
                      <Table.Th>Due</Table.Th>
                      <Table.Th>Returned</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {history.map((l) => (
                      <Table.Tr key={l.id}>
                        <Table.Td>
                          <div className="font-medium text-sm">{l.bookTitle}</div>
                          <div className="text-xs text-gray-500">{l.accessionNumber}</div>
                        </Table.Td>
                        <Table.Td className="text-sm">{fmtDate(l.issuedAt)}</Table.Td>
                        <Table.Td className="text-sm">{fmtDate(l.dueDate)}</Table.Td>
                        <Table.Td className="text-sm">
                          {l.returnedAt ? fmtDate(l.returnedAt) : '—'}
                        </Table.Td>
                        <Table.Td>
                          <LoanStatusBadge loan={l} />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            ) : (
              <EmptyBlock>You have not returned any book yet.</EmptyBlock>
            )}
          </Tabs.Panel>
        </Tabs>
      </Section>
    </div>
  );
}

function CurrentLoanCard({ loan }: { loan: Loan }) {
  const total = Math.max(1, dayjs(loan.dueDate).diff(dayjs(loan.issuedAt).startOf('day'), 'day'));
  const used = Math.min(
    total,
    dayjs().startOf('day').diff(dayjs(loan.issuedAt).startOf('day'), 'day'),
  );
  const left = daysLeft(loan.dueDate);
  const color = loan.overdue ? 'red' : loan.dueSoon ? 'orange' : 'teal';
  return (
    <div
      className={`rounded-lg border p-4 flex flex-col gap-2 ${loan.overdue ? 'border-red-300 bg-red-50/30' : ''}`}
    >
      <div className="flex flex-row items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-primary">{loan.bookTitle}</div>
          <div className="text-xs text-gray-500">
            {loan.author ? `${loan.author} · ` : ''}
            {loan.accessionNumber}
          </div>
        </div>
        <LoanStatusBadge loan={loan} />
      </div>
      <Progress
        value={loan.overdue ? 100 : (used / total) * 100}
        color={color}
        size="sm"
        radius="xl"
      />
      <div className="flex flex-row justify-between text-xs text-gray-600">
        <span>Borrowed {fmtDate(loan.issuedAt)}</span>
        <span
          className={`font-medium ${loan.overdue ? 'text-red-600' : loan.dueSoon ? 'text-orange-600' : ''}`}
        >
          {loan.overdue
            ? `${loan.daysOverdue} day(s) late`
            : left === 0
              ? 'Due today'
              : `${left} day(s) left · due ${fmtDate(loan.dueDate)}`}
        </span>
      </div>
      {loan.renewals > 0 && <div className="text-xs text-gray-500">Renewed {loan.renewals}×</div>}
    </div>
  );
}
