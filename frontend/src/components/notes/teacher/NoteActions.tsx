'use client';
import { ActionIcon, Button, Menu, Tooltip } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  FiArchive,
  FiBell,
  FiCopy,
  FiDownload,
  FiEdit2,
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiLink,
  FiMoreVertical,
  FiRefreshCw,
  FiRotateCcw,
  FiSend,
  FiShare2,
  FiTrash2,
  FiUploadCloud,
  FiBarChart2,
} from 'react-icons/fi';
import { BsPin, BsPinFill } from 'react-icons/bs';
import { useConfirm } from '@/components/library/useConfirm';
import { copyText, downloadNote, notesAction, studentNoteLink } from '../api';
import { TeacherNote, TeachingContext } from '../types';
import EditNoteModal from './EditNoteModal';
import ReplaceFileModal from './ReplaceFileModal';
import ShareNoteModal from './ShareNoteModal';

type Dialog = 'edit' | 'share' | 'replace' | null;

/** Preview + Share buttons and a menu with every other action on a note. */
export default function NoteActions({
  note,
  context,
  topics,
  onPreview,
  showDetailsLink = true,
  size = 'row',
}: {
  note: TeacherNote;
  context: TeachingContext;
  topics: string[];
  onPreview?: (n: TeacherNote) => void;
  showDetailsLink?: boolean;
  size?: 'row' | 'header';
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog>(null);
  const { ask, element } = useConfirm();
  const base = `/notes/teaching/${note.id}`;
  const live = note.status === 'PUBLISHED';
  const archived = note.status === 'ARCHIVED';
  const header = size === 'header';

  const confirmDelete = () =>
    ask({
      title: 'Delete this note permanently?',
      message: (
        <>
          <b>{note.title}</b> and its file will be removed for good, together with the record of
          which students opened it. {live ? 'Students will lose access immediately. ' : ''}If you
          only want to hide it, archive it instead.
        </>
      ),
      confirmLabel: 'Delete permanently',
      onConfirm: async () => {
        const ok = await notesAction('delete', base);
        if (ok && !showDetailsLink) router.push('/staff/notes');
      },
    });

  const confirmUnpublish = () =>
    ask({
      title: 'Move back to drafts?',
      message: `Students will no longer see “${note.title}”. Their reading progress is kept.`,
      confirmLabel: 'Move to drafts',
      color: 'orange',
      onConfirm: () => notesAction('post', `${base}/unpublish`),
    });

  const confirmArchive = () =>
    ask({
      title: 'Archive this note?',
      message: `“${note.title}” will be hidden from students and moved to your archive. You can restore it any time.`,
      confirmLabel: 'Archive',
      color: 'orange',
      onConfirm: () => notesAction('post', `${base}/archive`),
    });

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex flex-row items-center justify-end gap-1"
    >
      {onPreview && (
        <Tooltip label="Preview as students see it">
          {header ? (
            <Button variant="default" leftSection={<FiEye />} onClick={() => onPreview(note)}>
              Preview
            </Button>
          ) : (
            <ActionIcon
              variant="subtle"
              color="#024F3A"
              onClick={() => onPreview(note)}
              aria-label="Preview"
            >
              <FiEye />
            </ActionIcon>
          )}
        </Tooltip>
      )}
      <Tooltip label={live ? 'Classes, student link and reminders' : 'Choose classes and publish'}>
        {header ? (
          <Button
            color="#024F3A"
            leftSection={live ? <FiShare2 /> : <FiSend />}
            onClick={() => setDialog('share')}
          >
            {live ? 'Share' : archived ? 'Republish' : 'Publish'}
          </Button>
        ) : (
          <ActionIcon
            variant="subtle"
            color={live ? '#024F3A' : 'teal'}
            onClick={() => setDialog('share')}
            aria-label="Share"
          >
            {live ? <FiShare2 /> : <FiSend />}
          </ActionIcon>
        )}
      </Tooltip>
      <Menu position="bottom-end" withinPortal shadow="md" width={240}>
        <Menu.Target>
          {header ? (
            <Button variant="default" rightSection={<FiMoreVertical />}>
              More
            </Button>
          ) : (
            <ActionIcon variant="subtle" color="gray" aria-label="More actions">
              <FiMoreVertical />
            </ActionIcon>
          )}
        </Menu.Target>
        <Menu.Dropdown>
          {showDetailsLink && (
            <Menu.Item
              leftSection={<FiBarChart2 />}
              onClick={() => router.push(`/staff/notes/${note.id}`)}
            >
              Details & who opened it
            </Menu.Item>
          )}
          <Menu.Item leftSection={<FiEdit2 />} onClick={() => setDialog('edit')}>
            Edit details
          </Menu.Item>
          {note.kind === 'FILE' ? (
            <>
              <Menu.Item leftSection={<FiUploadCloud />} onClick={() => setDialog('replace')}>
                Replace file (new version)
              </Menu.Item>
              <Menu.Item
                leftSection={<FiDownload />}
                onClick={() => downloadNote(note.id, note.fileName)}
              >
                Download file
              </Menu.Item>
            </>
          ) : (
            <Menu.Item
              leftSection={<FiExternalLink />}
              onClick={() => window.open(note.linkUrl, '_blank', 'noopener')}
            >
              Open link
            </Menu.Item>
          )}
          <Menu.Item
            leftSection={<FiLink />}
            onClick={() => copyText(studentNoteLink(note.id), 'Student link')}
          >
            Copy student link
          </Menu.Item>

          <Menu.Divider />
          {live && (
            <Menu.Item
              leftSection={<FiBell />}
              disabled={note.audience === note.completed}
              onClick={() => notesAction('post', `${base}/nudge`)}
            >
              Remind students who haven’t studied it
            </Menu.Item>
          )}
          {!archived && (
            <Menu.Item
              leftSection={note.pinned ? <BsPinFill /> : <BsPin />}
              onClick={() => notesAction('post', `${base}/pin`)}
            >
              {note.pinned ? 'Unpin' : 'Pin to top for students'}
            </Menu.Item>
          )}
          <Menu.Item
            leftSection={note.allowDownload ? <FiEyeOff /> : <FiDownload />}
            onClick={() =>
              notesAction(
                'put',
                base,
                { allowDownload: !note.allowDownload },
                {
                  success: note.allowDownload
                    ? 'Students can now only view it'
                    : 'Students can now download it',
                },
              )
            }
            disabled={note.kind === 'LINK'}
          >
            {note.allowDownload ? 'Make view-only' : 'Allow downloads'}
          </Menu.Item>
          <Menu.Item
            leftSection={<FiCopy />}
            onClick={() => notesAction('post', `${base}/duplicate`)}
          >
            Duplicate as draft
          </Menu.Item>

          <Menu.Divider />
          {(live || note.status === 'SCHEDULED') && (
            <Menu.Item leftSection={<FiRotateCcw />} onClick={confirmUnpublish}>
              {note.status === 'SCHEDULED'
                ? 'Cancel schedule (back to draft)'
                : 'Unpublish (back to draft)'}
            </Menu.Item>
          )}
          {archived ? (
            <Menu.Item
              leftSection={<FiRefreshCw />}
              onClick={() => notesAction('post', `${base}/restore`)}
            >
              Restore from archive
            </Menu.Item>
          ) : (
            <Menu.Item leftSection={<FiArchive />} color="orange" onClick={confirmArchive}>
              Archive
            </Menu.Item>
          )}
          <Menu.Item leftSection={<FiTrash2 />} color="red" onClick={confirmDelete}>
            Delete permanently
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {element}
      {dialog === 'edit' && (
        <EditNoteModal
          note={note}
          opened
          onClose={() => setDialog(null)}
          context={context}
          topics={topics}
        />
      )}
      {dialog === 'share' && (
        <ShareNoteModal note={note} opened onClose={() => setDialog(null)} context={context} />
      )}
      {dialog === 'replace' && (
        <ReplaceFileModal note={note} opened onClose={() => setDialog(null)} context={context} />
      )}
    </div>
  );
}
