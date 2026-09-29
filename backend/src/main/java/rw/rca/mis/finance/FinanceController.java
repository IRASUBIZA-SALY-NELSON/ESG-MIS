package rw.rca.mis.finance;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import rw.rca.mis.common.ApiResponse;
import rw.rca.mis.service.Lookup;

/**
 * Finance office. Students may submit a payment proof on their own bills; the accountant records
 * office payments and reviews school-fee proofs. Headmaster and IT Manager can read.
 */
@RestController
@RequestMapping("/api/v1/finance")
public class FinanceController {
  private final FinanceService finance;
  private final PaymentProofStorage proofs;

  public FinanceController(FinanceService finance, PaymentProofStorage proofs) {
    this.finance = finance;
    this.proofs = proofs;
  }

  @GetMapping("/me")
  public ApiResponse<?> me() {
    return ApiResponse.ok(finance.myAccount());
  }

  @GetMapping("/me/payments/{id}/proof")
  public ResponseEntity<Resource> myProof(@PathVariable UUID id) {
    Payment payment = finance.requireProofAccess(id, null);
    return proofResponse(payment);
  }

  /** Student uploads proof of payment. Balance only changes after approval. */
  @PostMapping(value = "/me/bills/{id}/pay", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<?> studentPay(
      @PathVariable UUID id,
      @RequestParam String amount,
      @RequestParam String method,
      @RequestParam(required = false) String reference,
      @RequestParam(required = false) String paidOn,
      @RequestParam(required = false) String note,
      @RequestPart("proof") MultipartFile proof) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("amount", amount);
    body.put("method", method);
    body.put("reference", reference);
    body.put("paidOn", paidOn);
    body.put("note", note);
    return ApiResponse.ok(
        "Proof submitted. Waiting for approval.", finance.submitStudentPayment(id, body, proof));
  }

  @GetMapping("/options")
  public ApiResponse<?> options() {
    return ApiResponse.ok(finance.options());
  }

  @GetMapping("/summary")
  public ApiResponse<?> summary() {
    return ApiResponse.ok(finance.summary(null));
  }

  @GetMapping("/bills")
  public ApiResponse<?> bills(@RequestParam Map<String, String> query) {
    return ApiResponse.ok(finance.bills(query, null));
  }

  @GetMapping("/bills/{id}")
  public ApiResponse<?> bill(@PathVariable UUID id) {
    return ApiResponse.ok(finance.bill(id, null));
  }

  @PostMapping("/bills")
  public ApiResponse<?> create(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Bill created", finance.createBill(body, Bill.FINANCE));
  }

  @PostMapping("/bills/bulk")
  public ApiResponse<?> bulk(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Bills created", finance.createBulk(body));
  }

  @PutMapping("/bills/{id}")
  public ApiResponse<?> update(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Bill updated", finance.updateBill(id, body, Bill.FINANCE));
  }

  @PostMapping("/bills/publish")
  public ApiResponse<?> publish(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Bills published", finance.publishBills(FinanceService.idList(body.get("ids")), Bill.FINANCE));
  }

  @PostMapping("/bills/{id}/cancel")
  public ApiResponse<?> cancel(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Bill cancelled", finance.cancelBill(id, Lookup.text(body, "reason"), null));
  }

  @DeleteMapping("/bills/{id}")
  public ApiResponse<?> delete(@PathVariable UUID id) {
    finance.deleteDraft(id, Bill.FINANCE);
    return ApiResponse.ok("Draft deleted", null);
  }

  @PostMapping("/bills/{id}/payments")
  public ApiResponse<?> pay(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Payment recorded", finance.recordPayment(id, body));
  }

  @GetMapping("/payments")
  public ApiResponse<?> payments(@RequestParam Map<String, String> query) {
    return ApiResponse.ok(finance.payments(query));
  }

  @GetMapping("/payments/{id}")
  public ApiResponse<?> payment(@PathVariable UUID id) {
    return ApiResponse.ok(finance.payment(id));
  }

  @GetMapping("/payments/{id}/proof")
  public ResponseEntity<Resource> proof(@PathVariable UUID id) {
    Payment payment = finance.requireProofAccess(id, null);
    return proofResponse(payment);
  }

  @PostMapping("/payments/{id}/approve")
  public ApiResponse<?> approve(@PathVariable UUID id) {
    return ApiResponse.ok("Payment approved", finance.approvePayment(id, Bill.FINANCE));
  }

  @PostMapping("/payments/{id}/reject")
  public ApiResponse<?> reject(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(
        "Payment rejected", finance.rejectPayment(id, Lookup.text(body, "reason"), Bill.FINANCE));
  }

  @PostMapping("/payments/{id}/void")
  public ApiResponse<?> voidPayment(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Payment voided", finance.voidPayment(id, Lookup.text(body, "reason")));
  }

  @GetMapping("/students")
  public ApiResponse<?> students(@RequestParam Map<String, String> query) {
    return ApiResponse.ok(finance.studentBalances(query));
  }

  @GetMapping("/students/{id}")
  public ApiResponse<?> student(@PathVariable UUID id) {
    return ApiResponse.ok(finance.studentAccount(id, false, null));
  }

  private ResponseEntity<Resource> proofResponse(Payment payment) {
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
