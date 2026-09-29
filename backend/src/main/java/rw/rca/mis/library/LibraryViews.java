package rw.rca.mis.library;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public final class LibraryViews {
  private LibraryViews() {}

  public record BookView(
      UUID id,
      String title,
      String author,
      String isbn,
      String category,
      String publisher,
      Integer publishedYear,
      String edition,
      String language,
      String shelfLocation,
      String description,
      String status,
      long totalCopies,
      long availableCopies,
      long borrowedCopies,
      long lostCopies,
      long damagedCopies,
      long timesBorrowed,
      Instant createdAt) {}

  public record CopyView(
      UUID id,
      String accessionNumber,
      String status,
      String bookCondition,
      LocalDate acquiredOn,
      String notes,
      long timesBorrowed,
      String currentBorrower,
      LocalDate currentDueDate) {}

  public record LoanView(
      UUID id,
      UUID bookId,
      String bookTitle,
      String author,
      String category,
      UUID copyId,
      String accessionNumber,
      UUID borrowerId,
      String borrowerName,
      String borrowerEmail,
      String borrowerRole,
      String className,
      LocalDateTime issuedAt,
      LocalDate dueDate,
      LocalDateTime returnedAt,
      String status,
      int renewals,
      long daysOverdue,
      boolean overdue,
      boolean dueSoon,
      String issuedBy,
      String receivedBy,
      String conditionOnIssue,
      String conditionOnReturn,
      String notes,
      long remindersSent,
      LocalDateTime lastReminderAt) {}

  public record BorrowerView(
      UUID id,
      String fullName,
      String email,
      String role,
      String className,
      long totalLoans,
      long activeLoans,
      long overdueLoans,
      long lostBooks,
      LocalDateTime lastBorrowedAt) {}

  public record ReminderView(
      UUID id,
      UUID loanId,
      String bookTitle,
      String accessionNumber,
      UUID borrowerId,
      String borrowerName,
      String kind,
      String message,
      LocalDateTime sentAt,
      String sentBy,
      boolean seen,
      LocalDate dueDate) {}
}
