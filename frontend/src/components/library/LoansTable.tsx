'use client';
import Link from 'next/link';
import React, { useMemo } from 'react';
import LoanActions from './LoanActions';
import { Loan } from './types';
import { Column, DataTable, LoanStatusBadge, RoleBadge, fmtDate } from './ui';

export type LoanColumn =
  'book' | 'borrower' | 'issued' | 'due' | 'returned' | 'status' | 'reminders' | 'actions';

const ALL: LoanColumn[] = ['book', 'borrower', 'issued', 'due', 'status', 'actions'];

export default function LoansTable({
  loans,
  show = ALL,
  initialPageSize = 10,
  empty = 'No loans to show',
  defaultSort,
}: {
  loans: Loan[];
  show?: LoanColumn[];
  initialPageSize?: number;
  empty?: React.ReactNode;
  defaultSort?: { key: string; dir: 'asc' | 'desc' };
}) {
  const columns = useMemo(() => {
    const defs: Record<LoanColumn, Column<Loan>> = {
      book: {
        key: 'book',
        header: 'Book / Copy',
        sortValue: (l) => l.bookTitle.toLowerCase(),
        render: (l) => (
          <div className="flex flex-col">
            <Link
              href={`/librarian/books/${l.bookId}`}
              className="font-medium text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {l.bookTitle}
            </Link>
            <span className="text-xs text-gray-500">
              {l.accessionNumber}
              {l.author ? ` · ${l.author}` : ''}
            </span>
          </div>
        ),
      },
      borrower: {
        key: 'borrower',
        header: 'Borrower',
        sortValue: (l) => l.borrowerName.toLowerCase(),
        render: (l) => (
          <div className="flex flex-col">
            <Link
              href={`/librarian/borrowers/${l.borrowerId}`}
              className="font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {l.borrowerName}
            </Link>
            <span className="text-xs text-gray-500 flex flex-row items-center gap-1">
              {l.className ?? ''}{' '}
              {l.borrowerRole !== 'STUDENT' && <RoleBadge role={l.borrowerRole} />}
            </span>
          </div>
        ),
      },
      issued: {
        key: 'issued',
        header: 'Issued',
        sortValue: (l) => l.issuedAt,
        render: (l) => fmtDate(l.issuedAt),
      },
      due: {
        key: 'due',
        header: 'Due',
        sortValue: (l) => l.dueDate,
        render: (l) => (
          <span
            className={l.overdue ? 'text-red-600 font-medium' : l.dueSoon ? 'text-orange-600' : ''}
          >
            {fmtDate(l.dueDate)}
          </span>
        ),
      },
      returned: {
        key: 'returned',
        header: 'Returned',
        sortValue: (l) => l.returnedAt ?? '',
        render: (l) => (l.returnedAt ? fmtDate(l.returnedAt) : '—'),
      },
      status: {
        key: 'status',
        header: 'Status',
        sortValue: (l) =>
          l.status === 'ACTIVE' ? (l.overdue ? 0 : 1) : l.status === 'LOST' ? 2 : 3,
        render: (l) => <LoanStatusBadge loan={l} />,
      },
      reminders: {
        key: 'reminders',
        header: 'Reminders',
        sortValue: (l) => l.remindersSent ?? 0,
        render: (l) =>
          l.remindersSent ? (
            <div className="flex flex-col text-xs">
              <span className="font-medium">{l.remindersSent} sent</span>
              <span className="text-gray-500">last {fmtDate(l.lastReminderAt)}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">None yet</span>
          ),
      },
      actions: {
        key: 'actions',
        header: '',
        align: 'right',
        render: (l) => <LoanActions loan={l} />,
      },
    };
    return show.map((c) => defs[c]);
  }, [show]);

  return (
    <DataTable
      rows={loans}
      columns={columns}
      initialPageSize={initialPageSize}
      empty={empty}
      defaultSort={defaultSort}
      rowClassName={(l) => (l.status === 'ACTIVE' && l.overdue ? 'bg-red-50/40' : '')}
    />
  );
}
