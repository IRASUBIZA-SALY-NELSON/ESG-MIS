package rw.rca.mis.finance;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class FinanceViews {
  private FinanceViews() {}

  public record BillItemView(
      UUID id, String description, int quantity, long unitPrice, long amount, UUID loanId) {}

  public record BillView(
      UUID id,
      String billNumber,
      UUID studentId,
      String studentName,
      String studentEmail,
      String className,
      String department,
      String category,
      String title,
      String description,
      UUID termId,
      String termName,
      LocalDate dueDate,
      String status,
      String paymentStatus,
      long amount,
      long paidAmount,
      long balance,
      boolean overdue,
      String createdByName,
      Instant createdAt,
      Instant publishedAt,
      String cancelReason,
      List<BillItemView> items,
      List<PaymentView> payments) {}

  public record PaymentView(
      UUID id,
      String receiptNumber,
      UUID billId,
      String billNumber,
      String billTitle,
      String category,
      String department,
      UUID studentId,
      String studentName,
      String className,
      long amount,
      String method,
      String reference,
      LocalDate paidOn,
      String note,
      String source,
      String recordedByName,
      Instant createdAt,
      String status,
      boolean hasProof,
      String proofFileName,
      String proofContentType,
      String reviewedByName,
      Instant reviewedAt,
      String reviewNote,
      String voidReason,
      long billBalanceAfter) {}

  public record Totals(
      long billed, long paid, long balance, long bills, long unpaidBills, long overdueBills) {}

  public record StudentAccount(
      UUID studentId,
      String studentName,
      String studentEmail,
      String className,
      Totals totals,
      List<BillView> bills,
      List<PaymentView> payments) {}

  public record StudentBalance(
      UUID studentId,
      String studentName,
      String studentEmail,
      String className,
      long billed,
      long paid,
      long balance,
      long openBills,
      boolean overdue) {}

  public record BulkResult(String batchId, int created, int skipped, long totalAmount, List<String> skippedStudents) {}
}
