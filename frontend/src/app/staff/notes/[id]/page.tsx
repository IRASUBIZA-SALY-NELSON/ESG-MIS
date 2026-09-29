'use client';
import {
  Badge,
  Button,
  Menu,
  SegmentedControl,
  Select,
  SimpleGrid,
  Tabs,
  TextInput,
  Tooltip,
} from '@mantine/core';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { BsBookmarkFill } from 'react-icons/bs';
import {
  FiActivity,
  FiArrowLeft,
  FiBell,
  FiCheckCircle,
  FiDownload,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiSearch,
  FiUserX,
  FiUsers,
} from 'react-icons/fi';
import { GroupedBar, PALETTE } from '@/components/library/charts';
import { downloadExcel, downloadPdf } from '@/components/library/export';
import {
  Column,
  DataTable,
  EmptyBlock,
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  Section,
  fmtDate,
} from '@/components/library/ui';
import { downloadNote, notesAction, refreshNotes, useNotes } from '@/components/notes/api';
import {
  FileTypeIcon,
  NoteStatusBadge,
  categoryLabel,
  fmtBytes,
  fmtWhen,
  fromNow,
  plural,
  termName,
} from '@/components/notes/helpers';
import NotePreview from '@/components/notes/NotePreview';
import NoteActions from '@/components/notes/teacher/NoteActions';
import { NoteDetail, Reader, TeacherNote, TeachingContext } from '@/components/notes/types';

type ReaderFilter = 'ALL' | 'UNOPENED' | 'OPENED' | 'STUDIED';

const pdfSafe = (s?: string | null) =>
  (s ?? '').replace(/[\u2014\u2013]/g, '-').replace(/[\u2018\u2019]/g, "'");

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refresh } = useNotes<NoteDetail>(
    id ? `/notes/teaching/${id}` : null,
  );
  const { data: context } = useNotes<TeachingContext>('/notes/teaching/context');
  const { data: all } = useNotes<TeacherNote[]>('/notes/teaching');
  const [tab, setTab] = useState<string | null>('students');
  const [filter, setFilter] = useState<ReaderFilter>('ALL');
  const [klass, setKlass] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [nudging, setNudging] = useState(false);

  const topics = useMemo(
    () => Array.from(new Set((all ?? []).map((n) => n.topic).filter(Boolean) as string[])).sort(),
    [all],
  );

  const readers = useMemo(() => data?.readers ?? [], [data]);
  const inAudience = readers.filter((r) => r.inAudience);
  const counts = {
    ALL: readers.length,
    UNOPENED: inAudience.filter((r) => !r.opened).length,
    OPENED: readers.filter((r) => r.opened).length,
    STUDIED: readers.filter((r) => r.completed).length,
  };

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return readers
      .filter((r) =>
        filter === 'UNOPENED'
          ? r.inAudience && !r.opened
          : filter === 'OPENED'
            ? r.opened
            : filter === 'STUDIED'
              ? r.completed
              : true,
      )
      .filter((r) => !klass || r.className === klass)
      .filter((r) => !query || [r.fullName, r.email].some((v) => v?.toLowerCase().includes(query)))
      .map((r) => ({ ...r, id: r.studentId }));
  }, [readers, filter, klass, q]);

  if (error) return <ErrorBlock message={error} onRetry={() => refresh()} />;
  if (loading || !data || !context) return <LoadingBlock label="Loading note…" />;

  const n = data.note;
  const live = n.status === 'PUBLISHED';
  const pending = inAudience.filter((r) => !r.completed).length;
  const classNames = Array.from(
    new Set(readers.map((r) => r.className).filter(Boolean) as string[]),
  );

  const nudge = async () => {
    setNudging(true);
    await notesAction('post', `/notes/teaching/${n.id}/nudge`);
    setNudging(false);
  };

  const exportHead = [
    'Student',
    'Email',
    'Class',
    'Opened',
    'First opened',
    'Last opened',
    'Views',
    'Downloads',
    'Studied',
    'Studied on',
  ];
  const exportRows = () =>
    rows.map((r) => [
      r.fullName,
      r.email ?? '',
      r.className ?? '',
      r.opened ? 'Yes' : 'No',
      r.firstViewedAt ? fmtWhen(r.firstViewedAt) : '',
      r.lastViewedAt ? fmtWhen(r.lastViewedAt) : '',
      r.views,
      r.downloads,
      r.completed ? 'Yes' : 'No',
      r.completedAt ? fmtWhen(r.completedAt) : '',
    ]);

  const columns: Column<Reader & { id: string }>[] = [
    {
      key: 'student',
      header: 'Student',
      sortValue: (r) => r.fullName,
      render: (r) => (
        <div className="flex flex-row items-center gap-3">
          <span
            className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${
              r.completed
                ? 'bg-teal-50 text-teal-700'
                : r.opened
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {initials(r.fullName)}
          </span>
          <div className="flex flex-col">
            <span className="font-medium text-primary flex items-center gap-1.5">
              {r.fullName}
              {r.saved && (
                <Tooltip label="Saved to their list">
                  <span className="text-accent-dark text-xs">
                    <BsBookmarkFill />
                  </span>
                </Tooltip>
              )}
            </span>
            <span className="text-xs text-gray-500">{r.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      sortValue: (r) => r.className ?? '',
      render: (r) => (
        <div className="flex flex-col gap-0.5">
          <span>{r.className ?? '—'}</span>
          {!r.inAudience && (
            <span className="text-[11px] text-orange-600">No longer in a shared class</span>
          )}
        </div>
      ),
    },
    {
      key: 'opened',
      header: 'Opened',
      sortValue: (r) => r.firstViewedAt ?? '',
      render: (r) =>
        r.opened ? (
          <div className="flex flex-col gap-0.5">
            <Badge color="blue" variant="light" radius="sm" leftSection={<FiEye />}>
              Opened
            </Badge>
            <span className="text-[11px] text-gray-500">first {fmtWhen(r.firstViewedAt)}</span>
          </div>
        ) : (
          <Badge color="gray" variant="outline" radius="sm" leftSection={<FiEyeOff />}>
            Not yet
          </Badge>
        ),
    },
    {
      key: 'last',
      header: 'Last opened',
      sortValue: (r) => r.lastViewedAt ?? '',
      render: (r) => (
        <span className="text-xs text-gray-600">
          {r.lastViewedAt ? fromNow(r.lastViewedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'views',
      header: 'Views',
      align: 'center',
      sortValue: (r) => r.views,
      render: (r) => r.views || '—',
    },
    {
      key: 'downloads',
      header: 'Downloads',
      align: 'center',
      sortValue: (r) => r.downloads,
      render: (r) => r.downloads || '—',
    },
    {
      key: 'studied',
      header: 'Studied',
      sortValue: (r) => r.completedAt ?? '',
      render: (r) =>
        r.completed ? (
          <div className="flex flex-col gap-0.5">
            <Badge color="teal" variant="filled" radius="sm" leftSection={<FiCheckCircle />}>
              Studied
            </Badge>
            <span className="text-[11px] text-gray-500">{fmtWhen(r.completedAt)}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Not yet</span>
        ),
    },
  ];

  const labels = data.daily.map((d) => dayjs(d.date).format('DD MMM'));

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Link
        href="/staff/notes"
        className="text-sm text-gray-500 hover:text-primary flex items-center gap-1 mt-2 w-fit"
      >
        <FiArrowLeft /> All notes
      </Link>

      <div className="bg-white rounded-lg border p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-row items-start gap-4 min-w-0">
          <FileTypeIcon category={n.category} size="lg" />
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-row flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-primary">{n.title}</h1>
              <NoteStatusBadge status={n.status} publishAt={n.publishAt} />
              {n.pinned && (
                <Badge color="grape" variant="light" radius="sm">
                  Pinned
                </Badge>
              )}
              {!n.allowDownload && n.kind === 'FILE' && (
                <Badge color="orange" variant="light" radius="sm">
                  View-only
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {n.courseName}
              {n.topic ? ` · ${n.topic}` : ''} · {termName(n.termName)} ·{' '}
              {n.classes.map((c) => c.name).join(', ') || (
                <span className="text-orange-600">no class chosen</span>
              )}
            </div>
            {n.description && (
              <p className="text-sm text-gray-600 mt-1 whitespace-pre-line max-w-3xl">
                {n.description}
              </p>
            )}
          </div>
        </div>
        <NoteActions
          note={n}
          context={context}
          topics={topics}
          showDetailsLink={false}
          size="header"
        />
      </div>

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 5 }}>
        <KpiCard
          label="Opened"
          value={`${n.opened}/${n.audience}`}
          hint={`${n.reach}% of students`}
          icon={<FiUsers />}
          tone={n.reach >= 80 ? 'teal' : n.reach >= 50 ? 'orange' : 'red'}
        />
        <KpiCard
          label="Studied"
          value={n.completed}
          hint={
            n.audience
              ? `${Math.round((n.completed * 100) / n.audience)}% marked it as studied`
              : '—'
          }
          icon={<FiCheckCircle />}
          tone="gold"
        />
        <KpiCard
          label="Not opened yet"
          value={counts.UNOPENED}
          hint={
            n.lastNudgedAt ? `Last reminder ${fromNow(n.lastNudgedAt)}` : 'No reminder sent yet'
          }
          icon={<FiUserX />}
          tone={counts.UNOPENED ? 'red' : 'teal'}
          onClick={() => {
            setTab('students');
            setFilter('UNOPENED');
          }}
        />
        <KpiCard
          label="Views"
          value={n.views}
          hint={n.lastActivityAt ? `last ${fromNow(n.lastActivityAt)}` : 'No views yet'}
          icon={<FiEye />}
          tone="blue"
        />
        <KpiCard
          label="Downloads"
          value={n.kind === 'LINK' ? '—' : n.downloads}
          hint={
            n.kind === 'LINK'
              ? 'Web link'
              : n.allowDownload
                ? `${n.saved} saved to their list`
                : 'Downloads are off'
          }
          icon={<FiDownload />}
          tone="orange"
        />
      </SimpleGrid>

      {live && pending > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
          <div className="text-sm text-orange-800">
            <b>{plural(pending, 'student')}</b> {pending === 1 ? 'has' : 'have'} not finished this
            note yet
            {n.readBy ? ` — study-by date ${fmtDate(n.readBy)}` : ''}.
            {n.lastNudgedAt && ` You reminded them ${fromNow(n.lastNudgedAt)}.`}
          </div>
          <Button color="orange" leftSection={<FiBell />} onClick={nudge} loading={nudging}>
            Remind them
          </Button>
        </div>
      )}
      {n.status === 'DRAFT' && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          This note is a draft — students can’t see it yet. Use <b>Publish</b> to share it with your
          classes.
        </div>
      )}
      {n.status === 'SCHEDULED' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Scheduled — students will see it on <b>{fmtWhen(n.publishAt)}</b>.
        </div>
      )}

      <Tabs value={tab} onChange={setTab} color="#024F3A">
        <Tabs.List>
          <Tabs.Tab value="students" leftSection={<FiUsers />}>
            Students ({readers.length})
          </Tabs.Tab>
          <Tabs.Tab value="preview" leftSection={<FiFileText />}>
            Preview & details
          </Tabs.Tab>
          <Tabs.Tab value="activity" leftSection={<FiActivity />}>
            Activity
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="students" pt="md">
          <Section>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
                <SegmentedControl
                  size="xs"
                  value={filter}
                  onChange={(v) => setFilter(v as ReaderFilter)}
                  data={[
                    { value: 'ALL', label: `Everyone (${counts.ALL})` },
                    { value: 'UNOPENED', label: `Not opened (${counts.UNOPENED})` },
                    { value: 'OPENED', label: `Opened (${counts.OPENED})` },
                    { value: 'STUDIED', label: `Studied (${counts.STUDIED})` },
                  ]}
                />
                <div className="flex flex-row flex-wrap gap-2">
                  <TextInput
                    size="xs"
                    placeholder="Search student…"
                    leftSection={<FiSearch />}
                    value={q}
                    onChange={(e) => setQ(e.currentTarget.value)}
                    w={200}
                  />
                  {classNames.length > 1 && (
                    <Select
                      size="xs"
                      placeholder="Class"
                      data={classNames}
                      value={klass}
                      onChange={setKlass}
                      clearable
                      w={130}
                    />
                  )}
                  <Menu shadow="md" position="bottom-end">
                    <Menu.Target>
                      <Button
                        size="xs"
                        variant="default"
                        leftSection={<FiDownload />}
                        disabled={!rows.length}
                      >
                        Export
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        onClick={() =>
                          downloadExcel(`note_readers_${n.title.slice(0, 30)}`, [
                            { name: 'Students', head: exportHead, rows: exportRows() },
                          ])
                        }
                      >
                        Excel (.xlsx)
                      </Menu.Item>
                      <Menu.Item
                        onClick={() =>
                          downloadPdf({
                            filename: `note_readers`,
                            title: pdfSafe(n.title),
                            subtitle: pdfSafe(
                              `${n.courseName} - ${n.classes.map((c) => c.name).join(', ')}`,
                            ),
                            department: 'Academics · Course notes',
                            footer: 'ESG Course Notes',
                            generatedBy: context.teacherName,
                            landscape: true,
                            summary: [
                              ['Status', n.status],
                              ['Published', fmtWhen(n.publishedAt)],
                              ['Opened', `${n.opened} of ${n.audience} (${n.reach}%)`],
                              ['Studied', n.completed],
                              ['Views / downloads', `${n.views} / ${n.downloads}`],
                            ],
                            sections: [{ name: 'Students', head: exportHead, rows: exportRows() }],
                          })
                        }
                      >
                        PDF reading report
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </div>
              </div>
              <DataTable
                rows={rows}
                columns={columns}
                initialPageSize={25}
                defaultSort={{ key: 'class', dir: 'asc' }}
                empty={
                  n.audience === 0
                    ? 'No students in the shared classes yet.'
                    : filter === 'UNOPENED'
                      ? 'Everyone has opened this note.'
                      : filter === 'STUDIED'
                        ? 'Nobody has marked it as studied yet.'
                        : 'No students match.'
                }
              />
            </div>
          </Section>
        </Tabs.Panel>

        <Tabs.Panel value="preview" pt="md">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
            <NotePreview
              note={n}
              canDownload
              onDownload={() => downloadNote(n.id, n.fileName)}
              onOpenLink={() => window.open(n.linkUrl, '_blank', 'noopener')}
              onPendingRefresh={refreshNotes}
              height="75vh"
            />
            <Section title="Details">
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-gray-500">Type</dt>
                <dd>{categoryLabel(n.category)}</dd>
                {n.kind === 'FILE' ? (
                  <>
                    <dt className="text-gray-500">File</dt>
                    <dd className="break-all">{n.fileName}</dd>
                    <dt className="text-gray-500">Size</dt>
                    <dd>{fmtBytes(n.sizeBytes)}</dd>
                    <dt className="text-gray-500">Version</dt>
                    <dd>
                      v{n.version ?? 1} · {fmtWhen(n.fileUpdatedAt)}
                    </dd>
                  </>
                ) : (
                  <>
                    <dt className="text-gray-500">Link</dt>
                    <dd className="break-all">
                      <a
                        href={n.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {n.linkUrl}
                      </a>
                    </dd>
                  </>
                )}
                <dt className="text-gray-500">Created</dt>
                <dd>{fmtWhen(n.createdAt)}</dd>
                <dt className="text-gray-500">
                  {n.status === 'SCHEDULED' ? 'Releases' : 'Published'}
                </dt>
                <dd>{fmtWhen(n.publishAt ?? n.publishedAt)}</dd>
                {n.archivedAt && (
                  <>
                    <dt className="text-gray-500">Archived</dt>
                    <dd>{fmtWhen(n.archivedAt)}</dd>
                  </>
                )}
                <dt className="text-gray-500">Study by</dt>
                <dd>{n.readBy ? fmtDate(n.readBy) : 'No deadline'}</dd>
                <dt className="text-gray-500">Downloads</dt>
                <dd>{n.allowDownload ? 'Allowed' : 'View-only'}</dd>
                <dt className="text-gray-500">Reminders</dt>
                <dd>
                  {n.nudgeCount ? `${n.nudgeCount} sent · last ${fromNow(n.lastNudgedAt)}` : 'None'}
                </dd>
              </dl>
              {n.kind === 'FILE' && (
                <Button
                  fullWidth
                  mt="md"
                  variant="default"
                  leftSection={<FiDownload />}
                  onClick={() => downloadNote(n.id, n.fileName)}
                >
                  Download file
                </Button>
              )}
            </Section>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="activity" pt="md">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Section title="Last 30 days" className="xl:col-span-2">
              <GroupedBar
                labels={labels}
                stacked
                series={[
                  { label: 'Opened', values: data.daily.map((d) => d.views), color: PALETTE.navy },
                  {
                    label: 'Downloaded',
                    values: data.daily.map((d) => d.downloads),
                    color: PALETTE.orange,
                  },
                  {
                    label: 'Studied',
                    values: data.daily.map((d) => d.completions),
                    color: PALETTE.teal,
                  },
                ]}
              />
            </Section>
            <Section title="Latest">
              {data.recent.length === 0 ? (
                <EmptyBlock>No activity yet.</EmptyBlock>
              ) : (
                <ol className="flex flex-col gap-2.5">
                  {data.recent.map((a, i) => (
                    <li
                      key={`${a.studentId}-${a.at}-${i}`}
                      className="flex flex-row items-start gap-2 text-sm"
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                          a.type === 'COMPLETE'
                            ? 'bg-teal-500'
                            : a.type === 'DOWNLOAD'
                              ? 'bg-orange-400'
                              : 'bg-blue-500'
                        }`}
                      />
                      <div>
                        <b className="text-primary">{a.studentName}</b>{' '}
                        <span className="text-gray-500">
                          {a.type === 'COMPLETE'
                            ? 'finished studying it'
                            : a.type === 'DOWNLOAD'
                              ? 'downloaded it'
                              : 'opened it'}
                        </span>
                        <div className="text-xs text-gray-400">{fromNow(a.at)}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Section>
          </div>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
