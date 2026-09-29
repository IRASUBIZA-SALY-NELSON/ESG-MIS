'use client';
import { useLibrary } from '@/components/library/api';
import {
  DonutChart,
  GroupedBar,
  IssuedReturnedLine,
  PALETTE,
  SimpleBar,
} from '@/components/library/charts';
import { Cell, ReportSheet, downloadExcel, downloadPdf } from '@/components/library/export';
import { Book, Borrower, LibraryStats, Loan } from '@/components/library/types';
import {
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  PageHeader,
  Section,
  fmtDate,
  titleCase,
} from '@/components/library/ui';
import { useUserContext } from '@/context/Usercontext';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button, Table } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { FaBook, FaChartLine, FaFileExcel, FaFilePdf, FaPercent } from 'react-icons/fa';
import { FiClock, FiRepeat } from 'react-icons/fi';

const get = async <T,>(url: string): Promise<T> => (await AuthApi.get(url)).data.data;

type ReportKey = 'full' | 'inventory' | 'loans' | 'overdue' | 'borrowers' | 'popular' | 'monthly';

interface Built {
  filename: string;
  title: string;
  subtitle?: string;
  summary?: [string, Cell][];
  sections: ReportSheet[];
  landscape?: boolean;
}

export default function ReportsPage() {
  const { profile } = useUserContext();
  const { data: stats, loading, error, refresh } = useLibrary<LibraryStats>('/library/stats');
  const [range, setRange] = useState<[string | null, string | null]>([
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD'),
  ]);
  const [busy, setBusy] = useState<string | null>(null);

  if (loading) return <LoadingBlock label="Loading analytics…" />;
  if (error || !stats) return <ErrorBlock message={error ?? 'No data'} onRetry={() => refresh()} />;

  const t = stats.totals;
  const who = profile ? `${profile.firstName} ${profile.lastName}` : undefined;
  const period =
    range[0] && range[1]
      ? `${fmtDate(range[0])} – ${fmtDate(range[1])}`
      : range[0]
        ? `from ${fmtDate(range[0])}`
        : 'all time';

  const loanRow = (l: Loan): Cell[] => [
    l.bookTitle,
    l.accessionNumber,
    l.borrowerName,
    l.className ?? titleCase(l.borrowerRole),
    fmtDate(l.issuedAt),
    fmtDate(l.dueDate),
    l.returnedAt ? fmtDate(l.returnedAt) : '',
    l.status === 'ACTIVE' && l.overdue ? 'OVERDUE' : l.status,
    l.daysOverdue || '',
  ];
  const loanHead = [
    'Book',
    'Copy',
    'Borrower',
    'Class',
    'Issued',
    'Due',
    'Returned',
    'Status',
    'Days late',
  ];

  const inventorySheet = (books: Book[]): ReportSheet => ({
    name: 'Inventory',
    head: [
      'Title',
      'Author',
      'ISBN',
      'Category',
      'Shelf',
      'Copies',
      'Available',
      'Borrowed',
      'Lost',
      'Damaged',
      'Times borrowed',
      'Status',
    ],
    rows: books.map((b) => [
      b.title,
      b.author,
      b.isbn,
      b.category,
      b.shelfLocation,
      b.totalCopies,
      b.availableCopies,
      b.borrowedCopies,
      b.lostCopies,
      b.damagedCopies,
      b.timesBorrowed,
      b.status,
    ]),
  });

  const build = async (key: ReportKey): Promise<Built> => {
    const qs = new URLSearchParams({ status: 'ALL' });
    if (range[0]) qs.set('from', dayjs(range[0]).format('YYYY-MM-DD'));
    if (range[1]) qs.set('to', dayjs(range[1]).format('YYYY-MM-DD'));
    switch (key) {
      case 'inventory': {
        const books = await get<Book[]>('/library/books');
        return {
          filename: 'library_inventory',
          title: 'Library inventory',
          landscape: true,
          summary: [
            ['Titles', books.filter((b) => b.status === 'ACTIVE').length],
            ['Copies', books.reduce((a, b) => a + b.totalCopies, 0)],
            ['Available', books.reduce((a, b) => a + b.availableCopies, 0)],
            [
              'Lost / damaged',
              `${books.reduce((a, b) => a + b.lostCopies, 0)} / ${books.reduce((a, b) => a + b.damagedCopies, 0)}`,
            ],
          ],
          sections: [inventorySheet(books)],
        };
      }
      case 'loans': {
        const loans = await get<Loan[]>(`/library/loans?${qs}`);
        return {
          filename: 'library_loans',
          title: 'Loans report',
          subtitle: `Books issued ${period}`,
          landscape: true,
          summary: [
            ['Books issued', loans.length],
            ['Returned', loans.filter((l) => l.status === 'RETURNED').length],
            [
              'Returned late',
              loans.filter((l) => l.status === 'RETURNED' && l.daysOverdue > 0).length,
            ],
            ['Still out', loans.filter((l) => l.status === 'ACTIVE').length],
            ['Lost', loans.filter((l) => l.status === 'LOST').length],
            ['Distinct borrowers', new Set(loans.map((l) => l.borrowerId)).size],
          ],
          sections: [{ name: 'Loans', head: loanHead, rows: loans.map(loanRow) }],
        };
      }
      case 'overdue': {
        const loans = await get<Loan[]>('/library/loans?status=OVERDUE');
        return {
          filename: 'overdue_books',
          title: 'Overdue books',
          subtitle: `As of ${dayjs().format('DD MMM YYYY')}`,
          landscape: true,
          summary: [
            ['Overdue books', loans.length],
            ['Borrowers concerned', new Set(loans.map((l) => l.borrowerId)).size],
            [
              'Longest overdue',
              `${loans.reduce((a, l) => Math.max(a, l.daysOverdue ?? 0), 0)} days`,
            ],
          ],
          sections: [
            {
              name: 'Overdue',
              head: ['Borrower', 'Class', 'Email', 'Book', 'Copy', 'Due', 'Days late', 'Reminders'],
              rows: loans.map((l) => [
                l.borrowerName,
                l.className ?? titleCase(l.borrowerRole),
                l.borrowerEmail,
                l.bookTitle,
                l.accessionNumber,
                fmtDate(l.dueDate),
                l.daysOverdue,
                l.remindersSent ?? 0,
              ]),
            },
          ],
        };
      }
      case 'borrowers': {
        const list = await get<Borrower[]>('/library/borrowers');
        const cleared = (b: Borrower) => !b.activeLoans;
        return {
          filename: 'library_clearance',
          title: 'Borrowers & clearance',
          landscape: true,
          summary: [
            ['Members', list.length],
            ['Cleared', list.filter(cleared).length],
            ['Not cleared', list.filter((b) => !cleared(b)).length],
            ['Books lost', list.reduce((a, b) => a + b.lostBooks, 0)],
          ],
          sections: [
            {
              name: 'Borrowers',
              head: [
                'Name',
                'Role',
                'Class',
                'Email',
                'Total loans',
                'Out now',
                'Overdue',
                'Lost',
                'Clearance',
              ],
              rows: list.map((b) => [
                b.fullName,
                titleCase(b.role),
                b.className,
                b.email,
                b.totalLoans,
                b.activeLoans,
                b.overdueLoans,
                b.lostBooks,
                cleared(b) ? 'Cleared' : 'Not cleared',
              ]),
            },
          ],
        };
      }
      case 'popular':
        return {
          filename: 'popular_books',
          title: 'Reading trends',
          sections: [
            {
              name: 'Most borrowed books',
              head: ['#', 'Title', 'Author', 'Category', 'Loans'],
              rows: stats.topBooks.map((b, i) => [i + 1, b.title, b.author, b.category, b.loans]),
            },
            {
              name: 'Top readers',
              head: ['#', 'Name', 'Class', 'Loans', 'Out now'],
              rows: stats.topBorrowers.map((b, i) => [
                i + 1,
                b.fullName,
                b.className ?? 'Staff',
                b.loans,
                b.active,
              ]),
            },
            {
              name: 'By category',
              head: ['Category', 'Titles', 'Copies', 'Loans'],
              rows: stats.categories.map((c) => [c.category, c.titles, c.copies, c.loans]),
            },
            {
              name: 'By class',
              head: ['Class', 'Loans'],
              rows: Object.entries(stats.byClass).sort((a, b) => b[1] - a[1]),
            },
          ],
        };
      case 'monthly':
        return {
          filename: 'monthly_circulation',
          title: 'Monthly circulation',
          subtitle: 'Last 12 months',
          summary: [
            ['Issued (12 months)', stats.monthly.reduce((a, m) => a + m.issued, 0)],
            ['Returned (12 months)', stats.monthly.reduce((a, m) => a + m.returned, 0)],
            ['On-time return rate', `${t.onTimeReturnRate}%`],
            ['Average loan length', `${t.averageLoanDays} days`],
          ],
          sections: [
            {
              name: 'Monthly',
              head: ['Month', 'Issued', 'Returned'],
              rows: stats.monthly.map((m) => [m.label, m.issued, m.returned]),
            },
          ],
        };
      case 'full': {
        const [books, loans, borrowers] = await Promise.all([
          get<Book[]>('/library/books'),
          get<Loan[]>(`/library/loans?${qs}`),
          get<Borrower[]>('/library/borrowers'),
        ]);
        return {
          filename: 'library_full_report',
          title: 'Library report',
          subtitle: `Loans ${period}`,
          landscape: true,
          summary: [
            ['Titles / copies', `${t.titles} / ${t.copies}`],
            ['Books out now', `${t.activeLoans} (${t.overdueLoans} overdue)`],
            ['Loans in period', loans.length],
            ['On-time return rate', `${t.onTimeReturnRate}%`],
            ['Lost books', t.lostLoans],
            ['Readers this month', t.readersThisMonth],
          ],
          sections: [
            {
              name: 'Monthly circulation',
              head: ['Month', 'Issued', 'Returned'],
              rows: stats.monthly.map((m) => [m.label, m.issued, m.returned]),
            },
            {
              name: 'Currently overdue',
              head: loanHead,
              rows: loans.filter((l) => l.status === 'ACTIVE' && l.overdue).map(loanRow),
            },
            { name: 'Loans in period', head: loanHead, rows: loans.map(loanRow) },
            {
              name: 'Borrowers',
              head: ['Name', 'Class', 'Loans', 'Out now', 'Overdue', 'Lost'],
              rows: borrowers
                .filter((b) => b.totalLoans)
                .map((b) => [
                  b.fullName,
                  b.className ?? titleCase(b.role),
                  b.totalLoans,
                  b.activeLoans,
                  b.overdueLoans,
                  b.lostBooks,
                ]),
            },
            inventorySheet(books),
          ],
        };
      }
    }
  };

  const run = async (key: ReportKey, format: 'xlsx' | 'pdf') => {
    setBusy(`${key}-${format}`);
    try {
      const r = await build(key);
      if (format === 'xlsx') {
        const summarySheet: ReportSheet[] = r.summary?.length
          ? [
              {
                name: 'Summary',
                head: ['Metric', 'Value'],
                rows: [['Report', r.title], ['Period', r.subtitle ?? ''], ...r.summary],
              },
            ]
          : [];
        downloadExcel(r.filename, [...summarySheet, ...r.sections]);
      } else {
        await downloadPdf({ ...r, generatedBy: who });
      }
    } catch (e) {
      notifications.show({
        title: 'Could not build report',
        message: getResError(e),
        color: 'red',
      });
    } finally {
      setBusy(null);
    }
  };

  const reports: { key: ReportKey; title: string; desc: string; usesRange?: boolean }[] = [
    {
      key: 'full',
      title: 'Complete library report',
      desc: 'Summary, monthly trend, overdue, loans, borrowers and inventory in one file.',
      usesRange: true,
    },
    {
      key: 'loans',
      title: 'Loans by period',
      desc: 'Every book issued in the selected period with its return status.',
      usesRange: true,
    },
    {
      key: 'overdue',
      title: 'Overdue books',
      desc: 'Who still has late books, how late, and reminders sent.',
    },
    {
      key: 'borrowers',
      title: 'Borrowers & clearance',
      desc: 'All members with books held, books lost and clearance status.',
    },
    {
      key: 'inventory',
      title: 'Inventory / stock',
      desc: 'All titles with copies, availability and losses.',
    },
    {
      key: 'popular',
      title: 'Reading trends',
      desc: 'Most borrowed books, top readers, categories and classes.',
    },
    {
      key: 'monthly',
      title: 'Monthly circulation',
      desc: 'Books issued and returned per month for the last year.',
    },
  ];

  const classEntries = Object.entries(stats.byClass).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Reports & analytics"
        subtitle="Understand how the library is used and download reports for the school."
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Total loans ever"
          value={t.totalLoans}
          hint={`${t.loansThisMonth} this month`}
          icon={<FiRepeat />}
        />
        <KpiCard
          label="On-time returns"
          value={`${t.onTimeReturnRate}%`}
          icon={<FaPercent />}
          tone={t.onTimeReturnRate >= 75 ? 'teal' : 'orange'}
        />
        <KpiCard
          label="Average loan"
          value={`${t.averageLoanDays} d`}
          hint={`standard ${stats.settings.loanDays} days`}
          icon={<FiClock />}
          tone="blue"
        />
        <KpiCard
          label="Copies in use"
          value={`${t.utilizationRate}%`}
          hint={`${t.borrowedCopies} of ${t.copies}`}
          icon={<FaBook />}
          tone="gold"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Section className="xl:col-span-2" title="Issued vs returned — last 12 months">
          <IssuedReturnedLine
            labels={stats.monthly.map((m) => m.label)}
            issued={stats.monthly.map((m) => m.issued)}
            returned={stats.monthly.map((m) => m.returned)}
            height={280}
          />
        </Section>
        <Section title="Loans by borrower class">
          {classEntries.length ? (
            <DonutChart
              labels={classEntries.map(([k]) => k)}
              values={classEntries.map(([, v]) => v)}
              height={180}
              center={{ value: classEntries.reduce((a, [, v]) => a + v, 0), label: 'loans' }}
            />
          ) : (
            <p className="text-sm text-gray-500">No data yet.</p>
          )}
        </Section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Section title="Collection vs demand by category">
          <GroupedBar
            labels={stats.categories.map((c) => c.category)}
            series={[
              {
                label: 'Copies',
                values: stats.categories.map((c) => c.copies),
                color: PALETTE.violet,
              },
              { label: 'Loans', values: stats.categories.map((c) => c.loans), color: PALETTE.navy },
            ]}
            height={300}
          />
        </Section>
        <Section title="Last 30 days">
          <SimpleBar
            labels={stats.daily.map((d) => dayjs(d.date).format('DD MMM'))}
            values={stats.daily.map((d) => d.issued)}
            label="Issued"
            color={PALETTE.teal}
            height={300}
          />
        </Section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Section title="Most borrowed books">
          <RankTable
            head={['Title', 'Category', 'Loans']}
            rows={stats.topBooks.map((b) => [b.title, b.category ?? '—', b.loans])}
            max={stats.topBooks[0]?.loans ?? 1}
          />
        </Section>
        <Section title="Top readers">
          <RankTable
            head={['Name', 'Class', 'Loans']}
            rows={stats.topBorrowers.map((b) => [b.fullName, b.className ?? 'Staff', b.loans])}
            max={stats.topBorrowers[0]?.loans ?? 1}
          />
        </Section>
      </div>

      <Section
        title={
          <span className="flex items-center gap-2">
            <FaChartLine /> Download reports
          </span>
        }
        action={
          <DatePickerInput
            type="range"
            label="Period for loan reports"
            value={range}
            onChange={(v) => setRange(v as [string | null, string | null])}
            valueFormat="DD MMM YYYY"
            clearable
            w={280}
            size="xs"
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
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {reports.map((r) => (
            <div
              key={r.key}
              className={`rounded-lg border p-4 flex flex-col gap-2 ${r.key === 'full' ? 'bg-primary/5 border-primary/30' : 'bg-gray-50/60'}`}
            >
              <span className="font-semibold text-primary">{r.title}</span>
              <span className="text-xs text-gray-600 flex-1">{r.desc}</span>
              {r.usesRange && <span className="text-[11px] text-gray-500">Period: {period}</span>}
              <div className="flex flex-row gap-2 mt-1">
                <Button
                  size="xs"
                  variant="light"
                  color="green"
                  leftSection={<FaFileExcel />}
                  loading={busy === `${r.key}-xlsx`}
                  onClick={() => run(r.key, 'xlsx')}
                >
                  Excel
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  leftSection={<FaFilePdf />}
                  loading={busy === `${r.key}-pdf`}
                  onClick={() => run(r.key, 'pdf')}
                >
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function RankTable({
  head,
  rows,
  max,
}: {
  head: string[];
  rows: (string | number)[][];
  max: number;
}) {
  if (!rows.length) return <p className="text-sm text-gray-500 py-6 text-center">No data yet.</p>;
  return (
    <Table verticalSpacing="xs">
      <Table.Thead>
        <Table.Tr>
          <Table.Th className="w-8">#</Table.Th>
          {head.map((h) => (
            <Table.Th key={h} className="text-xs uppercase text-gray-500">
              {h}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((r, i) => (
          <Table.Tr key={i}>
            <Table.Td className="text-gray-400">{i + 1}</Table.Td>
            <Table.Td className="font-medium">{r[0]}</Table.Td>
            <Table.Td className="text-sm text-gray-600">{r[1]}</Table.Td>
            <Table.Td className="w-40">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${(Number(r[2]) / max) * 100}%`, minWidth: 4 }}
                />
                <span className="text-sm font-semibold">{r[2]}</span>
              </div>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
