'use client';
import { AddCopiesModal, BookFormModal } from '@/components/library/BookForms';
import { libraryAction, useLibrary } from '@/components/library/api';
import { downloadExcel, downloadPdf } from '@/components/library/export';
import { Book } from '@/components/library/types';
import {
  Column,
  DataTable,
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  PageHeader,
  Section,
} from '@/components/library/ui';
import { useUserContext } from '@/context/Usercontext';
import {
  ActionIcon,
  Badge,
  Button,
  Menu,
  Progress,
  Select,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useConfirm } from '@/components/library/useConfirm';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { FaBook, FaBookOpen, FaLayerGroup } from 'react-icons/fa';
import {
  FiArchive,
  FiDownload,
  FiEdit2,
  FiEye,
  FiMoreVertical,
  FiPlus,
  FiRotateCcw,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi';
import { MdOutlineLibraryAddCheck } from 'react-icons/md';

function BooksCatalog() {
  const router = useRouter();
  const params = useSearchParams();
  const { profile } = useUserContext();
  const { data: books, loading, error, refresh } = useLibrary<Book[]>('/library/books');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [availability, setAvailability] = useState<string>('all');
  const [status, setStatus] = useState<string>('ACTIVE');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Book | undefined>();
  const [copiesFor, setCopiesFor] = useState<Book | undefined>();
  const confirm = useConfirm();

  useEffect(() => {
    if (params.get('new') === '1') {
      setEditing(undefined);
      setFormOpen(true);
    }
  }, [params]);

  const categories = useMemo(
    () =>
      Array.from(new Set((books ?? []).map((b) => b.category).filter(Boolean) as string[])).sort(),
    [books],
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (books ?? []).filter((b) => {
      if (status !== 'ALL' && b.status !== status) return false;
      if (category && b.category !== category) return false;
      if (availability === 'available' && b.availableCopies === 0) return false;
      if (availability === 'out' && b.availableCopies > 0) return false;
      if (availability === 'issues' && b.lostCopies + b.damagedCopies === 0) return false;
      if (!query) return true;
      return [b.title, b.author, b.isbn, b.category, b.publisher, b.shelfLocation]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(query));
    });
  }, [books, q, category, availability, status]);

  if (loading) return <LoadingBlock label="Loading catalog…" />;
  if (error || !books) return <ErrorBlock message={error ?? 'No data'} onRetry={() => refresh()} />;

  const active = books.filter((b) => b.status === 'ACTIVE');
  const sum = (key: keyof Book) => active.reduce((a, b) => a + ((b[key] as number) ?? 0), 0);

  const remove = (book: Book) =>
    confirm.ask({
      title: `${book.timesBorrowed ? 'Archive' : 'Delete'} “${book.title}”?`,
      message: book.timesBorrowed
        ? 'This book has loan history, so it will be archived: hidden from the catalog and circulation, but past records stay intact. You can restore it later.'
        : 'This book was never borrowed, so it and its copies will be deleted permanently.',
      confirmLabel: book.timesBorrowed ? 'Archive' : 'Delete',
      onConfirm: () => libraryAction('delete', `/library/books/${book.id}`),
    });

  const restore = (book: Book) =>
    libraryAction(
      'put',
      `/library/books/${book.id}`,
      { status: 'ACTIVE' },
      { success: 'Book restored' },
    );

  const exportRows = filtered.map((b) => [
    b.title,
    b.author,
    b.isbn,
    b.category,
    b.publisher,
    b.publishedYear,
    b.shelfLocation,
    b.totalCopies,
    b.availableCopies,
    b.borrowedCopies,
    b.lostCopies,
    b.damagedCopies,
    b.timesBorrowed,
    b.status,
  ]);
  const head = [
    'Title',
    'Author',
    'ISBN',
    'Category',
    'Publisher',
    'Year',
    'Shelf',
    'Copies',
    'Available',
    'Borrowed',
    'Lost',
    'Damaged',
    'Times borrowed',
    'Status',
  ];

  const columns: Column<Book>[] = [
    {
      key: 'title',
      header: 'Title',
      sortValue: (b) => b.title.toLowerCase(),
      render: (b) => (
        <div className="flex flex-col max-w-[320px]">
          <Link
            href={`/librarian/books/${b.id}`}
            className="font-medium text-primary hover:underline"
          >
            {b.title}
          </Link>
          <span className="text-xs text-gray-500 truncate">
            {b.author ?? 'Unknown author'}
            {b.publishedYear ? ` · ${b.publishedYear}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'isbn',
      header: 'ISBN',
      render: (b) => <span className="font-mono text-xs">{b.isbn ?? '—'}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      sortValue: (b) => b.category ?? '',
      render: (b) =>
        b.category ? (
          <Badge variant="light" color="blue" radius="sm" className="normal-case">
            {b.category}
          </Badge>
        ) : (
          '—'
        ),
    },
    {
      key: 'shelf',
      header: 'Shelf',
      sortValue: (b) => b.shelfLocation ?? '',
      render: (b) => b.shelfLocation ?? '—',
    },
    {
      key: 'copies',
      header: 'Availability',
      sortValue: (b) => b.availableCopies,
      render: (b) => {
        const pct = b.totalCopies ? (b.availableCopies / b.totalCopies) * 100 : 0;
        return (
          <div className="flex flex-col gap-1 min-w-[130px]">
            <span className="text-xs">
              <b className={b.availableCopies ? 'text-teal-600' : 'text-red-600'}>
                {b.availableCopies}
              </b>{' '}
              of {b.totalCopies} available
              {b.lostCopies + b.damagedCopies > 0 && (
                <Tooltip label={`${b.lostCopies} lost · ${b.damagedCopies} damaged`}>
                  <span className="ml-1 text-orange-500">⚠</span>
                </Tooltip>
              )}
            </span>
            <Progress
              value={pct}
              size="sm"
              color={pct === 0 ? 'red' : pct < 40 ? 'orange' : 'teal'}
              radius="xl"
            />
          </div>
        );
      },
    },
    {
      key: 'loans',
      header: 'Borrowed',
      sortValue: (b) => b.timesBorrowed,
      align: 'center',
      render: (b) => <span className="font-medium">{b.timesBorrowed}×</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (b) => b.status,
      render: (b) => (
        <Badge color={b.status === 'ACTIVE' ? 'teal' : 'gray'} variant="light" radius="sm">
          {b.status === 'ACTIVE' ? 'Active' : 'Archived'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (b) => (
        <div className="flex flex-row justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Tooltip label="Add copies">
            <ActionIcon variant="subtle" color="teal" onClick={() => setCopiesFor(b)}>
              <FiPlus />
            </ActionIcon>
          </Tooltip>
          <Menu position="bottom-end" withinPortal shadow="md">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" aria-label="More">
                <FiMoreVertical />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<FiEye />}
                onClick={() => router.push(`/librarian/books/${b.id}`)}
              >
                View copies & history
              </Menu.Item>
              <Menu.Item
                leftSection={<FiEdit2 />}
                onClick={() => {
                  setEditing(b);
                  setFormOpen(true);
                }}
              >
                Edit details
              </Menu.Item>
              <Menu.Divider />
              {b.status === 'ACTIVE' ? (
                <Menu.Item
                  color="red"
                  leftSection={b.timesBorrowed ? <FiArchive /> : <FiTrash2 />}
                  onClick={() => remove(b)}
                >
                  {b.timesBorrowed ? 'Archive' : 'Delete'}
                </Menu.Item>
              ) : (
                <Menu.Item leftSection={<FiRotateCcw />} onClick={() => restore(b)}>
                  Restore to catalog
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Books catalog"
        subtitle="Register titles, manage copies and track each book's availability."
        actions={
          <>
            <Menu shadow="md" position="bottom-end">
              <Menu.Target>
                <Button variant="default" leftSection={<FiDownload />}>
                  Export
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  onClick={() =>
                    downloadExcel('library_inventory', [
                      { name: 'Inventory', head, rows: exportRows },
                    ])
                  }
                >
                  Excel (.xlsx)
                </Menu.Item>
                <Menu.Item
                  onClick={() =>
                    downloadPdf({
                      filename: 'library_inventory',
                      title: 'Library inventory',
                      subtitle: `${filtered.length} titles${category ? ` in ${category}` : ''}`,
                      landscape: true,
                      generatedBy: profile ? `${profile.firstName} ${profile.lastName}` : undefined,
                      summary: [
                        ['Titles', filtered.length],
                        ['Copies', filtered.reduce((a, b) => a + b.totalCopies, 0)],
                        ['Available copies', filtered.reduce((a, b) => a + b.availableCopies, 0)],
                      ],
                      sections: [
                        {
                          name: '',
                          head: [
                            'Title',
                            'Author',
                            'ISBN',
                            'Category',
                            'Shelf',
                            'Copies',
                            'Avail.',
                            'Out',
                            'Lost',
                            'Borrowed',
                          ],
                          rows: filtered.map((b) => [
                            b.title,
                            b.author,
                            b.isbn,
                            b.category,
                            b.shelfLocation,
                            b.totalCopies,
                            b.availableCopies,
                            b.borrowedCopies,
                            b.lostCopies,
                            `${b.timesBorrowed}×`,
                          ]),
                        },
                      ],
                    })
                  }
                >
                  PDF report
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Button
              color="#024F3A"
              leftSection={<FiPlus />}
              onClick={() => {
                setEditing(undefined);
                setFormOpen(true);
              }}
            >
              Register book
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Titles"
          value={active.length}
          hint={`${books.length - active.length} archived`}
          icon={<FaBook />}
        />
        <KpiCard
          label="Copies"
          value={sum('totalCopies')}
          hint={`${categories.length} categories`}
          icon={<FaLayerGroup />}
          tone="gold"
        />
        <KpiCard
          label="On the shelf"
          value={sum('availableCopies')}
          icon={<MdOutlineLibraryAddCheck />}
          tone="teal"
        />
        <KpiCard
          label="Out / lost / damaged"
          value={`${sum('borrowedCopies')} / ${sum('lostCopies')} / ${sum('damagedCopies')}`}
          icon={<FaBookOpen />}
          tone="orange"
        />
      </div>

      <Section>
        <div className="flex flex-row flex-wrap gap-3 mb-3">
          <TextInput
            className="flex-1 min-w-[240px]"
            placeholder="Search title, author, ISBN, publisher, shelf…"
            leftSection={<FiSearch />}
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
          />
          <Select
            placeholder="All categories"
            clearable
            searchable
            data={categories}
            value={category}
            onChange={setCategory}
            w={200}
          />
          <Select
            value={availability}
            onChange={(v) => setAvailability(v ?? 'all')}
            allowDeselect={false}
            w={190}
            data={[
              { value: 'all', label: 'Any availability' },
              { value: 'available', label: 'Has copies available' },
              { value: 'out', label: 'All copies out' },
              { value: 'issues', label: 'Has lost / damaged' },
            ]}
          />
          <Select
            value={status}
            onChange={(v) => setStatus(v ?? 'ACTIVE')}
            allowDeselect={false}
            w={140}
            data={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'ARCHIVED', label: 'Archived' },
              { value: 'ALL', label: 'All' },
            ]}
          />
        </div>
        <DataTable
          rows={filtered}
          columns={columns}
          initialPageSize={25}
          defaultSort={{ key: 'title', dir: 'asc' }}
          onRowClick={(b) => router.push(`/librarian/books/${b.id}`)}
          empty={q || category ? 'No book matches these filters' : 'No books registered yet'}
        />
      </Section>

      <BookFormModal
        opened={formOpen}
        book={editing}
        onClose={() => {
          setFormOpen(false);
          if (params.get('new')) router.replace('/librarian/books');
        }}
      />
      <AddCopiesModal
        opened={!!copiesFor}
        book={copiesFor}
        onClose={() => setCopiesFor(undefined)}
      />
      {confirm.element}
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <BooksCatalog />
    </Suspense>
  );
}
