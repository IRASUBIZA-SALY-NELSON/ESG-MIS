'use client';
import { titleCase } from '@/components/library/ui';
import { Badge } from '@mantine/core';
import { Bill, PaymentMethod } from './types';

export const rwf = (value?: number | null) =>
  `${new Intl.NumberFormat('en-US').format(Math.round(value ?? 0))} RWF`;

/** Short form for KPI cards: 1.2M RWF, 350K RWF. */
export const rwfShort = (value?: number | null) => {
  const v = value ?? 0;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(v >= 10_000_000 ? 1 : 2)}M RWF`;
  if (Math.abs(v) >= 10_000) return `${Math.round(v / 1000)}K RWF`;
  return rwf(v);
};

export const CATEGORY_LABELS: Record<string, string> = {
  SCHOOL_FEES: 'School fees',
  REGISTRATION: 'Registration',
  EXAM_FEES: 'Exam fees',
  UNIFORM: 'Uniform',
  TRANSPORT: 'Transport',
  MEALS: 'Meals',
  TRIP: 'Trip',
  OTHER: 'Other',
  LOST_BOOK: 'Lost book',
  DAMAGED_BOOK: 'Damaged book',
};

export const categoryLabel = (c?: string) => (c ? CATEGORY_LABELS[c] ?? titleCase(c) : '—');

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  BANK: 'Bank',
  MOBILE_MONEY: 'Mobile Money',
};

export const FINANCE_CATEGORIES = [
  'SCHOOL_FEES',
  'REGISTRATION',
  'EXAM_FEES',
  'UNIFORM',
  'TRANSPORT',
  'MEALS',
  'TRIP',
  'OTHER',
];

export const BillStatusBadge = ({ bill }: { bill: Pick<Bill, 'status' | 'paymentStatus' | 'overdue' | 'payments'> }) => {
  const pending = bill.payments?.some((p) => p.status === 'PENDING_REVIEW');
  if (bill.status === 'DRAFT')
    return (
      <Badge color="gray" variant="outline" radius="sm">
        Draft
      </Badge>
    );
  if (bill.status === 'CANCELLED')
    return (
      <Badge color="gray" variant="light" radius="sm">
        Cancelled
      </Badge>
    );
  if (bill.paymentStatus === 'PAID')
    return (
      <Badge color="teal" variant="light" radius="sm">
        Paid
      </Badge>
    );
  if (pending)
    return (
      <Badge color="blue" variant="light" radius="sm">
        Proof under review
      </Badge>
    );
  if (bill.paymentStatus === 'PARTIAL')
    return (
      <Badge color={bill.overdue ? 'red' : 'orange'} variant="light" radius="sm">
        {bill.overdue ? 'Part paid · overdue' : 'Part paid'}
      </Badge>
    );
  return (
    <Badge color="red" variant={bill.overdue ? 'filled' : 'light'} radius="sm">
      {bill.overdue ? 'Unpaid · overdue' : 'Unpaid'}
    </Badge>
  );
};

export const PaymentStatusBadge = ({ status }: { status?: string }) => {
  switch (status) {
    case 'PENDING_REVIEW':
      return (
        <Badge color="blue" variant="light" radius="sm">
          Waiting for approval
        </Badge>
      );
    case 'VALID':
      return (
        <Badge color="teal" variant="light" radius="sm">
          Approved
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge color="red" variant="light" radius="sm">
          Rejected
        </Badge>
      );
    case 'VOIDED':
      return (
        <Badge color="gray" variant="outline" radius="sm">
          Voided
        </Badge>
      );
    default:
      return null;
  }
};

export const DepartmentBadge = ({ department }: { department: string }) => (
  <Badge color={department === 'LIBRARY' ? 'grape' : 'blue'} variant="dot" radius="sm" size="sm">
    {department === 'LIBRARY' ? 'Library' : 'Finance'}
  </Badge>
);

export const PaidBar = ({ paid, amount }: { paid: number; amount: number }) => {
  const pct = amount > 0 ? Math.min(100, Math.round((paid / amount) * 100)) : 0;
  return (
    <div className="flex flex-row items-center gap-2 min-w-[110px]">
      <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full ${pct === 100 ? 'bg-teal-500' : pct > 0 ? 'bg-orange-400' : 'bg-red-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-9 text-right">{pct}%</span>
    </div>
  );
};
