'use client';
import { AuthApi } from '@/utils/constants';
import { exportToExcel } from '@/utils/funcs';
import { getResError } from '@/utils/fetch';
import {
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  PageHeader,
  Section,
  fmtDateTime,
} from '@/components/library/ui';
import MainModal from '@/components/core/modals/modal';
import { Badge, Button, Pagination, Select, Table, TextInput } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';
import { HiOutlineClipboardList } from 'react-icons/hi';
import { MdErrorOutline, MdLogin, MdSchedule } from 'react-icons/md';

type AuditRow = {
  id: string;
  createdAt: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  method: string;
  path: string;
  queryString?: string;
  action: string;
  module: string;
  status: number;
  outcome: string;
  ip?: string;
  userAgent?: string;
  durationMs?: number;
  detail?: string;
};

type AuditPage = {
  content: AuditRow[];
  totalElements: number;
  totalPages: number;
  number: number;
};

type AuditSummary = {
  today: number;
  failedToday: number;
  loginsToday: number;
  lastHour: number;
  total: number;
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'IT Manager',
  PM: 'Headmaster',
  DOS: 'Director of Studies',
  DS: 'Prefect of Discipline',
  TEACHER: 'Teacher',
  ACCOUNTANT: 'Accountant',
  LIBRARIAN: 'Librarian',
  STUDENT: 'Student',
  STAFF: 'Staff',
  PARENT: 'Parent',
};

const MODULE_LABEL: Record<string, string> = {
  AUTH: 'Sign-in',
  PEOPLE: 'People',
  PARENTS: 'Parents',
  FINANCE: 'Finance',
  LIBRARY: 'Library',
  NOTES: 'Notes',
  ACADEMICS: 'Academics',
  DISCIPLINE: 'Discipline',
  OTHER: 'Other',
};

const MODULE_COLOR: Record<string, string> = {
  AUTH: 'blue',
  PEOPLE: 'teal',
  PARENTS: 'grape',
  FINANCE: 'green',
  LIBRARY: 'cyan',
  NOTES: 'indigo',
  ACADEMICS: 'orange',
  DISCIPLINE: 'red',
  OTHER: 'gray',
};

export default function AdminAuditPage() {
  const [q, setQ] = useState('');
  const [module, setModule] = useState('ALL');
  const [outcome, setOutcome] = useState('ALL');
  const [role, setRole] = useState('ALL');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AuditPage | null>(null);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [selected, setSelected] = useState<AuditRow | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (module !== 'ALL') params.set('module', module);
    if (outcome !== 'ALL') params.set('outcome', outcome);
    if (role !== 'ALL') params.set('role', role);
    params.set('page', String(page - 1));
    params.set('limit', '30');
    return params.toString();
  }, [q, module, outcome, role, page]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, sumRes] = await Promise.all([
        AuthApi.get(`/audit?${query}`),
        AuthApi.get('/audit/summary'),
      ]);
      setRows(listRes.data?.data);
      setSummary(sumRes.data?.data);
    } catch (err) {
      setError(getResError(err, 'Could not load the audit log'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    const id = window.setInterval(load, 20000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const exportRows = async () => {
    const params = new URLSearchParams(query);
    params.set('page', '0');
    params.set('limit', '500');
    const res = await AuthApi.get(`/audit?${params.toString()}`);
    const list: AuditRow[] = res.data?.data?.content ?? [];
    exportToExcel(
      'ESG audit log',
      list.map((row) => ({
        Time: fmtDateTime(row.createdAt),
        Person: row.actorName || '—',
        Email: row.actorEmail || '—',
        Role: ROLE_LABEL[row.actorRole ?? ''] || row.actorRole || '—',
        Action: row.action,
        Area: MODULE_LABEL[row.module] || row.module,
        Result: row.outcome,
        Status: row.status,
        Path: row.path,
        IP: row.ip || '—',
      })),
      '.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    );
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Audit log"
        subtitle="Everything people did in ESG-MIS — sign-ins, student changes, bills, library, and failed attempts. Passwords are never stored."
        actions={
          <>
            <Button variant="light" leftSection={<FiRefreshCw />} onClick={load}>
              Refresh
            </Button>
            <Button color="green" onClick={exportRows}>
              Export Excel
            </Button>
          </>
        }
      />

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Today" value={summary.today} icon={<HiOutlineClipboardList />} tone="navy" />
          <KpiCard
            label="Failed today"
            value={summary.failedToday}
            icon={<MdErrorOutline />}
            tone="red"
          />
          <KpiCard label="Sign-ins today" value={summary.loginsToday} icon={<MdLogin />} tone="teal" />
          <KpiCard label="Last hour" value={summary.lastHour} icon={<MdSchedule />} tone="gold" />
        </div>
      )}

      <Section title="Activity">
        <div className="flex flex-row flex-wrap gap-2 mb-3">
          <TextInput
            placeholder="Search person, email or action"
            leftSection={<FiSearch />}
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.currentTarget.value);
            }}
            className="min-w-[240px] flex-grow"
          />
          <Select
            value={module}
            onChange={(v) => {
              setPage(1);
              setModule(v || 'ALL');
            }}
            data={[
              { value: 'ALL', label: 'All areas' },
              ...Object.entries(MODULE_LABEL).map(([value, label]) => ({ value, label })),
            ]}
            w={160}
          />
          <Select
            value={outcome}
            onChange={(v) => {
              setPage(1);
              setOutcome(v || 'ALL');
            }}
            data={[
              { value: 'ALL', label: 'All results' },
              { value: 'SUCCESS', label: 'Succeeded' },
              { value: 'FAILURE', label: 'Failed' },
            ]}
            w={150}
          />
          <Select
            value={role}
            onChange={(v) => {
              setPage(1);
              setRole(v || 'ALL');
            }}
            data={[
              { value: 'ALL', label: 'All roles' },
              ...Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })),
            ]}
            w={190}
          />
        </div>

        {loading && !rows ? (
          <LoadingBlock label="Loading audit log…" />
        ) : error ? (
          <ErrorBlock message={error} onRetry={load} />
        ) : (
          <>
            <Table highlightOnHover stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>When</Table.Th>
                  <Table.Th>Who</Table.Th>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Area</Table.Th>
                  <Table.Th>Result</Table.Th>
                  <Table.Th>IP</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {(rows?.content ?? []).length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6} className="text-center text-sm text-gray-500 py-8">
                      Nothing recorded yet. New sign-ins and changes appear here.
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  (rows?.content ?? []).map((row) => (
                    <Table.Tr
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(row)}
                    >
                      <Table.Td className="whitespace-nowrap text-sm">
                        {fmtDateTime(row.createdAt)}
                      </Table.Td>
                      <Table.Td>
                        <p className="text-sm font-medium">{row.actorName || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{row.actorEmail || '—'}</p>
                        {row.actorRole && (
                          <Badge size="xs" variant="light" mt={4}>
                            {ROLE_LABEL[row.actorRole] || row.actorRole}
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <p className="text-sm">{row.action}</p>
                        <p className="text-xs text-gray-400">{row.method}</p>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={MODULE_COLOR[row.module] || 'gray'} variant="light">
                          {MODULE_LABEL[row.module] || row.module}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={row.outcome === 'SUCCESS' ? 'teal' : 'red'} variant="light">
                          {row.outcome === 'SUCCESS' ? `${row.status} ok` : `${row.status} failed`}
                        </Badge>
                      </Table.Td>
                      <Table.Td className="text-xs text-gray-500">{row.ip || '—'}</Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
            {rows && rows.totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={rows.totalPages}
                  value={page}
                  onChange={setPage}
                />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {rows?.totalElements ?? 0} events · click a row for the full record
            </p>
          </>
        )}
      </Section>

      <MainModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Audit record"
        size="lg"
      >
        {selected && (
          <div className="flex flex-col gap-2 px-5 pb-4 text-sm">
            <Row label="When" value={fmtDateTime(selected.createdAt)} />
            <Row label="Person" value={`${selected.actorName || 'Unknown'} (${selected.actorEmail || 'no email'})`} />
            <Row
              label="Role"
              value={ROLE_LABEL[selected.actorRole ?? ''] || selected.actorRole || '—'}
            />
            <Row label="Action" value={selected.action} />
            <Row label="Area" value={MODULE_LABEL[selected.module] || selected.module} />
            <Row label="Result" value={`${selected.outcome} (${selected.status})`} />
            <Row label="Request" value={`${selected.method} ${selected.path}`} />
            {selected.queryString && <Row label="Query" value={selected.queryString} />}
            <Row label="IP" value={selected.ip || '—'} />
            <Row label="Browser" value={selected.userAgent || '—'} />
            <Row label="Duration" value={`${selected.durationMs ?? 0} ms`} />
            {selected.detail && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Details</p>
                <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto max-h-48 whitespace-pre-wrap">
                  {selected.detail}
                </pre>
              </div>
            )}
          </div>
        )}
      </MainModal>
    </div>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p>{value}</p>
  </div>
);
