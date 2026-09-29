package rw.rca.mis.web;

import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rw.rca.mis.common.ApiResponse;
import rw.rca.mis.service.AcademicService;

@RestController
@RequestMapping("/api/v1")
public class AcademicController {
  private final AcademicService academic;

  public AcademicController(AcademicService academic) {
    this.academic = academic;
  }

  @GetMapping({"/academic-years/all", "/academic-years"})
  public ApiResponse<?> years() {
    return ApiResponse.ok(academic.years());
  }

  @PostMapping("/academic-years/create")
  public ApiResponse<?> createYear(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Academic year created", academic.createYear(body));
  }

  @org.springframework.web.bind.annotation.RequestMapping(
      path = {"/academic-years/update/{id}", "/terms/update/academic-year/{id}"},
      method = {org.springframework.web.bind.annotation.RequestMethod.PUT, org.springframework.web.bind.annotation.RequestMethod.PATCH})
  public ApiResponse<?> updateYear(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(academic.updateYear(id, body));
  }

  @PutMapping("/academic-years/close/{id}")
  public ApiResponse<?> closeYear(@PathVariable UUID id) {
    return ApiResponse.ok(academic.closeYear(id));
  }

  @GetMapping({"/terms/all/academic-year/{yearId}", "/terms/all/{yearId}"})
  public ApiResponse<?> terms(@PathVariable UUID yearId) {
    return ApiResponse.ok(academic.termsForYear(yearId));
  }

  @GetMapping("/terms/all")
  public ApiResponse<?> allTerms() {
    return ApiResponse.ok(academic.allTerms());
  }

  @PostMapping("/terms/create")
  public ApiResponse<?> createTerm(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Term created", academic.createTerm(body));
  }

  @PutMapping("/terms/update/{id}")
  public ApiResponse<?> updateTerm(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(academic.updateTerm(id, body));
  }

  @PatchMapping("/terms/update/mark-status/{id}")
  public ApiResponse<?> markStatus(@PathVariable UUID id, @RequestParam String status) {
    return ApiResponse.ok(academic.updateMarkStatus(id, status));
  }

  @GetMapping({"/classes/all", "/classes/all/current-year", "/classes/all/by-loggedIn-teacher"})
  public ApiResponse<?> classes() {
    return ApiResponse.ok(academic.classes());
  }

  @GetMapping("/classes/all/year/{yearId}")
  public ApiResponse<?> classesForYear(@PathVariable UUID yearId) {
    return ApiResponse.ok(academic.classesForYear(yearId));
  }

  @PostMapping("/classes/create")
  public ApiResponse<?> createClass(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Class created", academic.createClass(body));
  }

  @PutMapping("/classes/update")
  public ApiResponse<?> updateClass(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok(academic.updateClass(body));
  }

  @PutMapping("/classes/course/assign-or-remove/course")
  public ApiResponse<?> assignCourse(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok(academic.assignCourse(body));
  }

  @GetMapping({"/courses/all", "/courses/all/by-loggedIn-student"})
  public ApiResponse<?> courses() {
    return ApiResponse.ok(academic.courses());
  }

  @GetMapping({"/courses/id/{id}", "/courses/class/{id}"})
  public ApiResponse<?> courseOrClassCourses(@PathVariable UUID id) {
    try {
      return ApiResponse.ok(academic.course(id));
    } catch (Exception ex) {
      return ApiResponse.ok(academic.coursesForClass(id));
    }
  }

  @GetMapping("/courses/all/teacher/{id}")
  public ApiResponse<?> teacherCourses(@PathVariable UUID id) {
    return ApiResponse.ok(academic.courses());
  }

  @PostMapping("/courses/create")
  public ApiResponse<?> createCourse(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Course created", academic.createCourse(body));
  }

  @PutMapping("/courses/update/{id}")
  public ApiResponse<?> updateCourse(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(academic.updateCourse(id, body));
  }

  @GetMapping("/timetables/terms/{termId}")
  public ApiResponse<?> timetable(@PathVariable UUID termId) {
    return ApiResponse.ok(academic.timetable(termId));
  }

  @PostMapping("/timetables/terms/{termId}")
  public ApiResponse<?> saveTimetable(@PathVariable UUID termId, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(academic.saveTimetable(termId, body));
  }
}
