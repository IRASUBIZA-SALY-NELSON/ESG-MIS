package rw.rca.mis.web;

import java.util.List;
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
import rw.rca.mis.common.Pages;
import rw.rca.mis.domain.Person;
import rw.rca.mis.service.Lookup;
import rw.rca.mis.service.PeopleService;

@RestController
@RequestMapping("/api/v1")
public class PeopleController {
  private final PeopleService people;

  public PeopleController(PeopleService people) {
    this.people = people;
  }

  @GetMapping({"/students/all", "/students"})
  public ApiResponse<?> students() {
    return ApiResponse.ok(people.byRole("STUDENT"));
  }

  @GetMapping({"/students/student/search", "/students/all/search/paginated", "/students/all/paginated", "/students/all/by-class-academic-year"})
  public ApiResponse<?> searchStudents(
      @RequestParam(required = false) String academicYearId,
      @RequestParam(required = false) String classId,
      @RequestParam(required = false) String searchQuery,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "30") int limit) {
    List<Person> found = people.searchStudents(academicYearId, classId, searchQuery);
    return ApiResponse.ok(Pages.of(found, page, limit));
  }

  @GetMapping("/students/alumnus")
  public ApiResponse<?> alumni() {
    return ApiResponse.ok(people.alumni());
  }

  @GetMapping("/students/id/{id}")
  public ApiResponse<?> student(@PathVariable UUID id) {
    return ApiResponse.ok(people.get(id));
  }

  @GetMapping("/students/profile-id/{id}")
  public ApiResponse<?> studentProfile(@PathVariable UUID id) {
    return ApiResponse.ok(people.studentProfile(id));
  }

  @PostMapping("/students/create")
  public ApiResponse<?> createStudent(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Student created", people.create("STUDENT", body));
  }

  @PostMapping("/students/import")
  public ApiResponse<?> importStudents(@RequestBody List<Map<String, Object>> rows) {
    Map<String, Object> result = people.importStudents(rows);
    int created = ((Number) result.get("created")).intValue();
    int failed = ((Number) result.get("failed")).intValue();
    String message =
        created == 0 && failed > 0
            ? "No students imported"
            : "Imported " + created + " student" + (created == 1 ? "" : "s");
    return ApiResponse.ok(message, result);
  }

  @PutMapping({"/students/update/{id}", "/users/update/{id}"})
  public ApiResponse<?> updateStudent(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok(people.update(id, body));
  }

  @DeleteMapping({"/users/student/delete/{id}", "/users/delete/{id}"})
  public ApiResponse<?> deleteUser(@PathVariable UUID id) {
    people.delete(id);
    return ApiResponse.ok("Deleted", id);
  }

  @PutMapping("/students/assign/class")
  public ApiResponse<?> assignClass(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok(people.assignClass(body));
  }

  @PutMapping("/students/assign/role")
  public ApiResponse<?> assignRole(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok(people.assignRole(body));
  }

  @PutMapping("/students/student/status")
  public ApiResponse<?> status(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok(people.updateStatus(body));
  }

  @GetMapping({"/teachers/all", "/teachers"})
  public ApiResponse<?> teachers() {
    return ApiResponse.ok(people.byRole("TEACHER"));
  }

  @PostMapping("/teachers/create")
  public ApiResponse<?> createTeacher(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Teacher created", people.create("TEACHER", body));
  }

  @DeleteMapping("/teachers/delete/{id}")
  public ApiResponse<?> deleteTeacher(@PathVariable UUID id) {
    people.delete(id);
    return ApiResponse.ok("Deleted", id);
  }

  @GetMapping({"/teachers/not_finished_marking/all", "/teachers/not_finished_marking/all/{termId}"})
  public ApiResponse<?> unfinished(@PathVariable(required = false) String termId) {
    return ApiResponse.ok(people.byRole("TEACHER"));
  }

  @PutMapping("/teachers/assign/class")
  public ApiResponse<?> assignTeacherClass(@RequestParam UUID teacherId, @RequestParam UUID classId) {
    return ApiResponse.ok(people.assignTeacherClass(teacherId, classId));
  }

  @org.springframework.web.bind.annotation.RequestMapping(
      path = {"/teachers/assign/courses", "/teacher-class-course/assign/many"},
      method = {org.springframework.web.bind.annotation.RequestMethod.PUT, org.springframework.web.bind.annotation.RequestMethod.PATCH})
  public ApiResponse<?> assignCourses(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Assignment saved", body);
  }

  @GetMapping({"/staff-members/all", "/staff-members"})
  public ApiResponse<?> staff(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int limit) {
    List<Person> staff = people.byRole("TEACHER");
    staff = new java.util.ArrayList<>(staff);
    staff.addAll(people.byRole("DS"));
    staff.addAll(people.byRole("PM"));
    staff.addAll(people.byRole("DOS"));
    staff.addAll(people.byRole("ACCOUNTANT"));
    staff.addAll(people.byRole("ADMIN"));
    return ApiResponse.ok(Pages.of(staff, page, limit));
  }

  @PostMapping("/staff-members/create")
  public ApiResponse<?> createStaff(@RequestBody Map<String, Object> body) {
    String role = Lookup.text(body, "role", "roleName");
    return ApiResponse.ok(people.create(role == null ? "STAFF" : role, body));
  }

  @DeleteMapping({"/staff-members/delete/{id}", "/staff-members/staff/delete/{id}"})
  public ApiResponse<?> deleteStaff(@PathVariable UUID id) {
    people.delete(id);
    return ApiResponse.ok("Deleted", id);
  }

  @GetMapping("/users/all")
  public ApiResponse<?> users(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int limit) {
    return ApiResponse.ok(Pages.of(people.everyone(), page, limit));
  }

  @GetMapping("/users/search")
  public ApiResponse<?> searchUsers(
      @RequestParam(required = false) String query,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int limit) {
    return ApiResponse.ok(Pages.of(people.searchUsers(query), page, limit));
  }

  @GetMapping({"/student-class-term/student/{id}"})
  public ApiResponse<?> placements(@PathVariable UUID id) {
    return ApiResponse.ok(people.placementsForStudent(id));
  }

  @GetMapping("/student-class-term/class/term")
  public ApiResponse<?> classTerm(@RequestParam UUID classId, @RequestParam UUID termId) {
    return ApiResponse.ok(people.studentsForClassTerm(classId, termId));
  }
}
