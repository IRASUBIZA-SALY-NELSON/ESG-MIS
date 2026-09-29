'use client';
import {
  Badge,
  Button,
  Checkbox,
  Menu,
  SegmentedControl,
  Select,
  SimpleGrid,
  Tabs,
  TextInput,
  Tooltip,
} from '@mantine/core';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { BsPinFill } from 'react-icons/bs';
import {
  FiArchive,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiCheckCircle,
  FiDownload,
  FiEye,
  FiFileText,
  FiLink,
  FiRefreshCw,
  FiRotateCcw,
  FiSearch,
  FiSend,
  FiTrash2,
  FiUploadCloud,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { DonutChart, GroupedBar, PALETTE } from '@/components/library/charts';
import { downloadExcel, downloadPdf } from '@/components/library/export';
import {
  Column,
  DataTable,
  EmptyBlock,
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  PageHeader,
  Section,
  fmtDate,
} from '@/components/library/ui';
import { useConfirm } from '@/components/library/useConfirm';
import { notesAction, useNotes } from '@/components/notes/api';
import {
  FileTypeIcon,
  NoteStatusBadge,
  ReachBar,
  categoryLabel,
  fmtBytes,
  fmtWhen,
  fromNow,
  plural,
  statusLabel,
} from '@/components/notes/helpers';
import NoteActions from '@/components/notes/teacher/NoteActions';
import TeacherPreviewModal from '@/components/notes/teacher/TeacherPreviewModal';
import UploadNotesModal from '@/components/notes/teacher/UploadNotesModal';
import {
  NoteCategory,
  NoteStatus,
  TeacherNote,
  TeachingContext,
  TeachingStats,
} from '@/components/notes/types';

type StatusFilter = 'ACTIVE' | NoteStatus;

const pdfSafe = (s?: string | number | null) =>
  s === undefined || s === null
    ? ''
    : `${s}`
        .replace(/[\u2014\u2013]/g, '-')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"');

function statusLine(n: TeacherNote) {
  switch (n.status) {
    case 'PUBLISHED':
      return `Published ${fromNow(n.publishedAt)}`;
    case 'SCHEDULED':
      return `Releases ${fmtWhen(n.publishAt)}`;
    case 'ARCHIVED':
      return `Archived ${fromNow(n.archivedAt)}`;
    default:
      return `Saved ${fromNow(n.updatedAt ?? n.createdAt)}`;
  }
}

function NotesManager() {
  const router = useRouter();
  const params = useSearchParams();
  const {
    data: context,
    error: ctxError,
    refresh: refreshCtx,
  } = useNotes<TeachingContext>('/notes/teaching/context');
  const { data: notes, loading, error, refresh } = useNotes<TeacherNote[]>('/notes/teaching');
  const { data: stats } = useNotes<TeachingStats>('/notes/teaching/stats');
  const { ask, element } = useConfirm();

  const [tab, setTab] = useState<string | null>(
    params.get('tab') === 'insights' ? 'insights' : 'notes',
  );
  const [upload, setUpload] = useState<null | 'files' | 'link'>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [course, setCourse] = useState<string>('ALL');
  const [status, setStatus] = useState<StatusFilter>('ACTIVE');
  const [klass, setKlass] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const all = useMemo(() => notes ?? [], [notes]);
  const topics = useMemo(
    () => Array.from(new Set(all.map((n) => n.topic).filter(Boolean) as string[])).sort(),
    [all],
  );
  const previewNote = all.find((n) => n.id === previewId) ?? null;

  const inCourse = useMemo(
    () => (course === 'ALL' ? all : all.filter((n) => n.courseId === course)),
    [all, course],
  );
  const countOf = (s: StatusFilter) =>
    inCourse.filter((n) => (s === 'ACTIVE' ? n.status !== 'ARCHIVED' : n.status === s)).length;

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return inCourse
      .filter((n) => (status === 'ACTIVE' ? n.status !== 'ARCHIVED' : n.status === status))
      .filter((n) => !klass || n.classes.some((c) => c.id === klass))
      .filter((n) => !type || n.category === type)
      .filter((n) => !topic || n.topic === topic)
      .filter(
        (n) =>
          !query ||
          [n.title, n.topic, n.fileName, n.description, n.courseName].some((v) =>
            v?.toLowerCase().includes(query),
          ),
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [inCourse, status, klass, type, topic, q]);

  const classOptions = useMemo(() => {
    const map = new Map<string, string>();
    (context?.courses ?? [])
      .filter((c) => course === 'ALL' || c.id === course)
      .forEach((c) => c.classes.forEach((k) => map.set(k.id, k.name)));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [context, course]);

  const typeOptions = useMemo(
    () =>
      Array.from(new Set(all.map((n) => n.category))).map((c) => ({
        value: c,
        label: categoryLabel(c as NoteCategory),
      })),
    [all],
  );

  const selectedNotes = rows.filter((n) => selected.includes(n.id));
  const allVisibleSelected = rows.length > 0 && rows.every((n) => selected.includes(n.id));
  const filtersOn = !!(klass || type || topic || q);

  const bulk = (action: string, label: string, danger = false) => {
    const ids = selectedNotes.map((n) => n.id);
    const run = async () => {
      const res = await notesAction<{ done: number; skipped: string[] }>(
        'post',
        '/notes/teaching/bulk',
        { ids, action },
      );
      if (res) setSelected([]);
    };
    if (!danger) return run();
    ask({
      title: `${label} ${plural(ids.length, 'note')}?`,
      message:
        action === 'delete'
          ? 'The files and reading records will be removed for good. Students lose access immediately.'
          : 'Students will no longer see these notes. You can restore them from the archive.',
      confirmLabel: label,
      color: action === 'delete' ? 'red' : 'orange',
      onConfirm: run,
    });
  };

  const exportRows = () =>
    rows.map((n) => [
      pdfSafe(n.title),
      pdfSafe(n.courseName),
      n.classes.map((c) => c.name).join(', '),
      pdfSafe(n.topic ?? ''),
      categoryLabel(n.category),
      statusLabel(n.status),
      n.status === 'SCHEDULED' ? fmtWhen(n.publishAt) : fmtDate(n.publishedAt),
      n.audience,
      n.opened,
      `${n.reach}%`,
      n.completed,
      n.views,
      n.downloads,
      n.readBy ? fmtDate(n.readBy) : '',
    ]);
  const exportHead = [
    'Title',
    'Course',
    'Classes',
    'Topic',
    'Type',
    'Status',
    'Released',
    'Students',
    'Opened',
    'Reach',
    'Studied',
    'Views',
    'Downloads',
    'Study by',
  ];

  const columns: Column<TeacherNote>[] = [
    {
      key: 'select',
      header: (
        <Checkbox
          size="xs"
          color="#024F3A"
          aria-label="Select all"
          checked={allVisibleSelected}
          indeterminate={!allVisibleSelected && selectedNotes.length > 0}
          onChange={() => setSelected(allVisibleSelected ? [] : rows.map((n) => n.id))}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      render: (n) => (
        <Checkbox
          size="xs"
          color="#024F3A"
          aria-label={`Select ${n.title}`}
          checked={selected.includes(n.id)}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            setSelected((s) =>
              e.currentTarget.checked ? [...s, n.id] : s.filter((id) => id !== n.id),
            )
          }
        />
      ),
    },
    {
      key: 'title',
      header: 'Note',
      sortValue: (n) => n.title.toLowerCase(),
      render: (n) => (
        <div className="flex flex-row items-center gap-3 min-w-[260px] max-w-[380px]">
          <FileTypeIcon category={n.category} />
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-primary truncate flex items-center gap-1.5">
              {n.pinned && (
                <Tooltip label="Pinned for students">
                  <span className="text-accent-dark text-xs">
                    <BsPinFill />
                  </span>
                </Tooltip>
              )}
              {n.title}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {[
                n.topic,
                n.kind === 'LINK'
                  ? 'Web link'
                  : `${categoryLabel(n.category)} · ${fmtBytes(n.sizeBytes)}`,
                (n.version ?? 1) > 1 ? `v${n.version}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              {!n.allowDownload && n.kind === 'FILE' && (
                <span className="text-orange-600"> · view-only</span>
              )}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course · classes',
      sortValue: (n) => n.courseName,
      render: (n) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm">{n.courseName}</span>
          <div className="flex flex-row flex-wrap gap-1">
            {n.classes.length ? (
              n.classes.map((c) => (
                <Badge key={c.id} size="xs" variant="outline" color="blue" radius="sm">
                  {c.name}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-orange-600">No class chosen</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (n) => n.publishAt ?? n.publishedAt ?? n.updatedAt ?? '',
      render: (n) => (
        <div className="flex flex-col gap-1 items-start">
          <NoteStatusBadge status={n.status} publishAt={n.publishAt} />
          <span className="text-[11px] text-gray-500 whitespace-nowrap">{statusLine(n)}</span>
        </div>
      ),
    },
    {
      key: 'reach',
      header: 'Reach',
      sortValue: (n) => (n.status === 'PUBLISHED' ? n.reach : -1),
      render: (n) =>
        n.status === 'PUBLISHED' || n.status === 'ARCHIVED' ? (
          <ReachBar opened={n.opened} audience={n.audience} completed={n.completed} />
        ) : (
          <span className="text-xs text-gray-400">{plural(n.audience, 'student')} when live</span>
        ),
    },
    {
      key: 'activity',
      header: 'Activity',
      sortValue: (n) => n.views,
      render: (n) => (
        <div className="flex flex-col text-xs text-gray-600 whitespace-nowrap">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FiEye /> {n.views}
            </span>
            <span className="flex items-center gap-1">
              <FiDownload /> {n.downloads}
            </span>
          </span>
          <span className="text-gray-400">
            {n.lastActivityAt ? `last ${fromNow(n.lastActivityAt)}` : 'no activity yet'}
          </span>
        </div>
      ),
    },
    {
      key: 'readBy',
      header: 'Study by',
      sortValue: (n) => n.readBy ?? '9999',
      render: (n) =>
        n.readBy ? (
          <span
            className={`text-xs whitespace-nowrap ${
              dayjs(n.readBy).isBefore(dayjs(), 'day')
                ? 'text-red-600'
                : dayjs(n.readBy).diff(dayjs(), 'day') <= 2
                  ? 'text-orange-600'
                  : 'text-gray-600'
            }`}
          >
            {fmtDate(n.readBy)}
          </span>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (n) =>
        context ? (
          <NoteActions
            note={n}
            context={context}
            topics={topics}
            onPreview={(x) => setPreviewId(x.id)}
          />
        ) : null,
    },
  ];

  if (ctxError) return <ErrorBlock message={ctxError} onRetry={() => refreshCtx()} />;
  if (!context || (loading && !notes)) return <LoadingBlock label="Loading your notes…" />;

  const k = stats?.kpis;
  const noCourses = context.courses.length === 0;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Course notes"
        subtitle="Share notes with your classes and follow who has opened and studied them."
        actions={
          <>
            <Menu shadow="md" position="bottom-end">
              <Menu.Target>
                <Button variant="default" leftSection={<FiDownload />} disabled={!rows.length}>
                  Export
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{plural(rows.length, 'note')} in the current view</Menu.Label>
                <Menu.Item
                  onClick={() =>
                    downloadExcel('course_notes', [
                      { name: 'Notes', head: exportHead, rows: exportRows() },
                    ])
                  }
                >
                  Excel (.xlsx)
                </Menu.Item>
                <Menu.Item
                  onClick={() =>
                    downloadPdf({
                      filename: 'course_notes',
                      title: 'Course notes report',
                      subtitle: `${context.teacherName} · ${course === 'ALL' ? 'All courses' : context.courses.find((c) => c.id === course)?.name}`,
                      department: 'Academics · Course notes',
                      footer: 'ESG Course Notes',
                      generatedBy: context.teacherName,
                      landscape: true,
                      summary: k
                        ? [
                            ['Published notes', k.published],
                            ['Scheduled / drafts', `${k.scheduled} / ${k.drafts}`],
                            ['Average reach', `${k.reach}%`],
                            ['Studied', `${k.completion}%`],
                            ['Total views / downloads', `${k.views} / ${k.downloads}`],
                          ]
                        : [],
                      sections: [{ name: 'Notes', head: exportHead, rows: exportRows() }],
                    })
                  }
                >
                  PDF report
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Button
              variant="default"
              leftSection={<FiLink />}
              onClick={() => setUpload('link')}
              disabled={noCourses}
            >
              Share a link
            </Button>
            <Button
              color="#024F3A"
              leftSection={<FiUploadCloud />}
              onClick={() => setUpload('files')}
              disabled={noCourses}
            >
              Upload notes
            </Button>
          </>
        }
      />

      {noCourses && (
        <Section>
          <EmptyBlock>
            You are not assigned to any course yet. Ask the academic office to assign your courses
            and classes — then you can share notes here.
          </EmptyBlock>
        </Section>
      )}

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 5 }}>
        <KpiCard
          label="Published"
          value={k?.published ?? '—'}
          hint={k ? `${k.scheduled} scheduled · ${plural(k.drafts, 'draft')}` : undefined}
          icon={<FiSend />}
          tone="teal"
          onClick={() => {
            setTab('notes');
            setStatus('PUBLISHED');
          }}
        />
        <KpiCard
          label="Student reach"
          value={k ? `${k.reach}%` : '—'}
          hint={k ? `${k.unopenedStudents} unopened across all shares` : undefined}
          icon={<FiUsers />}
          tone={k && k.reach < 50 ? 'red' : k && k.reach < 80 ? 'orange' : 'navy'}
        />
        <KpiCard
          label="Studied"
          value={k ? `${k.completion}%` : '—'}
          hint="Marked as studied by students"
          icon={<FiCheckCircle />}
          tone="gold"
        />
        <KpiCard
          label="Views this week"
          value={k?.viewsThisWeek ?? '—'}
          hint={k ? `${k.views} views in total` : undefined}
          icon={<FiEye />}
          tone="blue"
          onClick={() => setTab('insights')}
        />
        <KpiCard
          label="Downloads"
          value={k?.downloads ?? '—'}
          hint={k ? `${fmtBytes(k.storageBytes)} of files shared` : undefined}
          icon={<FiDownload />}
          tone="orange"
        />
      </SimpleGrid>

      <Tabs value={tab} onChange={setTab} color="#024F3A" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="notes" leftSection={<FiFileText />}>
            My notes ({all.length})
          </Tabs.Tab>
          <Tabs.Tab value="insights" leftSection={<FiBarChart2 />}>
            Insights
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="notes" pt="md">
          <Section>
            <div className="flex flex-col gap-3">
              <div className="flex flex-row flex-wrap gap-2">
                {[{ id: 'ALL', name: 'All courses' }, ...context.courses].map((c) => {
                  const count =
                    c.id === 'ALL' ? all.length : all.filter((n) => n.courseId === c.id).length;
                  const active = course === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCourse(c.id);
                        setKlass(null);
                        setSelected([]);
                      }}
                      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                        active
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {c.name}
                      <span
                        className={`ml-2 text-xs ${active ? 'text-white/80' : 'text-gray-400'}`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col xl:flex-row xl:items-center gap-2 justify-between">
                <SegmentedControl
                  value={status}
                  onChange={(v) => {
                    setStatus(v as StatusFilter);
                    setSelected([]);
                  }}
                  data={[
                    { value: 'ACTIVE', label: `Active (${countOf('ACTIVE')})` },
                    { value: 'PUBLISHED', label: `Published (${countOf('PUBLISHED')})` },
                    { value: 'SCHEDULED', label: `Scheduled (${countOf('SCHEDULED')})` },
                    { value: 'DRAFT', label: `Drafts (${countOf('DRAFT')})` },
                    { value: 'ARCHIVED', label: `Archived (${countOf('ARCHIVED')})` },
                  ]}
                  size="xs"
                />
                <div className="flex flex-row flex-wrap gap-2">
                  <TextInput
                    size="xs"
                    placeholder="Search title, topic, file…"
                    leftSection={<FiSearch />}
                    value={q}
                    onChange={(e) => setQ(e.currentTarget.value)}
                    w={220}
                  />
                  <Select
                    size="xs"
                    placeholder="Class"
                    data={classOptions}
                    value={klass}
                    onChange={setKlass}
                    clearable
                    w={130}
                  />
                  <Select
                    size="xs"
                    placeholder="Topic"
                    data={topics}
                    value={topic}
                    onChange={setTopic}
                    clearable
                    searchable
                    w={150}
                  />
                  <Select
                    size="xs"
                    placeholder="Type"
                    data={typeOptions}
                    value={type}
                    onChange={setType}
                    clearable
                    w={130}
                  />
                  {filtersOn && (
                    <Button
                      size="xs"
                      variant="subtle"
                      color="gray"
                      leftSection={<FiX />}
                      onClick={() => {
                        setKlass(null);
                        setType(null);
                        setTopic(null);
                        setQ('');
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {selectedNotes.length > 0 && (
                <div className="flex flex-row flex-wrap items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                  <span className="text-sm font-medium text-primary mr-2">
                    {selectedNotes.length} selected
                  </span>
                  <Button
                    size="xs"
                    color="teal"
                    leftSection={<FiSend />}
                    onClick={() => bulk('publish', 'Publish')}
                  >
                    Publish
                  </Button>
                  <Button
                    size="xs"
                    variant="default"
                    leftSection={<FiRotateCcw />}
                    onClick={() => bulk('unpublish', 'Unpublish')}
                  >
                    Move to drafts
                  </Button>
                  <Button
                    size="xs"
                    variant="default"
                    leftSection={<FiDownload />}
                    onClick={() => bulk('allowDownload', 'Allow downloads')}
                  >
                    Allow downloads
                  </Button>
                  <Button
                    size="xs"
                    variant="default"
                    leftSection={<FiEye />}
                    onClick={() => bulk('blockDownload', 'Make view-only')}
                  >
                    View-only
                  </Button>
                  {status === 'ARCHIVED' ? (
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={<FiRefreshCw />}
                      onClick={() => bulk('restore', 'Restore')}
                    >
                      Restore
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      color="orange"
                      variant="light"
                      leftSection={<FiArchive />}
                      onClick={() => bulk('archive', 'Archive', true)}
                    >
                      Archive
                    </Button>
                  )}
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    leftSection={<FiTrash2 />}
                    onClick={() => bulk('delete', 'Delete', true)}
                  >
                    Delete
                  </Button>
                  <Button size="xs" variant="subtle" color="gray" onClick={() => setSelected([])}>
                    Clear selection
                  </Button>
                </div>
              )}

              {error ? (
                <ErrorBlock message={error} onRetry={() => refresh()} />
              ) : all.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-14 text-center">
                  <span className="h-16 w-16 rounded-full bg-primary/10 text-primary text-3xl flex items-center justify-center">
                    <FiBookOpen />
                  </span>
                  <div className="font-semibold text-primary">No notes yet</div>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Upload PDFs, slides, Word documents, videos or links. Students in the classes
                    you choose will see them on their Course Notes page.
                  </p>
                  <Button
                    color="#024F3A"
                    leftSection={<FiUploadCloud />}
                    onClick={() => setUpload('files')}
                    disabled={noCourses}
                  >
                    Upload your first notes
                  </Button>
                </div>
              ) : (
                <DataTable
                  rows={rows}
                  columns={columns}
                  onRowClick={(n) => router.push(`/staff/notes/${n.id}`)}
                  rowClassName={(n) => (selected.includes(n.id) ? '!bg-primary/5' : '')}
                  empty={
                    filtersOn
                      ? 'No notes match these filters.'
                      : status === 'ARCHIVED'
                        ? 'Nothing archived.'
                        : status === 'DRAFT'
                          ? 'No drafts.'
                          : status === 'SCHEDULED'
                            ? 'Nothing scheduled.'
                            : 'No notes here yet.'
                  }
                />
              )}
            </div>
          </Section>
        </Tabs.Panel>

        <Tabs.Panel value="insights" pt="md">
          {!stats ? (
            <LoadingBlock />
          ) : (
            <Insights stats={stats} onOpen={(id) => router.push(`/staff/notes/${id}`)} />
          )}
        </Tabs.Panel>
      </Tabs>

      {element}
      {upload && (
        <UploadNotesModal
          opened
          onClose={() => setUpload(null)}
          context={context}
          topics={topics}
          defaultCourseId={course === 'ALL' ? null : course}
          initialMode={upload}
        />
      )}
      <TeacherPreviewModal note={previewNote} onClose={() => setPreviewId(null)} />
    </div>
  );
}

const activityText = {
  VIEW: 'opened',
  DOWNLOAD: 'downloaded',
  COMPLETE: 'finished studying',
} as const;
const activityColor = {
  VIEW: 'bg-blue-500',
  DOWNLOAD: 'bg-orange-400',
  COMPLETE: 'bg-teal-500',
} as const;

function Insights({ stats, onOpen }: { stats: TeachingStats; onOpen: (id: string) => void }) {
  const labels = stats.daily.map((d) => dayjs(d.date).format('DD MMM'));
  const types = Object.entries(stats.byType);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Section title="Student activity — last 30 days" className="xl:col-span-2">
          <GroupedBar
            labels={labels}
            stacked
            series={[
              { label: 'Opened', values: stats.daily.map((d) => d.views), color: PALETTE.navy },
              {
                label: 'Downloaded',
                values: stats.daily.map((d) => d.downloads),
                color: PALETTE.orange,
              },
              {
                label: 'Studied',
                values: stats.daily.map((d) => d.completions),
                color: PALETTE.teal,
              },
            ]}
          />
        </Section>
        <Section title="What you share">
          {types.length ? (
            <DonutChart
              labels={types.map(([t]) => categoryLabel(t as NoteCategory))}
              values={types.map(([, v]) => v)}
              center={{ value: types.reduce((s, [, v]) => s + v, 0), label: 'notes' }}
            />
          ) : (
            <EmptyBlock>No notes yet</EmptyBlock>
          )}
        </Section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Section title="Reach by course (published notes)">
          {stats.byCourse.length ? (
            <GroupedBar
              labels={stats.byCourse.map((c) => c.course)}
              series={[
                {
                  label: 'Opened %',
                  values: stats.byCourse.map((c) => c.reach),
                  color: PALETTE.navy,
                },
                {
                  label: 'Studied %',
                  values: stats.byCourse.map((c) => c.completion),
                  color: PALETTE.teal,
                },
              ]}
            />
          ) : (
            <EmptyBlock>Publish notes to see reach by course.</EmptyBlock>
          )}
        </Section>
        <Section
          title={
            <span className="flex items-center gap-2">
              Needs attention{' '}
              <Badge color="red" variant="light">
                {stats.attention.length}
              </Badge>
            </span>
          }
        >
          {stats.attention.length === 0 ? (
            <EmptyBlock>Great — every published note has reached most of its students.</EmptyBlock>
          ) : (
            <div className="flex flex-col divide-y">
              {stats.attention.map((n) => (
                <div key={n.id} className="flex flex-row items-center gap-3 py-2.5">
                  <FileTypeIcon category={n.category} size="sm" />
                  <button
                    type="button"
                    onClick={() => onOpen(n.id)}
                    className="flex flex-col min-w-0 flex-1 text-left"
                  >
                    <span className="text-sm font-medium text-primary truncate hover:underline">
                      {n.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      {n.courseName} · published {fromNow(n.publishedAt)}
                      {n.nudgeCount ? ` · reminded ${n.nudgeCount}×` : ''}
                    </span>
                  </button>
                  <ReachBar opened={n.opened} audience={n.audience} compact />
                  <Tooltip label="Remind students who haven’t studied it">
                    <Button
                      size="compact-xs"
                      variant="light"
                      color="orange"
                      leftSection={<FiBell />}
                      onClick={() => notesAction('post', `/notes/teaching/${n.id}/nudge`)}
                    >
                      Remind
                    </Button>
                  </Tooltip>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Section title="Recent student activity">
          {stats.recent.length === 0 ? (
            <EmptyBlock>No student activity in the last 30 days.</EmptyBlock>
          ) : (
            <ol className="relative flex flex-col gap-3 pl-4 border-l border-gray-200">
              {stats.recent.map((a, i) => (
                <li key={`${a.noteId}-${a.at}-${i}`} className="relative">
                  <span
                    className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ${activityColor[a.type]}`}
                  />
                  <div className="text-sm">
                    <b className="text-primary">{a.studentName}</b>
                    <span className="text-gray-500">
                      {' '}
                      {a.className ? `(${a.className}) ` : ''}
                      {activityText[a.type]}{' '}
                    </span>
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => onOpen(a.noteId)}
                    >
                      {a.noteTitle}
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">
                    {fromNow(a.at)} · {a.courseName}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Section>
        <Section title="Most viewed notes">
          {stats.top.length === 0 ? (
            <EmptyBlock>No views yet.</EmptyBlock>
          ) : (
            <div className="flex flex-col divide-y">
              {stats.top.map((n, i) => (
                <button
                  type="button"
                  key={n.id}
                  onClick={() => onOpen(n.id)}
                  className="flex flex-row items-center gap-3 py-2.5 text-left hover:bg-gray-50 rounded px-1"
                >
                  <span className="w-5 text-center text-sm font-semibold text-gray-400">
                    {i + 1}
                  </span>
                  <FileTypeIcon category={n.category} size="sm" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-primary truncate">{n.title}</span>
                    <span className="text-xs text-gray-500">{n.courseName}</span>
                  </div>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <FiEye /> {n.views}
                  </span>
                  <span className="text-sm text-gray-600 flex items-center gap-1 w-12 justify-end">
                    <FiDownload /> {n.downloads}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

export default function StaffNotesPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <NotesManager />
    </Suspense>
  );
}
