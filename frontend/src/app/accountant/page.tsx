'use client';
import { PageHeader, Section } from '@/components/library/ui';
import { useUserContext } from '@/context/Usercontext';

export default function AccountantDashboard() {
  const { profile } = useUserContext();
  return (
    <div className="flex flex-col gap-4 p-1">
      <PageHeader
        title={`Welcome${profile?.firstName ? `, ${profile.firstName}` : ''}`}
        subtitle="Finance office — student bills, payments, receipts, claims and finance clearance."
      />
      <Section title="Finance workspace">
        <p className="text-sm text-gray-600">
          Student bills, payments, receipts, claims and clearance will appear here as each part is
          switched on.
        </p>
      </Section>
    </div>
  );
}
