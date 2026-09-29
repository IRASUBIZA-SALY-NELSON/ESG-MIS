'use client';
import { Alert, Button, Select, TextInput, Textarea } from '@mantine/core';
import React, { useMemo, useState } from 'react';
import { FiHash } from 'react-icons/fi';
import { CONDITIONS } from './LoanActions';
import { libraryAction, useLibrary } from './api';
import { Loan } from './types';
import { LoanStatusBadge, fmtDate } from './ui';

/** Quick return by copy number: finds the open loan, shows how late it is, and checks the book in. */
export default function ReturnBookForm({ onReturned }: { onReturned?: (loan: Loan) => void }) {
  const { data: active } = useLibrary<Loan[]>('/library/loans?status=ACTIVE');
  const [code, setCode] = useState('');
  const [condition, setCondition] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const query = code.trim().toUpperCase();
  const matches = useMemo(() => {
    if (query.length < 3) return [];
    return (active ?? []).filter(
      (l) =>
        l.accessionNumber.toUpperCase() === query ||
        l.accessionNumber.toUpperCase().endsWith(query) ||
        l.bookTitle.toUpperCase().includes(query) ||
        l.borrowerName.toUpperCase().includes(query),
    );
  }, [active, query]);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const loan = matches.length === 1 ? matches[0] : matches.find((l) => l.id === pickedId);

  const submit = async () => {
    if (!loan) return;
    setBusy(true);
    const result = await libraryAction<Loan>(
      'post',
      '/library/loans/return',
      {
        loanId: loan.id,
        condition: condition ?? loan.conditionOnIssue ?? 'GOOD',
        notes: notes || undefined,
      },
      {
        success:
          loan.overdue
            ? `Received, ${loan.daysOverdue} day(s) late.`
            : 'Book received back on time.',
      },
    );
    setBusy(false);
    if (result) {
      setCode('');
      setNotes('');
      setCondition(null);
      setPickedId(null);
      onReturned?.(result);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <TextInput
        label="Copy number, book title or borrower"
        placeholder="e.g. ESG-L-00012 or just 12"
        leftSection={<FiHash />}
        value={code}
        onChange={(e) => {
          setCode(e.currentTarget.value);
          setPickedId(null);
        }}
        onKeyDown={(e) => e.key === 'Enter' && loan && submit()}
      />
      {query.length >= 3 && matches.length === 0 && (
        <Alert color="gray" variant="light">
          No book currently on loan matches “{code}”.
        </Alert>
      )}
      {matches.length > 1 && (
        <Select
          label={`${matches.length} loans match — pick one`}
          data={matches.map((l) => ({
            value: l.id,
            label: `${l.accessionNumber} · ${l.bookTitle} · ${l.borrowerName}`,
          }))}
          value={pickedId}
          onChange={setPickedId}
        />
      )}
      {loan && (
        <>
          <div className="rounded-md border bg-gray-50 p-3 text-sm flex flex-col gap-1">
            <div className="flex flex-row items-center justify-between gap-2">
              <span className="font-semibold text-primary">{loan.bookTitle}</span>
              <LoanStatusBadge loan={loan} />
            </div>
            <span className="text-gray-600">
              {loan.accessionNumber} · borrowed by <b>{loan.borrowerName}</b>
              {loan.className ? ` (${loan.className})` : ''}
            </span>
            <span className="text-gray-600">
              Issued {fmtDate(loan.issuedAt)} · due {fmtDate(loan.dueDate)}
            </span>
            {loan.overdue && (
              <span className="text-red-600 font-medium">
                {loan.daysOverdue} day(s) late
              </span>
            )}
          </div>
          <Select
            label="Condition on return"
            data={CONDITIONS}
            value={condition ?? loan.conditionOnIssue ?? 'GOOD'}
            onChange={setCondition}
            allowDeselect={false}
          />
          <Textarea
            label="Notes (optional)"
            autosize
            minRows={1}
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
          />
        </>
      )}
      <Button color="teal" disabled={!loan} loading={busy} onClick={submit}>
        Receive book
      </Button>
    </div>
  );
}
