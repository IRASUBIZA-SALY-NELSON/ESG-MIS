'use client';
import LoansTable from '@/components/library/LoansTable';
import { useLibrary } from '@/components/library/api';
import { downloadExcel, downloadPdf } from '@/components/library/export';
import { Loan } from '@/components/library/types';
import { ErrorBlock, LoadingBlock, PageHeader, Section, fmtDate } from '@/components/library/ui';
import { useUserContext } from '@/context/Usercontext';
import { Button, Menu, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { FiDownload, FiSearch } from 'react-icons/fi';

const STATUSES = [
  { value: 'ALL', label: 'All loans' },
  { value: 'ACTIVE', label: 'Currently out' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'DUE_SOON', label: 'Due soon' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'LOST', label: 'Lost' },
];

function LoansHistory() {
  const params = useSearchParams();
  const { profile } = useUserContext();
  const [status, setStatus] = useState(params.get('status') ?? 'ALL');
  const [range, setRange] = useState<[string | null, string | null]>([null, null]);
  const [q, setQ] = useState('');

  const qs = new URLSearchParams({ status });
  if (range[0]) qs.set('from', dayjs(range[0]).format('YYYY-MM-DD'));
  if (range[1]) qs.set('to', dayjs(range[1]).format('YYYY-MM-DD'));
  const { data: loans, loading, error, refresh } = useLibrary<Loan[]>(`/library/loans?${qs}`);

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return loans ?? [];
    return (loans ?? []).filter((l) =>
      [l.bookTitle, l.author, l.accessionNumber, l.borrowerName, l.className, l.category]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(query)),
    );
  }, [loans, q]);

  const statusLabel = STATUSES.find((s) => s.value === status)?.label ?? status;
  const period =
    range[0] || range[1]
      ? `${range[0] ? fmtDate(range[0]) : 'start'} – ${range[1] ? fmtDate(range[1]) : 'today'}`
      : 'all time';

  const head = [
    'Book',
    'Copy',
    'Borrower',
    'Role',
    'Class',
    'Issued',
    'Due',
    'Returned',
    'Status',
    'Renewals',
    'Days late',
    'Issued by',
  ];
  const rows = visible.map((l) => [
    l.bookTitle,
    l.accessionNumber,
    l.borrowerName,
    l.borrowerRole,
    l.className,
    fmtDate(l.issuedAt),
    fmtDate(l.dueDate),
    l.returnedAt ? fmtDate(l.returnedAt) : '',
    l.status === 'ACTIVE' && l.overdue ? 'OVERDUE' : l.status,
    l.renewals,
    l.daysOverdue,
    l.issuedBy,
  ]);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Loans history"
        subtitle="Every book issued, returned or lost — filter by period and export."
        actions={
          <Menu shadow="md" position="bottom-end">
            <Menu.Target>
              <Button variant="default" leftSection={<FiDownload />} disabled={!visible.length}>
                Export {visible.length} loans
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                onClick={() => downloadExcel('library_loans', [{ name: 'Loans', head, rows }])}
              >
                Excel (.xlsx)
              </Menu.Item>
              <Menu.Item
                onClick={() =>
                  downloadPdf({
                    filename: 'library_loans',
                    title: `Loans report — ${statusLabel}`,
                    subtitle: `Period: ${period}`,
                    landscape: true,
                    generatedBy: profile ? `${profile.firstName} ${profile.lastName}` : undefined,
                    summary: [
                      ['Loans', visible.length],
                      ['Returned', visible.filter((l) => l.status === 'RETURNED').length],
                      ['Still out', visible.filter((l) => l.status === 'ACTIVE').length],
                      [
                        'Overdue now',
                        visible.filter((l) => l.status === 'ACTIVE' && l.overdue).length,
                      ],
                      ['Lost', visible.filter((l) => l.status === 'LOST').length],
                    ],
                    sections: [
                      {
                        name: '',
                        head: [
                          'Book',
                          'Copy',
                          'Borrower',
                          'Class',
                          'Issued',
                          'Due',
                          'Returned',
                          'Status',
                          'Late',
                        ],
                        rows: visible.map((l) => [
                          l.bookTitle,
                          l.accessionNumber,
                          l.borrowerName,
                          l.className ?? l.borrowerRole,
                          fmtDate(l.issuedAt),
                          fmtDate(l.dueDate),
                          l.returnedAt ? fmtDate(l.returnedAt) : '—',
                          l.status === 'ACTIVE' && l.overdue ? 'OVERDUE' : l.status,
                          l.daysOverdue ? `${l.daysOverdue}d` : '',
                        ]),
                      },
                    ],
                  })
                }
              >
                PDF report
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        }
      />
      <Section>
        <div className="flex flex-row flex-wrap gap-3 mb-3">
          <TextInput
            className="flex-1 min-w-[220px]"
            placeholder="Search book, copy, borrower, class…"
            leftSection={<FiSearch />}
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
          />
          <Select
            data={STATUSES}
            value={status}
            onChange={(v) => setStatus(v ?? 'ALL')}
            allowDeselect={false}
            w={170}
          />
          <DatePickerInput
            type="range"
            placeholder="Issued between…"
            value={range}
            onChange={(v) => setRange(v as [string | null, string | null])}
            clearable
            valueFormat="DD MMM YYYY"
            w={260}
            maxDate={dayjs().format('YYYY-MM-DD')}
            presets={[
              {
                value: [
                  dayjs().startOf('month').format('YYYY-MM-DD'),
                  dayjs().format('YYYY-MM-DD'),
                ],
                label: 'This month',
              },
              {
                value: [
                  dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
                  dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
                ],
                label: 'Last month',
              },
              {
                value: [
                  dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
                  dayjs().format('YYYY-MM-DD'),
                ],
                label: 'Last 3 months',
              },
              {
                value: [dayjs().startOf('year').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
                label: 'This year',
              },
            ]}
          />
        </div>
        {loading ? (
          <LoadingBlock />
        ) : error ? (
          <ErrorBlock message={error} onRetry={() => refresh()} />
        ) : (
          <LoansTable
            loans={visible}
            show={['book', 'borrower', 'issued', 'due', 'returned', 'status', 'actions']}
            initialPageSize={25}
            defaultSort={{ key: 'issued', dir: 'desc' }}
            empty="No loans in this selection."
          />
        )}
      </Section>
    </div>
  );
}

export default function LoansPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <LoansHistory />
    </Suspense>
  );
}
