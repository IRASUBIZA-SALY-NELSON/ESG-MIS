'use client';
import { downloadPdf } from '@/components/library/export';
import { fmtDate } from '@/components/library/ui';
import { Bill, Payment, StudentAccount } from './types';
import { categoryLabel, METHOD_LABELS, rwf } from './ui';

const office = (department?: string) => (department === 'LIBRARY' ? 'School Library · Finance Office' : 'Finance Office');

export function printReceipt(payment: Payment, bill?: Bill, by?: string) {
  return downloadPdf({
    filename: `receipt_${payment.receiptNumber}`,
    title: `Payment receipt ${payment.receiptNumber}`,
    subtitle: payment.status === 'VOIDED' ? `VOIDED: ${payment.voidReason ?? ''}` : 'Official receipt of payment',
    department: office(bill?.department),
    footer: 'ESG Finance Office · Keep this receipt as proof of payment',
    generatedBy: by,
    summary: [
      ['Student', payment.studentName],
      ['Class', payment.className ?? '—'],
      ['Amount received', rwf(payment.amount)],
      ['Paid by', METHOD_LABELS[payment.method]],
      ['Reference', payment.reference ?? '—'],
      ['Date paid', fmtDate(payment.paidOn)],
      ['For bill', `${payment.billNumber}: ${payment.billTitle}`],
      ['Balance left on the bill', rwf(payment.billBalanceAfter)],
      ['Received by', payment.recordedByName ?? '—'],
    ],
    sections: bill
      ? [
          {
            name: 'Bill details',
            head: ['Description', 'Qty', 'Unit price', 'Amount'],
            rows: [
              ...bill.items.map((i) => [i.description, i.quantity, rwf(i.unitPrice), rwf(i.amount)]),
              ['Total', '', '', rwf(bill.amount)],
            ],
          },
        ]
      : [],
  });
}

export function printBill(bill: Bill, by?: string) {
  const valid = bill.payments.filter((p) => p.status === 'VALID');
  return downloadPdf({
    filename: `bill_${bill.billNumber}`,
    title: `${bill.status === 'CANCELLED' ? 'CANCELLED ' : ''}Bill ${bill.billNumber}`,
    subtitle: bill.title,
    department: office(bill.department),
    footer: 'ESG Finance Office',
    generatedBy: by,
    summary: [
      ['Student', bill.studentName],
      ['Class', bill.className ?? '—'],
      ['Type', categoryLabel(bill.category)],
      ['Term', bill.termName ?? '—'],
      ['Pay by', fmtDate(bill.dueDate)],
      ['Total', rwf(bill.amount)],
      ['Paid', rwf(bill.paidAmount)],
      ['Balance', rwf(bill.balance)],
      ...(bill.description ? ([['Note', bill.description]] as [string, string][]) : []),
    ],
    sections: [
      {
        name: 'What is charged',
        head: ['Description', 'Qty', 'Unit price', 'Amount'],
        rows: bill.items.map((i) => [i.description, i.quantity, rwf(i.unitPrice), rwf(i.amount)]),
      },
      {
        name: 'Payments',
        head: ['Receipt', 'Date', 'Paid by', 'Reference', 'Amount'],
        rows: valid.map((p) => [p.receiptNumber, fmtDate(p.paidOn), METHOD_LABELS[p.method], p.reference ?? '', rwf(p.amount)]),
      },
    ],
  });
}

export function printStatement(account: StudentAccount, by?: string) {
  const bills = account.bills.filter((b) => b.status === 'PUBLISHED');
  return downloadPdf({
    filename: `statement_${account.studentName.replace(/\s+/g, '_')}`,
    title: 'Student account statement',
    subtitle: `${account.studentName}${account.className ? ` · ${account.className}` : ''}`,
    department: 'Finance Office',
    footer: 'ESG Finance Office',
    generatedBy: by,
    summary: [
      ['Total billed', rwf(account.totals.billed)],
      ['Total paid', rwf(account.totals.paid)],
      ['Balance to pay', rwf(account.totals.balance)],
      ['Bills not fully paid', account.totals.unpaidBills],
      ['Overdue bills', account.totals.overdueBills],
    ],
    sections: [
      {
        name: 'Bills',
        head: ['Bill', 'Title', 'Type', 'Pay by', 'Amount', 'Paid', 'Balance'],
        rows: bills.map((b) => [
          b.billNumber,
          b.title,
          categoryLabel(b.category),
          fmtDate(b.dueDate),
          rwf(b.amount),
          rwf(b.paidAmount),
          rwf(b.balance),
        ]),
      },
      {
        name: 'Payments',
        head: ['Receipt', 'Date', 'Bill', 'Paid by', 'Reference', 'Amount'],
        rows: account.payments
          .filter((p) => p.status === 'VALID')
          .map((p) => [p.receiptNumber, fmtDate(p.paidOn), p.billNumber, METHOD_LABELS[p.method], p.reference ?? '', rwf(p.amount)]),
      },
    ],
  });
}
