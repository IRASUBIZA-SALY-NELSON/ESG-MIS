'use client';
import { Alert, Badge, Button, SegmentedControl, Select, TextInput, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDebouncedValue } from '@mantine/hooks';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { FiBookOpen, FiUser } from 'react-icons/fi';
import { libraryAction, useLibrary } from './api';
import { Book, BorrowerOption, LibrarySettings, Loan } from './types';
import { RoleBadge, fmtDate } from './ui';

/** Issue a book: pick borrower, pick a title (first available copy) or scan an accession number. */
export default function IssueBookForm({
  presetBorrower,
  presetBookId,
  onIssued,
}: {
  presetBorrower?: BorrowerOption;
  presetBookId?: string;
  onIssued?: (loan: Loan) => void;
}) {
  const { data: settings } = useLibrary<LibrarySettings>('/library/settings');
  const { data: books } = useLibrary<Book[]>('/library/books');
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 250);
  const { data: found, loading: searching } = useLibrary<BorrowerOption[]>(
    `/library/borrowers/search?q=${encodeURIComponent(debounced)}`,
  );
  const [picked, setBorrower] = useState<BorrowerOption | undefined>(presetBorrower);
  const { data: live } = useLibrary<BorrowerOption[]>(
    picked
      ? `/library/borrowers/search?q=${encodeURIComponent(picked.email ?? picked.fullName)}`
      : null,
  );
  const borrower = picked ? (live?.find((b) => b.id === picked.id) ?? picked) : undefined;
  const [mode, setMode] = useState<'title' | 'copy'>('title');
  const [bookId, setBookId] = useState<string | null>(presetBookId ?? null);
  const [accession, setAccession] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (settings && !dueDate) {
      setDueDate(dayjs().add(settings.loanDays, 'day').format('YYYY-MM-DD'));
    }
  }, [settings, dueDate]);

  useEffect(() => {
    if (presetBorrower) setBorrower(presetBorrower);
  }, [presetBorrower]);

  const borrowerOptions = useMemo(() => {
    const list = [...(found ?? [])];
    if (borrower && !list.some((b) => b.id === borrower.id)) list.unshift(borrower);
    return list;
  }, [found, borrower]);

  const bookOptions = useMemo(
    () =>
      (books ?? [])
        .filter((b) => b.status === 'ACTIVE')
        .map((b) => ({
          value: b.id,
          label: `${b.title}${b.author ? ` — ${b.author}` : ''}`,
          disabled: b.availableCopies === 0,
          available: b.availableCopies,
        })),
    [books],
  );
  const selectedBook = books?.find((b) => b.id === bookId);

  const blocked = borrower && !borrower.canBorrow;
  const canSubmit =
    !!borrower &&
    !blocked &&
    (mode === 'title' ? !!bookId : accession.trim().length > 0) &&
    !!dueDate;

  const submit = async () => {
    if (!borrower) return;
    setBusy(true);
    const loan = await libraryAction<Loan>('post', '/library/loans/issue', {
      borrowerId: borrower.id,
      bookId: mode === 'title' ? bookId : undefined,
      accessionNumber: mode === 'copy' ? accession.trim() : undefined,
      dueDate,
      notes: notes || undefined,
    });
    setBusy(false);
    if (loan) {
      setBookId(null);
      setAccession('');
      setNotes('');
      onIssued?.(loan);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Borrower"
        placeholder="Search a student, teacher or staff by name or email"
        leftSection={<FiUser />}
        searchable
        clearable
        disabled={!!presetBorrower}
        searchValue={search}
        onSearchChange={setSearch}
        nothingFoundMessage={searching ? 'Searching…' : 'No borrower found'}
        filter={({ options }) => options}
        data={borrowerOptions.map((b) => ({
          value: b.id,
          label: `${b.fullName}${b.className ? ` · ${b.className}` : ''}`,
        }))}
        value={borrower?.id ?? null}
        onChange={(id) => setBorrower(borrowerOptions.find((b) => b.id === id))}
      />
      {borrower && (
        <div className="flex flex-row flex-wrap items-center gap-2 text-xs rounded-md bg-gray-50 border px-3 py-2">
          <RoleBadge role={borrower.role} />
          <span className="text-gray-600">{borrower.email}</span>
          <Badge variant="light" color={borrower.activeLoans ? 'blue' : 'gray'} size="sm">
            {borrower.activeLoans} / {settings?.maxActiveLoans ?? '—'} books out
          </Badge>
          {borrower.hasOverdue && (
            <Badge color="red" variant="light" size="sm">
              Has overdue book
            </Badge>
          )}
        </div>
      )}
      {blocked && (
        <Alert color="red" variant="light">
          {borrower!.hasOverdue && settings?.blockWhenOverdue
            ? 'This borrower has an overdue book. It must be returned before a new loan.'
            : `This borrower already has the maximum of ${settings?.maxActiveLoans} books.`}
        </Alert>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Book</span>
        <SegmentedControl
          size="xs"
          value={mode}
          onChange={(v) => setMode(v as 'title' | 'copy')}
          data={[
            { value: 'title', label: 'Choose title' },
            { value: 'copy', label: 'Enter copy number' },
          ]}
        />
      </div>
      {mode === 'title' ? (
        <Select
          placeholder="Search the catalog"
          leftSection={<FiBookOpen />}
          searchable
          clearable
          value={bookId}
          onChange={setBookId}
          data={bookOptions}
          nothingFoundMessage="No matching title"
          renderOption={({ option }) => {
            const o = bookOptions.find((b) => b.value === option.value);
            return (
              <div className="flex flex-row justify-between w-full gap-2 text-sm">
                <span>{option.label}</span>
                <Badge size="xs" variant="light" color={o?.available ? 'teal' : 'red'}>
                  {o?.available ? `${o.available} available` : 'none available'}
                </Badge>
              </div>
            );
          }}
          description={
            selectedBook
              ? `${selectedBook.availableCopies} of ${selectedBook.totalCopies} copies on the shelf${
                  selectedBook.shelfLocation ? ` · shelf ${selectedBook.shelfLocation}` : ''
                }. The first available copy is issued.`
              : undefined
          }
        />
      ) : (
        <TextInput
          placeholder="e.g. ESG-L-00012"
          value={accession}
          onChange={(e) => setAccession(e.currentTarget.value.toUpperCase())}
          description="The accession number written on the copy's label."
        />
      )}

      <DateInput
        label="Due date"
        value={dueDate}
        onChange={setDueDate}
        minDate={dayjs().add(1, 'day').format('YYYY-MM-DD')}
        valueFormat="DD MMM YYYY"
        description={
          settings
            ? `Standard loan period: ${settings.loanDays} days (${fmtDate(dayjs().add(settings.loanDays, 'day').format('YYYY-MM-DD'))})`
            : undefined
        }
      />
      <Textarea
        label="Notes (optional)"
        autosize
        minRows={1}
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
      />
      <Button color="#024F3A" disabled={!canSubmit} loading={busy} onClick={submit}>
        Issue book
      </Button>
    </div>
  );
}
