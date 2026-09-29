'use client';
import { Alert, Button, FileButton, NumberInput, SegmentedControl, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { useState } from 'react';
import { FiPaperclip } from 'react-icons/fi';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { refreshFinance } from './api';
import { Bill, Payment, PaymentMethod } from './types';
import { METHOD_LABELS, rwf } from './ui';

/** Student claims a payment and uploads a photo/PDF of the slip or Mobile Money screenshot. */
export default function StudentPayForm({ bill, onDone }: { bill: Bill; onDone: (payment?: Payment) => void }) {
  const pending = (bill.payments ?? [])
    .filter((p) => p.status === 'PENDING_REVIEW')
    .reduce((s, p) => s + p.amount, 0);
  const available = Math.max(bill.balance - pending, 0);

  const [amount, setAmount] = useState<number | ''>(available || '');
  const [method, setMethod] = useState<PaymentMethod>('MOBILE_MONEY');
  const [reference, setReference] = useState('');
  const [paidOn, setPaidOn] = useState(dayjs().format('YYYY-MM-DD'));
  const [note, setNote] = useState('');
  const [proof, setProof] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const value = Number(amount);
    if (!value || value <= 0) return setError('Enter the amount you paid');
    if (value > available) return setError(`You can only claim up to ${rwf(available)} right now`);
    if (method !== 'CASH' && !reference.trim())
      return setError(method === 'BANK' ? 'Enter the bank slip number' : 'Enter the Mobile Money transaction ID');
    if (!proof) return setError('Upload a photo or PDF of the payment as proof');
    if (proof.size > 8 * 1024 * 1024) return setError('Proof files can be at most 8 MB');

    const form = new FormData();
    form.append('amount', String(value));
    form.append('method', method);
    if (reference.trim()) form.append('reference', reference.trim());
    form.append('paidOn', paidOn);
    if (note.trim()) form.append('note', note.trim());
    form.append('proof', proof);

    setSaving(true);
    try {
      const res = await AuthApi.post(`/finance/me/bills/${bill.id}/pay`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      notifications.show({
        title: 'Proof submitted',
        message:
          bill.department === 'LIBRARY'
            ? 'The librarian will check your payment and approve it.'
            : 'The accountant will check your payment and approve it.',
        color: 'teal',
      });
      refreshFinance();
      onDone(res.data?.data);
    } catch (e) {
      setError(getResError(e));
    } finally {
      setSaving(false);
    }
  };

  if (available <= 0) {
    return (
      <Alert color="blue" variant="light">
        {pending > 0
          ? 'A payment proof is already waiting for review on this bill.'
          : 'This bill is fully paid.'}
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md bg-gray-50 border px-3 py-2 text-sm flex flex-row flex-wrap justify-between gap-2">
        <span>
          <b>{bill.title}</b> · {bill.billNumber}
        </span>
        <span>
          Still to pay <b className="text-red-600">{rwf(available)}</b>
        </span>
      </div>
      <NumberInput
        label="Amount you paid (RWF)"
        value={amount}
        onChange={(v) => setAmount(v === '' ? '' : Number(v))}
        min={1}
        max={available}
        allowDecimal={false}
        thousandSeparator=","
        required
      />
      <div>
        <p className="text-sm font-medium mb-1">Paid by</p>
        <SegmentedControl
          fullWidth
          value={method}
          onChange={(v) => setMethod(v as PaymentMethod)}
          data={(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((m) => ({
            value: m,
            label: METHOD_LABELS[m],
          }))}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextInput
          label={method === 'BANK' ? 'Bank slip number' : method === 'MOBILE_MONEY' ? 'Transaction ID' : 'Reference'}
          value={reference}
          onChange={(e) => setReference(e.currentTarget.value)}
          required={method !== 'CASH'}
          placeholder={method === 'CASH' ? 'Optional' : 'As shown on the receipt'}
        />
        <DateInput
          label="Date paid"
          value={dayjs(paidOn).toDate()}
          onChange={(d: any) => d && setPaidOn(dayjs(d).format('YYYY-MM-DD'))}
          valueFormat="DD MMM YYYY"
          maxDate={new Date()}
        />
      </div>
      <div className="flex flex-row flex-wrap items-center gap-3">
        <FileButton onChange={setProof} accept="image/png,image/jpeg,image/webp,application/pdf">
          {(props) => (
            <Button {...props} variant="light" leftSection={<FiPaperclip />}>
              {proof ? 'Change proof file' : 'Upload proof (photo or PDF)'}
            </Button>
          )}
        </FileButton>
        {proof && <span className="text-sm text-gray-600">{proof.name}</span>}
      </div>
      <Textarea
        label="Note"
        placeholder="Optional"
        value={note}
        onChange={(e) => setNote(e.currentTarget.value)}
        maxLength={255}
      />
      {error && (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      )}
      <div className="flex justify-end gap-2 border-t pt-3">
        <Button variant="default" onClick={() => onDone()} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={submit} loading={saving}>
          Submit for approval
        </Button>
      </div>
    </div>
  );
}
