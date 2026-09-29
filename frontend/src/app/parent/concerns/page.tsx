'use client';
import { useParentData } from '@/components/parent/api';
import { ChildSummary, ParentConcern } from '@/components/parent/types';
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Section,
  StatusBadge,
  fmtDateTime,
  termLabel,
} from '@/components/parent/ui';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button, SegmentedControl, Select, TextInput, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

const CATEGORIES = [
  { value: 'ACADEMIC', label: 'Academics' },
  { value: 'DISCIPLINE', label: 'Discipline' },
  { value: 'FEES', label: 'School fees' },
  { value: 'HEALTH', label: 'Health & wellbeing' },
  { value: 'OTHER', label: 'Other' },
];

export default function ConcernsPage() {
  const searchParams = useSearchParams();
  const children = useParentData<ChildSummary[]>('/parent-portal/children');
  const concerns = useParentData<ParentConcern[]>('/parent-portal/concerns');
  const [studentId, setStudentId] = useState<string | null>(searchParams.get('studentId'));
  const [category, setCategory] = useState<string | null>('ACADEMIC');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
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
      notifications.show({
        title: 'Message sent',
        message: 'The school will reply here.',
        color: 'teal',
      });
      setSubject('');
      setMessage('');
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
    <div className="flex flex-col gap-4 py-2">
      <div>
        <h2 className="text-xl font-semibold text-primary">Messages to the school</h2>
        <p className="text-sm text-gray-600">
          Ask a question or raise a concern about your child. The school administration will reply
          on this page.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Section title="New message" className="xl:col-span-2 self-start">
          <form onSubmit={submit} className="flex flex-col gap-3">
            <Select
              label="About"
              placeholder="General (all children)"
              value={studentId}
              onChange={setStudentId}
              clearable
              data={(children.data ?? []).map((c) => ({ value: c.id, label: c.fullName }))}
            />
            <Select
              label="Category"
              value={category}
              onChange={setCategory}
              data={CATEGORIES}
              allowDeselect={false}
            />
            <TextInput
              label="Subject"
              required
              maxLength={200}
              value={subject}
              onChange={(e) => setSubject(e.currentTarget.value)}
              placeholder="e.g. Request a meeting with the class teacher"
            />
            <Textarea
              label="Message"
              required
              minRows={5}
              autosize
              maxLength={4000}
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              description={`${message.length}/4000`}
            />
            <Button
              type="submit"
              loading={sending}
              color="#024F3A"
              disabled={!subject.trim() || !message.trim()}
            >
              Send message
            </Button>
          </form>
        </Section>

        <Section
          title="My messages"
          className="xl:col-span-3"
          action={
            <SegmentedControl
              size="xs"
              value={filter}
              onChange={setFilter}
              data={['ALL', 'OPEN', 'ANSWERED', 'CLOSED'].map((v) => ({
                value: v,
                label: termLabel(v),
              }))}
            />
          }
        >
          {concerns.loading && <LoadingBlock />}
          {concerns.error && (
            <ErrorBlock message={concerns.error} onRetry={() => concerns.refresh()} />
          )}
          {concerns.data && list.length === 0 && <EmptyBlock>No message here yet.</EmptyBlock>}
          <div className="flex flex-col gap-3">
            {list.map((c) => (
              <div key={c.id} className="border rounded-lg p-4">
                <div className="flex flex-row justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-medium text-primary">{c.subject}</p>
                    <p className="text-xs text-gray-500">
                      {termLabel(c.category)}
                      {c.student && ` · ${c.student.firstName} ${c.student.lastName}`} ·{' '}
                      {fmtDateTime(c.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-sm mt-2 whitespace-pre-wrap">{c.message}</p>
                {c.response && (
                  <div className="mt-3 bg-teal-50 border border-teal-100 rounded-md p-3">
                    <p className="text-xs text-teal-800 mb-1">
                      Reply from{' '}
                      {c.respondedBy
                        ? `${c.respondedBy.firstName} ${c.respondedBy.lastName}`
                        : 'the school'}{' '}
                      · {fmtDateTime(c.respondedAt)}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{c.response}</p>
                  </div>
                )}
                {c.status !== 'CLOSED' && (
                  <button
                    onClick={() => close(c.id)}
                    className="text-xs text-gray-500 underline mt-2"
                  >
                    Mark as resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
