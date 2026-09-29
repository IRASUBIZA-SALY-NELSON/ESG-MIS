'use client';
import { Button, Modal, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import { FiLink } from 'react-icons/fi';
import { notesAction } from '../api';
import { TeacherNote, TeachingContext } from '../types';
import NoteFormFields, { NoteFormValues, formToMeta } from './NoteFormFields';

const toForm = (n: TeacherNote): NoteFormValues => ({
  courseId: n.courseId,
  classIds: n.classes.map((c) => c.id),
  termId: n.termId ?? null,
  topic: n.topic ?? '',
  description: n.description ?? '',
  readBy: n.readBy ?? null,
  allowDownload: n.allowDownload,
  pinned: n.pinned,
});

export default function EditNoteModal({
  note,
  opened,
  onClose,
  context,
  topics,
}: {
  note: TeacherNote;
  opened: boolean;
  onClose: () => void;
  context: TeachingContext;
  topics: string[];
}) {
  const [title, setTitle] = useState(note.title);
  const [linkUrl, setLinkUrl] = useState(note.linkUrl ?? '');
  const [form, setForm] = useState<NoteFormValues>(() => toForm(note));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (opened) {
      setTitle(note.title);
      setLinkUrl(note.linkUrl ?? '');
      setForm(toForm(note));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const live = note.status === 'PUBLISHED' || note.status === 'SCHEDULED';
  const invalid =
    !title.trim() ||
    !form.courseId ||
    (live && form.classIds.length === 0) ||
    (note.kind === 'LINK' && !linkUrl.trim());

  const save = async () => {
    setBusy(true);
    const body: Record<string, any> = { ...formToMeta(form), title: title.trim() };
    if (note.kind === 'LINK') body.linkUrl = linkUrl.trim();
    const res = await notesAction('put', `/notes/teaching/${note.id}`, body);
    setBusy(false);
    if (res) onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={() => !busy && onClose()}
      size="xl"
      title={<b className="text-primary text-lg">Edit note details</b>}
    >
      <div className="flex flex-col gap-3">
        <TextInput
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          maxLength={200}
        />
        {note.kind === 'LINK' && (
          <TextInput
            label="Link"
            required
            leftSection={<FiLink />}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.currentTarget.value)}
          />
        )}
        <NoteFormFields context={context} values={form} onChange={setForm} topics={topics} />
        {live && form.classIds.length === 0 && (
          <div className="text-sm text-orange-600">
            A published note must be shared with at least one class.
          </div>
        )}
        <div className="flex flex-row justify-end gap-2 pt-2 border-t">
          <Button variant="default" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button color="#024F3A" onClick={save} loading={busy} disabled={invalid}>
            Save changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
