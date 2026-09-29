'use client';
import { ActionIcon, Alert, Badge, Button, Modal, Tooltip } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import {
  FiBell,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiCircle,
  FiDownload,
  FiExternalLink,
  FiRefreshCw,
} from 'react-icons/fi';
import { fmtDate } from '@/components/library/ui';
import { downloadNote, notesAction, refreshNotes } from '../api';
import { FileTypeIcon, categoryLabel, fmtBytes, fromNow } from '../helpers';
import NotePreview from '../NotePreview';
import { StudentNote } from '../types';

/** Full-screen reader: preview on the left, teacher's message and study actions on the right. */
export default function StudentNoteModal({
  note,
  onClose,
  onPrev,
  onNext,
  position,
}: {
  note: StudentNote | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  position?: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const recorded = useRef<string | null>(null);

  useEffect(() => {
    if (!note || recorded.current === note.id) return;
    recorded.current = note.id;
    notesAction('post', `/notes/me/${note.id}/view`, {}, { silent: true });
  }, [note]);

  useEffect(() => {
    if (!note) recorded.current = null;
  }, [note]);

  const toggle = async (what: 'complete' | 'save') => {
    if (!note) return;
    setBusy(what);
    await notesAction('post', `/notes/me/${note.id}/${what}`);
    setBusy(null);
  };

  const openLink = () => note?.linkUrl && window.open(note.linkUrl, '_blank', 'noopener');

  return (
    <Modal
      opened={!!note}
      onClose={onClose}
      size="92%"
      padding="md"
      title={
        note && (
          <div className="flex flex-row items-center gap-3 min-w-0">
            <FileTypeIcon category={note.category} size="sm" />
            <div className="flex flex-col min-w-0">
              <b className="text-primary truncate">{note.title}</b>
              <span className="text-xs text-gray-500 truncate">
                {note.courseName} · {note.teacherName}
                {note.topic ? ` · ${note.topic}` : ''}
              </span>
            </div>
          </div>
        )
      }
    >
      {note && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-4">
          <NotePreview
            note={note}
            canDownload={note.allowDownload}
            onDownload={() => downloadNote(note.id, note.fileName)}
            onOpenLink={openLink}
            onPendingRefresh={refreshNotes}
          />
          <div className="flex flex-col gap-3">
            {note.nudged && (
              <Alert
                color="orange"
                variant="light"
                icon={<FiBell />}
                title="Reminder from your teacher"
              >
                {note.teacherName} asked you to study this note
                {note.readBy ? ` by ${fmtDate(note.readBy)}` : ''}.
              </Alert>
            )}
            {note.updatedSinceView && (
              <Alert color="blue" variant="light" icon={<FiRefreshCw />}>
                Your teacher uploaded a new version since you last opened it.
              </Alert>
            )}

            {note.description && (
              <div className="rounded-lg bg-primary/5 p-3">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  Message from {note.teacherName}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{note.description}</p>
              </div>
            )}

            <Button
              size="md"
              color={note.completed ? 'teal' : '#024F3A'}
              variant={note.completed ? 'light' : 'filled'}
              leftSection={note.completed ? <FiCheckCircle /> : <FiCircle />}
              onClick={() => toggle('complete')}
              loading={busy === 'complete'}
            >
              {note.completed ? 'Studied ✓' : 'Mark as studied'}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="default"
                leftSection={
                  note.saved ? <BsBookmarkFill className="text-accent-dark" /> : <BsBookmark />
                }
                onClick={() => toggle('save')}
                loading={busy === 'save'}
              >
                {note.saved ? 'Saved' : 'Save'}
              </Button>
              {note.kind === 'LINK' ? (
                <Button variant="default" leftSection={<FiExternalLink />} onClick={openLink}>
                  Open link
                </Button>
              ) : (
                <Tooltip
                  label="Your teacher made this note view-only"
                  disabled={note.allowDownload}
                >
                  <Button
                    variant="default"
                    leftSection={<FiDownload />}
                    disabled={!note.allowDownload}
                    onClick={() => downloadNote(note.id, note.fileName)}
                  >
                    Download
                  </Button>
                </Tooltip>
              )}
            </div>

            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs border-t pt-3">
              <dt className="text-gray-500">Shared</dt>
              <dd>{fromNow(note.publishedAt)}</dd>
              {note.readBy && (
                <>
                  <dt className="text-gray-500">Study by</dt>
                  <dd className={note.readByPassed ? 'text-red-600 font-medium' : ''}>
                    {fmtDate(note.readBy)}
                    {note.readByPassed ? ' (passed)' : ''}
                  </dd>
                </>
              )}
              <dt className="text-gray-500">Type</dt>
              <dd>{categoryLabel(note.category)}</dd>
              {note.kind === 'FILE' && (
                <>
                  <dt className="text-gray-500">File</dt>
                  <dd className="break-all">
                    {note.fileName} · {fmtBytes(note.sizeBytes)}
                  </dd>
                </>
              )}
              {note.completedAt && (
                <>
                  <dt className="text-gray-500">Studied on</dt>
                  <dd>{fmtDate(note.completedAt)}</dd>
                </>
              )}
            </dl>
            <div className="flex flex-row flex-wrap gap-1">
              {note.pinned && (
                <Badge color="grape" variant="light" radius="sm">
                  Pinned by teacher
                </Badge>
              )}
              {!note.allowDownload && note.kind === 'FILE' && (
                <Badge color="orange" variant="light" radius="sm">
                  View-only
                </Badge>
              )}
            </div>

            {(onPrev || onNext) && (
              <div className="flex flex-row items-center justify-between border-t pt-3 mt-auto">
                <ActionIcon
                  variant="default"
                  size="lg"
                  onClick={onPrev}
                  disabled={!onPrev}
                  aria-label="Previous note"
                >
                  <FiChevronLeft />
                </ActionIcon>
                <span className="text-xs text-gray-500">{position}</span>
                <ActionIcon
                  variant="default"
                  size="lg"
                  onClick={onNext}
                  disabled={!onNext}
                  aria-label="Next note"
                >
                  <FiChevronRight />
                </ActionIcon>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
