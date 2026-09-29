'use client';
import {
  ActionIcon,
  Badge,
  Button,
  Progress,
  SegmentedControl,
  Select,
  SimpleGrid,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { BsBookmark, BsBookmarkFill, BsPinFill } from 'react-icons/bs';
import {
  FiBell,
  FiBookOpen,
  FiCheckCircle,
  FiCircle,
  FiDownload,
  FiSearch,
  FiStar,
} from 'react-icons/fi';
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
import { downloadNote, notesAction, useNotes } from '@/components/notes/api';
import { FileTypeIcon, categoryLabel, fmtBytes, fromNow, plural } from '@/components/notes/helpers';
import StudentNoteModal from '@/components/notes/student/StudentNoteModal';
import { MyNotes, StudentNote } from '@/components/notes/types';

type View = 'ALL' | 'NEW' | 'TODO' | 'DONE' | 'SAVED';
type Sort = 'newest' | 'oldest' | 'deadline' | 'title';

function progressBadge(n: StudentNote) {
  if (n.completed)
    return (
      <Badge color="teal" variant="filled" radius="sm" leftSection={<FiCheckCircle />}>
        Studied
      </Badge>
    );
  if (n.isNew)
    return (
      <Badge color="blue" variant="filled" radius="sm">
        New
      </Badge>
    );
  return (
    <Badge color="gray" variant="light" radius="sm">
      Opened
    </Badge>
  );
}

const matchesView = (n: StudentNote, v: View) =>
  v === 'NEW'
    ? n.isNew
    : v === 'TODO'
      ? !n.completed
      : v === 'DONE'
        ? n.completed
        : v === 'SAVED'
          ? n.saved
          : true;

function StudentNotes() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, loading, error, refresh } = useNotes<MyNotes>('/notes/me');
  const [course, setCourse] = useState<string>('ALL');
  const [view, setView] = useState<View>('ALL');
  const [topic, setTopic] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>('newest');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const notes = useMemo(() => data?.notes ?? [], [data]);

  useEffect(() => {
    const wanted = params.get('open');
    if (!wanted || !data) return;
    if (notes.some((n) => n.id === wanted)) setOpenId(wanted);
    else
      notifications.show({
        title: 'Note not available',
        message: 'It may have been removed, or it is not shared with your class.',
        color: 'orange',
      });
    router.replace('/student/notes');
  }, [params, data, notes, router]);

  const inCourse = useMemo(
    () => (course === 'ALL' ? notes : notes.filter((n) => n.courseId === course)),
    [notes, course],
  );
  const topics = useMemo(
    () => Array.from(new Set(inCourse.map((n) => n.topic).filter(Boolean) as string[])).sort(),
    [inCourse],
  );

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = inCourse
      .filter((n) => matchesView(n, view))
      .filter((n) => !topic || n.topic === topic)
      .filter(
        (n) =>
          !query ||
          [n.title, n.topic, n.description, n.courseName, n.teacherName, n.fileName].some((v) =>
            v?.toLowerCase().includes(query),
          ),
      );
    const by: Record<Sort, (a: StudentNote, b: StudentNote) => number> = {
      newest: (a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''),
      oldest: (a, b) => (a.publishedAt ?? '').localeCompare(b.publishedAt ?? ''),
      deadline: (a, b) => (a.readBy ?? '9999').localeCompare(b.readBy ?? '9999'),
      title: (a, b) => a.title.localeCompare(b.title),
    };
    return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || by[sort](a, b));
  }, [inCourse, view, topic, q, sort]);

  const openIndex = rows.findIndex((n) => n.id === openId);
  const openNote = notes.find((n) => n.id === openId) ?? null;
  const nudged = notes.filter((n) => n.nudged);

  if (error) return <ErrorBlock message={error} onRetry={() => refresh()} />;
  if (loading || !data) return <LoadingBlock label="Loading your notes…" />;

  const s = data.stats;
  const donePct = s.total ? Math.round((s.completed * 100) / s.total) : 0;

  const columns: Column<StudentNote>[] = [
    {
      key: 'title',
      header: 'Note',
      sortValue: (n) => n.title.toLowerCase(),
      render: (n) => (
        <div className="flex flex-row items-center gap-3 min-w-[260px] max-w-[420px]">
          <FileTypeIcon category={n.category} />
          <div className="flex flex-col min-w-0">
            <span
              className={`truncate flex items-center gap-1.5 ${n.isNew ? 'font-semibold text-primary' : 'font-medium text-primary'}`}
            >
              {n.pinned && (
                <span className="text-accent-dark text-xs">
                  <BsPinFill />
                </span>
              )}
              {n.title}
              {n.updatedSinceView && (
                <Badge size="xs" color="blue" variant="light">
                  Updated
                </Badge>
              )}
              {n.nudged && (
                <Tooltip label="Your teacher sent a reminder">
                  <span className="text-orange-500">
                    <FiBell />
                  </span>
                </Tooltip>
              )}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {[
                n.topic,
                n.kind === 'LINK'
                  ? 'Web link'
                  : `${categoryLabel(n.category)} · ${fmtBytes(n.sizeBytes)}`,
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
      header: 'Course',
      sortValue: (n) => n.courseName,
      render: (n) => (
        <div className="flex flex-col">
          <span>{n.courseName}</span>
          <span className="text-xs text-gray-500">{n.teacherName}</span>
        </div>
      ),
    },
    {
      key: 'shared',
      header: 'Shared',
      sortValue: (n) => n.publishedAt ?? '',
      render: (n) => (
        <Tooltip label={fmtDate(n.publishedAt)}>
          <span className="text-xs text-gray-600 whitespace-nowrap">{fromNow(n.publishedAt)}</span>
        </Tooltip>
      ),
    },
    {
      key: 'readBy',
      header: 'Study by',
      sortValue: (n) => n.readBy ?? '9999',
      render: (n) => {
        if (!n.readBy) return <span className="text-gray-300 text-xs">—</span>;
        const days = dayjs(n.readBy).startOf('day').diff(dayjs().startOf('day'), 'day');
        const tone = n.completed
          ? 'text-gray-500'
          : days < 0
            ? 'text-red-600 font-medium'
            : days <= 2
              ? 'text-orange-600 font-medium'
              : 'text-gray-600';
        return (
          <div className={`flex flex-col text-xs whitespace-nowrap ${tone}`}>
            <span>{fmtDate(n.readBy)}</span>
            {!n.completed && (
              <span className="text-[11px]">
                {days < 0
                  ? `${plural(-days, 'day')} late`
                  : days === 0
                    ? 'today'
                    : `in ${plural(days, 'day')}`}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'progress',
      header: 'My progress',
      sortValue: (n) => (n.completed ? 2 : n.viewed ? 1 : 0),
      render: progressBadge,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (n) => (
        <div
          className="flex flex-row items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button size="compact-sm" color="#024F3A" onClick={() => setOpenId(n.id)}>
            Open
          </Button>
          {n.kind === 'FILE' && (
            <Tooltip label={n.allowDownload ? 'Download' : 'View-only — downloads are off'}>
              <ActionIcon
                variant="subtle"
                color="gray"
                disabled={!n.allowDownload}
                onClick={() => downloadNote(n.id, n.fileName)}
                aria-label="Download"
              >
                <FiDownload />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label={n.saved ? 'Remove from saved' : 'Save for later'}>
            <ActionIcon
              variant="subtle"
              color={n.saved ? 'gold' : 'gray'}
              onClick={() => notesAction('post', `/notes/me/${n.id}/save`)}
              aria-label="Save"
            >
              {n.saved ? <BsBookmarkFill /> : <BsBookmark />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label={n.completed ? 'Mark as not studied' : 'Mark as studied'}>
            <ActionIcon
              variant="subtle"
              color={n.completed ? 'teal' : 'gray'}
              onClick={() => notesAction('post', `/notes/me/${n.id}/complete`)}
              aria-label="Studied"
            >
              {n.completed ? <FiCheckCircle /> : <FiCircle />}
            </ActionIcon>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Course notes"
        subtitle={
          data.className
            ? `Notes your teachers shared with ${data.className}. Open them here, download them, and tick them off when you have studied them.`
            : 'You are not placed in a class yet, so no notes are shared with you.'
        }
      />

      {nudged.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2 font-semibold text-orange-800">
            <FiBell /> Your teachers reminded you to study{' '}
            {nudged.length === 1 ? 'this note' : 'these notes'}
          </div>
          <div className="flex flex-col divide-y divide-orange-100">
            {nudged.map((n) => (
              <div key={n.id} className="flex flex-row items-center justify-between gap-3 py-2">
                <div className="flex flex-row items-center gap-3 min-w-0">
                  <FileTypeIcon category={n.category} size="sm" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-primary truncate">{n.title}</span>
                    <span className="text-xs text-gray-600">
                      {n.courseName} · {n.teacherName}
                      {n.readBy ? ` · study by ${fmtDate(n.readBy)}` : ''}
                    </span>
                  </div>
                </div>
                <Button size="compact-sm" color="orange" onClick={() => setOpenId(n.id)}>
                  Open
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }}>
        <KpiCard
          label="New"
          value={s.unread}
          hint={s.unread ? 'Not opened yet' : 'You are up to date'}
          icon={<FiStar />}
          tone="blue"
          onClick={() => setView('NEW')}
        />
        <KpiCard
          label="To study"
          value={s.toStudy}
          hint={s.dueSoon ? `${s.dueSoon} due soon or late` : 'No deadlines close'}
          icon={<FiBookOpen />}
          tone={s.dueSoon ? 'orange' : 'navy'}
          onClick={() => setView('TODO')}
        />
        <KpiCard
          label="Studied"
          value={`${s.completed}/${s.total}`}
          hint={
            <Progress value={donePct} size="sm" color="teal" radius="xl" className="w-28 mt-1" />
          }
          icon={<FiCheckCircle />}
          tone="teal"
          onClick={() => setView('DONE')}
        />
        <KpiCard
          label="Saved"
          value={s.saved}
          hint="Your bookmarked notes"
          icon={<BsBookmarkFill />}
          tone="gold"
          onClick={() => setView('SAVED')}
        />
      </SimpleGrid>

      {data.courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            {
              courseId: 'ALL',
              courseName: 'All courses',
              teacherName: `${data.courses.length} courses`,
              total: s.total,
              unread: s.unread,
              completed: s.completed,
            },
            ...data.courses,
          ].map((c) => {
            const active = course === c.courseId;
            const pct = c.total ? Math.round((c.completed * 100) / c.total) : 0;
            return (
              <button
                type="button"
                key={c.courseId}
                onClick={() => {
                  setCourse(c.courseId);
                  setTopic(null);
                }}
                className={`text-left rounded-lg border p-3 flex flex-col gap-2 transition-all ${
                  active
                    ? 'border-primary ring-1 ring-primary bg-primary/5'
                    : 'bg-white hover:shadow-md'
                }`}
              >
                <div className="flex flex-row items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-primary truncate">{c.courseName}</span>
                    <span className="text-xs text-gray-500 truncate">
                      {c.teacherName ?? 'No teacher yet'}
                    </span>
                  </div>
                  {c.unread > 0 && (
                    <Badge color="blue" variant="filled" size="sm">
                      {c.unread} new
                    </Badge>
                  )}
                </div>
                <div className="flex flex-row items-center gap-2 text-xs text-gray-500">
                  <Progress value={pct} size="sm" color="teal" radius="xl" className="flex-1" />
                  <span className="whitespace-nowrap">
                    {c.completed}/{c.total} studied
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Section>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
            <SegmentedControl
              size="xs"
              value={view}
              onChange={(v) => setView(v as View)}
              data={[
                { value: 'ALL', label: `All (${inCourse.length})` },
                { value: 'NEW', label: `New (${inCourse.filter((n) => n.isNew).length})` },
                {
                  value: 'TODO',
                  label: `To study (${inCourse.filter((n) => !n.completed).length})`,
                },
                { value: 'DONE', label: `Studied (${inCourse.filter((n) => n.completed).length})` },
                { value: 'SAVED', label: `Saved (${inCourse.filter((n) => n.saved).length})` },
              ]}
            />
            <div className="flex flex-row flex-wrap gap-2">
              <TextInput
                size="xs"
                placeholder="Search notes…"
                leftSection={<FiSearch />}
                value={q}
                onChange={(e) => setQ(e.currentTarget.value)}
                w={220}
              />
              {topics.length > 0 && (
                <Select
                  size="xs"
                  placeholder="Topic"
                  data={topics}
                  value={topic}
                  onChange={setTopic}
                  clearable
                  w={160}
                />
              )}
              <Select
                size="xs"
                w={150}
                value={sort}
                onChange={(v) => setSort((v as Sort) ?? 'newest')}
                allowDeselect={false}
                data={[
                  { value: 'newest', label: 'Newest first' },
                  { value: 'oldest', label: 'Oldest first' },
                  { value: 'deadline', label: 'Study-by date' },
                  { value: 'title', label: 'Title A–Z' },
                ]}
              />
            </div>
          </div>
          {notes.length === 0 ? (
            <EmptyBlock>
              {data.className
                ? 'Your teachers have not shared any notes yet. New notes will appear here.'
                : 'Once you are placed in a class, your teachers’ notes will appear here.'}
            </EmptyBlock>
          ) : (
            <DataTable
              rows={rows}
              columns={columns}
              onRowClick={(n) => setOpenId(n.id)}
              rowClassName={(n) => (n.isNew ? 'font-medium' : '')}
              empty={
                view === 'NEW'
                  ? 'No new notes — you have opened everything.'
                  : view === 'DONE'
                    ? 'Nothing marked as studied yet.'
                    : view === 'SAVED'
                      ? 'Save notes with the bookmark icon to find them here.'
                      : view === 'TODO'
                        ? 'All done — every note is marked as studied.'
                        : 'No notes match your search.'
              }
            />
          )}
        </div>
      </Section>

      <StudentNoteModal
        note={openNote}
        onClose={() => setOpenId(null)}
        onPrev={openIndex > 0 ? () => setOpenId(rows[openIndex - 1].id) : undefined}
        onNext={
          openIndex >= 0 && openIndex < rows.length - 1
            ? () => setOpenId(rows[openIndex + 1].id)
            : undefined
        }
        position={openIndex >= 0 ? `${openIndex + 1} of ${rows.length}` : undefined}
      />
    </div>
  );
}

export default function StudentNotesPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <StudentNotes />
    </Suspense>
  );
}
