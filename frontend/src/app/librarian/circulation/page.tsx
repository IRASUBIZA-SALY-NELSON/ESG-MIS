'use client';
import IssueBookForm from '@/components/library/IssueBookForm';
import LoansTable from '@/components/library/LoansTable';
import ReturnBookForm from '@/components/library/ReturnBookForm';
import { useLibrary } from '@/components/library/api';
import { LibrarySettings, Loan } from '@/components/library/types';
import { ErrorBlock, LoadingBlock, PageHeader, Section } from '@/components/library/ui';
import { SegmentedControl, TextInput } from '@mantine/core';
import { useMemo, useState } from 'react';
import { FiArrowDownLeft, FiArrowUpRight, FiSearch } from 'react-icons/fi';

export default function CirculationPage() {
  const { data: settings } = useLibrary<LibrarySettings>('/library/settings');
  const {
    data: loans,
    loading,
    error,
    refresh,
  } = useLibrary<Loan[]>('/library/loans?status=ACTIVE');
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');

  const counts = useMemo(
    () => ({
      all: loans?.length ?? 0,
      overdue: loans?.filter((l) => l.overdue).length ?? 0,
      soon: loans?.filter((l) => l.dueSoon).length ?? 0,
    }),
    [loans],
  );

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (loans ?? []).filter((l) => {
      if (filter === 'overdue' && !l.overdue) return false;
      if (filter === 'soon' && !l.dueSoon) return false;
      if (!query) return true;
      return [l.bookTitle, l.accessionNumber, l.borrowerName, l.className, l.borrowerEmail]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(query));
    });
  }, [loans, filter, q]);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title="Circulation desk"
        subtitle={
          settings
            ? `Loan period ${settings.loanDays} days · up to ${settings.maxActiveLoans} books per borrower`
            : 'Issue and receive books'
        }
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Section
          title={
            <span className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 text-primary p-1.5">
                <FiArrowUpRight />
              </span>
              Issue a book
            </span>
          }
        >
          <IssueBookForm />
        </Section>
        <Section
          title={
            <span className="flex items-center gap-2">
              <span className="rounded-full bg-teal-50 text-teal-600 p-1.5">
                <FiArrowDownLeft />
              </span>
              Return a book
            </span>
          }
        >
          <ReturnBookForm />
        </Section>
      </div>

      <Section
        title={`Books currently out (${counts.all})`}
        action={
          <div className="flex flex-row flex-wrap gap-2 items-center">
            <SegmentedControl
              size="xs"
              value={filter}
              onChange={setFilter}
              data={[
                { value: 'all', label: `All (${counts.all})` },
                { value: 'overdue', label: `Overdue (${counts.overdue})` },
                { value: 'soon', label: `Due soon (${counts.soon})` },
              ]}
            />
            <TextInput
              size="xs"
              placeholder="Search book, copy, borrower…"
              leftSection={<FiSearch />}
              value={q}
              onChange={(e) => setQ(e.currentTarget.value)}
              w={240}
            />
          </div>
        }
      >
        {loading ? (
          <LoadingBlock />
        ) : error ? (
          <ErrorBlock message={error} onRetry={() => refresh()} />
        ) : (
          <LoansTable
            loans={visible}
            show={['book', 'borrower', 'issued', 'due', 'status', 'reminders', 'actions']}
            defaultSort={{ key: 'due', dir: 'asc' }}
            empty={filter === 'all' && !q ? 'No books are out right now.' : 'No loan matches.'}
          />
        )}
      </Section>
    </div>
  );
}
