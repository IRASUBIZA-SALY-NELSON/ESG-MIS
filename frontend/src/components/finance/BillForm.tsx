'use client';
import { Alert, Button, Select, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { FiBookOpen } from 'react-icons/fi';
import DraftNotice from '@/components/core/DraftNotice';
import { useStateDraft } from '@/hooks/useFormDraft';
import { financeAction, useFinance } from './api';
import LineItemsEditor, { Line, lineTotal, linesError, linesPayload, newLine } from './LineItemsEditor';
import StudentPicker, { PickedStudent } from './StudentPicker';
import { Bill, UnbilledLoss } from './types';
import { CATEGORY_LABELS, FINANCE_CATEGORIES, rwf } from './ui';

interface TermOption {
  id: string;
  name: string;
  academicYear?: { name?: string };
}

const termText = (t: TermOption) => {
  const name = t.name.replace(/_/g, ' ').toLowerCase();
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}${t.academicYear?.name ? ` ${t.academicYear.name}` : ''}`;
};

export const useTerms = (enabled = true) => {
  const { data } = useFinance<TermOption[] | { content: TermOption[] }>(enabled ? '/terms/all' : null);
  const list = Array.isArray(data) ? data : data?.content ?? [];
  return list.map((t) => ({ value: t.id, label: termText(t) }));
};

/**
 * Creates (or edits a draft of) one student's bill.
 * The library variant only offers book categories and suggests lost books that are not billed yet.
 */
export default function BillForm({
  mode,
  bill,
  initialStudent,
  onDone,
}: {
  mode: 'finance' | 'library';
  bill?: Bill;
  initialStudent?: PickedStudent | null;
  onDone: (bill?: Bill) => void;
}) {
  const library = mode === 'library';
  const base = library ? '/library/bills' : '/finance/bills';
  const [student, setStudent] = useState<PickedStudent | null>(
    bill
      ? { id: bill.studentId, name: bill.studentName, className: bill.className }
      : initialStudent ?? null,
  );
  const [category, setCategory] = useState<string>(bill?.category ?? (library ? 'LOST_BOOK' : 'SCHOOL_FEES'));
  const [title, setTitle] = useState(bill?.title ?? '');
  const [description, setDescription] = useState(bill?.description ?? '');
  const [termId, setTermId] = useState<string | null>(bill?.termId ?? null);
  const [dueDate, setDueDate] = useState<string | null>(
    bill?.dueDate ?? dayjs().add(library ? 14 : 30, 'day').format('YYYY-MM-DD'),
  );
  const [lines, setLines] = useState<Line[]>(
    bill?.items.length
      ? bill.items.map((i) =>
          newLine({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, loanId: i.loanId }),
        )
      : [newLine()],
  );
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const terms = useTerms(!library);
  const creating = !bill;
  const { savedAt, clear } = useStateDraft(
    creating ? `${mode}-bill-new` : `${mode}-bill-${bill.id}`,
    {
      student,
      category,
      title,
      description,
      termId,
      dueDate,
      lines,
    },
    (extra) => {
      if (extra.student) setStudent(extra.student as PickedStudent);
      if (typeof extra.category === 'string') setCategory(extra.category);
      if (typeof extra.title === 'string') setTitle(extra.title);
      if (typeof extra.description === 'string') setDescription(extra.description);
      if (extra.termId === null || typeof extra.termId === 'string') setTermId((extra.termId as string | null) ?? null);
      if (extra.dueDate === null || typeof extra.dueDate === 'string') setDueDate((extra.dueDate as string | null) ?? null);
      if (Array.isArray(extra.lines)) setLines(extra.lines as Line[]);
    },
  );

  const { data: losses } = useFinance<UnbilledLoss[]>(
    library && student && !bill ? `/library/bills/unbilled-losses?studentId=${student.id}` : null,
  );
  const suggestions = (losses ?? []).filter((l) => !lines.some((x) => x.loanId === l.loanId));

  useEffect(() => {
    setError(null);
  }, [student, lines, title]);

  const addLoss = (loss: UnbilledLoss) => {
    const blank = lines.length === 1 && !lines[0].description && !lines[0].unitPrice;
    const line = newLine({ description: loss.title, quantity: 1, loanId: loss.loanId });
    setLines(blank ? [line] : [...lines, line]);
  };

  const submit = async (publish: boolean) => {
    if (!student) return setError('Choose the student');
    const problem = linesError(lines);
    if (problem) return setError(problem);
    if (!library && !title.trim()) return setError('Give the bill a title, e.g. "School fees: Term 1 2026"');
    setSaving(publish ? 'publish' : 'draft');
    const body = {
      studentId: student.id,
      category,
      title: title.trim() || undefined,
      description: description.trim() || null,
      termId: library ? undefined : termId,
      dueDate,
      items: linesPayload(lines),
      publish,
    };
    let saved: Bill | undefined;
    if (bill) {
      saved = await financeAction<Bill>('put', `${base}/${bill.id}`, body, { success: 'Draft saved' });
      if (saved && publish) {
        const published = await financeAction<Bill[]>('post', `${base}/publish`, { ids: [bill.id] }, {
          success: 'Bill published. The student and parents can now see it.',
        });
        saved = published?.[0] ?? saved;
      }
    } else {
      saved = await financeAction<Bill>('post', base, body, {
        success: publish ? 'Bill published. The student and parents can now see it.' : 'Saved as draft',
      });
    }
    setSaving(null);
    if (saved) {
      clear();
      onDone(saved);
    }
  };

  const categories = library ? ['LOST_BOOK', 'DAMAGED_BOOK'] : FINANCE_CATEGORIES;

  return (
    <div className="flex flex-col gap-3">
      {creating && (
        <DraftNotice
          savedAt={savedAt}
          onDiscard={() => {
            clear();
            setStudent(initialStudent ?? null);
            setCategory(library ? 'LOST_BOOK' : 'SCHOOL_FEES');
            setTitle('');
            setDescription('');
            setTermId(null);
            setLines([newLine()]);
          }}
        />
      )}
      <StudentPicker source={mode} value={student} onChange={setStudent} disabled={!!bill} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Select
          label="Type of bill"
          data={categories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
          value={category}
          onChange={(v) => v && setCategory(v)}
          allowDeselect={false}
        />
        <DateInput
          label="Pay by"
          value={dueDate ? dayjs(dueDate).toDate() : null}
          onChange={(d: any) => setDueDate(d ? dayjs(d).format('YYYY-MM-DD') : null)}
          valueFormat="DD MMM YYYY"
          clearable
          minDate={bill ? undefined : new Date()}
        />
      </div>
      <TextInput
        label="Title"
        placeholder={library ? 'Leave empty to use the book titles' : 'e.g. School fees: Term 1 2026'}
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        maxLength={200}
        required={!library}
      />
      {!library && (
        <Select
          label="Term"
          placeholder="Optional"
          data={terms}
          value={termId}
          onChange={setTermId}
          clearable
        />
      )}

      {library && suggestions.length > 0 && (
        <Alert color="grape" variant="light" icon={<FiBookOpen />} title="Lost books not billed yet">
          <div className="flex flex-row flex-wrap gap-2 mt-1">
            {suggestions.map((l) => (
              <Button key={l.loanId} size="xs" variant="white" color="grape" onClick={() => addLoss(l)}>
                + {l.title}
                {l.accessionNumber ? ` (${l.accessionNumber})` : ''}
              </Button>
            ))}
          </div>
        </Alert>
      )}

      <div>
        <p className="text-sm font-medium mb-1">
          {library ? 'Books charged' : 'What is charged'}
          {library && (
            <span className="text-xs text-gray-500 font-normal ml-2">
              Type any book title, even if it is not in the catalog.
            </span>
          )}
        </p>
        <LineItemsEditor
          lines={lines}
          onChange={setLines}
          descriptionLabel={library ? 'Book title' : 'Description'}
          descriptionPlaceholder={library ? 'e.g. Physics for Rwanda Secondary Schools S4' : 'e.g. Tuition'}
          quantityLabel={library ? 'Books' : 'Qty'}
        />
      </div>

      <Textarea
        label="Note for the student and parents"
        placeholder="Optional"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
        autosize
        minRows={2}
        maxLength={4000}
      />

      {error && (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      )}

      <div className="flex flex-row flex-wrap justify-between items-center gap-2 border-t pt-3">
        <span className="text-xs text-gray-500">
          Drafts are only visible to your office. Publishing shows the bill to the student and parents.
        </span>
        <div className="flex flex-row gap-2">
          <Button variant="default" onClick={() => submit(false)} loading={saving === 'draft'} disabled={!!saving}>
            Save as draft
          </Button>
          <Button onClick={() => submit(true)} loading={saving === 'publish'} disabled={!!saving}>
            Publish {lineTotal(lines) > 0 ? rwf(lineTotal(lines)) : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}
