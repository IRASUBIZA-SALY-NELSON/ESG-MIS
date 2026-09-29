package rw.rca.mis.web;

import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rw.rca.mis.common.ApiResponse;
import rw.rca.mis.finance.FinanceService;
import rw.rca.mis.service.ParentPortalService;

/** Endpoints for logged-in parents. Every child endpoint checks the parent-student link. */
@RestController
@RequestMapping("/api/v1/parent-portal")
public class ParentPortalController {
  private final ParentPortalService portal;
  private final FinanceService finance;

  public ParentPortalController(ParentPortalService portal, FinanceService finance) {
    this.portal = portal;
    this.finance = finance;
  }

  @GetMapping("/children/{studentId}/bills")
  public ApiResponse<?> bills(@PathVariable UUID studentId) {
    return ApiResponse.ok(finance.childAccount(studentId));
  }

  @GetMapping("/children")
  public ApiResponse<?> children() {
    return ApiResponse.ok(portal.children());
  }

  @GetMapping("/children/{studentId}/overview")
  public ApiResponse<?> overview(@PathVariable UUID studentId) {
    return ApiResponse.ok(portal.overview(studentId));
  }

  @GetMapping("/children/{studentId}/academic-years")
  public ApiResponse<?> years(@PathVariable UUID studentId) {
    return ApiResponse.ok(portal.yearsFor(studentId));
  }

  @GetMapping("/children/{studentId}/terms")
  public ApiResponse<?> terms(@PathVariable UUID studentId, @RequestParam(required = false) UUID academicYearId) {
    return ApiResponse.ok(portal.termsFor(studentId, academicYearId));
  }

  @GetMapping("/children/{studentId}/marks")
  public ApiResponse<?> marks(@PathVariable UUID studentId, @RequestParam(required = false) UUID termId) {
    return ApiResponse.ok(portal.marks(studentId, termId));
  }

  @GetMapping("/children/{studentId}/report-card")
  public ApiResponse<?> reportCard(
      @PathVariable UUID studentId, @RequestParam(required = false) UUID academicYearId) {
    return ApiResponse.ok(portal.reportCard(studentId, academicYearId));
  }

  @GetMapping("/children/{studentId}/discipline")
  public ApiResponse<?> discipline(
      @PathVariable UUID studentId, @RequestParam(required = false) UUID academicYearId) {
    return ApiResponse.ok(portal.discipline(studentId, academicYearId));
  }

  @GetMapping("/children/{studentId}/appeals")
  public ApiResponse<?> appeals(@PathVariable UUID studentId) {
    return ApiResponse.ok(portal.appeals(studentId));
  }

  @GetMapping("/children/{studentId}/teachers")
  public ApiResponse<?> teachers(@PathVariable UUID studentId) {
    return ApiResponse.ok(portal.contacts(studentId));
  }

  @GetMapping("/concerns")
  public ApiResponse<?> concerns() {
    return ApiResponse.ok(portal.myConcerns());
  }

  @PostMapping("/concerns")
  public ApiResponse<?> raise(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Your message was sent to the school", portal.raiseConcern(body));
  }

  @PutMapping("/concerns/{concernId}/close")
  public ApiResponse<?> close(@PathVariable UUID concernId) {
    return ApiResponse.ok("Concern closed", portal.closeConcern(concernId));
  }
}
