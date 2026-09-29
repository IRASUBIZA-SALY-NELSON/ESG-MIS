export type BookStatus = 'ACTIVE' | 'ARCHIVED';
export type CopyStatus = 'AVAILABLE' | 'BORROWED' | 'LOST' | 'DAMAGED' | 'RETIRED';
export type CopyCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'LOST';

export interface Book {
  id: string;
  title: string;
  author?: string;
  isbn?: string;
  category?: string;
  publisher?: string;
  publishedYear?: number;
  edition?: string;
  language?: string;
  shelfLocation?: string;
  description?: string;
  status: BookStatus;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  lostCopies: number;
  damagedCopies: number;
  timesBorrowed: number;
  createdAt?: string;
}

export interface BookCopy {
  id: string;
  accessionNumber: string;
  status: CopyStatus;
  bookCondition?: CopyCondition;
  acquiredOn?: string;
  notes?: string;
  timesBorrowed: number;
  currentBorrower?: string;
  currentDueDate?: string;
}

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  author?: string;
  category?: string;
  copyId: string;
  accessionNumber: string;
  borrowerId: string;
  borrowerName: string;
  borrowerEmail?: string;
  borrowerRole?: string;
  className?: string;
  issuedAt: string;
  dueDate: string;
  returnedAt?: string;
  status: LoanStatus;
  renewals: number;
  daysOverdue: number;
  overdue: boolean;
  dueSoon: boolean;
  issuedBy?: string;
  receivedBy?: string;
  conditionOnIssue?: string;
  conditionOnReturn?: string;
  notes?: string;
  remindersSent?: number;
  lastReminderAt?: string;
}

export interface Borrower {
  id: string;
  fullName: string;
  email?: string;
  role?: string;
  className?: string;
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  lostBooks: number;
  lastBorrowedAt?: string;
}

export interface BorrowerOption {
  id: string;
  fullName: string;
  email?: string;
  role?: string;
  className?: string;
  activeLoans: number;
  hasOverdue: boolean;
  canBorrow: boolean;
}

export interface Reminder {
  id: string;
  loanId: string;
  bookTitle: string;
  accessionNumber: string;
  borrowerId: string;
  borrowerName: string;
  kind: 'DUE_SOON' | 'OVERDUE' | 'CUSTOM';
  message: string;
  sentAt: string;
  sentBy?: string;
  seen: boolean;
  dueDate?: string;
}

export interface LibrarySettings {
  loanDays: number;
  maxActiveLoans: number;
  maxRenewals: number;
  renewalDays: number;
  dueSoonDays: number;
  blockWhenOverdue: boolean;
}

export interface LibraryStats {
  settings: LibrarySettings;
  totals: {
    titles: number;
    archivedTitles: number;
    copies: number;
    availableCopies: number;
    borrowedCopies: number;
    activeLoans: number;
    overdueLoans: number;
    dueSoonLoans: number;
    borrowersWithBooks: number;
    loansThisMonth: number;
    returnsThisMonth: number;
    totalLoans: number;
    lostLoans: number;
    readersThisMonth: number;
    onTimeReturnRate: number;
    averageLoanDays: number;
    utilizationRate: number;
  };
  copyStatus: Record<CopyStatus, number>;
  monthly: { month: string; label: string; issued: number; returned: number }[];
  daily: { date: string; issued: number; returned: number }[];
  categories: { category: string; titles: number; copies: number; loans: number }[];
  topBooks: { bookId: string; title: string; author?: string; category?: string; loans: number }[];
  topBorrowers: {
    id: string;
    fullName: string;
    className?: string;
    loans: number;
    active: number;
  }[];
  byClass: Record<string, number>;
  overdue: Loan[];
  dueSoon: Loan[];
  recent: Loan[];
}

export interface BookDetail {
  book: Book;
  copies: BookCopy[];
  loans: Loan[];
}

export interface BorrowerDetail {
  borrower: Borrower;
  loans: Loan[];
  reminders: Reminder[];
}

export interface MyLibrary {
  summary: {
    current: number;
    overdue: number;
    dueSoon: number;
    totalBorrowed: number;
    maxActiveLoans: number;
    loanDays: number;
  };
  current: Loan[];
  history: Loan[];
  reminders: Reminder[];
}

export interface CatalogEntry {
  id: string;
  title: string;
  author?: string;
  category?: string;
  shelfLocation?: string;
  availableCopies: number;
  totalCopies: number;
}
