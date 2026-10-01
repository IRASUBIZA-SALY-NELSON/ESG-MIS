package rw.rca.mis.web;

import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import rw.rca.mis.common.ApiResponse;
import rw.rca.mis.repo.ParentLinkRepository;
import rw.rca.mis.service.DisciplineService;
import rw.rca.mis.service.Lookup;
import rw.rca.mis.service.ReportCardDocumentService;

@RestController
@RequestMapping("/api/v1")
public class DisciplineController {
  private final DisciplineService discipline;
  private final ReportCardDocumentService documents;
  private final Lookup lookup;
  private final ParentLinkRepository parentLinks;

  public DisciplineController(
      DisciplineService discipline,
      ReportCardDocumentService documents,
      Lookup lookup,
      ParentLinkRepository parentLinks) {
    this.discipline = discipline;
    this.documents = documents;
    this.lookup = lookup;
    this.parentLinks = parentLinks;
  }

  @GetMapping("/case-categories/all")
  public ApiResponse<?> categories() {
    return ApiResponse.ok(discipline.categories());
  }

  @PostMapping("/case-categories/create")
  public ApiResponse<?> createCategory(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok(discipline.saveCategory(body, null));
  }

  @PutMapping("/case-categories/update/{id}")
  public ApiResponse<?> updateCategory(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(discipline.saveCategory(body, id));
  }

  @DeleteMapping("/case-categories/delete/{id}")
  public ApiResponse<?> deleteCategory(@PathVariable UUID id) {
    discipline.deleteCategory(id);
    return ApiResponse.ok("Deleted", id);
  }

  @GetMapping("/deductions/student/{id}")
  public ApiResponse<?> studentDeductions(@PathVariable UUID id) {
    return ApiResponse.ok(discipline.deductionsForStudent(id));
  }

  @GetMapping("/deductions/ds-marks/loggedIn-student")
  public ApiResponse<?> loggedInDsMarks(@RequestParam(required = false) UUID academicYearId) {
    return ApiResponse.ok(documents.dsReport(lookup.currentUser().getId(), academicYearId));
  }

  @GetMapping("/deductions/ds-marks/by-studentId")
  public ApiResponse<?> dsMarksByStudent(
      @RequestParam UUID studentId, @RequestParam(required = false) UUID academicYearId) {
    return ApiResponse.ok(documents.dsReport(studentId, academicYearId));
  }

  @GetMapping("/deductions/ds-marks/by-parent")
  public ApiResponse<?> dsMarksByParent(
      @RequestParam String token,
      @RequestParam UUID studentId,
      @RequestParam(required = false) UUID academicYearId) {
    if (token.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "token and studentId are required");
    }
    if (!parentLinks.existsByReportCardTokenAndStudentId(token, studentId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid report card token");
    }
    return ApiResponse.ok(documents.dsReport(studentId, academicYearId));
  }

  @GetMapping({"/deductions/academic-year/term/student", "/deductions/academic-year/term/staff"})
  public ApiResponse<?> deductions() {
    return ApiResponse.ok(discipline.allDeductions());
  }

  @PostMapping({"/deductions/create", "/deductions/create/whole-class/"})
  public ApiResponse<?> create(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok(discipline.createDeduction(body));
  }

  @PostMapping("/deductions/create/many-students/")
  public ApiResponse<?> createMany(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok(discipline.createMany(body));
  }

  @PatchMapping("/deductions/cancel/{id}")
  public ApiResponse<?> cancel(@PathVariable UUID id) {
    return ApiResponse.ok(discipline.cancel(id));
  }

  @GetMapping({"/academicAppeals/all", "/academicAppeals/all/{ignored}"})
  public ApiResponse<?> academicAppeals() {
    return ApiResponse.ok(discipline.appeals("ACADEMIC"));
  }

  @GetMapping("/ds-appeals/all")
  public ApiResponse<?> dsAppeals() {
    return ApiResponse.ok(discipline.appeals("DS"));
  }

  @PostMapping("/academicAppeals/create")
  public ApiResponse<?> createAcademic(@RequestParam(required = false) String category, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(discipline.createAppeal("ACADEMIC", category, body));
  }

  @PostMapping("/ds-appeals/create")
  public ApiResponse<?> createDs(@RequestParam(required = false) String category, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(discipline.createAppeal("DS", category, body));
  }

  @GetMapping({"/academicAppeals/approve/{id}", "/academicAppeals/reviewing/{id}"})
  public ApiResponse<?> progress(@PathVariable UUID id, jakarta.servlet.http.HttpServletRequest request) {
    String status = request.getRequestURI().contains("approve") ? "APPROVED" : "REVIEWING";
    return ApiResponse.ok(discipline.setStatus(id, status));
  }

  @org.springframework.web.bind.annotation.RequestMapping(
      path = {"/academicAppeals/reject/{id}", "/ds-appeals/reject/{id}"},
      method = {org.springframework.web.bind.annotation.RequestMethod.PUT, org.springframework.web.bind.annotation.RequestMethod.PATCH})
  public ApiResponse<?> reject(@PathVariable UUID id) {
    return ApiResponse.ok(discipline.setStatus(id, "REJECTED"));
  }

  @PatchMapping("/ds-appeals/approve/{id}")
  public ApiResponse<?> approveDs(@PathVariable UUID id) {
    return ApiResponse.ok(discipline.setStatus(id, "APPROVED"));
  }

  @GetMapping("/academicAppeals/{id}")
  public ApiResponse<?> one(@PathVariable UUID id) {
    return ApiResponse.ok(discipline.appeals("ACADEMIC").stream().filter(appeal -> appeal.getId().equals(id)).findFirst().orElse(null));
  }

  @GetMapping("/academicAppeals/{id}/comments")
  public ApiResponse<?> comments(@PathVariable UUID id) {
    return ApiResponse.ok(discipline.comments(id));
  }

  @org.springframework.web.bind.annotation.RequestMapping(
      path = {"/academicAppeals/{id}/make-comments", "/academicAppeals/comment/{id}"},
      method = {org.springframework.web.bind.annotation.RequestMethod.POST, org.springframework.web.bind.annotation.RequestMethod.PUT})
  public ApiResponse<?> comment(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(discipline.comment(id, body));
  }
}
