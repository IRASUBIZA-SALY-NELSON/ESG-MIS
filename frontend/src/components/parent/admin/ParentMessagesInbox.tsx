'use client';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button, SegmentedControl, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useParentData } from '../api';
import { ParentConcern } from '../types';
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Section,
  StatusBadge,
  fmtDateTime,
  termLabel,
} from '../ui';

const ConcernItem = ({ concern, onChanged }: { concern: ParentConcern; onChanged: () => void }) => {
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async (body: Record<string, string>) => {
    setBusy(true);
    try {
      await AuthApi.put(`/parents/concerns/${concern.id}/respond`, body);
      setReply('');
      onChanged();
    } catch (error) {
      notifications.show({ title: 'Could not save', message: getResError(error), color: 'red' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex flex-row justify-between gap-2 flex-wrap">
        <div>
          <p className="font-medium text-primary">{concern.subject}</p>
          <p className="text-xs text-gray-500">
            From {concern.parent.firstName} {concern.parent.lastName} ({concern.parent.email}
            {concern.parent.phoneNumber ? ` · ${concern.parent.phoneNumber}` : ''})
          </p>
          <p className="text-xs text-gray-500">
            {termLabel(concern.category)}
            {concern.student &&
              ` · about ${concern.student.firstName} ${concern.student.lastName}${
                concern.student.currentClazz?.className
                  ? ` (${concern.student.currentClazz.className})`
                  : ''
              }`}{' '}
            · {fmtDateTime(concern.createdAt)}
          </p>
        </div>
        <StatusBadge status={concern.status} />
      </div>
      <p className="text-sm mt-2 whitespace-pre-wrap">{concern.message}</p>
      {concern.response && (
        <div className="mt-3 bg-teal-50 border border-teal-100 rounded-md p-3">
          <p className="text-xs text-teal-800 mb-1">
            Replied by{' '}
            {concern.respondedBy
              ? `${concern.respondedBy.firstName} ${concern.respondedBy.lastName}`
              : 'staff'}{' '}
            · {fmtDateTime(concern.respondedAt)}
          </p>
          <p className="text-sm whitespace-pre-wrap">{concern.response}</p>
        </div>
      )}
      {concern.status !== 'CLOSED' && (
        <div className="mt-3 flex flex-col gap-2">
          <Textarea
            placeholder={
              concern.response
                ? 'Send another reply (replaces the previous one)'
                : 'Write a reply to the parent'
            }
            autosize
            minRows={2}
            value={reply}
            onChange={(e) => setReply(e.currentTarget.value)}
          />
          <div className="flex flex-row gap-2 justify-end">
            <Button
              variant="default"
              size="xs"
              loading={busy}
              onClick={() => send({ status: 'CLOSED' })}
            >
              Close
            </Button>
            <Button
              size="xs"
              color="#024F3A"
              loading={busy}
              disabled={!reply.trim()}
              onClick={() => send({ response: reply })}
            >
              Send reply
            </Button>
          </div>
        </div>
      )}
      {concern.status === 'CLOSED' && (
        <button
          className="text-xs underline text-gray-500 mt-2"
          onClick={() => send({ status: 'OPEN' })}
        >
          Reopen
        </button>
      )}
    </div>
  );
};

export default function ParentMessagesInbox() {
  const { data, loading, error, refresh } = useParentData<ParentConcern[]>('/parents/concerns/all');
  const [filter, setFilter] = useState('OPEN');
  const list = (data ?? []).filter((c) => filter === 'ALL' || c.status === filter);
  const count = (status: string) => (data ?? []).filter((c) => c.status === status).length;

  return (
    <div className="flex flex-col gap-4 py-2">
      <div>
        <h2 className="text-xl font-semibold text-primary">Parent messages</h2>
        <p className="text-sm text-gray-600">
          Questions and concerns sent by parents from the parent portal.
        </p>
      </div>
      <Section
        action={
          <SegmentedControl
            size="xs"
            value={filter}
            onChange={setFilter}
            data={[
              { value: 'OPEN', label: `Open (${count('OPEN')})` },
              { value: 'ANSWERED', label: `Answered (${count('ANSWERED')})` },
              { value: 'CLOSED', label: `Closed (${count('CLOSED')})` },
              { value: 'ALL', label: 'All' },
            ]}
          />
        }
      >
        {loading && <LoadingBlock />}
        {error && <ErrorBlock message={error} onRetry={() => refresh()} />}
        {data && list.length === 0 && <EmptyBlock>No message in this list.</EmptyBlock>}
        <div className="flex flex-col gap-3">
          {list.map((c) => (
            <ConcernItem key={c.id} concern={c} onChanged={() => refresh()} />
          ))}
        </div>
      </Section>
    </div>
  );
}
