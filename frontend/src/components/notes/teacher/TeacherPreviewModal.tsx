'use client';
import { Badge, Button, Modal } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { FiBarChart2, FiDownload } from 'react-icons/fi';
import { downloadNote, refreshNotes } from '../api';
import { FileTypeIcon, NoteStatusBadge, ReachBar, fmtBytes, fmtWhen } from '../helpers';
import NotePreview from '../NotePreview';
import { TeacherNote } from '../types';

export default function TeacherPreviewModal({
  note,
  onClose,
}: {
  note: TeacherNote | null;
  onClose: () => void;
}) {
  const router = useRouter();
  return (
    <Modal
      opened={!!note}
      onClose={onClose}
      size="90%"
      padding="md"
      title={
        note && (
          <div className="flex flex-row items-center gap-3 min-w-0">
            <FileTypeIcon category={note.category} size="sm" />
            <div className="flex flex-col min-w-0">
              <b className="text-primary truncate">{note.title}</b>
              <span className="text-xs text-gray-500 truncate">
                {note.courseName}
                {note.topic ? ` · ${note.topic}` : ''} ·{' '}
                {note.classes.map((c) => c.name).join(', ') || 'No class yet'}
              </span>
            </div>
          </div>
        )
      }
    >
      {note && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
          <NotePreview
            note={note}
            canDownload
            onDownload={() => downloadNote(note.id, note.fileName)}
            onOpenLink={() => window.open(note.linkUrl, '_blank', 'noopener')}
            onPendingRefresh={refreshNotes}
          />
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex flex-row flex-wrap gap-2">
              <NoteStatusBadge status={note.status} publishAt={note.publishAt} />
              {!note.allowDownload && (
                <Badge color="orange" variant="light" radius="sm">
                  View-only
                </Badge>
              )}
              {note.pinned && (
                <Badge color="grape" variant="light" radius="sm">
                  Pinned
                </Badge>
              )}
            </div>
            {note.description && (
              <p className="text-gray-600 whitespace-pre-line">{note.description}</p>
            )}
            <ReachBar opened={note.opened} audience={note.audience} completed={note.completed} />
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-gray-500">Views</dt>
              <dd>{note.views}</dd>
              <dt className="text-gray-500">Downloads</dt>
              <dd>{note.downloads}</dd>
              {note.kind === 'FILE' && (
                <>
                  <dt className="text-gray-500">File</dt>
                  <dd className="truncate">
                    {note.fileName} ({fmtBytes(note.sizeBytes)}) · v{note.version ?? 1}
                  </dd>
                </>
              )}
              <dt className="text-gray-500">
                {note.status === 'SCHEDULED' ? 'Releases' : 'Published'}
              </dt>
              <dd>{fmtWhen(note.publishAt ?? note.publishedAt)}</dd>
            </dl>
            <Button
              variant="light"
              color="#024F3A"
              leftSection={<FiBarChart2 />}
              onClick={() => router.push(`/staff/notes/${note.id}`)}
            >
              See who opened it
            </Button>
            {note.kind === 'FILE' && (
              <Button
                variant="default"
                leftSection={<FiDownload />}
                onClick={() => downloadNote(note.id, note.fileName)}
              >
                Download
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
