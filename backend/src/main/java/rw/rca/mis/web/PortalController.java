package rw.rca.mis.web;

import java.util.Map;
import java.util.UUID;
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
import rw.rca.mis.service.DashboardService;
import rw.rca.mis.service.ExtrasService;
import rw.rca.mis.service.Lookup;
import rw.rca.mis.service.PerformanceExportService;

@RestController
@RequestMapping("/api/v1")
public class PortalController {
  private final DashboardService dashboard;
  private final ExtrasService extras;
  private final Lookup lookup;
  private final PerformanceExportService performanceExport;

  public PortalController(
      DashboardService dashboard, ExtrasService extras, Lookup lookup, PerformanceExportService performanceExport) {
    this.dashboard = dashboard;
    this.extras = extras;
    this.lookup = lookup;
    this.performanceExport = performanceExport;
  }

  @GetMapping({
    "/dashboard/logged-in-admin/{id}",
    "/dashboard/logged-in-pm/{id}",
    "/dashboard/logged-in-teacher/{id}",
    "/dashboard/logged-in-ds/{id}",
    "/dashboard/logged-in-student/{id}"
  })
  public ApiResponse<?> dashboard(@PathVariable UUID id) {
    if ("STUDENT".equals(lookup.currentUser().getRoleName())) {
      return ApiResponse.ok(dashboard.studentSummary(lookup.currentUser()));
    }
    if ("TEACHER".equals(lookup.currentUser().getRoleName())) {
      return ApiResponse.ok(dashboard.teacherSummary(lookup.currentUser(), id));
    }
    return ApiResponse.ok(dashboard.summary(id));
  }

  @GetMapping("/positions/all")
  public ApiResponse<?> positions() {
    return ApiResponse.ok(extras.positions());
  }

  @PostMapping("/positions/create")
  public ApiResponse<?> createPosition(@RequestParam String name) {
    return ApiResponse.ok(extras.createPosition(name));
  }

  @PutMapping({"/positions/update/{id}", "/positions/update/academic-year/{id}"})
  public ApiResponse<?> updatePosition(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(extras.updatePosition(id, body));
  }

  @GetMapping({"/candidates/all", "/positions/all_positions_by_candidate/{id}"})
  public ApiResponse<?> candidates(@PathVariable(required = false) UUID id) {
    if (id == null) {
      return ApiResponse.ok(extras.candidates());
    }
    return ApiResponse.ok(extras.candidatesForStudent(id));
  }

  @PostMapping("/candidates/create")
  public ApiResponse<?> createCandidate(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok(extras.createCandidate(body));
  }

  @PutMapping({"/candidates/update/{id}", "/candidates/assign/{id}"})
  public ApiResponse<?> updateCandidate(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    body.put("studentId", body.getOrDefault("studentId", id));
    return ApiResponse.ok(extras.createCandidate(body));
  }

  @GetMapping("/voting_sessions/all")
  public ApiResponse<?> sessions() {
    return ApiResponse.ok(extras.sessions());
  }

  @PostMapping("/voting_sessions/create")
  public ApiResponse<?> createSession(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok(extras.createSession(body));
  }

  @PutMapping("/voting_sessions/update/{id}")
  public ApiResponse<?> updateSession(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(extras.updateSession(id, body));
  }

  @PutMapping("/voting_sessions/release-or-hold-results")
  public ApiResponse<?> release(@RequestParam String action, @RequestParam UUID sessionId) {
    return ApiResponse.ok(extras.release(sessionId, action));
  }

  @org.springframework.web.bind.annotation.PatchMapping("/voting_sessions/assign_positions")
  public ApiResponse<?> assignPositions(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Positions assigned", body);
  }

  @PostMapping("/votes/create/list")
  public ApiResponse<?> vote(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok(extras.vote(body));
  }

  @GetMapping("/news/all")
  public ApiResponse<?> news() {
    return ApiResponse.ok(extras.news());
  }

  @GetMapping("/past-papers/course/{id}")
  public ApiResponse<?> papers(@PathVariable UUID id) {
    return ApiResponse.ok(extras.papersForCourse(id));
  }

  @GetMapping("/past-papers/id/{id}")
  public ApiResponse<?> paper(@PathVariable UUID id) {
    return ApiResponse.ok(extras.paper(id));
  }

  @PutMapping("/past-papers/update/{id}")
  public ApiResponse<?> updatePaper(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(extras.updatePaper(id, body));
  }

  @DeleteMapping("/past-papers/delete/{id}")
  public ApiResponse<?> deletePaper(@PathVariable UUID id) {
    extras.deletePaper(id);
    return ApiResponse.ok("Deleted", id);
  }

  @PostMapping("/importing/{portal}")
  public ApiResponse<String> importing(@PathVariable String portal) {
    return ApiResponse.ok("Import received for " + portal);
  }

  @PostMapping("/teacher-availability/bulk")
  public ApiResponse<String> availability() {
    return ApiResponse.ok("Availability saved");
  }

  @GetMapping({
    "/exporting/students/performance/",
    "/exporting/students/performance",
    "/exporting/students-percentages",
    "/exporting/students/marks"
  })
  public ApiResponse<?> performance(
      @RequestParam UUID termId,
      @RequestParam(required = false) UUID academicYearId,
      @RequestParam(required = false) UUID classId,
      @RequestParam(required = false) String markType,
      @RequestParam(required = false) String type) {
    String kind = markType != null && !markType.isBlank() ? markType : type;
    return ApiResponse.ok(performanceExport.ranking(termId, academicYearId, classId, kind));
  }

  @GetMapping("/exporting/election-results/{sessionId}")
  public ApiResponse<?> electionResults(@PathVariable UUID sessionId) {
    return ApiResponse.ok(extras.electionResults(sessionId));
  }
}
