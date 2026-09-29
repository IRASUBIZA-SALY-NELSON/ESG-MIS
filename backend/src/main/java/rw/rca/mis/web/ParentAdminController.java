package rw.rca.mis.web;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import rw.rca.mis.common.ApiResponse;
import rw.rca.mis.domain.Person;
import rw.rca.mis.service.ParentAdminService;

@RestController
public class ParentAdminController {
  private final ParentAdminService parents;

  public ParentAdminController(ParentAdminService parents) {
    this.parents = parents;
  }

  @GetMapping("/api/v1/parents/all")
  public ApiResponse<?> all() {
    return ApiResponse.ok(parents.all());
  }

  @GetMapping("/api/v1/parents/{parentId}")
  public ApiResponse<?> one(@PathVariable UUID parentId) {
    return ApiResponse.ok(parents.one(parentId));
  }

  @GetMapping("/api/v1/parents/by-student/{studentId}")
  public ApiResponse<?> byStudent(@PathVariable UUID studentId) {
    return ApiResponse.ok(parents.byStudent(studentId));
  }

  @PostMapping("/api/v1/parents/create")
  public ApiResponse<?> create(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Parent account created", parents.create(body));
  }

  @PutMapping("/api/v1/parents/update/{parentId}")
  public ApiResponse<?> update(@PathVariable UUID parentId, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Parent updated", parents.update(parentId, body));
  }

  @PostMapping("/api/v1/parents/{parentId}/link")
  public ApiResponse<?> link(@PathVariable UUID parentId, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Student linked", parents.link(parentId, body));
  }

  @DeleteMapping("/api/v1/parents/{parentId}/link/{studentId}")
  public ApiResponse<?> unlink(@PathVariable UUID parentId, @PathVariable UUID studentId) {
    return ApiResponse.ok("Student unlinked", parents.unlink(parentId, studentId));
  }

  @DeleteMapping("/api/v1/parents/delete/{parentId}")
  public ApiResponse<?> delete(@PathVariable UUID parentId) {
    parents.delete(parentId);
    return ApiResponse.ok("Parent deleted", null);
  }

  @GetMapping("/api/v1/parents/concerns/all")
  public ApiResponse<?> concerns() {
    return ApiResponse.ok(parents.allConcerns());
  }

  @PutMapping("/api/v1/parents/concerns/{concernId}/respond")
  public ApiResponse<?> respond(@PathVariable UUID concernId, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Response saved", parents.respond(concernId, body));
  }

  /** Public: used by the report-card QR verification page. Returns only the students tied to the token. */
  @GetMapping("/api/parents/destructure-token/{token}")
  public ApiResponse<List<Map<String, Object>>> destructure(@PathVariable String token) {
    return ApiResponse.ok(parents.studentsForToken(token).stream().map(ParentAdminController::publicStudent).toList());
  }

  private static Map<String, Object> publicStudent(Person student) {
    Map<String, Object> row = new LinkedHashMap<>();
    row.put("id", student.getId());
    row.put("firstName", student.getFirstName());
    row.put("lastName", student.getLastName());
    row.put("fullName", student.fullName());
    row.put("gender", student.getGender());
    if (student.getCurrentClass() != null) {
      row.put("currentClazz", Map.of("id", student.getCurrentClass().getId(), "className", student.getCurrentClass().getClassName()));
    }
    return row;
  }
}
