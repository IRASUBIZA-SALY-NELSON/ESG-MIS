'use client';
import { Badge, Pagination, ScrollArea, Select, Table } from '@mantine/core';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { CopyStatus, Loan } from './types';

export {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Section,
  fmtDate,
  fmtDateTime,
} from '@/components/parent/ui';

export const daysLeft = (due?: string) =>
  due ? dayjs(due).diff(dayjs().startOf('day'), 'day') : 0;

export const titleCase = (value?: string) =>
  (value ?? '')
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export const PageHeader = ({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) => (
  <div className="flex flex-row flex-wrap items-end justify-between gap-3 mb-4 mt-2">
    <div>
      <h1 className="text-xl font-semibold text-primary">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-row flex-wrap gap-2">{actions}</div>}
  </div>
);

const tones = {
  navy: { bar: 'bg-primary', icon: 'bg-primary/10 text-primary' },
  teal: { bar: 'bg-teal-500', icon: 'bg-teal-50 text-teal-600' },
  orange: { bar: 'bg-orange-400', icon: 'bg-orange-50 text-orange-500' },
  red: { bar: 'bg-red-500', icon: 'bg-red-50 text-red-500' },
  blue: { bar: 'bg-blue-500', icon: 'bg-blue-50 text-blue-600' },
  violet: { bar: 'bg-violet-500', icon: 'bg-violet-50 text-violet-600' },
  gold: { bar: 'bg-accent', icon: 'bg-accent-light text-accent-dark' },
};
export type Tone = keyof typeof tones;

export const KpiCard = ({
  label,
  value,
  hint,
  icon,
  tone = 'navy',
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: Tone;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden bg-white rounded-lg border p-4 flex flex-row items-start gap-3 ${
      onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
    }`}
  >
    <span className={`absolute left-0 top-0 h-full w-1 ${tones[tone].bar}`} />
    {icon && (
      <span className={`rounded-lg p-2.5 text-xl shrink-0 ${tones[tone].icon}`}>{icon}</span>
    )}
    <div className="flex flex-col min-w-0">
      <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      <span className="text-2xl font-semibold text-primary leading-tight">{value}</span>
      {hint && <span className="text-xs text-gray-500 mt-0.5">{hint}</span>}
    </div>
  </div>
);

const copyColors: Record<CopyStatus, string> = {
  AVAILABLE: 'teal',
  BORROWED: 'blue',
  LOST: 'red',
  DAMAGED: 'orange',
  RETIRED: 'gray',
};

export const CopyStatusBadge = ({ status }: { status?: CopyStatus }) =>
  status ? (
    <Badge color={copyColors[status] ?? 'gray'} variant="light" radius="sm">
      {titleCase(status)}
    </Badge>
  ) : null;

export const LoanStatusBadge = ({ loan }: { loan: Loan }) => {
  if (loan.status === 'LOST')
    return (
      <Badge color="red" variant="filled" radius="sm">
        Lost
      </Badge>
    );
  if (loan.status === 'RETURNED')
    return (
      <Badge color={loan.daysOverdue > 0 ? 'orange' : 'gray'} variant="light" radius="sm">
        {loan.daysOverdue > 0 ? `Returned ${loan.daysOverdue}d late` : 'Returned'}
      </Badge>
    );
  if (loan.overdue)
    return (
      <Badge color="red" variant="light" radius="sm">
        Overdue {loan.daysOverdue}d
      </Badge>
    );
  if (loan.dueSoon)
    return (
      <Badge color="orange" variant="light" radius="sm">
        Due {daysLeft(loan.dueDate) === 0 ? 'today' : `in ${daysLeft(loan.dueDate)}d`}
      </Badge>
    );
  return (
    <Badge color="blue" variant="light" radius="sm">
      On loan
    </Badge>
  );
};

export const RoleBadge = ({ role }: { role?: string }) =>
  role ? (
    <Badge
      color={role === 'STUDENT' ? 'indigo' : role === 'TEACHER' ? 'grape' : 'cyan'}
      variant="outline"
      radius="sm"
      size="sm"
    >
      {titleCase(role)}
    </Badge>
  ) : null;

// ------------------------------------------------------------------ data table

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number | undefined | null;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

/** Sortable, paginated table with a sticky header — used by every librarian list. */
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  pageSizeOptions = [10, 25, 50, 100],
  initialPageSize = 10,
  empty = 'Nothing to show',
  onRowClick,
  rowClassName,
  defaultSort,
}: {
  rows: T[];
  columns: Column<T>[];
  pageSizeOptions?: number[];
  initialPageSize?: number;
  empty?: React.ReactNode;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  defaultSort?: { key: string; dir: 'asc' | 'desc' };
}) {
  const [sort, setSort] = useState(defaultSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va === vb) return 0;
      if (va === undefined || va === null) return 1;
      if (vb === undefined || vb === null) return -1;
      return (va > vb ? 1 : -1) * factor;
    });
  }, [rows, columns, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  useEffect(() => {
    if (page > pages) setPage(1);
  }, [page, pages]);
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggle = (key: string) =>
    setSort((s) =>
      s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    );

  return (
    <div className="flex flex-col gap-3">
      <ScrollArea type="auto">
        <Table
          striped
          highlightOnHover
          verticalSpacing="sm"
          className="min-w-[720px]"
          styles={{ th: { whiteSpace: 'nowrap' } }}
        >
          <Table.Thead className="bg-gray-50">
            <Table.Tr>
              {columns.map((c) => (
                <Table.Th
                  key={c.key}
                  className={`text-xs uppercase tracking-wide text-gray-600 ${
                    c.sortValue ? 'cursor-pointer select-none hover:text-primary' : ''
                  }`}
                  style={{ textAlign: c.align ?? 'left' }}
                  onClick={() => c.sortValue && toggle(c.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.header}
                    {sort?.key === c.key &&
                      (sort.dir === 'asc' ? <FiChevronUp /> : <FiChevronDown />)}
                  </span>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {visible.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <div className="text-center text-gray-500 py-8 text-sm">{empty}</div>
                </Table.Td>
              </Table.Tr>
            ) : (
              visible.map((row) => (
                <Table.Tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={`${onRowClick ? 'cursor-pointer' : ''} ${rowClassName?.(row) ?? ''}`}
                >
                  {columns.map((c) => (
                    <Table.Td
                      key={c.key}
                      className={`text-sm ${c.className ?? ''}`}
                      style={{ textAlign: c.align ?? 'left' }}
                    >
                      {c.render(row)}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
      {sorted.length > pageSizeOptions[0] && (
        <div className="flex flex-row flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of{' '}
            {sorted.length}
          </span>
          <div className="flex flex-row items-center gap-3">
            <Select
              size="xs"
              w={90}
              value={`${pageSize}`}
              onChange={(v) => {
                setPageSize(Number(v ?? initialPageSize));
                setPage(1);
              }}
              data={pageSizeOptions.map((n) => ({ value: `${n}`, label: `${n} / page` }))}
              allowDeselect={false}
            />
            <Pagination size="sm" total={pages} value={page} onChange={setPage} color="#024F3A" />
          </div>
        </div>
      )}
    </div>
  );
}
