'use client';
import { financeAction, useFinance } from '@/components/finance/api';
import { printBill } from '@/components/finance/documents';
import ProofReviewList from '@/components/finance/ProofReviewList';
import { Bill } from '@/components/finance/types';
import {
  BillStatusBadge,
  categoryLabel,
  METHOD_LABELS,
  PaymentStatusBadge,
  rwf,
} from '@/components/finance/ui';
import {
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  Section,
  fmtDate,
  fmtDateTime,
} from '@/components/library/ui';
import { useUserContext } from '@/context/Usercontext';
import { Button, Group, Modal, Table, Textarea } from '@mantine/core';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';

export default function LibrarianBillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useUserContext();
  const { data: bill, loading, error, refresh } = useFinance<Bill>(id ? `/library/bills/${id}` : null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [busy, setBusy] = useState(false);

  const pendingProofs = useMemo(
    () => (bill?.payments ?? []).filter((p) => p.status === 'PENDING_REVIEW'),
    [bill],
  );

  if (loading) return <LoadingBlock label="Loading bill…" />;
  if (error || !bill) return <ErrorBlock message={error ?? 'Bill not found'} onRetry={() => refresh()} />;

  const canPublish = bill.status === 'DRAFT';
  const canCancel =
    bill.status === 'PUBLISHED' && bill.paymentStatus !== 'PAID' && bill.paymentStatus !== 'CANCELLED';

  const publish = async () => {
    setBusy(true);
    await financeAction('post', '/library/bills/publish', { ids: [bill.id] }, {
      success: 'Bill published.',
    });
    setBusy(false);
    refresh();
  };

  const cancel = async () => {
    if (!cancelReason.trim()) return;
    setBusy(true);
    await financeAction('post', `/library/bills/${bill.id}/cancel`, { reason: cancelReason.trim() }, {
      success: 'Bill cancelled.',
    });
    setBusy(false);
    setCancelOpen(false);
    setCancelReason('');
    refresh();
  };

  const by = profile ? `${profile.firstName} ${profile.lastName}` : undefined;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        title={bill.billNumber}
        subtitle={
          <>
            {bill.title} · {bill.studentName}
            {bill.className ? ` · ${bill.className}` : ''}
          </>
        }
        actions={
          <>
            <Button component={Link} href="/librarian/bills" variant="default" leftSection={<FiArrowLeft />}>
              All library bills
            </Button>
            <Button variant="light" leftSection={<FiDownload />} onClick={() => printBill(bill, by)}>
              PDF
            </Button>
            {canPublish && (
              <Button color="#024F3A" loading={busy} onClick={publish}>
                Publish
              </Button>
            )}
            {canCancel && (
              <Button color="red" variant="light" onClick={() => setCancelOpen(true)}>
                Cancel bill
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        <div className="bg-white border rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase">Status</p>
          <div className="mt-1">
            <BillStatusBadge bill={bill} />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase">Type</p>
          <p className="font-medium mt-1">{categoryLabel(bill.category)}</p>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase">Pay by</p>
          <p className="font-medium mt-1">{fmtDate(bill.dueDate)}</p>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase">Balance</p>
          <p className="text-xl font-semibold text-primary mt-1">{rwf(bill.balance)}</p>
          <p className="text-xs text-gray-500">
            of {rwf(bill.amount)} · paid {rwf(bill.paidAmount)}
          </p>
        </div>
      </div>

      {pendingProofs.length > 0 && (
        <Section title="Proofs to approve on this bill">
          <ProofReviewList payments={pendingProofs} basePath="/library/bills" />
        </Section>
      )}

      <Section title="Books charged">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Qty</Table.Th>
              <Table.Th>Unit price</Table.Th>
              <Table.Th>Amount</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {bill.items.map((i) => (
              <Table.Tr key={i.id}>
                <Table.Td>{i.description}</Table.Td>
                <Table.Td>{i.quantity}</Table.Td>
                <Table.Td>{rwf(i.unitPrice)}</Table.Td>
                <Table.Td>{rwf(i.amount)}</Table.Td>
              </Table.Tr>
            ))}
            <Table.Tr>
              <Table.Td colSpan={3} className="text-right font-semibold">
                Total
              </Table.Td>
              <Table.Td className="font-semibold">{rwf(bill.amount)}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Section>

      <Section title="Payments">
        {!bill.payments.length ? (
          <p className="text-sm text-gray-500 py-2">No payments yet.</p>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Receipt</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Method</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {bill.payments.map((p) => (
                <Table.Tr key={p.id}>
                  <Table.Td>{p.receiptNumber}</Table.Td>
                  <Table.Td>{fmtDate(p.paidOn)}</Table.Td>
                  <Table.Td>{rwf(p.amount)}</Table.Td>
                  <Table.Td>
                    {METHOD_LABELS[p.method]}
                    {p.reference ? ` · ${p.reference}` : ''}
                  </Table.Td>
                  <Table.Td>
                    <PaymentStatusBadge status={p.status} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Section>

      <p className="text-xs text-gray-500">
        Created {fmtDateTime(bill.createdAt)}
        {bill.publishedAt ? ` · Published ${fmtDateTime(bill.publishedAt)}` : ''}
      </p>

      <Modal
        opened={cancelOpen}
        onClose={() => !busy && setCancelOpen(false)}
        title={<b className="text-primary">Cancel bill</b>}
        centered
      >
        <Textarea
          label="Reason"
          placeholder="Why is this bill being cancelled?"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.currentTarget.value)}
          minRows={3}
          required
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setCancelOpen(false)} disabled={busy}>
            Back
          </Button>
          <Button color="red" onClick={cancel} loading={busy} disabled={!cancelReason.trim()}>
            Cancel bill
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
