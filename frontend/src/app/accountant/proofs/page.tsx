'use client';
import { useFinance } from '@/components/finance/api';
import ProofReviewList from '@/components/finance/ProofReviewList';
import { Payment } from '@/components/finance/types';
import { ErrorBlock, LoadingBlock, PageHeader, Section } from '@/components/library/ui';
import { Button } from '@mantine/core';
import Link from 'next/link';

export default function AccountantProofsPage() {
  const { data: payments, loading, error, refresh } = useFinance<Payment[]>(
    '/finance/payments?status=PENDING_REVIEW',
  );

  if (loading) return <LoadingBlock label="Loading proofs…" />;
  if (error) return <ErrorBlock message={error} onRetry={() => refresh()} />;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Payment proofs"
        subtitle="Student-uploaded slips waiting for accountant approval (school fees and other finance bills)."
        actions={
          <Button component={Link} href="/accountant" variant="default">
            Dashboard
          </Button>
        }
      />
      <Section title={`${payments?.length ?? 0} waiting for review`}>
        <ProofReviewList
          payments={payments ?? []}
          basePath="/finance"
          empty="No school-fee proofs waiting. Lost-book proofs are approved by the librarian."
        />
      </Section>
    </div>
  );
}
