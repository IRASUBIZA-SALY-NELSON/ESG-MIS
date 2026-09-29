'use client';
import { libraryAction, useLibrary } from '@/components/library/api';
import { LibrarySettings } from '@/components/library/types';
import { ErrorBlock, LoadingBlock, PageHeader, Section } from '@/components/library/ui';
import { Button, NumberInput, Switch } from '@mantine/core';
import React, { useEffect, useState } from 'react';

export default function LibrarySettingsPage() {
  const { data, loading, error, refresh } = useLibrary<LibrarySettings>('/library/settings');
  const [form, setForm] = useState<LibrarySettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (loading || (!form && !error)) return <LoadingBlock />;
  if (error || !form)
    return <ErrorBlock message={error ?? 'No settings'} onRetry={() => refresh()} />;

  const set = <K extends keyof LibrarySettings>(key: K, value: LibrarySettings[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));
  const numeric = (key: keyof LibrarySettings) => (v: string | number) =>
    set(key, (v === '' ? 0 : Number(v)) as never);
  const dirty = JSON.stringify(form) !== JSON.stringify(data);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await libraryAction('put', '/library/settings', form, { success: 'Library rules saved' });
    setSaving(false);
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-4 pb-6 max-w-4xl">
      <PageHeader
        title="Library rules"
        subtitle="These rules apply to every new loan, renewal and reminder."
        actions={
          <>
            <Button variant="default" disabled={!dirty} onClick={() => setForm(data!)}>
              Reset
            </Button>
            <Button type="submit" color="#024F3A" loading={saving} disabled={!dirty}>
              Save rules
            </Button>
          </>
        }
      />

      <Section title="Loans">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberInput
            label="Loan period (days)"
            description="Default due date when a book is issued"
            min={1}
            max={180}
            value={form.loanDays}
            onChange={numeric('loanDays')}
          />
          <NumberInput
            label="Maximum books per borrower"
            description="How many books one person can hold at the same time"
            min={1}
            max={50}
            value={form.maxActiveLoans}
            onChange={numeric('maxActiveLoans')}
          />
          <NumberInput
            label="Maximum renewals per loan"
            min={0}
            max={20}
            value={form.maxRenewals}
            onChange={numeric('maxRenewals')}
          />
          <NumberInput
            label="Days added per renewal"
            min={1}
            max={90}
            value={form.renewalDays}
            onChange={numeric('renewalDays')}
          />
          <Switch
            className="md:col-span-2"
            color="#024F3A"
            label="Block borrowing while a borrower has an overdue book"
            description="Recommended: the borrower must return late books before taking new ones"
            checked={form.blockWhenOverdue}
            onChange={(e) => set('blockWhenOverdue', e.currentTarget.checked)}
          />
        </div>
      </Section>

      <Section title="Reminders">
        <NumberInput
          label="“Due soon” window (days)"
          description="Loans due within this many days show as due soon and can receive a due-soon reminder"
          min={0}
          max={30}
          value={form.dueSoonDays}
          onChange={numeric('dueSoonDays')}
          className="max-w-md"
        />
      </Section>
    </form>
  );
}
