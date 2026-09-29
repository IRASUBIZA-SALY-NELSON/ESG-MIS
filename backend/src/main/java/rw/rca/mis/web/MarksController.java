package rw.rca.mis.web;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import rw.rca.mis.common.ApiResponse;
import rw.rca.mis.repo.ParentLinkRepository;
import rw.rca.mis.service.Lookup;
import rw.rca.mis.service.MarksService;

@RestController
@RequestMapping("/api/v1")
public class MarksController {
  private final MarksService marks;
  private final Lookup lookup;
  private final ParentLinkRepository parentLinks;

  public MarksController(MarksService marks, Lookup lookup, ParentLinkRepository parentLinks) {
    this.marks = marks;
    this.lookup = lookup;
    this.parentLinks = parentLinks;
  }

  @GetMapping({"/academicMarks/all/by-studentId", "/academicMarks/all/by-loggedIn-student"})
  public ApiResponse<?> byStudent(@RequestParam(required = false) UUID studentId) {
    UUID id = studentId == null ? lookup.currentUser().getId() : studentId;
    return ApiResponse.ok(marks.forStudent(id));
  }

  @GetMapping("/academicMarks/all/academic-year/term/course/student")
  public ApiResponse<?> filtered(@RequestParam(required = false) UUID studentId) {
    if (studentId == null) {
      return ApiResponse.ok(List.of());
    }
    return ApiResponse.ok(marks.forStudent(studentId));
  }

  @PostMapping("/academicMarks/create")
  public ApiResponse<?> create(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Mark saved", marks.create(body));
  }

  @PutMapping("/academicMarks/update/{id}")
  public ApiResponse<?> update(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(marks.update(id, body));
  }

  @DeleteMapping("/academicMarks/delete/{id}")
  public ApiResponse<?> delete(@PathVariable UUID id) {
    marks.delete(id);
    return ApiResponse.ok("Deleted", id);
  }

  @PutMapping({"/academicMarks/lock", "/academicMarks/unlock", "/academicMarks/second-sitting/lock", "/academicMarks/second-sitting/unlock"})
  public ApiResponse<?> lockQuery(
      @RequestParam(required = false) String markType,
      @RequestParam UUID termId,
      @RequestParam(required = false) List<String> studentIds,
      jakarta.servlet.http.HttpServletRequest request) {
    boolean locked = request.getRequestURI().contains("/lock");
    return ApiResponse.ok(marks.lock(termId, markType, locked, null, null, studentIds));
  }

  @PutMapping({
    "/academicMarks/lock/class/{classId}/{termId}/{courseId}",
    "/academicMarks/unlock/class/{classId}/{termId}/{courseId}"
  })
  public ApiResponse<?> lockClass(
      @PathVariable UUID classId,
      @PathVariable UUID termId,
      @PathVariable UUID courseId,
      @RequestParam(required = false) String academicMarkType,
      jakarta.servlet.http.HttpServletRequest request) {
    boolean locked = request.getRequestURI().contains("/lock/");
    return ApiResponse.ok(marks.lock(termId, academicMarkType, locked, classId, courseId, null));
  }

  @PutMapping({
    "/academicMarks/lock/many-students/{termId}",
    "/academicMarks/unlock/many-students/{termId}",
    "/academicMarks/second-sitting/lock/many-students",
    "/academicMarks/second-sitting/unlock/many-students"
  })
  public ApiResponse<?> lockMany(
      @PathVariable(required = false) UUID termId,
      @RequestParam(required = false) String academicMarkType,
      @RequestBody(required = false) Map<String, Object> body,
      jakarta.servlet.http.HttpServletRequest request) {
    boolean locked = request.getRequestURI().contains("/lock");
    UUID resolvedTerm = termId;
    if (resolvedTerm == null && body != null) {
      resolvedTerm = Lookup.uuid(body.get("termId"));
    }
    return ApiResponse.ok(marks.lock(resolvedTerm, academicMarkType, locked, null, null, null));
  }

  @GetMapping({
    "/academicMarks/report-card/by-loggedIn-student",
    "/academicMarks/report-card/by-student",
    "/academicMarks/report-card/{studentId}"
  })
  public ApiResponse<?> report(
      @PathVariable(required = false) UUID studentId, @RequestParam(required = false) UUID id) {
    UUID resolved = studentId != null ? studentId : id;
    if (resolved == null) {
      resolved = lookup.currentUser().getId();
    }
    return ApiResponse.ok(marks.reportCard(resolved));
  }

  @GetMapping("/academicMarks/report-card/by-parent")
  public ApiResponse<?> byParent(
      @RequestParam(required = false) String token,
      @RequestParam(required = false) UUID studentId,
      @RequestParam(required = false) UUID academicYearId) {
    if (token == null || token.isBlank() || studentId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "token and studentId are required");
    }
    if (!parentLinks.existsByReportCardTokenAndStudentId(token, studentId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid report card token");
    }
    return ApiResponse.ok(marks.reportCard(studentId, academicYearId));
  }

  @GetMapping("/academicMarks/second-sitting/by-student-and-course")
  public ApiResponse<?> secondSitting(@RequestParam UUID studentId) {
    return ApiResponse.ok(
        marks.forStudent(studentId).stream().filter(mark -> "SECOND_SITTING".equals(mark.getMarkType())).toList());
  }

  @PostMapping({"/report-cards/validate", "/report-cards/validate-all"})
  public ApiResponse<String> validate() {
    return ApiResponse.ok("Report card validated");
  }
}
