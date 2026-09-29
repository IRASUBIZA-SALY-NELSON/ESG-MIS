'use client';
import { Alert, Badge, Loader } from '@mantine/core';
import dayjs from 'dayjs';
import React from 'react';
import { Released } from './types';

export const termLabel = (name?: string) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

export const pct = (value?: number | null) =>
  value === undefined || value === null ? '—' : `${value.toFixed(1)}%`;

export const num = (value?: number | null) =>
  value === undefined || value === null
    ? '—'
    : Number.isInteger(value)
      ? `${value}`
      : value.toFixed(1);

export const fmtDate = (value?: string) => (value ? dayjs(value).format('DD MMM YYYY') : '—');

export const fmtDateTime = (value?: string) =>
  value ? dayjs(value).format('DD MMM YYYY, HH:mm') : '—';

export const ordinal = (n?: number) => {
  if (!n) return '—';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const scoreColor = (percentage?: number, pass = 50) => {
  if (percentage === undefined || percentage === null) return 'gray';
  if (percentage >= 70) return 'teal';
  if (percentage >= pass) return 'blue';
  return 'red';
};

export const StatusBadge = ({ status }: { status?: string }) => {
  const colors: Record<string, string> = {
    PASS: 'teal',
    FAIL: 'red',
    PENDING: 'gray',
    OPEN: 'orange',
    ANSWERED: 'teal',
    CLOSED: 'gray',
    APPROVED: 'teal',
    ACCEPTED: 'teal',
    REJECTED: 'red',
    PROMOTED: 'teal',
    SITTING: 'orange',
    REPEATING: 'red',
    IN_PROGRESS: 'blue',
    ACTIVE: 'teal',
    CANCELLED: 'gray',
  };
  if (!status) return null;
  return (
    <Badge color={colors[status] ?? 'gray'} variant="light" radius="sm">
      {status.replace('_', ' ')}
    </Badge>
  );
};

export const ReleaseNote = ({ released }: { released: Released }) => {
  if (released === 'EXAM') return null;
  return (
    <Alert
      color={released === 'NONE' ? 'gray' : 'blue'}
      variant="light"
      radius="md"
      className="mb-3"
    >
      {released === 'NONE'
        ? 'The school has not released marks for this term yet.'
        : 'Only continuous assessment (CAT) marks are released for this term. Exam marks will appear once the school publishes them.'}
    </Alert>
  );
};

export const StatCard = ({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: 'default' | 'good' | 'warn' | 'bad';
}) => {
  const toneClass = {
    default: 'border-gray-200',
    good: 'border-teal-300',
    warn: 'border-orange-300',
    bad: 'border-red-300',
  }[tone];
  return (
    <div className={`bg-white rounded-lg border-l-4 ${toneClass} border p-4 flex flex-col gap-1`}>
      <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      <span className="text-2xl font-semibold text-primary">{value}</span>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  );
};

export const Section = ({
  title,
  action,
  children,
  className = '',
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`bg-white rounded-lg border p-4 ${className}`}>
    {(title || action) && (
      <div className="flex flex-row items-center justify-between gap-3 mb-3 flex-wrap">
        {title && <h3 className="font-semibold text-primary">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </section>
);

export const LoadingBlock = ({ label = 'Loading…' }: { label?: string }) => (
  <div className="flex flex-row items-center gap-3 justify-center py-16 text-gray-500">
    <Loader size="sm" color="#024F3A" />
    <span>{label}</span>
  </div>
);

export const ErrorBlock = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <Alert color="red" variant="light" radius="md" title="Something went wrong">
    <div className="flex flex-row items-center gap-3 flex-wrap">
      <span>{message}</span>
      {onRetry && (
        <button className="underline text-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  </Alert>
);

export const EmptyBlock = ({ children }: { children: React.ReactNode }) => (
  <div className="text-center text-gray-500 py-10 text-sm">{children}</div>
);
