'use client';
import {
  ActionIcon,
  Alert,
  Button,
  Menu,
  Modal,
  NumberInput,
  Select,
  Textarea,
  Tooltip,
} from '@mantine/core';
import React, { useState } from 'react';
import {
  FiBell,
  FiCheckCircle,
  FiMoreVertical,
  FiRefreshCw,
  FiXOctagon,
} from 'react-icons/fi';
import { libraryAction, useLibrary } from './api';
import { LibrarySettings, Loan } from './types';
import { fmtDate } from './ui';

type Kind = 'return' | 'renew' | 'remind' | 'lost';

export const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
  { value: 'DAMAGED', label: 'Damaged (take copy out of circulation)' },
];

/** Row-level menu for a loan; opens the matching confirmation dialog. */
export default function LoanActions({
  loan,
  compact = false,
  onDone,
}: {
  loan: Loan;
  compact?: boolean;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState<Kind | null>(null);
  const active = loan.status === 'ACTIVE';

  if (!active) return <span className="text-gray-300 text-xs">—</span>;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex flex-row items-center gap-1 justify-end"
    >
      {active && !compact && (
        <Tooltip label="Receive this book back">
          <Button size="compact-xs" variant="light" color="teal" onClick={() => setOpen('return')}>
            Return
          </Button>
        </Tooltip>
      )}
      <Menu position="bottom-end" withinPortal shadow="md" width={200}>
        <Menu.Target>
          <ActionIcon variant="subtle" color="gray" aria-label="More actions">
            <FiMoreVertical />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<FiCheckCircle />} onClick={() => setOpen('return')}>
            Return book
          </Menu.Item>
          <Menu.Item leftSection={<FiRefreshCw />} onClick={() => setOpen('renew')}>
            Renew loan
          </Menu.Item>
          <Menu.Item leftSection={<FiBell />} onClick={() => setOpen('remind')}>
            Send reminder
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item color="red" leftSection={<FiXOctagon />} onClick={() => setOpen('lost')}>
            Mark as lost
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      {open && (
        <LoanDialog
          kind={open}
          loan={loan}
          onClose={() => setOpen(null)}
          onDone={() => {
            setOpen(null);
            onDone?.();
          }}
        />
      )}
    </div>
  );
}

const titles: Record<Kind, string> = {
  return: 'Return book',
  renew: 'Renew loan',
  remind: 'Send reminder',
  lost: 'Mark book as lost',
};

export function LoanDialog({
  kind,
  loan,
  onClose,
  onDone,
}: {
  kind: Kind;
  loan: Loan;
  onClose: () => void;
  onDone: () => void;
}) {
  const { data: settings } = useLibrary<LibrarySettings>('/library/settings');
  const [condition, setCondition] = useState<string | null>(loan.conditionOnIssue ?? 'GOOD');
  const [notes, setNotes] = useState('');
  const [days, setDays] = useState<number | string>('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    let result;
    switch (kind) {
      case 'return':
        result = await libraryAction('post', '/library/loans/return', {
          loanId: loan.id,
          condition,
          notes: notes || undefined,
        });
        break;
      case 'renew':
        result = await libraryAction('post', `/library/loans/${loan.id}/renew`, {
          days: days === '' ? undefined : Number(days),
        });
        break;
      case 'remind':
        result = await libraryAction('post', `/library/loans/${loan.id}/remind`, {
          message: notes || undefined,
        });
        break;
      case 'lost':
        result = await libraryAction('post', `/library/loans/${loan.id}/lost`, {
          notes: notes || undefined,
        });
        break;
    }
    setBusy(false);
    if (result) onDone();
  };

  const color = kind === 'lost' ? 'red' : 'teal';

  return (
    <Modal opened onClose={onClose} title={<b className="text-primary">{titles[kind]}</b>} centered>
      <div className="flex flex-col gap-3">
        <div className="rounded-md bg-gray-50 border p-3 text-sm flex flex-col gap-0.5">
          <span className="font-semibold text-primary">{loan.bookTitle}</span>
          <span className="text-gray-600">
            Copy <b>{loan.accessionNumber}</b> · {loan.borrowerName}
            {loan.className ? ` (${loan.className})` : ''}
          </span>
          <span className="text-gray-600">
            Issued {fmtDate(loan.issuedAt)} · Due {fmtDate(loan.dueDate)}
            {loan.renewals ? ` · renewed ${loan.renewals}×` : ''}
          </span>
        </div>

        {kind === 'return' && (
          <>
            {loan.overdue ? (
              <Alert color="orange" variant="light">
                This book is <b>{loan.daysOverdue} day(s) late</b>. The late return will be noted in
                the borrower&apos;s history.
              </Alert>
            ) : (
              <Alert color="teal" variant="light">
                Returned on time.
              </Alert>
            )}
            <Select
              label="Condition on return"
              data={CONDITIONS}
              value={condition}
              onChange={setCondition}
              allowDeselect={false}
              description={`Condition when issued: ${loan.conditionOnIssue ?? 'not recorded'}`}
            />
            <Textarea
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
            />
          </>
        )}

        {kind === 'renew' && (
          <>
            <NumberInput
              label="Extend by (days)"
              placeholder={`${settings?.renewalDays ?? 7} (default)`}
              min={1}
              max={60}
              value={days}
              onChange={setDays}
            />
            <p className="text-xs text-gray-500">
              Renewals used: {loan.renewals} of {settings?.maxRenewals ?? '—'}. Overdue books cannot
              be renewed until returned.
            </p>
          </>
        )}

        {kind === 'remind' && (
          <Textarea
            label="Message"
            description="Leave empty to send the standard reminder with the due date."
            autosize
            minRows={3}
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
          />
        )}

        {kind === 'lost' && (
          <>
            <Alert color="red" variant="light">
              The copy will be removed from circulation and the loss recorded against the borrower.
            </Alert>
            <Textarea
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
            />
          </>
        )}

        <div className="flex flex-row justify-end gap-2 mt-1">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button color={color} loading={busy} onClick={submit}>
            {titles[kind]}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
