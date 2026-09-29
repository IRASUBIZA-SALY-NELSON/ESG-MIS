'use client';
import {
  ActionIcon,
  Button,
  Divider,
  Modal,
  Progress,
  SegmentedControl,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiLink, FiUpload, FiX, FiAlertCircle } from 'react-icons/fi';
import { errorMessage, refreshNotes, uploadNote } from '../api';
import { FileTypeIcon, fmtBytes, plural } from '../helpers';
import { NoteCategory, TeachingContext } from '../types';
import FileDrop, { categoryOfFile, titleFromFile, validateFile } from './FileDrop';
import NoteFormFields, {
  NoteFormValues,
  PublishHint,
  audienceSize,
  emptyForm,
  formToMeta,
} from './NoteFormFields';

type Mode = 'files' | 'link';
type When = 'NOW' | 'SCHEDULE' | 'DRAFT';

interface QueuedFile {
  key: string;
  file: File;
  title: string;
  error: string | null;
  progress: number;
  state: 'ready' | 'uploading' | 'done' | 'failed';
}

export default function UploadNotesModal({
  opened,
  onClose,
  context,
  topics,
  defaultCourseId,
  initialMode = 'files',
}: {
  opened: boolean;
  onClose: () => void;
  context: TeachingContext;
  topics: string[];
  defaultCourseId?: string | null;
  initialMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [link, setLink] = useState({ url: '', title: '' });
  const [form, setForm] = useState<NoteFormValues>(() => emptyForm(context, defaultCourseId));
  const [when, setWhen] = useState<When>('NOW');
  const [publishAt, setPublishAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (opened) {
      setMode(initialMode);
      setFiles([]);
      setLink({ url: '', title: '' });
      setForm(emptyForm(context, defaultCourseId));
      setWhen('NOW');
      setPublishAt(null);
    }
    // Reset only when the modal opens; context refreshes must not wipe what the teacher typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const course = context.courses.find((c) => c.id === form.courseId);
  const classNames =
    course?.classes.filter((c) => form.classIds.includes(c.id)).map((c) => c.name) ?? [];
  const students = audienceSize(context, form);

  const addFiles = (list: File[]) =>
    setFiles((prev) => [
      ...prev,
      ...list.map((file) => ({
        key: `${file.name}-${file.size}-${Math.random()}`,
        file,
        title: titleFromFile(file.name),
        error: validateFile(file, context.maxFileMb, context.allowedTypes),
        progress: 0,
        state: 'ready' as const,
      })),
    ]);

  const pending = files.filter((f) => f.state !== 'done' && !f.error);
  const scheduleInvalid = when === 'SCHEDULE' && (!publishAt || !dayjs(publishAt).isAfter(dayjs()));
  const invalid =
    !form.courseId ||
    (when !== 'DRAFT' && form.classIds.length === 0) ||
    scheduleInvalid ||
    (mode === 'files'
      ? pending.length === 0 || pending.some((f) => !f.title.trim())
      : !link.url.trim() || !link.title.trim());

  const actionLabel = useMemo(() => {
    const n = mode === 'files' ? pending.length : 1;
    const noun = n === 1 ? 'note' : `${n} notes`;
    if (when === 'DRAFT') return `Save ${noun} as draft`;
    if (when === 'SCHEDULE') return `Schedule ${noun}`;
    return `Publish ${noun}`;
  }, [mode, pending.length, when]);

  const baseMeta = () => ({
    ...formToMeta(form),
    publish: when,
    publishAt: when === 'SCHEDULE' ? publishAt : null,
  });

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === 'link') {
        const res = await uploadNote(
          { ...baseMeta(), kind: 'LINK', linkUrl: link.url.trim(), title: link.title.trim() },
          null,
        );
        notifications.show({
          title: 'Link shared',
          message: res?.message ?? 'Saved',
          color: 'teal',
        });
        refreshNotes();
        onClose();
        return;
      }
      let ok = 0;
      for (const item of pending) {
        const update = (patch: Partial<QueuedFile>) =>
          setFiles((prev) => prev.map((f) => (f.key === item.key ? { ...f, ...patch } : f)));
        update({ state: 'uploading', progress: 0, error: null });
        try {
          await uploadNote(
            { ...baseMeta(), kind: 'FILE', title: item.title.trim() },
            item.file,
            (p) => update({ progress: p }),
          );
          update({ state: 'done', progress: 100 });
          ok++;
        } catch (e) {
          update({ state: 'failed', error: await errorMessage(e) });
        }
      }
      refreshNotes();
      const failed = pending.length - ok;
      if (ok) {
        notifications.show({
          title:
            when === 'DRAFT'
              ? 'Saved as drafts'
              : when === 'SCHEDULE'
                ? 'Scheduled'
                : 'Notes shared',
          message:
            when === 'NOW'
              ? `${plural(ok, 'note')} now visible to ${plural(students, 'student')}`
              : `${plural(ok, 'note')} saved${failed ? `, ${failed} failed` : ''}`,
          color: 'teal',
        });
      }
      if (!failed) onClose();
    } catch (e) {
      notifications.show({
        title: 'Could not share',
        message: await errorMessage(e),
        color: 'red',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => !busy && onClose()}
      size="xl"
      title={<b className="text-primary text-lg">Share new notes</b>}
      closeOnClickOutside={!busy}
    >
      <div className="flex flex-col gap-4">
        <SegmentedControl
          value={mode}
          onChange={(v) => setMode(v as Mode)}
          disabled={busy}
          data={[
            {
              value: 'files',
              label: (
                <span className="flex items-center gap-2 justify-center">
                  <FiUpload /> Upload files
                </span>
              ),
            },
            {
              value: 'link',
              label: (
                <span className="flex items-center gap-2 justify-center">
                  <FiLink /> Share a link
                </span>
              ),
            },
          ]}
          fullWidth
        />

        {mode === 'files' ? (
          <div className="flex flex-col gap-2">
            <FileDrop
              onFiles={addFiles}
              maxMb={context.maxFileMb}
              allowedTypes={context.allowedTypes}
              compact={files.length > 0}
            />
            {files.length > 0 && (
              <div className="flex flex-col divide-y border rounded-lg max-h-72 overflow-y-auto">
                {files.map((f) => (
                  <div key={f.key} className="flex flex-row items-center gap-3 p-2.5">
                    <FileTypeIcon
                      category={categoryOfFile(f.file.name) as NoteCategory}
                      size="sm"
                    />
                    <div className="flex flex-col flex-1 min-w-0 gap-1">
                      <TextInput
                        size="xs"
                        value={f.title}
                        onChange={(e) => {
                          const title = e.currentTarget.value;
                          setFiles((prev) =>
                            prev.map((x) => (x.key === f.key ? { ...x, title } : x)),
                          );
                        }}
                        disabled={busy || f.state === 'done'}
                        placeholder="Title students will see"
                        error={!f.title.trim() && !f.error ? 'Title required' : undefined}
                      />
                      <div className="flex flex-row items-center gap-2 text-xs text-gray-500 truncate">
                        <span className="truncate">{f.file.name}</span>
                        <span>· {fmtBytes(f.file.size)}</span>
                        {f.error && (
                          <span className="text-red-600 flex items-center gap-1">
                            <FiAlertCircle /> {f.error}
                          </span>
                        )}
                      </div>
                      {f.state === 'uploading' && (
                        <Progress value={f.progress} size="xs" animated color="#024F3A" />
                      )}
                    </div>
                    {f.state === 'done' ? (
                      <FiCheckCircle className="text-teal-600 text-xl shrink-0" />
                    ) : f.state === 'uploading' ? (
                      <span className="text-xs text-gray-500 w-10 text-right">{f.progress}%</span>
                    ) : (
                      <Tooltip label="Remove">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          disabled={busy}
                          onClick={() => setFiles((prev) => prev.filter((x) => x.key !== f.key))}
                        >
                          <FiX />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="Link"
              placeholder="https://…"
              required
              leftSection={<FiLink />}
              value={link.url}
              onChange={(e) => setLink({ ...link, url: e.currentTarget.value })}
              description="YouTube videos play right inside the notes page"
            />
            <TextInput
              label="Title"
              placeholder="e.g. Khan Academy — Limits"
              required
              value={link.title}
              onChange={(e) => setLink({ ...link, title: e.currentTarget.value })}
            />
          </div>
        )}

        <Divider label="Who and how" labelPosition="left" />
        <NoteFormFields context={context} values={form} onChange={setForm} topics={topics} />

        <Divider label="When students see it" labelPosition="left" />
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <SegmentedControl
            value={when}
            onChange={(v) => setWhen(v as When)}
            data={[
              { value: 'NOW', label: 'Publish now' },
              { value: 'SCHEDULE', label: 'Schedule' },
              { value: 'DRAFT', label: 'Save as draft' },
            ]}
            color="#024F3A"
          />
          {when === 'SCHEDULE' && (
            <DateTimePicker
              placeholder="Release date and time"
              value={publishAt}
              onChange={setPublishAt}
              minDate={new Date()}
              valueFormat="DD MMM YYYY, HH:mm"
              className="flex-1"
              error={publishAt && scheduleInvalid ? 'Pick a time in the future' : undefined}
              clearable
            />
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t">
          {when === 'DRAFT' ? (
            <span className="text-sm text-gray-600">
              Only you will see drafts until you publish them.
            </span>
          ) : (
            <PublishHint students={students} classes={classNames} />
          )}
          <div className="flex flex-row gap-2 justify-end">
            <Button variant="default" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button color="#024F3A" onClick={submit} loading={busy} disabled={invalid}>
              {actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
