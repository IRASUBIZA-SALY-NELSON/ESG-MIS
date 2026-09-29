'use client';
import { useFinance } from '@/components/finance/api';
import ProofReviewList from '@/components/finance/ProofReviewList';
import { FinanceSummary, Payment } from '@/components/finance/types';
import { categoryLabel, rwf, rwfShort } from '@/components/finance/ui';
import {
  EmptyBlock,
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  PageHeader,
  Section,
  fmtDate,
} from '@/components/library/ui';
import { SimpleBar } from '@/components/library/charts';
import { Button } from '@mantine/core';
import Link from 'next/link';
import { FaFileInvoiceDollar, FaMoneyBillWave, FaUserClock } from 'react-icons/fa';
import { MdPendingActions } from 'react-icons/md';

export default function AccountantDashboard() {
  const { data, loading, error, refresh } = useFinance<FinanceSummary>('/finance/summary');
  const { data: pending } = useFinance<Payment[]>('/finance/payments?status=PENDING_REVIEW');

  if (loading) return <LoadingBlock label="Loading finance dashboard…" />;
  if (error || !data) return <ErrorBlock message={error ?? 'No data'} onRetry={() => refresh()} />;

  const t = data.totals;
  const monthLabels = data.monthly.map((m) => m.month.slice(5));
  const monthValues = data.monthly.map((m) => m.collected);

  return (
    <div className="flex flex-col gap-4 p-1">
      <PageHeader
        title="Finance office"
        subtitle="School fees, other bills, receipts and payment proofs from students."
        actions={
          <>
            <Button component={Link} href="/accountant/bills" variant="light">
              All bills
            </Button>
            <Button component={Link} href="/accountant/bills?new=1">
              New bill
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Outstanding"
          value={rwfShort(t.outstanding)}
          hint={`${t.studentsOwing} student(s) still owing`}
          tone="red"
          icon={<FaMoneyBillWave />}
        />
        <KpiCard
          label="Collected this month"
          value={rwfShort(t.collectedThisMonth)}
          hint={`${t.paymentsThisMonth} payment(s)`}
          tone="teal"
          icon={<FaFileInvoiceDollar />}
        />
        <KpiCard
          label="Proofs to review"
          value={t.pendingReviews ?? pending?.length ?? 0}
          hint="Student uploads waiting for approval"
          tone="blue"
          icon={<MdPendingActions />}
          onClick={() => (window.location.href = '/accountant/proofs')}
        />
        <KpiCard
          label="Overdue bills"
          value={t.overdueBills}
          hint={`${Math.round(t.collectionRate)}% collection rate`}
          tone="orange"
          icon={<FaUserClock />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Collections (12 months)">
          <SimpleBar labels={monthLabels} values={monthValues} label="Collected" height={220} />
        </Section>
        <Section title="Payment proofs waiting">
          <ProofReviewList
            payments={pending ?? data.awaitingReview ?? []}
            basePath="/finance"
            empty="No school-fee proofs waiting. Lost-book proofs are approved by the librarian."
          />
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Top balances">
          {!data.topDebtors.length ? (
            <EmptyBlock>Everyone is clear.</EmptyBlock>
          ) : (
            <ul className="divide-y text-sm">
              {data.topDebtors.map((s) => (
                <li key={s.studentId} className="py-2 flex justify-between gap-2">
                  <Link href={`/accountant/students/${s.studentId}`} className="text-primary hover:underline">
                    {s.studentName}
                    <span className="text-gray-500"> · {s.className ?? '—'}</span>
                  </Link>
                  <b className="text-red-600">{rwf(s.balance)}</b>
                </li>
              ))}
            </ul>
          )}
        </Section>
        <Section title="By bill type">
          <ul className="divide-y text-sm">
            {data.byCategory.slice(0, 8).map((c) => (
              <li key={c.category} className="py-2 flex justify-between gap-2">
                <span>{categoryLabel(c.category)}</span>
                <span>
                  <b>{rwfShort(c.outstanding)}</b>
                  <span className="text-gray-400 text-xs ml-2">of {rwfShort(c.billed)}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Recent approved payments">
        {!data.recentPayments.length ? (
          <EmptyBlock>No payments yet.</EmptyBlock>
        ) : (
          <ul className="divide-y text-sm">
            {data.recentPayments.map((p) => (
              <li key={p.id} className="py-2 flex flex-wrap justify-between gap-2">
                <span>
                  {p.studentName} · {p.billNumber}
                  <span className="text-gray-500"> · {fmtDate(p.paidOn)}</span>
                </span>
                <b className="text-teal-700">{rwf(p.amount)}</b>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
