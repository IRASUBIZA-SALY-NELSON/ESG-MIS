'use client';
import { Button, Group, Modal, Textarea } from '@mantine/core';
import { useState } from 'react';
import { FiCheck, FiEye, FiX } from 'react-icons/fi';
import { AuthApi } from '@/utils/constants';
import { financeAction } from './api';
import { Payment } from './types';
import { METHOD_LABELS, PaymentStatusBadge, categoryLabel, rwf } from './ui';
import { fmtDate } from '@/components/library/ui';

/** Review queue for student-uploaded payment proofs (librarian or accountant). */
export default function ProofReviewList({
  payments,
  basePath,
  empty = 'No payment proofs waiting for review.',
}: {
  payments: Payment[];
  /** '/library/bills' for librarian, '/finance' for accountant */
  basePath: '/library/bills' | '/finance';
  empty?: string;
}) {
  const pending = payments.filter((p) => p.status === 'PENDING_REVIEW');
  const [rejecting, setRejecting] = useState<Payment | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const approve = async (p: Payment) => {
    setBusy(true);
    await financeAction('post', `${basePath}/payments/${p.id}/approve`, {}, {
      success: 'Payment approved. The bill balance is updated.',
    });
    setBusy(false);
  };

  const reject = async () => {
    if (!rejecting || !reason.trim()) return;
    setBusy(true);
    await financeAction(
      'post',
      `${basePath}/payments/${rejecting.id}/reject`,
      { reason: reason.trim() },
      { success: 'Payment rejected. The student can submit again.' },
    );
    setBusy(false);
    setRejecting(null);
    setReason('');
  };

  const openProof = async (p: Payment) => {
    const url =
      basePath === '/finance'
        ? `/finance/payments/${p.id}/proof`
        : `/library/bills/payments/${p.id}/proof`;
    const res = await AuthApi.get(url, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: p.proofContentType || 'application/octet-stream' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

  if (!pending.length) {
    return <p className="text-sm text-gray-500 py-4">{empty}</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {pending.map((p) => (
          <div key={p.id} className="border rounded-lg p-3 bg-white flex flex-col gap-2">
            <div className="flex flex-row flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-primary">
                  {p.studentName}
                  {p.className ? ` · ${p.className}` : ''}
                </p>
                <p className="text-sm text-gray-600">
                  {p.billNumber}: {p.billTitle} · {categoryLabel(p.category)}
                </p>
                <p className="text-sm mt-1">
                  <b>{rwf(p.amount)}</b> by {METHOD_LABELS[p.method]}
                  {p.reference ? ` · ${p.reference}` : ''} · paid {fmtDate(p.paidOn)}
                </p>
              </div>
              <PaymentStatusBadge status={p.status} />
            </div>
            <Group gap="xs">
              {p.hasProof && (
                <Button size="xs" variant="light" leftSection={<FiEye />} onClick={() => openProof(p)}>
                  View proof
                </Button>
              )}
              <Button
                size="xs"
                color="teal"
                leftSection={<FiCheck />}
                loading={busy}
                onClick={() => approve(p)}
              >
                Approve
              </Button>
              <Button
                size="xs"
                color="red"
                variant="light"
                leftSection={<FiX />}
                disabled={busy}
                onClick={() => setRejecting(p)}
              >
                Reject
              </Button>
            </Group>
          </div>
        ))}
      </div>
      <Modal
        opened={!!rejecting}
        onClose={() => !busy && setRejecting(null)}
        title={<b className="text-primary">Reject payment proof</b>}
        centered
      >
        <Textarea
          label="Reason for the student"
          placeholder="e.g. The amount on the slip does not match"
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
          minRows={3}
          required
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setRejecting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button color="red" onClick={reject} loading={busy} disabled={!reason.trim()}>
            Reject
          </Button>
        </Group>
      </Modal>
    </>
  );
}
