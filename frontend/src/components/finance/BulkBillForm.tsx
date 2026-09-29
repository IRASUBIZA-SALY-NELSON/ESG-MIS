'use client';
import { Alert, Button, Checkbox, MultiSelect, SegmentedControl, Select, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import DraftNotice from '@/components/core/DraftNotice';
import { useStateDraft } from '@/hooks/useFormDraft';
import { financeAction, useFinance } from './api';
import { useTerms } from './BillForm';
import LineItemsEditor, { Line, lineTotal, linesError, linesPayload, newLine } from './LineItemsEditor';
import { BulkResult, StudentBalance } from './types';
import { CATEGORY_LABELS, FINANCE_CATEGORIES, rwf } from './ui';

interface ClassOption {
  id: string;
  className: string;
}

/** Bills many students at once: a whole class, several classes or the whole school. */
export default function BulkBillForm({ onDone }: { onDone: (result: BulkResult) => void }) {
  const [scope, setScope] = useState<'classes' | 'school'>('classes');
  const [classIds, setClassIds] = useState<string[]>([]);
  const [category, setCategory] = useState('SCHOOL_FEES');
  const [title, setTitle] = useState('');
  const [termId, setTermId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(dayjs().add(30, 'day').format('YYYY-MM-DD'));
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<Line[]>([newLine({ description: 'Tuition' })]);
  const [publish, setPublish] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkResult | null>(null);
  const { savedAt, clear } = useStateDraft(
    'finance-bulk-bill',
    { scope, classIds, category, title, termId, dueDate, description, lines, publish },
    (extra) => {
      if (extra.scope === 'classes' || extra.scope === 'school') setScope(extra.scope);
      if (Array.isArray(extra.classIds)) setClassIds(extra.classIds as string[]);
      if (typeof extra.category === 'string') setCategory(extra.category);
      if (typeof extra.title === 'string') setTitle(extra.title);
      if (extra.termId === null || typeof extra.termId === 'string') setTermId((extra.termId as string | null) ?? null);
      if (extra.dueDate === null || typeof extra.dueDate === 'string') setDueDate((extra.dueDate as string | null) ?? null);
      if (typeof extra.description === 'string') setDescription(extra.description);
      if (Array.isArray(extra.lines)) setLines(extra.lines as Line[]);
      if (typeof extra.publish === 'boolean') setPublish(extra.publish);
    },
  );

  const terms = useTerms();
  const { data: classes } = useFinance<ClassOption[]>('/classes/all');
  const { data: students } = useFinance<StudentBalance[]>('/finance/students');

  const selectedClassNames = useMemo(
    () => new Set((classes ?? []).filter((c) => classIds.includes(c.id)).map((c) => c.className)),
    [classes, classIds],
  );
  const studentCount = useMemo(() => {
    if (!students) return 0;
    if (scope === 'school') return students.length;
    return students.filter((s) => s.className && selectedClassNames.has(s.className)).length;
  }, [students, scope, selectedClassNames]);
  const perStudent = lineTotal(lines);

  const submit = async () => {
    setError(null);
    if (scope === 'classes' && !classIds.length) return setError('Choose at least one class');
    if (!title.trim()) return setError('Give the bill a title, e.g. "School fees: Term 1 2026"');
    const problem = linesError(lines);
    if (problem) return setError(problem);
    setSaving(true);
    const res = await financeAction<BulkResult>(
      'post',
      '/finance/bills/bulk',
      {
        allStudents: scope === 'school',
        classIds: scope === 'classes' ? classIds : [],
        category,
        title: title.trim(),
        description: description.trim() || null,
        termId,
        dueDate,
        items: linesPayload(lines),
        publish,
      },
      { silent: true },
    );
    setSaving(false);
    if (res) {
      clear();
      setResult(res);
    }
  };

  if (result) {
    return (
      <div className="flex flex-col gap-3">
        <Alert color="teal" variant="light" title={`${result.created} bill(s) ${publish ? 'published' : 'saved as drafts'}`}>
          Total billed: <b>{rwf(result.totalAmount)}</b>.
          {!publish && ' Open the drafts and publish them when you are ready.'}
        </Alert>
        {result.skipped > 0 && (
          <Alert color="orange" variant="light" title={`${result.skipped} student(s) skipped`}>
            They already have a bill called “{title}”. No duplicate was created:
            <span className="block mt-1 text-xs">{result.skippedStudents.slice(0, 30).join(', ')}
              {result.skippedStudents.length > 30 ? ` and ${result.skippedStudents.length - 30} more` : ''}</span>
          </Alert>
        )}
        <div className="flex justify-end">
          <Button onClick={() => onDone(result)}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <DraftNotice
        savedAt={savedAt}
        onDiscard={() => {
          clear();
          setTitle('');
          setDescription('');
          setClassIds([]);
          setLines([newLine({ description: 'Tuition' })]);
        }}
      />
      <div>
        <p className="text-sm font-medium mb-1">Who is billed</p>
        <SegmentedControl
          value={scope}
          onChange={(v) => setScope(v as 'classes' | 'school')}
          data={[
            { value: 'classes', label: 'Selected classes' },
            { value: 'school', label: 'Whole school' },
          ]}
        />
      </div>
      {scope === 'classes' && (
        <MultiSelect
          label="Classes"
          placeholder="Choose one or more classes"
          data={(classes ?? []).map((c) => ({ value: c.id, label: c.className }))}
          value={classIds}
          onChange={setClassIds}
          searchable
          clearable
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Select
          label="Type of bill"
          data={FINANCE_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
          value={category}
          onChange={(v) => v && setCategory(v)}
          allowDeselect={false}
        />
        <Select label="Term" placeholder="Optional" data={terms} value={termId} onChange={setTermId} clearable />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">
        <TextInput
          label="Title"
          placeholder="e.g. School fees: Term 1 2026"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          maxLength={200}
          required
          description="Students who already have a bill with this title are skipped."
        />
        <DateInput
          label="Pay by"
          value={dueDate ? dayjs(dueDate).toDate() : null}
          onChange={(d: any) => setDueDate(d ? dayjs(d).format('YYYY-MM-DD') : null)}
          valueFormat="DD MMM YYYY"
          clearable
          minDate={new Date()}
        />
      </div>
      <div>
        <p className="text-sm font-medium mb-1">What each student pays</p>
        <LineItemsEditor lines={lines} onChange={setLines} />
      </div>
      <Textarea
        label="Note for students and parents"
        placeholder="Optional, e.g. bank account and Mobile Money code"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
        autosize
        minRows={2}
        maxLength={4000}
      />
      <div className="rounded-md bg-primary/5 border border-primary/10 px-3 py-2 text-sm">
        <b>{studentCount}</b> student(s) × <b>{rwf(perStudent)}</b> ={' '}
        <b className="text-primary">{rwf(studentCount * perStudent)}</b>
      </div>
      <Checkbox
        checked={publish}
        onChange={(e) => setPublish(e.currentTarget.checked)}
        label="Publish now, so students and parents can see the bills immediately"
      />
      {error && (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      )}
      <div className="flex justify-end border-t pt-3">
        <Button onClick={submit} loading={saving} disabled={studentCount === 0}>
          {publish ? 'Create and publish' : 'Create as drafts'} ({studentCount})
        </Button>
      </div>
    </div>
  );
}
