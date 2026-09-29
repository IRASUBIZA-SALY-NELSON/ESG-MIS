'use client';
import { Badge, Progress, Tooltip } from '@mantine/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';
import {
  FaFile,
  FaFileAlt,
  FaFileArchive,
  FaFileAudio,
  FaFileExcel,
  FaFileImage,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileVideo,
  FaFileWord,
  FaLink,
} from 'react-icons/fa';
import { NoteCategory, NoteStatus } from './types';

dayjs.extend(relativeTime);

export const fmtBytes = (bytes?: number) => {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const plural = (n: number, word: string, many = `${word}s`) =>
  `${n} ${n === 1 ? word : many}`;

export const fromNow = (value?: string) => (value ? dayjs(value).fromNow() : '—');

export const fmtWhen = (value?: string) =>
  value ? dayjs(value).format('DD MMM YYYY, HH:mm') : '—';

const CATEGORY: Record<
  NoteCategory,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  pdf: { label: 'PDF', icon: FaFilePdf, color: 'text-red-600', bg: 'bg-red-50' },
  doc: { label: 'Word', icon: FaFileWord, color: 'text-blue-600', bg: 'bg-blue-50' },
  slides: { label: 'Slides', icon: FaFilePowerpoint, color: 'text-orange-600', bg: 'bg-orange-50' },
  sheet: { label: 'Spreadsheet', icon: FaFileExcel, color: 'text-green-700', bg: 'bg-green-50' },
  text: { label: 'Text / code', icon: FaFileAlt, color: 'text-slate-600', bg: 'bg-slate-100' },
  image: { label: 'Image', icon: FaFileImage, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
  video: { label: 'Video', icon: FaFileVideo, color: 'text-violet-600', bg: 'bg-violet-50' },
  audio: { label: 'Audio', icon: FaFileAudio, color: 'text-cyan-700', bg: 'bg-cyan-50' },
  archive: { label: 'Archive', icon: FaFileArchive, color: 'text-amber-700', bg: 'bg-amber-50' },
  link: { label: 'Link', icon: FaLink, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  other: { label: 'File', icon: FaFile, color: 'text-gray-500', bg: 'bg-gray-100' },
};

export const categoryLabel = (c?: NoteCategory) => CATEGORY[c ?? 'other']?.label ?? 'File';

export const FileTypeIcon = ({
  category,
  size = 'md',
}: {
  category?: NoteCategory;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const c = CATEGORY[category ?? 'other'] ?? CATEGORY.other;
  const Icon = c.icon;
  const box =
    size === 'sm'
      ? 'h-8 w-8 text-base'
      : size === 'lg'
        ? 'h-14 w-14 text-3xl'
        : 'h-10 w-10 text-xl';
  return (
    <span
      className={`${box} ${c.bg} ${c.color} shrink-0 rounded-lg flex items-center justify-center`}
    >
      <Icon />
    </span>
  );
};

const STATUS: Record<NoteStatus, { label: string; color: string; hint: string }> = {
  PUBLISHED: { label: 'Published', color: 'teal', hint: 'Students can see this note' },
  SCHEDULED: {
    label: 'Scheduled',
    color: 'blue',
    hint: 'Students will see it at the release time',
  },
  DRAFT: { label: 'Draft', color: 'gray', hint: 'Only you can see this note' },
  ARCHIVED: {
    label: 'Archived',
    color: 'orange',
    hint: 'Hidden from students, kept for your records',
  },
};

export const NoteStatusBadge = ({
  status,
  publishAt,
}: {
  status: NoteStatus;
  publishAt?: string;
}) => {
  const s = STATUS[status] ?? STATUS.DRAFT;
  return (
    <Tooltip
      label={status === 'SCHEDULED' && publishAt ? `Releases ${fmtWhen(publishAt)}` : s.hint}
    >
      <Badge color={s.color} variant={status === 'PUBLISHED' ? 'filled' : 'light'} radius="sm">
        {s.label}
      </Badge>
    </Tooltip>
  );
};

export const statusLabel = (s: NoteStatus) => STATUS[s]?.label ?? s;

export const reachColor = (pct: number) => (pct >= 80 ? 'teal' : pct >= 50 ? 'yellow' : 'red');

/** "5 / 8 opened" with a coloured bar, plus completed count underneath. */
export const ReachBar = ({
  opened,
  audience,
  completed,
  compact = false,
}: {
  opened: number;
  audience: number;
  completed?: number;
  compact?: boolean;
}) => {
  if (!audience) return <span className="text-xs text-gray-400">No students yet</span>;
  const pct = Math.round((opened * 100) / audience);
  return (
    <Tooltip
      label={`${opened} of ${audience} students opened it${
        completed !== undefined ? ` · ${completed} marked it as studied` : ''
      }`}
    >
      <div className={`flex flex-col gap-1 ${compact ? 'w-24' : 'w-32'}`}>
        <div className="flex flex-row justify-between text-xs">
          <span className="font-medium text-primary">
            {opened}/{audience}
          </span>
          <span className="text-gray-500">{pct}%</span>
        </div>
        <Progress value={pct} color={reachColor(pct)} size="sm" radius="xl" />
        {completed !== undefined && !compact && (
          <span className="text-[11px] text-gray-500">{completed} studied</span>
        )}
      </div>
    </Tooltip>
  );
};

export const termName = (name?: string) => {
  if (!name) return '—';
  const base = name
    .replace(/_?TERM$/i, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .trim();
  return `${base.charAt(0).toUpperCase()}${base.slice(1)} term`;
};
