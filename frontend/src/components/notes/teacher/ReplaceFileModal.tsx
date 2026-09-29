'use client';
import { Alert, Button, Modal, Progress } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { errorMessage, refreshNotes, replaceNoteFile } from '../api';
import { FileTypeIcon, fmtBytes } from '../helpers';
import { NoteCategory, TeacherNote, TeachingContext } from '../types';
import FileDrop, { categoryOfFile, validateFile } from './FileDrop';

export default function ReplaceFileModal({
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
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (opened) {
      setFile(null);
      setProgress(0);
    }
  }, [opened]);

  const error = file ? validateFile(file, context.maxFileMb, context.allowedTypes) : null;

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const res = await replaceNoteFile(note.id, file, setProgress);
      notifications.show({
        title: 'File replaced',
        message: res?.message ?? 'Done',
        color: 'teal',
      });
      refreshNotes();
      onClose();
    } catch (e) {
      notifications.show({ title: 'Upload failed', message: await errorMessage(e), color: 'red' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => !busy && onClose()}
      size="lg"
      title={<b className="text-primary text-lg">Replace file</b>}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center gap-3 rounded-lg bg-gray-50 p-3">
          <FileTypeIcon category={note.category} size="sm" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-primary truncate">{note.fileName}</span>
            <span className="text-xs text-gray-500">
              Current version {note.version ?? 1} · {fmtBytes(note.sizeBytes)}
            </span>
          </div>
        </div>
        <Alert icon={<FiInfo />} color="blue" variant="light">
          Students keep their progress. Anyone who already opened this note will see it marked as{' '}
          <b>Updated</b>.
        </Alert>
        <FileDrop
          onFiles={(f) => setFile(f[0])}
          multiple={false}
          maxMb={context.maxFileMb}
          allowedTypes={context.allowedTypes}
          compact={!!file}
        />
        {file && (
          <div className="flex flex-row items-center gap-3 border rounded-lg p-3">
            <FileTypeIcon category={categoryOfFile(file.name) as NoteCategory} size="sm" />
            <div className="flex flex-col flex-1 min-w-0 gap-1">
              <span className="text-sm font-medium truncate">{file.name}</span>
              <span className={`text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
                {error ?? fmtBytes(file.size)}
              </span>
              {busy && <Progress value={progress} size="xs" animated color="#024F3A" />}
            </div>
          </div>
        )}
        <div className="flex flex-row justify-end gap-2 pt-2 border-t">
          <Button variant="default" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button color="#024F3A" onClick={upload} loading={busy} disabled={!file || !!error}>
            Upload new version
          </Button>
        </div>
      </div>
    </Modal>
  );
}
