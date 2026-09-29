'use client';
import { ActionIcon, Button, NumberInput, TextInput } from '@mantine/core';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { rwf } from './ui';

export interface Line {
  key: string;
  description: string;
  quantity: number;
  unitPrice: number | '';
  loanId?: string;
}

export const newLine = (partial: Partial<Line> = {}): Line => ({
  key: Math.random().toString(36).slice(2),
  description: '',
  quantity: 1,
  unitPrice: '',
  ...partial,
});

export const lineTotal = (lines: Line[]) =>
  lines.reduce((sum, l) => sum + (Number(l.unitPrice) || 0) * (l.quantity || 0), 0);

export const linesError = (lines: Line[]) => {
  if (!lines.length) return 'Add at least one line';
  for (const l of lines) {
    if (!l.description.trim()) return 'Every line needs a description';
    if (!l.quantity || l.quantity < 1) return 'Quantity must be at least 1';
    if (!Number(l.unitPrice) || Number(l.unitPrice) <= 0) return `Enter a price for "${l.description}"`;
  }
  return null;
};

export const linesPayload = (lines: Line[]) =>
  lines.map((l) => ({
    description: l.description.trim(),
    quantity: l.quantity,
    unitPrice: Number(l.unitPrice),
    ...(l.loanId ? { loanId: l.loanId } : {}),
  }));

export default function LineItemsEditor({
  lines,
  onChange,
  descriptionLabel = 'Description',
  descriptionPlaceholder = 'e.g. Tuition',
  quantityLabel = 'Qty',
}: {
  lines: Line[];
  onChange: (lines: Line[]) => void;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  quantityLabel?: string;
}) {
  const update = (key: string, patch: Partial<Line>) =>
    onChange(lines.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  return (
    <div className="flex flex-col gap-2">
      <div className="hidden md:grid grid-cols-[1fr_80px_140px_120px_32px] gap-2 text-xs font-medium text-gray-500 px-1">
        <span>{descriptionLabel}</span>
        <span>{quantityLabel}</span>
        <span>Unit price (RWF)</span>
        <span className="text-right">Amount</span>
        <span />
      </div>
      {lines.map((l) => (
        <div
          key={l.key}
          className="grid grid-cols-1 md:grid-cols-[1fr_80px_140px_120px_32px] gap-2 items-center"
        >
          <TextInput
            value={l.description}
            onChange={(e) => update(l.key, { description: e.currentTarget.value })}
            placeholder={descriptionPlaceholder}
            aria-label={descriptionLabel}
            maxLength={255}
            readOnly={!!l.loanId}
            rightSection={l.loanId ? <span className="text-[10px] text-purple-600">catalog</span> : null}
            rightSectionWidth={l.loanId ? 52 : undefined}
          />
          <NumberInput
            value={l.quantity}
            onChange={(v) => update(l.key, { quantity: Number(v) || 1 })}
            min={1}
            max={1000}
            allowDecimal={false}
            aria-label={quantityLabel}
            disabled={!!l.loanId}
          />
          <NumberInput
            value={l.unitPrice}
            onChange={(v) => update(l.key, { unitPrice: v === '' ? '' : Number(v) })}
            min={0}
            allowDecimal={false}
            thousandSeparator=","
            placeholder="0"
            aria-label="Unit price"
          />
          <span className="text-sm font-semibold text-primary md:text-right">
            {rwf((Number(l.unitPrice) || 0) * (l.quantity || 0))}
          </span>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => onChange(lines.filter((x) => x.key !== l.key))}
            disabled={lines.length === 1}
            aria-label="Remove line"
          >
            <FiTrash2 />
          </ActionIcon>
        </div>
      ))}
      <div className="flex flex-row items-center justify-between border-t pt-2 mt-1">
        <Button
          variant="subtle"
          size="xs"
          leftSection={<FiPlus />}
          onClick={() => onChange([...lines, newLine()])}
        >
          Add line
        </Button>
        <span className="text-sm">
          Total <b className="text-primary text-base ml-1">{rwf(lineTotal(lines))}</b>
        </span>
      </div>
    </div>
  );
}
