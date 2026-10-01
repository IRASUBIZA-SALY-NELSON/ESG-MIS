'use client';
import { useParentData } from '@/components/parent/api';
import AppealsTab from '@/components/parent/child/AppealsTab';
import BillsTab from '@/components/parent/child/BillsTab';
import DisciplineTab from '@/components/parent/child/DisciplineTab';
import MarksTab from '@/components/parent/child/MarksTab';
import OverviewTab from '@/components/parent/child/OverviewTab';
import ReportCardTab from '@/components/parent/child/ReportCardTab';
import TeachersTab from '@/components/parent/child/TeachersTab';
import { ChildSummary } from '@/components/parent/types';
import { ErrorBlock, LoadingBlock } from '@/components/parent/ui';
import Link from 'next/link';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  FiArrowLeft,
  FiBookOpen,
  FiCreditCard,
  FiFileText,
  FiShield,
} from 'react-icons/fi';

const SECTIONS = [
  { value: 'marks', label: 'Marks', hint: 'CAT and exams', icon: FiBookOpen },
  { value: 'report-card', label: 'Report card', hint: 'Official document', icon: FiFileText },
  { value: 'discipline', label: 'Conduct', hint: 'Discipline marks', icon: FiShield },
  { value: 'bills', label: 'Fees', hint: 'Bills to pay', icon: FiCreditCard },
] as const;

const TITLES: Record<string, string> = {
  marks: 'Marks',
  'report-card': 'Report card',
  discipline: 'Conduct',
  bills: 'Fees',
  teachers: 'Teachers',
  appeals: 'Appeals',
};

export default function ChildPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initial = searchParams.get('tab');
  const [tab, setTab] = useState(initial && TITLES[initial] ? initial : 'home');

  const go = (value: string) => {
    setTab(value);
    window.history.replaceState(null, '', value === 'home' ? pathname : `${pathname}?tab=${value}`);
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
        <ErrorBlock message="This student is not on your account." />
        <Link href="/parent" className="text-sm underline mt-3 inline-block min-h-11">
          Back
        </Link>
      </div>
    );
  }
  if (!child) return null;

  if (tab !== 'home') {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => go('home')}
          className="flex items-center gap-2 min-h-11 -ml-1 text-primary font-medium print:hidden"
        >
          <FiArrowLeft size={20} />
          {TITLES[tab] ?? 'Back'}
        </button>
        {tab === 'marks' && <MarksTab studentId={child.id} />}
        {tab === 'report-card' && <ReportCardTab studentId={child.id} />}
        {tab === 'discipline' && <DisciplineTab studentId={child.id} />}
        {tab === 'bills' && <BillsTab studentId={child.id} />}
        {tab === 'teachers' && <TeachersTab studentId={child.id} />}
        {tab === 'appeals' && <AppealsTab studentId={child.id} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href="/parent"
          className="h-11 w-11 rounded-full flex items-center justify-center text-primary -ml-2"
          aria-label="Back"
        >
          <FiArrowLeft size={22} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-semibold text-primary text-lg leading-tight truncate">{child.fullName}</h1>
          <p className="text-sm text-gray-500 truncate">{child.className ?? 'No class'}</p>
        </div>
      </div>

      <OverviewTab studentId={child.id} />

      <div className="grid grid-cols-2 gap-3">
        {SECTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => go(item.value)}
              className="bg-white border rounded-2xl p-4 text-left min-h-[7rem] flex flex-col gap-2 active:bg-gray-50"
            >
              <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon size={20} />
              </span>
              <span className="font-semibold text-primary">{item.label}</span>
              <span className="text-xs text-gray-500">{item.hint}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <button type="button" onClick={() => go('teachers')} className="min-h-11 text-primary font-medium">
          Teachers
        </button>
        <button type="button" onClick={() => go('appeals')} className="min-h-11 text-primary font-medium">
          Appeals{child.pendingAppeals > 0 ? ` (${child.pendingAppeals})` : ''}
        </button>
        <Link href={`/parent/concerns?studentId=${child.id}`} className="min-h-11 text-primary font-medium flex items-center">
          Message school
        </Link>
      </div>
    </div>
  );
}
