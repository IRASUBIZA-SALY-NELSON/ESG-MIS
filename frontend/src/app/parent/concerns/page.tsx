'use client';
import { useParentData } from '@/components/parent/api';
import { ChildSummary, ParentConcern } from '@/components/parent/types';
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  StatusBadge,
  fmtDateTime,
  termLabel,
} from '@/components/parent/ui';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { NativeSelect, TextInput, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

const CATEGORIES = [
  { value: 'ACADEMIC', label: 'Academics' },
  { value: 'DISCIPLINE', label: 'Conduct' },
  { value: 'FEES', label: 'Fees' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'OTHER', label: 'Other' },
];

export default function ConcernsPage() {
  const searchParams = useSearchParams();
  const children = useParentData<ChildSummary[]>('/parent-portal/children');
  const concerns = useParentData<ParentConcern[]>('/parent-portal/concerns');
  const [studentId, setStudentId] = useState<string | null>(searchParams.get('studentId'));
  const [category, setCategory] = useState<string>('ACADEMIC');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [compose, setCompose] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!studentId && children.data?.length === 1) setStudentId(children.data[0].id);
  }, [children.data, studentId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      await AuthApi.post('/parent-portal/concerns', { studentId, category, subject, message });
      notifications.show({ title: 'Sent', message: 'The school will reply here.', color: 'teal' });
      setSubject('');
      setMessage('');
      setCompose(false);
      concerns.refresh();
    } catch (error) {
      notifications.show({ title: 'Could not send', message: getResError(error), color: 'red' });
    } finally {
      setSending(false);
    }
  };

  const close = async (id: string) => {
    try {
      await AuthApi.put(`/parent-portal/concerns/${id}/close`);
      concerns.refresh();
    } catch (error) {
      notifications.show({ title: 'Could not close', message: getResError(error), color: 'red' });
    }
  };

  const list = (concerns.data ?? []).filter((c) => filter === 'ALL' || c.status === filter);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-primary">Messages</h1>
        <button
          type="button"
          onClick={() => setCompose((v) => !v)}
          className="min-h-11 px-4 rounded-xl bg-primary text-white text-sm font-medium"
        >
          {compose ? 'Cancel' : 'New'}
        </button>
      </div>

      {compose && (
        <form onSubmit={submit} className="bg-white border rounded-2xl p-3 flex flex-col gap-3">
          <NativeSelect
            label="Child"
            value={studentId ?? ''}
            onChange={(e) => setStudentId(e.currentTarget.value || null)}
            data={[
              { value: '', label: 'General' },
              ...(children.data ?? []).map((c) => ({ value: c.id, label: c.fullName })),
            ]}
            size="md"
          />
          <NativeSelect
            label="About"
            value={category}
            onChange={(e) => setCategory(e.currentTarget.value)}
            data={CATEGORIES}
            size="md"
          />
          <TextInput
            label="Subject"
            required
            maxLength={200}
            value={subject}
            size="md"
            onChange={(e) => setSubject(e.currentTarget.value)}
          />
          <Textarea
            label="Message"
            required
            minRows={4}
            autosize
            maxLength={4000}
            value={message}
            size="md"
            onChange={(e) => setMessage(e.currentTarget.value)}
          />
          <button
            type="submit"
            disabled={sending || !subject.trim() || !message.trim()}
            className="min-h-12 rounded-xl bg-primary text-white font-medium disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {['ALL', 'OPEN', 'ANSWERED', 'CLOSED'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilter(v)}
            className={`shrink-0 min-h-10 px-3 rounded-full text-sm ${
              filter === v ? 'bg-primary text-white font-medium' : 'bg-white border text-gray-700'
            }`}
          >
            {termLabel(v)}
          </button>
        ))}
      </div>

      {concerns.loading && <LoadingBlock />}
      {concerns.error && <ErrorBlock message={concerns.error} onRetry={() => concerns.refresh()} />}
      {concerns.data && list.length === 0 && <EmptyBlock>No messages.</EmptyBlock>}
      {list.map((c) => (
        <div key={c.id} className="bg-white border rounded-2xl p-3">
          <div className="flex justify-between gap-2">
            <p className="font-medium text-primary">{c.subject}</p>
            <StatusBadge status={c.status} />
          </div>
          <p className="text-xs text-gray-500">
            {c.student ? `${c.student.firstName} ${c.student.lastName} · ` : ''}
            {fmtDateTime(c.createdAt)}
          </p>
          <p className="text-sm mt-2 whitespace-pre-wrap">{c.message}</p>
          {c.response && (
            <div className="mt-2 bg-[#EEF5F1] rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">School reply</p>
              <p className="text-sm whitespace-pre-wrap">{c.response}</p>
            </div>
          )}
          {c.status !== 'CLOSED' && (
            <button onClick={() => close(c.id)} className="text-sm text-gray-500 underline mt-2 min-h-11">
              Mark done
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
