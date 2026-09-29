package rw.rca.mis.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rw.rca.mis.common.ApiResponse;
import rw.rca.mis.service.AuditService;

@RestController
@RequestMapping("/api/v1/audit")
public class AuditController {
  private final AuditService audit;

  public AuditController(AuditService audit) {
    this.audit = audit;
  }

  @GetMapping
  public ApiResponse<?> list(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String module,
      @RequestParam(required = false) String outcome,
      @RequestParam(required = false) String role,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "30") int limit) {
    return ApiResponse.ok(audit.list(q, module, outcome, role, page, limit));
  }

  @GetMapping("/summary")
  public ApiResponse<?> summary() {
    return ApiResponse.ok(audit.summary());
  }
}
