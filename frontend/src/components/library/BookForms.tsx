'use client';
import {
  Autocomplete,
  Button,
  Modal,
  NumberInput,
  Select,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { libraryAction, useLibrary } from './api';
import { Book, BookCopy } from './types';

const COPY_CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
];

const LANGUAGES = ['English', 'Kinyarwanda', 'French', 'Swahili'];

type BookFormState = {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  publishedYear: number | string;
  edition: string;
  language: string;
  shelfLocation: string;
  description: string;
  copies: number | string;
  bookCondition: string;
};

const empty: BookFormState = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  publisher: '',
  publishedYear: '',
  edition: '',
  language: 'English',
  shelfLocation: '',
  description: '',
  copies: 1,
  bookCondition: 'NEW',
};

/** Register a new title (with N copies) or edit an existing one. */
export function BookFormModal({
  opened,
  onClose,
  book,
  onSaved,
}: {
  opened: boolean;
  onClose: () => void;
  book?: Book;
  onSaved?: (book: Book) => void;
}) {
  const { data: categories } = useLibrary<string[]>('/library/books/categories');
  const [form, setForm] = useState<BookFormState>(empty);
  const [busy, setBusy] = useState(false);
  const editing = !!book;

  useEffect(() => {
    if (!opened) return;
    setForm(
      book
        ? {
            ...empty,
            title: book.title,
            author: book.author ?? '',
            isbn: book.isbn ?? '',
            category: book.category ?? '',
            publisher: book.publisher ?? '',
            publishedYear: book.publishedYear ?? '',
            edition: book.edition ?? '',
            language: book.language ?? 'English',
            shelfLocation: book.shelfLocation ?? '',
            description: book.description ?? '',
          }
        : empty,
    );
  }, [opened, book]);

  const set = <K extends keyof BookFormState>(key: K, value: BookFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isbnDigits = form.isbn.replace(/[\s-]/g, '');
  const isbnError =
    form.isbn && !/^(\d{9}[\dXx]|\d{13})$/.test(isbnDigits)
      ? 'ISBN must have 10 or 13 digits'
      : null;
  const year = Number(form.publishedYear);
  const yearError =
    form.publishedYear !== '' && (year < 1450 || year > dayjs().year() + 1) ? 'Invalid year' : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || isbnError || yearError) return;
    setBusy(true);
    const body: Record<string, any> = {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim() || null,
      category: form.category.trim(),
      publisher: form.publisher.trim(),
      publishedYear: form.publishedYear === '' ? null : Number(form.publishedYear),
      edition: form.edition.trim(),
      language: form.language,
      shelfLocation: form.shelfLocation.trim(),
      description: form.description.trim(),
    };
    if (!editing) {
      body.copies = Number(form.copies || 0);
      body.bookCondition = form.bookCondition;
    }
    const saved = editing
      ? await libraryAction<Book>('put', `/library/books/${book!.id}`, body, {
          success: 'Book updated',
        })
      : await libraryAction<Book>('post', '/library/books', body, {
          success: `“${body.title}” registered with ${body.copies} cop${body.copies === 1 ? 'y' : 'ies'}`,
        });
    setBusy(false);
    if (saved) {
      onSaved?.(saved);
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      centered
      title={
        <b className="text-primary">{editing ? 'Edit book details' : 'Register a new book'}</b>
      }
    >
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextInput
          className="md:col-span-2"
          label="Title"
          required
          data-autofocus
          value={form.title}
          onChange={(e) => set('title', e.currentTarget.value)}
        />
        <TextInput
          label="Author(s)"
          value={form.author}
          onChange={(e) => set('author', e.currentTarget.value)}
        />
        <TextInput
          label="ISBN"
          placeholder="10 or 13 digits"
          value={form.isbn}
          error={isbnError}
          onChange={(e) => set('isbn', e.currentTarget.value)}
        />
        <Autocomplete
          label="Category"
          placeholder="Pick or type a new one"
          data={categories ?? []}
          value={form.category}
          onChange={(v) => set('category', v)}
        />
        <TextInput
          label="Shelf location"
          placeholder="e.g. A1"
          value={form.shelfLocation}
          onChange={(e) => set('shelfLocation', e.currentTarget.value)}
        />
        <TextInput
          label="Publisher"
          value={form.publisher}
          onChange={(e) => set('publisher', e.currentTarget.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Year"
            value={form.publishedYear}
            error={yearError}
            onChange={(v) => set('publishedYear', v)}
            hideControls
          />
          <TextInput
            label="Edition"
            placeholder="e.g. 3rd"
            value={form.edition}
            onChange={(e) => set('edition', e.currentTarget.value)}
          />
        </div>
        <Select
          label="Language"
          data={LANGUAGES}
          value={form.language}
          onChange={(v) => set('language', v ?? 'English')}
          allowDeselect={false}
          searchable
        />
        {!editing && (
          <>
            <NumberInput
              label="Number of copies"
              description="Each copy gets its own accession number automatically"
              min={0}
              max={500}
              value={form.copies}
              onChange={(v) => set('copies', v)}
            />
            <Select
              label="Condition of the copies"
              data={COPY_CONDITIONS}
              value={form.bookCondition}
              onChange={(v) => set('bookCondition', v ?? 'NEW')}
              allowDeselect={false}
            />
          </>
        )}
        <Textarea
          className="md:col-span-2"
          label="Description / notes"
          autosize
          minRows={2}
          value={form.description}
          onChange={(e) => set('description', e.currentTarget.value)}
        />
        <div className="md:col-span-2 flex flex-row justify-end gap-2">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" color="#024F3A" loading={busy} disabled={!form.title.trim()}>
            {editing ? 'Save changes' : 'Register book'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AddCopiesModal({
  opened,
  onClose,
  book,
}: {
  opened: boolean;
  onClose: () => void;
  book?: Book;
}) {
  const [count, setCount] = useState<number | string>(1);
  const [condition, setCondition] = useState('NEW');
  const [acquiredOn, setAcquiredOn] = useState<string | null>(dayjs().format('YYYY-MM-DD'));
  const [accession, setAccession] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (opened) {
      setCount(1);
      setCondition('NEW');
      setAccession('');
      setNotes('');
      setAcquiredOn(dayjs().format('YYYY-MM-DD'));
    }
  }, [opened]);

  const submit = async () => {
    if (!book) return;
    setBusy(true);
    const n = Number(count || 1);
    const res = await libraryAction(
      'post',
      `/library/books/${book.id}/copies`,
      {
        count: n,
        bookCondition: condition,
        acquiredOn,
        accessionNumber: n === 1 && accession.trim() ? accession.trim() : undefined,
        notes: notes || undefined,
      },
      { success: `${n} cop${n === 1 ? 'y' : 'ies'} added to “${book.title}”` },
    );
    setBusy(false);
    if (res) onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title={<b className="text-primary">Add copies</b>}
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">
          Adding copies of <b>{book?.title}</b> (currently {book?.totalCopies ?? 0}).
        </p>
        <NumberInput label="How many copies" min={1} max={500} value={count} onChange={setCount} />
        {Number(count) === 1 && (
          <TextInput
            label="Accession number (optional)"
            description="Leave empty to generate the next number automatically"
            value={accession}
            onChange={(e) => setAccession(e.currentTarget.value.toUpperCase())}
          />
        )}
        <Select
          label="Condition"
          data={COPY_CONDITIONS}
          value={condition}
          onChange={(v) => setCondition(v ?? 'NEW')}
          allowDeselect={false}
        />
        <DateInput
          label="Acquired on"
          value={acquiredOn}
          onChange={setAcquiredOn}
          valueFormat="DD MMM YYYY"
          maxDate={dayjs().format('YYYY-MM-DD')}
        />
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} />
        <div className="flex flex-row justify-end gap-2">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button color="#024F3A" loading={busy} onClick={submit}>
            Add copies
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const EDITABLE_STATUSES = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'LOST', label: 'Lost' },
  { value: 'RETIRED', label: 'Retired (withdrawn)' },
];

export function EditCopyModal({ copy, onClose }: { copy?: BookCopy; onClose: () => void }) {
  const [status, setStatus] = useState<string>('AVAILABLE');
  const [condition, setCondition] = useState<string>('GOOD');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (copy) {
      setStatus(copy.status);
      setCondition(copy.bookCondition ?? 'GOOD');
      setNotes(copy.notes ?? '');
    }
  }, [copy]);

  const borrowed = copy?.status === 'BORROWED';

  const submit = async () => {
    if (!copy) return;
    setBusy(true);
    const res = await libraryAction(
      'put',
      `/library/copies/${copy.id}`,
      {
        status: borrowed ? undefined : status,
        bookCondition: condition,
        notes,
      },
      { success: `Copy ${copy.accessionNumber} updated` },
    );
    setBusy(false);
    if (res) onClose();
  };

  return (
    <Modal
      opened={!!copy}
      onClose={onClose}
      centered
      title={<b className="text-primary">Copy {copy?.accessionNumber}</b>}
    >
      <div className="flex flex-col gap-3">
        <Select
          label="Status"
          data={borrowed ? [{ value: 'BORROWED', label: 'Borrowed' }] : EDITABLE_STATUSES}
          value={status}
          onChange={(v) => setStatus(v ?? status)}
          disabled={borrowed}
          description={
            borrowed
              ? 'This copy is on loan — return it from the circulation desk first.'
              : undefined
          }
          allowDeselect={false}
        />
        <Select
          label="Condition"
          data={[...COPY_CONDITIONS, { value: 'DAMAGED', label: 'Damaged' }]}
          value={condition}
          onChange={(v) => setCondition(v ?? condition)}
          allowDeselect={false}
        />
        <Textarea
          label="Notes"
          autosize
          minRows={2}
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
        />
        <div className="flex flex-row justify-end gap-2">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button color="#024F3A" loading={busy} onClick={submit}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
