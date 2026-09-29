export type BillStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'CANCELLED';
export type PaymentRecordStatus = 'PENDING_REVIEW' | 'VALID' | 'REJECTED' | 'VOIDED';
export type PaymentMethod = 'CASH' | 'BANK' | 'MOBILE_MONEY';
export type Department = 'FINANCE' | 'LIBRARY';

export interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  loanId?: string;
}

export interface Payment {
  id: string;
  receiptNumber: string;
  billId: string;
  billNumber: string;
  billTitle: string;
  category: string;
  department?: Department;
  studentId: string;
  studentName: string;
  className?: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  paidOn: string;
  note?: string;
  source?: 'OFFICE' | 'STUDENT';
  recordedByName?: string;
  createdAt: string;
  status: PaymentRecordStatus;
  hasProof?: boolean;
  proofFileName?: string;
  proofContentType?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNote?: string;
  voidReason?: string;
  billBalanceAfter: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  className?: string;
  department: Department;
  category: string;
  title: string;
  description?: string;
  termId?: string;
  termName?: string;
  dueDate?: string;
  status: BillStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  paidAmount: number;
  balance: number;
  overdue: boolean;
  createdByName?: string;
  createdAt: string;
  publishedAt?: string;
  cancelReason?: string;
  items: BillItem[];
  payments: Payment[];
}

export interface Totals {
  billed: number;
  paid: number;
  balance: number;
  bills: number;
  unpaidBills: number;
  overdueBills: number;
}

export interface StudentAccount {
  studentId: string;
  studentName: string;
  studentEmail?: string;
  className?: string;
  totals: Totals;
  bills: Bill[];
  payments: Payment[];
}

export interface StudentBalance {
  studentId: string;
  studentName: string;
  studentEmail?: string;
  className?: string;
  billed: number;
  paid: number;
  balance: number;
  openBills: number;
  overdue: boolean;
}

export interface GroupRow {
  bills: number;
  billed: number;
  collected: number;
  outstanding: number;
  studentsOwing: number;
}

export interface FinanceSummary {
  totals: {
    billed: number;
    collected: number;
    outstanding: number;
    collectionRate: number;
    publishedBills: number;
    draftBills: number;
    paidBills: number;
    overdueBills: number;
    studentsOwing: number;
    collectedToday: number;
    collectedThisMonth: number;
    paymentsThisMonth: number;
    pendingReviews?: number;
  };
  byCategory: (GroupRow & { category: string })[];
  byClass: (GroupRow & { className: string })[];
  monthly: { month: string; collected: number }[];
  byMethod: Record<PaymentMethod, number>;
  recentPayments: Payment[];
  awaitingReview?: Payment[];
  topDebtors: StudentBalance[];
}

export interface BulkResult {
  batchId: string;
  created: number;
  skipped: number;
  totalAmount: number;
  skippedStudents: string[];
}

export interface UnbilledLoss {
  loanId: string;
  title: string;
  accessionNumber: string;
  lostOn: string;
}
