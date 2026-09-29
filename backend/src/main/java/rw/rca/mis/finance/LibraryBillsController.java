package rw.rca.mis.finance;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rw.rca.mis.common.ApiResponse;
import rw.rca.mis.library.LoanRepository;
import rw.rca.mis.service.Lookup;

/**
 * Lost and damaged book bills. The librarian raises and publishes them, then checks student payment
 * proofs and approves. The accountant can also see every paid library bill from the finance office.
 */
@RestController
@RequestMapping("/api/v1/library/bills")
public class LibraryBillsController {
  private final FinanceService finance;
  private final LoanRepository loans;
  private final BillRepository bills;
  private final PaymentProofStorage proofs;

  public LibraryBillsController(
      FinanceService finance, LoanRepository loans, BillRepository bills, PaymentProofStorage proofs) {
    this.finance = finance;
    this.loans = loans;
    this.bills = bills;
    this.proofs = proofs;
  }

  @GetMapping
  public ApiResponse<?> list(@RequestParam Map<String, String> query) {
    return ApiResponse.ok(finance.bills(query, Bill.LIBRARY));
  }

  @GetMapping("/summary")
  public ApiResponse<?> summary() {
    return ApiResponse.ok(finance.summary(Bill.LIBRARY));
  }

  @GetMapping("/payments")
  public ApiResponse<?> payments(@RequestParam Map<String, String> query) {
    Map<String, String> q = new java.util.HashMap<>(query);
    q.put("department", Bill.LIBRARY);
    return ApiResponse.ok(finance.payments(q));
  }

  @GetMapping("/{id}")
  public ApiResponse<?> bill(@PathVariable UUID id) {
    return ApiResponse.ok(finance.bill(id, Bill.LIBRARY));
  }

  @GetMapping("/students/{studentId}")
  public ApiResponse<?> student(@PathVariable UUID studentId) {
    return ApiResponse.ok(finance.studentAccount(studentId, false, Bill.LIBRARY));
  }

  /** Books this student lost that are not on any bill yet, to pre-fill a new bill. */
  @GetMapping("/unbilled-losses")
  public ApiResponse<?> unbilledLosses(@RequestParam UUID studentId) {
    List<Map<String, Object>> rows =
        loans.findByBorrowerIdOrderByIssuedAtDesc(studentId).stream()
            .filter(l -> "LOST".equals(l.getStatus()))
            .filter(l -> !bills.loanAlreadyBilled(l.getId()))
            .map(
                l ->
                    Map.<String, Object>of(
                        "loanId", l.getId(),
                        "title", l.getCopy().getBook().getTitle(),
                        "accessionNumber",
                            l.getCopy().getAccessionNumber() == null ? "" : l.getCopy().getAccessionNumber(),
                        "lostOn",
                            l.getReturnedAt() == null ? "" : l.getReturnedAt().toLocalDate().toString()))
            .toList();
    return ApiResponse.ok(rows);
  }

  @PostMapping
  public ApiResponse<?> create(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Bill created", finance.createBill(body, Bill.LIBRARY));
  }

  @PutMapping("/{id}")
  public ApiResponse<?> update(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Bill updated", finance.updateBill(id, body, Bill.LIBRARY));
  }

  @PostMapping("/publish")
  public ApiResponse<?> publish(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok(
        "Bills published", finance.publishBills(FinanceService.idList(body.get("ids")), Bill.LIBRARY));
  }

  @PostMapping("/{id}/cancel")
  public ApiResponse<?> cancel(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(
        "Bill cancelled", finance.cancelBill(id, Lookup.text(body, "reason"), Bill.LIBRARY));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<?> delete(@PathVariable UUID id) {
    finance.deleteDraft(id, Bill.LIBRARY);
    return ApiResponse.ok("Draft deleted", null);
  }

  @PostMapping("/payments/{id}/approve")
  public ApiResponse<?> approve(@PathVariable UUID id) {
    return ApiResponse.ok(
        "Payment approved. The student bill is now marked paid.",
        finance.approvePayment(id, Bill.LIBRARY));
  }

  @PostMapping("/payments/{id}/reject")
  public ApiResponse<?> reject(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(
        "Payment rejected", finance.rejectPayment(id, Lookup.text(body, "reason"), Bill.LIBRARY));
  }

  @GetMapping("/payments/{id}/proof")
  public ResponseEntity<Resource> proof(@PathVariable UUID id) {
    Payment payment = finance.requireProofAccess(id, Bill.LIBRARY);
    MediaType media = MediaType.parseMediaType(payment.getProofContentType());
    return ResponseEntity.ok()
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.inline()
                .filename(payment.getProofFileName(), StandardCharsets.UTF_8)
                .build()
                .toString())
        .contentType(media)
        .body(new FileSystemResource(proofs.path(payment.getProofStoredName())));
  }
}
