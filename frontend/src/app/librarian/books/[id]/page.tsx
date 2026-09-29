'use client';
import { AddCopiesModal, BookFormModal, EditCopyModal } from '@/components/library/BookForms';
import IssueBookForm from '@/components/library/IssueBookForm';
import LoansTable from '@/components/library/LoansTable';
import { libraryAction, useLibrary } from '@/components/library/api';
import { downloadExcel } from '@/components/library/export';
import { BookCopy, BookDetail } from '@/components/library/types';
import {
  Column,
  CopyStatusBadge,
  DataTable,
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  Section,
  fmtDate,
  titleCase,
} from '@/components/library/ui';
import { useConfirm } from '@/components/library/useConfirm';
import { ActionIcon, Badge, Button, Modal, Tabs, Tooltip } from '@mantine/core';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { FaBook, FaBookOpen, FaHistory, FaLayerGroup } from 'react-icons/fa';
import { FiArrowLeft, FiArrowUpRight, FiDownload, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refresh } = useLibrary<BookDetail>(`/library/books/${id}`);
  const [edit, setEdit] = useState(false);
  const [addCopies, setAddCopies] = useState(false);
  const [issue, setIssue] = useState(false);
  const [editCopy, setEditCopy] = useState<BookCopy | undefined>();
  const confirm = useConfirm();

  if (loading) return <LoadingBlock label="Loading book…" />;
  if (error || !data)
    return <ErrorBlock message={error ?? 'Book not found'} onRetry={() => refresh()} />;

  const { book, copies, loans } = data;
  const activeLoans = loans.filter((l) => l.status === 'ACTIVE');

  const copyColumns: Column<BookCopy>[] = [
    {
      key: 'acc',
      header: 'Accession no.',
      sortValue: (c) => c.accessionNumber,
      render: (c) => <span className="font-mono font-medium">{c.accessionNumber}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (c) => c.status,
      render: (c) => <CopyStatusBadge status={c.status} />,
    },
    {
      key: 'cond',
      header: 'Condition',
      sortValue: (c) => c.bookCondition ?? '',
      render: (c) => titleCase(c.bookCondition) || '—',
    },
    {
      key: 'holder',
      header: 'Current borrower',
      render: (c) =>
        c.currentBorrower ? (
          <div className="flex flex-col">
            <span className="font-medium">{c.currentBorrower}</span>
            <span className="text-xs text-gray-500">due {fmtDate(c.currentDueDate)}</span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: 'acq',
      header: 'Acquired',
      sortValue: (c) => c.acquiredOn ?? '',
      render: (c) => fmtDate(c.acquiredOn),
    },
    {
      key: 'times',
      header: 'Loans',
      align: 'center',
      sortValue: (c) => c.timesBorrowed,
      render: (c) => `${c.timesBorrowed}×`,
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (c) => (
        <span className="text-xs text-gray-600 line-clamp-2 max-w-[220px]">{c.notes ?? ''}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex flex-row justify-end gap-1">
          <Tooltip label="Edit status / condition">
            <ActionIcon variant="subtle" color="gray" onClick={() => setEditCopy(c)}>
              <FiEdit2 />
            </ActionIcon>
          </Tooltip>
          {c.timesBorrowed === 0 && c.status !== 'BORROWED' && (
            <Tooltip label="Delete copy">
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() =>
                  confirm.ask({
                    title: `Delete copy ${c.accessionNumber}?`,
                    message: 'This copy was never borrowed and will be removed permanently.',
                    confirmLabel: 'Delete',
                    onConfirm: () => libraryAction('delete', `/library/copies/${c.id}`),
                  })
                }
              >
                <FiTrash2 />
              </ActionIcon>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const facts: [string, React.ReactNode][] = [
    ['Author', book.author],
    ['ISBN', book.isbn && <span className="font-mono">{book.isbn}</span>],
    ['Category', book.category],
    ['Publisher', book.publisher],
    ['Year', book.publishedYear],
    ['Edition', book.edition],
    ['Language', book.language],
    ['Shelf', book.shelfLocation],
    ['Added', fmtDate(book.createdAt)],
  ];

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Link
        href="/librarian/books"
        className="text-sm text-gray-500 hover:text-primary flex items-center gap-1 mt-2"
      >
        <FiArrowLeft /> Back to catalog
      </Link>
      <div className="bg-white border rounded-lg p-5 flex flex-col lg:flex-row gap-5">
        <div className="shrink-0 h-28 w-20 rounded-md bg-gradient-to-br from-primary to-[#3b4a7a] text-white flex items-center justify-center text-3xl shadow">
          <FaBook />
        </div>
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex flex-row flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-primary">{book.title}</h1>
            {book.status === 'ARCHIVED' && (
              <Badge color="gray" variant="filled">
                Archived
              </Badge>
            )}
          </div>
          <dl className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-x-6 gap-y-2 text-sm">
            {facts
              .filter(([, v]) => v !== undefined && v !== null && v !== '')
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-gray-500">{k}</dt>
                  <dd className="font-medium text-gray-800">{v}</dd>
                </div>
              ))}
          </dl>
          {book.description && (
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{book.description}</p>
          )}
        </div>
        <div className="flex flex-row lg:flex-col gap-2 shrink-0">
          <Button
            color="#024F3A"
            leftSection={<FiArrowUpRight />}
            disabled={book.availableCopies === 0 || book.status !== 'ACTIVE'}
            onClick={() => setIssue(true)}
          >
            Issue this book
          </Button>
          <Button variant="default" leftSection={<FiPlus />} onClick={() => setAddCopies(true)}>
            Add copies
          </Button>
          <Button variant="default" leftSection={<FiEdit2 />} onClick={() => setEdit(true)}>
            Edit details
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard label="Copies" value={book.totalCopies} icon={<FaLayerGroup />} />
        <KpiCard
          label="Available"
          value={book.availableCopies}
          icon={<FaBook />}
          tone={book.availableCopies ? 'teal' : 'red'}
        />
        <KpiCard
          label="Out now"
          value={book.borrowedCopies}
          hint={
            activeLoans.filter((l) => l.overdue).length
              ? `${activeLoans.filter((l) => l.overdue).length} overdue`
              : undefined
          }
          icon={<FaBookOpen />}
          tone="blue"
        />
        <KpiCard
          label="Times borrowed"
          value={book.timesBorrowed}
          hint={`${book.lostCopies} lost · ${book.damagedCopies} damaged`}
          icon={<FaHistory />}
          tone="gold"
        />
      </div>

      <Section>
        <Tabs defaultValue="copies" color="#024F3A">
          <Tabs.List className="mb-3">
            <Tabs.Tab value="copies">Copies ({copies.length})</Tabs.Tab>
            <Tabs.Tab value="current">On loan now ({activeLoans.length})</Tabs.Tab>
            <Tabs.Tab value="history">Loan history ({loans.length})</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="copies">
            <DataTable
              rows={copies}
              columns={copyColumns}
              initialPageSize={25}
              empty="No copies — add some."
            />
          </Tabs.Panel>
          <Tabs.Panel value="current">
            <LoansTable
              loans={activeLoans}
              show={['book', 'borrower', 'issued', 'due', 'status', 'actions']}
              empty="No copy of this book is on loan."
            />
          </Tabs.Panel>
          <Tabs.Panel value="history">
            <div className="flex justify-end mb-2">
              <Button
                size="xs"
                variant="default"
                leftSection={<FiDownload />}
                onClick={() =>
                  downloadExcel(`book_history_${book.title.replace(/\W+/g, '_').slice(0, 30)}`, [
                    {
                      name: 'Loans',
                      head: [
                        'Copy',
                        'Borrower',
                        'Class',
                        'Issued',
                        'Due',
                        'Returned',
                        'Status',
                        'Days late',
                      ],
                      rows: loans.map((l) => [
                        l.accessionNumber,
                        l.borrowerName,
                        l.className,
                        fmtDate(l.issuedAt),
                        fmtDate(l.dueDate),
                        l.returnedAt ? fmtDate(l.returnedAt) : '',
                        l.status,
                        l.daysOverdue,
                      ]),
                    },
                  ])
                }
              >
                Export history
              </Button>
            </div>
            <LoansTable
              loans={loans}
              show={['book', 'borrower', 'issued', 'due', 'returned', 'status']}
              defaultSort={{ key: 'issued', dir: 'desc' }}
              empty="This book has never been borrowed."
            />
          </Tabs.Panel>
        </Tabs>
      </Section>

      <BookFormModal opened={edit} onClose={() => setEdit(false)} book={book} />
      <AddCopiesModal opened={addCopies} onClose={() => setAddCopies(false)} book={book} />
      <EditCopyModal copy={editCopy} onClose={() => setEditCopy(undefined)} />
      <Modal
        opened={issue}
        onClose={() => setIssue(false)}
        title={<b className="text-primary">Issue “{book.title}”</b>}
        size="lg"
        centered
      >
        <IssueBookForm presetBookId={book.id} onIssued={() => setIssue(false)} />
      </Modal>
      {confirm.element}
    </div>
  );
}
