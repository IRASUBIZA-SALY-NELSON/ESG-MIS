'use client';
import { useParentData } from '@/components/parent/api';
import { ChildSummary } from '@/components/parent/types';
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  ordinal,
  pct,
  scoreColor,
  termLabel,
} from '@/components/parent/ui';
import { useUserContext } from '@/context/Usercontext';
import { Badge, Progress } from '@mantine/core';
import Link from 'next/link';
import { FiAlertTriangle, FiChevronRight } from 'react-icons/fi';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const ChildCard = ({ child }: { child: ChildSummary }) => {
  const disciplinePct =
    child.disciplineScore !== undefined && child.disciplineMax
      ? (child.disciplineScore / child.disciplineMax) * 100
      : undefined;
  return (
    <Link
      href={`/parent/children/${child.id}`}
      className="bg-white rounded-xl border hover:border-primary/40 hover:shadow-md transition p-5 flex flex-col gap-4"
    >
      <div className="flex flex-row items-start justify-between gap-3">
        <div className="flex flex-row items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
            {child.firstName?.charAt(0)}
            {child.lastName?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-primary text-lg leading-tight">{child.fullName}</p>
            <p className="text-sm text-gray-500">
              {child.className ?? 'No class assigned'} · {termLabel(child.relationship)}
              {child.primaryContact ? ' · Primary contact' : ''}
            </p>
          </div>
        </div>
        <FiChevronRight className="text-gray-400 mt-2" size={20} />
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-lightPurple p-3">
          <p className="text-xs text-gray-500">Average</p>
          <p
            className="text-xl font-semibold"
            style={{ color: `var(--mantine-color-${scoreColor(child.currentPercentage)}-7)` }}
          >
            {pct(child.currentPercentage)}
          </p>
          <p className="text-[11px] text-gray-500">
            {termLabel(child.resultsTerm?.name) || 'No results yet'}
          </p>
        </div>
        <div className="rounded-lg bg-lightPurple p-3">
          <p className="text-xs text-gray-500">Class position</p>
          <p className="text-xl font-semibold text-primary">{ordinal(child.currentPosition)}</p>
          <p className="text-[11px] text-gray-500">
            {child.classSize ? `of ${child.classSize}` : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-lightPurple p-3">
          <p className="text-xs text-gray-500">Discipline</p>
          <p
            className={`text-xl font-semibold ${child.disciplinePass === false ? 'text-red-600' : 'text-primary'}`}
          >
            {child.disciplineScore ?? '—'}
            <span className="text-sm text-gray-500">/{child.disciplineMax ?? 40}</span>
          </p>
          <Progress
            value={disciplinePct ?? 0}
            color={child.disciplinePass === false ? 'red' : 'teal'}
            size="xs"
            className="mt-1"
          />
        </div>
      </div>

      {child.alerts.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {child.alerts.map((alert) => (
            <li
              key={alert}
              className="flex flex-row items-start gap-2 text-sm text-orange-700 bg-orange-50 rounded-md px-3 py-1.5"
            >
              <FiAlertTriangle className="mt-0.5 shrink-0" />
              <span>{alert}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-teal-700 bg-teal-50 rounded-md px-3 py-1.5">
          Everything looks good. No alerts.
        </p>
      )}

      <div className="flex flex-row gap-2 flex-wrap">
        {child.currentTerm && (
          <Badge variant="outline" color="dark" radius="sm">
            Current: {termLabel(child.currentTerm.name)}
          </Badge>
        )}
        {child.pendingAppeals > 0 && (
          <Badge variant="light" color="orange" radius="sm">
            {child.pendingAppeals} pending appeal{child.pendingAppeals > 1 ? 's' : ''}
          </Badge>
        )}
        {child.openConcerns > 0 && (
          <Badge variant="light" color="blue" radius="sm">
            {child.openConcerns} open message{child.openConcerns > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    </Link>
  );
};

export default function ParentDashboard() {
  const { profile } = useUserContext();
  const { data, loading, error, refresh } =
    useParentData<ChildSummary[]>('/parent-portal/children');
  const totalAlerts = data?.reduce((sum, c) => sum + c.alerts.length, 0) ?? 0;

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="bg-primary text-white rounded-xl p-5 flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg">
            {greeting()}, <span className="font-semibold">{profile?.firstName ?? 'Parent'}</span>
          </p>
          <p className="text-sm text-white/80">
            Follow your children's marks, report cards, discipline and school messages in one place.
          </p>
        </div>
        {data && (
          <div className="flex flex-row gap-6 text-center">
            <div>
              <p className="text-2xl font-semibold">{data.length}</p>
              <p className="text-xs text-white/80">Children</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{totalAlerts}</p>
              <p className="text-xs text-white/80">Alerts</p>
            </div>
          </div>
        )}
      </div>

      {loading && <LoadingBlock label="Loading your children…" />}
      {error && <ErrorBlock message={error} onRetry={() => refresh()} />}
      {data && data.length === 0 && (
        <EmptyBlock>
          No student is linked to your account yet. Please contact the school administration so they
          can link your child to this account.
        </EmptyBlock>
      )}
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {data.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}
    </div>
  );
}
