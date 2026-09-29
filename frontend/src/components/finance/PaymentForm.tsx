'use client';
import { Alert, Button, NumberInput, SegmentedControl, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useState } from 'react';
import { financeAction } from './api';
import { Bill, Payment, PaymentMethod } from './types';
import { METHOD_LABELS, rwf } from './ui';

export default function PaymentForm({ bill, onDone }: { bill: Bill; onDone: (payment?: Payment) => void }) {
  const [amount, setAmount] = useState<number | ''>(bill.balance);
  const [method, setMethod] = useState<PaymentMethod>('MOBILE_MONEY');
  const [reference, setReference] = useState('');
  const [paidOn, setPaidOn] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const value = Number(amount);
    if (!value || value <= 0) return setError('Enter the amount received');
    if (value > bill.balance) return setError(`The remaining balance is only ${rwf(bill.balance)}`);
    if (method !== 'CASH' && !reference.trim())
      return setError(method === 'BANK' ? 'Enter the bank slip number' : 'Enter the Mobile Money transaction ID');
    setSaving(true);
    const payment = await financeAction<Payment>(
      'post',
      `/finance/bills/${bill.id}/payments`,
      { amount: value, method, reference: reference.trim() || null, paidOn, note: note.trim() || null },
      { success: `Payment recorded for ${bill.studentName}` },
    );
    setSaving(false);
    if (payment) onDone(payment);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md bg-gray-50 border px-3 py-2 text-sm flex flex-row flex-wrap justify-between gap-2">
        <span>
          <b>{bill.studentName}</b> · {bill.billNumber}
        </span>
        <span>
          Balance <b className="text-red-600">{rwf(bill.balance)}</b> of {rwf(bill.amount)}
        </span>
      </div>
      <NumberInput
        label="Amount received (RWF)"
        value={amount}
        onChange={(v) => setAmount(v === '' ? '' : Number(v))}
        min={1}
        max={bill.balance}
        allowDecimal={false}
        thousandSeparator=","
        required
        description="Instalments are allowed. The rest stays on the bill."
      />
      <div>
        <p className="text-sm font-medium mb-1">Paid by</p>
        <SegmentedControl
          fullWidth
          value={method}
          onChange={(v) => setMethod(v as PaymentMethod)}
          data={(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((m) => ({ value: m, label: METHOD_LABELS[m] }))}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextInput
          label={method === 'BANK' ? 'Bank slip number' : method === 'MOBILE_MONEY' ? 'Transaction ID' : 'Reference'}
          placeholder={method === 'CASH' ? 'Optional' : method === 'BANK' ? 'e.g. BK-48213377' : 'e.g. MP2409281234'}
          value={reference}
          onChange={(e) => setReference(e.currentTarget.value)}
          required={method !== 'CASH'}
          maxLength={100}
        />
        <DateInput
          label="Date paid"
          value={dayjs(paidOn).toDate()}
          onChange={(d: any) => d && setPaidOn(dayjs(d).format('YYYY-MM-DD'))}
          valueFormat="DD MMM YYYY"
          maxDate={new Date()}
        />
      </div>
      <Textarea label="Note" placeholder="Optional" value={note} onChange={(e) => setNote(e.currentTarget.value)} maxLength={255} />
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
          Record {Number(amount) > 0 ? rwf(Number(amount)) : 'payment'}
        </Button>
      </div>
    </div>
  );
}
