'use client';
import { useLibrary } from '@/components/library/api';
import { Select } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useMemo, useState } from 'react';
import { useFinance } from './api';
import { StudentBalance } from './types';
import { rwf } from './ui';

export interface PickedStudent {
  id: string;
  name: string;
  className?: string;
  email?: string;
}

interface Borrower {
  id: string;
  fullName: string;
  email?: string;
  role: string;
  className?: string;
}

/** Student search. The finance office loads every student; the library uses its borrower search. */
export default function StudentPicker({
  source,
  value,
  onChange,
  disabled,
}: {
  source: 'finance' | 'library';
  value: PickedStudent | null;
  onChange: (student: PickedStudent | null) => void;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 250);
  const { data: all } = useFinance<StudentBalance[]>(source === 'finance' ? '/finance/students' : null);
  const { data: found } = useLibrary<Borrower[]>(
    source === 'library' && debounced.trim().length >= 2
      ? `/library/borrowers/search?q=${encodeURIComponent(debounced.trim())}`
      : null,
  );

  const options: PickedStudent[] = useMemo(() => {
    const list: PickedStudent[] =
      source === 'finance'
        ? (all ?? []).map((s) => ({
            id: s.studentId,
            name: s.studentName,
            className: s.className,
            email: s.studentEmail,
          }))
        : (found ?? [])
            .filter((b) => b.role === 'STUDENT')
            .map((b) => ({ id: b.id, name: b.fullName, className: b.className, email: b.email }));
    if (value && !list.some((s) => s.id === value.id)) list.unshift(value);
    return list;
  }, [source, all, found, value]);

  const balances = useMemo(
    () => new Map((all ?? []).map((s) => [s.studentId, s.balance])),
    [all],
  );

  return (
    <Select
      label="Student"
      placeholder={source === 'library' ? 'Type at least 2 letters of the name or email' : 'Search by name, class or email'}
      searchable
      clearable
      required
      disabled={disabled}
      nothingFoundMessage={
        source === 'library' && debounced.trim().length < 2 ? 'Keep typing…' : 'No student found'
      }
      searchValue={search}
      onSearchChange={setSearch}
      value={value?.id ?? null}
      onChange={(id) => onChange(options.find((s) => s.id === id) ?? null)}
      data={options.map((s) => ({
        value: s.id,
        label: `${s.name}${s.className ? ` · ${s.className}` : ''}`,
      }))}
      filter={source === 'library' ? ({ options: o }) => o : undefined}
      limit={50}
      description={
        value && source === 'finance' && (balances.get(value.id) ?? 0) > 0
          ? `Already owes ${rwf(balances.get(value.id))} on published bills`
          : undefined
      }
    />
  );
}
