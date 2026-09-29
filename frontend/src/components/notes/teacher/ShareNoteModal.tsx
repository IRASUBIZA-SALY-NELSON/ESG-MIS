'use client';
import { Alert, Button, Checkbox, Modal, SegmentedControl, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { FiBell, FiCopy, FiInfo } from 'react-icons/fi';
import { copyText, notesAction, studentNoteLink } from '../api';
import { NoteStatusBadge, ReachBar, fmtWhen, plural } from '../helpers';
import { TeacherNote, TeachingContext } from '../types';

type When = 'NOW' | 'SCHEDULE';

/** Choose which classes get the note, publish or schedule it, copy the student link and nudge readers. */
export default function ShareNoteModal({
  note,
  opened,
  onClose,
  context,
}: {
  note: TeacherNote;
  opened: boolean;
  onClose: () => void;
  context: TeachingContext;
}) {
  const course = context.courses.find((c) => c.id === note.courseId);
  const [classIds, setClassIds] = useState<string[]>(note.classes.map((c) => c.id));
  const [when, setWhen] = useState<When>('NOW');
  const [publishAt, setPublishAt] = useState<string | null>(note.publishAt ?? null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setClassIds(note.classes.map((c) => c.id));
      setWhen(note.status === 'SCHEDULED' ? 'SCHEDULE' : 'NOW');
      setPublishAt(note.publishAt ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const classes = course?.classes ?? note.classes;
  const students = classes
    .filter((c) => classIds.includes(c.id))
    .reduce((s, c) => s + c.students, 0);
  const audienceChanged =
    classIds.length !== note.classes.length ||
    classIds.some((id) => !note.classes.find((c) => c.id === id));
  const live = note.status === 'PUBLISHED';
  const scheduleInvalid = when === 'SCHEDULE' && (!publishAt || !dayjs(publishAt).isAfter(dayjs()));
  const link = studentNoteLink(note.id);

  const saveAudience = async () => {
    if (!audienceChanged) return true;
    return !!(await notesAction(
      'put',
      `/notes/teaching/${note.id}`,
      { classIds },
      { silent: true },
    ));
  };

  const publish = async () => {
    setBusy('publish');
    if (await saveAudience()) {
      const res = await notesAction('post', `/notes/teaching/${note.id}/publish`, {
        publishAt: when === 'SCHEDULE' ? publishAt : null,
      });
      if (res) onClose();
    }
    setBusy(null);
  };

  const updateAudience = async () => {
    setBusy('audience');
    const res = await notesAction(
      'put',
      `/notes/teaching/${note.id}`,
      { classIds },
      { success: `Now shared with ${plural(students, 'student')}` },
    );
    setBusy(null);
    if (res) onClose();
  };

  const nudge = async () => {
    setBusy('nudge');
    await notesAction('post', `/notes/teaching/${note.id}/nudge`);
    setBusy(null);
  };

  return (
    <Modal
      opened={opened}
      onClose={() => !busy && onClose()}
      size="lg"
      title={<b className="text-primary text-lg">Share “{note.title}”</b>}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-3">
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center gap-2">
              <NoteStatusBadge status={note.status} publishAt={note.publishAt} />
              <span className="text-sm text-gray-600">{note.courseName}</span>
            </div>
            {note.status === 'SCHEDULED' && (
              <span className="text-xs text-gray-500">Releases {fmtWhen(note.publishAt)}</span>
            )}
          </div>
          {(live || note.status === 'ARCHIVED') && (
            <ReachBar opened={note.opened} audience={note.audience} completed={note.completed} />
          )}
        </div>

        <div>
          <div className="text-sm font-medium mb-1">Classes that can see it</div>
          <div className="flex flex-row flex-wrap gap-2">
            {classes.map((c) => {
              const checked = classIds.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex flex-row items-center gap-2 rounded-md border px-3 py-2 cursor-pointer ${checked ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}
                >
                  <Checkbox
                    checked={checked}
                    color="#024F3A"
                    onChange={(e) =>
                      setClassIds(
                        e.currentTarget.checked
                          ? [...classIds, c.id]
                          : classIds.filter((id) => id !== c.id),
                      )
                    }
                  />
                  <span className="text-sm font-medium text-primary">{c.name}</span>
                  <span className="text-xs text-gray-500">{c.students} students</span>
                </label>
              );
            })}
          </div>
          <div className="text-xs text-gray-500 mt-1">{plural(students, 'student')} selected</div>
        </div>

        {note.status === 'ARCHIVED' ? (
          <Alert icon={<FiInfo />} color="orange" variant="light">
            This note is archived. Publishing it makes it visible to the selected classes again.
          </Alert>
        ) : null}

        {!live && (
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <SegmentedControl
              value={when}
              onChange={(v) => setWhen(v as When)}
              data={[
                { value: 'NOW', label: 'Publish now' },
                { value: 'SCHEDULE', label: 'Schedule' },
              ]}
              color="#024F3A"
            />
            {when === 'SCHEDULE' && (
              <DateTimePicker
                className="flex-1"
                placeholder="Release date and time"
                value={publishAt}
                onChange={setPublishAt}
                minDate={new Date()}
                valueFormat="DD MMM YYYY, HH:mm"
                error={publishAt && scheduleInvalid ? 'Pick a time in the future' : undefined}
              />
            )}
          </div>
        )}

        <TextInput
          label="Student link"
          description="Send it on your class group chat — students in the selected classes open the note straight away after logging in."
          value={link}
          readOnly
          rightSectionWidth={90}
          rightSection={
            <Button
              size="compact-xs"
              variant="light"
              leftSection={<FiCopy />}
              onClick={() => copyText(link, 'Student link')}
            >
              Copy
            </Button>
          }
        />

        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t">
          {live ? (
            <Button
              variant="light"
              color="orange"
              leftSection={<FiBell />}
              onClick={nudge}
              loading={busy === 'nudge'}
              disabled={!!busy || note.audience === note.completed}
            >
              Remind students who haven’t studied it
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-row gap-2 justify-end">
            <Button variant="default" onClick={onClose} disabled={!!busy}>
              Close
            </Button>
            {live ? (
              <Button
                color="#024F3A"
                onClick={updateAudience}
                loading={busy === 'audience'}
                disabled={!audienceChanged || classIds.length === 0 || !!busy}
              >
                Update classes
              </Button>
            ) : (
              <Button
                color="#024F3A"
                onClick={publish}
                loading={busy === 'publish'}
                disabled={classIds.length === 0 || scheduleInvalid || !!busy}
              >
                {when === 'SCHEDULE'
                  ? 'Schedule release'
                  : `Publish to ${plural(students, 'student')}`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
