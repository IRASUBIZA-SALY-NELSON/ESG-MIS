'use client';
import { Button, Loader, ScrollArea, Table } from '@mantine/core';
import React, { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiExternalLink, FiEyeOff } from 'react-icons/fi';
import { errorMessage, fetchNoteBlob } from './api';
import { FileTypeIcon, categoryLabel, fmtBytes } from './helpers';
import { PreviewableNote } from './types';

const OFFICE = new Set(['doc', 'slides', 'sheet']);
const MAX_TEXT = 400_000;

const youtubeId = (url?: string) => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
};

const parseCsv = (text: string) =>
  text
    .split(/\r?\n/)
    .filter((l) => l.trim().length)
    .slice(0, 300)
    .map((line) => {
      const cells: string[] = [];
      let cur = '';
      let quoted = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (quoted && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else quoted = !quoted;
        } else if (ch === ',' && !quoted) {
          cells.push(cur);
          cur = '';
        } else cur += ch;
      }
      cells.push(cur);
      return cells;
    });

const Placeholder = ({
  note,
  title,
  message,
  action,
  busy,
}: {
  note: PreviewableNote;
  title: string;
  message?: React.ReactNode;
  action?: React.ReactNode;
  busy?: boolean;
}) => (
  <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center gap-3 p-8 bg-gray-50 rounded-lg">
    {busy ? <Loader color="#024F3A" /> : <FileTypeIcon category={note.category} size="lg" />}
    <div className="font-semibold text-primary">{title}</div>
    {message && <div className="text-sm text-gray-500 max-w-md">{message}</div>}
    {action}
  </div>
);

/**
 * Renders a note inline: PDFs (and office files converted to PDF), images, audio/video,
 * text/code, CSV tables and links. Everything is fetched with the user's token as a blob.
 */
export default function NotePreview({
  note,
  canDownload,
  onDownload,
  onOpenLink,
  onPendingRefresh,
  height = '70vh',
}: {
  note: PreviewableNote;
  canDownload: boolean;
  onDownload?: () => void;
  onOpenLink?: () => void;
  onPendingRefresh?: () => void;
  height?: number | string;
}) {
  const office = OFFICE.has(note.category);
  const needsBlob =
    note.kind === 'FILE' &&
    (['pdf', 'image', 'video', 'audio', 'text'].includes(note.category) ||
      (office && note.previewStatus === 'READY'));
  const isCsv = (note.fileName ?? '').toLowerCase().endsWith('.csv');
  const isCode = !/\.(txt|md|csv)$/i.test(note.fileName ?? '');

  const [url, setUrl] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!needsBlob) return;
    let revoked: string | null = null;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setUrl(null);
    setText(null);
    fetchNoteBlob(note.id, office)
      .then(async (blob) => {
        if (cancelled) return;
        if (note.category === 'text') {
          const t = await blob.text();
          setText(
            t.length > MAX_TEXT ? `${t.slice(0, MAX_TEXT)}\n\n… (download to see the rest)` : t,
          );
        } else {
          revoked = URL.createObjectURL(blob);
          setUrl(revoked);
        }
      })
      .catch(async (e) => !cancelled && setError(await errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [note.id, note.category, note.previewStatus, needsBlob, office]);

  useEffect(() => {
    if (!(office && note.previewStatus === 'PENDING') || !onPendingRefresh) return;
    const timer = setInterval(onPendingRefresh, 4000);
    return () => clearInterval(timer);
  }, [office, note.previewStatus, onPendingRefresh]);

  const csvRows = useMemo(() => (isCsv && text ? parseCsv(text) : null), [isCsv, text]);

  const downloadBtn = canDownload && onDownload && (
    <Button leftSection={<FiDownload />} onClick={onDownload} color="#024F3A">
      Download {note.sizeBytes ? `(${fmtBytes(note.sizeBytes)})` : ''}
    </Button>
  );

  const frame = (child: React.ReactNode) => (
    <div style={{ height }} className="w-full rounded-lg border overflow-hidden bg-gray-100">
      {child}
    </div>
  );

  if (note.kind === 'LINK') {
    const yt = youtubeId(note.linkUrl);
    if (yt) {
      return frame(
        <iframe
          title={note.title}
          src={`https://www.youtube-nocookie.com/embed/${yt}`}
          className="w-full h-full"
          allow="accelerometer; encrypted-media; picture-in-picture"
          allowFullScreen
        />,
      );
    }
    return (
      <Placeholder
        note={note}
        title="This note is a web link"
        message={<span className="break-all">{note.linkUrl}</span>}
        action={
          <Button leftSection={<FiExternalLink />} color="#024F3A" onClick={onOpenLink}>
            Open link in a new tab
          </Button>
        }
      />
    );
  }

  if (office && note.previewStatus === 'PENDING') {
    return (
      <Placeholder
        note={note}
        busy
        title={`Preparing a preview of this ${categoryLabel(note.category).toLowerCase()} file…`}
        message="This takes a few seconds after upload. The page updates by itself."
        action={downloadBtn}
      />
    );
  }

  if (!needsBlob) {
    return (
      <Placeholder
        note={note}
        title="No preview for this file"
        message={
          office
            ? 'We could not convert this document for preview. Download it to open it in Word, PowerPoint or Excel.'
            : `${note.fileName ?? 'This file'} cannot be shown in the browser.`
        }
        action={downloadBtn}
      />
    );
  }

  if (loading) {
    return <Placeholder note={note} busy title="Opening…" />;
  }
  if (error) {
    return (
      <Placeholder
        note={note}
        title="Could not open this note"
        message={error}
        action={downloadBtn}
      />
    );
  }

  if (text !== null) {
    if (csvRows && csvRows.length) {
      return frame(
        <ScrollArea h="100%" type="auto" className="bg-white">
          <Table striped withTableBorder withColumnBorders stickyHeader className="text-sm">
            <Table.Thead>
              <Table.Tr>
                {csvRows[0].map((h, i) => (
                  <Table.Th key={i}>{h}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {csvRows.slice(1).map((r, i) => (
                <Table.Tr key={i}>
                  {r.map((c, j) => (
                    <Table.Td key={j}>{c}</Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>,
      );
    }
    return frame(
      <ScrollArea h="100%" type="auto" className="bg-white">
        <pre
          className={`p-6 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800 ${
            isCode ? 'font-mono bg-slate-50' : 'font-sans'
          }`}
        >
          {text}
        </pre>
      </ScrollArea>,
    );
  }

  if (!url) return null;

  if (note.category === 'image') {
    return frame(
      <div className="w-full h-full flex items-center justify-center bg-[repeating-conic-gradient(#f3f4f6_0%_25%,#fff_0%_50%)] bg-[length:20px_20px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={note.title} className="max-w-full max-h-full object-contain" />
      </div>,
    );
  }
  if (note.category === 'video') {
    return frame(
      <video
        src={url}
        controls
        className="w-full h-full bg-black"
        controlsList={canDownload ? undefined : 'nodownload'}
      />,
    );
  }
  if (note.category === 'audio') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-10 bg-gray-50 rounded-lg">
        <FileTypeIcon category="audio" size="lg" />
        <audio
          src={url}
          controls
          className="w-full max-w-lg"
          controlsList={canDownload ? undefined : 'nodownload'}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {!canDownload && (
        <div className="flex flex-row items-center gap-2 text-xs text-orange-700 bg-orange-50 rounded px-3 py-1.5">
          <FiEyeOff /> View-only: your teacher turned off downloads for this note.
        </div>
      )}
      {frame(
        <iframe
          title={note.title}
          src={`${url}#toolbar=${canDownload ? 1 : 0}&navpanes=0`}
          className="w-full h-full bg-white"
        />,
      )}
    </div>
  );
}
