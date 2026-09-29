'use client';
import { useParentData } from '@/components/parent/api';
import AppealsTab from '@/components/parent/child/AppealsTab';
import DisciplineTab from '@/components/parent/child/DisciplineTab';
import MarksTab from '@/components/parent/child/MarksTab';
import OverviewTab from '@/components/parent/child/OverviewTab';
import ReportCardTab from '@/components/parent/child/ReportCardTab';
import TeachersTab from '@/components/parent/child/TeachersTab';
import { ChildSummary } from '@/components/parent/types';
import { ErrorBlock, LoadingBlock, termLabel } from '@/components/parent/ui';
import { Tabs } from '@mantine/core';
import Link from 'next/link';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'marks', label: 'Marks' },
  { value: 'report-card', label: 'Report card' },
  { value: 'discipline', label: 'Discipline' },
  { value: 'appeals', label: 'Appeals' },
  { value: 'teachers', label: 'Teachers & contacts' },
];

export default function ChildPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialTab = searchParams.get('tab');
  const [tab, setTab] = useState(
    TABS.some((t) => t.value === initialTab) ? initialTab! : 'overview',
  );
  const selectTab = (value: string | null) => {
    const next = value ?? 'overview';
    setTab(next);
    window.history.replaceState(null, '', `${pathname}?tab=${next}`);
  };
  const {
    data: children,
    loading,
    error,
    refresh,
  } = useParentData<ChildSummary[]>('/parent-portal/children');
  const child = children?.find((c) => c.id === id);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={() => refresh()} />;
  if (children && !child) {
    return (
      <div className="py-6">
        <ErrorBlock message="This student is not linked to your account." />
        <Link href="/parent" className="text-sm underline mt-3 inline-block">
          Back to my children
        </Link>
      </div>
    );
  }
  if (!child) return null;

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex flex-row items-center justify-between flex-wrap gap-3 print:hidden">
        <div className="flex flex-row items-center gap-3">
          <Link
            href="/parent"
            className="p-2 rounded-full hover:bg-primary/10 text-primary"
            aria-label="Back"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div className="h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
            {child.firstName?.charAt(0)}
            {child.lastName?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-primary text-lg leading-tight">{child.fullName}</p>
            <p className="text-sm text-gray-500">
              {child.className ?? 'No class'} ·{' '}
              {child.currentTerm ? termLabel(child.currentTerm.name) : 'No active term'}
              {child.studentStatus &&
                child.studentStatus !== 'ACTIVE' &&
                ` · ${child.studentStatus}`}
            </p>
          </div>
        </div>
      </div>

      <Tabs value={tab} onChange={selectTab} color="#024F3A" keepMounted={false}>
        <Tabs.List className="print:hidden bg-white rounded-t-lg px-2 overflow-x-auto flex-nowrap">
          {TABS.map((t) => (
            <Tabs.Tab key={t.value} value={t.value}>
              {t.label}
              {t.value === 'appeals' && child.pendingAppeals > 0 && (
                <span className="ml-1 text-xs text-orange-600">({child.pendingAppeals})</span>
              )}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <div className="pt-4">
          <Tabs.Panel value="overview">
            <OverviewTab studentId={child.id} />
          </Tabs.Panel>
          <Tabs.Panel value="marks">
            <MarksTab studentId={child.id} />
          </Tabs.Panel>
          <Tabs.Panel value="report-card">
            <ReportCardTab studentId={child.id} />
          </Tabs.Panel>
          <Tabs.Panel value="discipline">
            <DisciplineTab studentId={child.id} />
          </Tabs.Panel>
          <Tabs.Panel value="appeals">
            <AppealsTab studentId={child.id} />
          </Tabs.Panel>
          <Tabs.Panel value="teachers">
            <TeachersTab studentId={child.id} />
          </Tabs.Panel>
        </div>
      </Tabs>
    </div>
  );
}
