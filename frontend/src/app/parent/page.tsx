'use client';
import { useParentData } from '@/components/parent/api';
import { ChildSummary } from '@/components/parent/types';
import { EmptyBlock, ErrorBlock, LoadingBlock, pct } from '@/components/parent/ui';
import Link from 'next/link';
import { FiAlertTriangle, FiChevronRight } from 'react-icons/fi';

const ChildCard = ({ child }: { child: ChildSummary }) => (
  <Link
    href={`/parent/children/${child.id}`}
    className="bg-white rounded-2xl border p-4 flex items-center gap-3 active:bg-gray-50"
  >
    <div className="h-12 w-12 shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
      {child.firstName?.charAt(0)}
      {child.lastName?.charAt(0)}
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-semibold text-primary truncate">{child.fullName}</p>
      <p className="text-sm text-gray-500 truncate">
        {child.className ?? 'No class'}
        {child.currentPercentage !== undefined ? ` · ${pct(child.currentPercentage)}` : ''}
      </p>
      {child.alerts[0] && (
        <p className="mt-1 flex items-center gap-1 text-sm text-orange-700">
          <FiAlertTriangle className="shrink-0" />
          <span className="truncate">{child.alerts[0]}</span>
        </p>
      )}
    </div>
    <FiChevronRight className="text-gray-400 shrink-0" size={22} />
  </Link>
);

export default function ParentDashboard() {
  const { data, loading, error, refresh } = useParentData<ChildSummary[]>('/parent-portal/children');

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold text-primary">Children</h1>
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={() => refresh()} />}
      {data && data.length === 0 && (
        <EmptyBlock>No child is linked yet. Ask the school to connect your account.</EmptyBlock>
      )}
      {data?.map((child) => (
        <ChildCard key={child.id} child={child} />
      ))}
    </div>
  );
}
