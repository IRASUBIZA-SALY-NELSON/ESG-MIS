package rw.rca.mis.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.ContentCachingRequestWrapper;
import rw.rca.mis.common.Pages;
import rw.rca.mis.domain.AuditEvent;
import rw.rca.mis.domain.Person;
import rw.rca.mis.repo.AuditEventRepository;
import rw.rca.mis.repo.PersonRepository;

@Service
public class AuditService {
  private static final ZoneId KIGALI = ZoneId.of("Africa/Kigali");
  private static final Pattern SECRET =
      Pattern.compile(
          "(?i)\"(password|newPassword|currentPassword|oldPassword|confirmPassword|token|code|secret|appPassword)\"\\s*:\\s*\"[^\"]*\"");
  private static final Pattern UUID_IN_PATH =
      Pattern.compile("/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");

  private final AuditEventRepository events;
  private final PersonRepository people;

  public AuditService(AuditEventRepository events, PersonRepository people) {
    this.events = events;
    this.people = people;
  }

  public boolean shouldRecord(HttpServletRequest request) {
    String uri = Optional.ofNullable(request.getRequestURI()).orElse("");
    String method = Optional.ofNullable(request.getMethod()).orElse("GET").toUpperCase(Locale.ROOT);
    if (!uri.contains("/api/")) return false;
    if (uri.contains("/audit")) return false;
    if ("OPTIONS".equals(method)) return false;
    if (!"GET".equals(method)) return true;
    return uri.contains("/auth/login")
        || uri.contains("/auth/initiate-reset-password")
        || uri.contains("/auth/reset-password")
        || uri.contains("/auth/verify-reset-code")
        || uri.contains("/auth/change-password")
        || uri.contains("/students/profile-id/")
        || uri.contains("/students/id/");
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void record(HttpServletRequest request, HttpServletResponse response, long startedNanos) {
    if (!shouldRecord(request)) return;
    AuditEvent event = new AuditEvent();
    String method = Optional.ofNullable(request.getMethod()).orElse("GET").toUpperCase(Locale.ROOT);
    String path = Optional.ofNullable(request.getRequestURI()).orElse("");
    event.setMethod(method);
    event.setPath(trim(path, 512));
    event.setQueryString(trim(request.getQueryString(), 512));
    event.setStatus(response.getStatus());
    event.setOutcome(response.getStatus() < 400 ? "SUCCESS" : "FAILURE");
    event.setAction(describe(method, path));
    event.setModule(moduleOf(path));
    event.setIp(clientIp(request));
    event.setUserAgent(trim(request.getHeader("User-Agent"), 180));
    event.setDurationMs(Math.max(0, (System.nanoTime() - startedNanos) / 1_000_000));
    event.setDetail(trim(redact(bodyOf(request)), 4000));
    fillActor(event, request);
    events.save(event);
  }

  public Map<String, Object> list(String q, String module, String outcome, String role, int page, int limit) {
    Page<AuditEvent> found =
        events.search(
            blank(q),
            blank(module),
            blank(outcome),
            blank(role),
            PageRequest.of(page, limit <= 0 ? 30 : Math.min(limit, 200), Sort.by(Sort.Direction.DESC, "createdAt")));
    Map<String, Object> body = Pages.of(found.getContent(), 0, found.getContent().size());
    body.put("content", found.getContent());
    body.put("totalElements", found.getTotalElements());
    body.put("totalPages", found.getTotalPages());
    body.put("number", found.getNumber());
    body.put("size", found.getSize());
    body.put("numberOfElements", found.getNumberOfElements());
    body.put("first", found.isFirst());
    body.put("last", found.isLast());
    body.put("empty", found.isEmpty());
    return body;
  }

  public Map<String, Object> summary() {
    Instant startOfDay = LocalDate.now(KIGALI).atStartOfDay(KIGALI).toInstant();
    Instant lastHour = Instant.now().minusSeconds(3600);
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("today", events.countByCreatedAtAfter(startOfDay));
    body.put("failedToday", events.countByCreatedAtAfterAndOutcome(startOfDay, "FAILURE"));
    body.put("loginsToday", events.countByCreatedAtAfterAndModule(startOfDay, "AUTH"));
    body.put("lastHour", events.countByCreatedAtAfter(lastHour));
    body.put("total", events.count());
    return body;
  }

  private void fillActor(AuditEvent event, HttpServletRequest request) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String email = null;
    String role = null;
    if (auth != null && auth.isAuthenticated() && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
      email = auth.getName();
      role =
          auth.getAuthorities().stream()
              .map(GrantedAuthority::getAuthority)
              .filter(a -> a.startsWith("ROLE_"))
              .map(a -> a.substring(5))
              .findFirst()
              .orElse(null);
    }
    if (email == null) {
      email = emailFromBody(event.getDetail());
    }
    if (email != null && !email.isBlank()) {
      event.setActorEmail(email);
      Optional<Person> person = people.findByEmailIgnoreCase(email);
      if (person.isPresent()) {
        event.setActorId(person.get().getId());
        event.setActorName(person.get().fullName());
        if (role == null) role = person.get().getRoleName();
      }
    }
    event.setActorRole(role);
    if (event.getActorName() == null && email != null) {
      event.setActorName(email);
    }
  }

  private static String describe(String method, String path) {
    String key = method + " " + UUID_IN_PATH.matcher(path.replaceFirst("^/api/v1", "")).replaceAll("/{id}");
    return switch (key) {
      case "POST /auth/login" -> "Signed in";
      case "POST /auth/initiate-reset-password" -> "Asked for a password reset";
      case "PUT /auth/reset-password" -> "Reset a password";
      case "PUT /auth/change-password" -> "Changed own password";
      case "PATCH /auth/profile/{id}", "PATCH /auth/profile" -> "Updated own profile";
      case "GET /students/profile-id/{id}" -> "Opened a student profile";
      case "GET /students/id/{id}" -> "Opened a student record";
      case "POST /students/create" -> "Created a student";
      case "PUT /students/update/{id}", "PUT /users/update/{id}" -> "Updated a person";
      case "PUT /students/student/status" -> "Changed a student status";
      case "PUT /students/assign/class" -> "Assigned a student to a class";
      case "PUT /students/assign/role" -> "Assigned a student role";
      case "DELETE /users/student/delete/{id}", "DELETE /users/delete/{id}" -> "Deleted a user";
      case "POST /teachers/create" -> "Created a teacher";
      case "DELETE /teachers/delete/{id}" -> "Deleted a teacher";
      case "POST /staff-members/create" -> "Created a staff member";
      case "DELETE /staff-members/delete/{id}" -> "Deleted a staff member";
      case "POST /parents/create" -> "Created a parent account";
      case "PUT /parents/update/{id}" -> "Updated a parent";
      case "POST /parents/{id}/link" -> "Linked a parent to a student";
      case "DELETE /parents/{id}/link/{id}" -> "Unlinked a parent from a student";
      case "DELETE /parents/delete/{id}" -> "Deleted a parent";
      case "PUT /parents/concerns/{id}/respond" -> "Replied to a parent message";
      case "POST /classes/create" -> "Created a class";
      case "PUT /classes/update" -> "Updated a class";
      case "POST /courses/create" -> "Created a course";
      case "PUT /courses/update/{id}" -> "Updated a course";
      case "POST /academic-years/create" -> "Created an academic year";
      case "PUT /academic-years/update/{id}" -> "Updated an academic year";
      case "PUT /academic-years/close/{id}" -> "Closed an academic year";
      case "POST /terms/create" -> "Created a term";
      case "PUT /terms/update/{id}" -> "Updated a term";
      case "POST /finance/bills" -> "Created a bill";
      case "PUT /finance/bills/{id}" -> "Updated a bill";
      case "POST /finance/bills/{id}/publish" -> "Published a bill";
      case "POST /finance/bills/{id}/cancel" -> "Cancelled a bill";
      case "DELETE /finance/bills/{id}" -> "Deleted a draft bill";
      case "POST /finance/bills/{id}/pay" -> "Recorded an office payment";
      case "POST /finance/me/bills/{id}/pay" -> "Student submitted a payment proof";
      case "POST /finance/payments/{id}/approve" -> "Approved a payment proof";
      case "POST /finance/payments/{id}/reject" -> "Rejected a payment proof";
      case "POST /library/bills" -> "Created a lost-book bill";
      case "POST /library/bills/{id}/publish" -> "Published a lost-book bill";
      case "POST /library/bills/payments/{id}/approve" -> "Approved a lost-book payment";
      case "POST /library/bills/payments/{id}/reject" -> "Rejected a lost-book payment";
      default -> switch (method) {
        case "POST" -> "Created or submitted " + shortPath(path);
        case "PUT", "PATCH" -> "Updated " + shortPath(path);
        case "DELETE" -> "Deleted " + shortPath(path);
        default -> "Viewed " + shortPath(path);
      };
    };
  }

  private static String moduleOf(String path) {
    String rest = path.replaceFirst("^/api/v1/", "");
    String first = rest.contains("/") ? rest.substring(0, rest.indexOf('/')) : rest;
    return switch (first) {
      case "auth" -> "AUTH";
      case "students", "teachers", "staff-members", "users" -> "PEOPLE";
      case "parents", "parent-portal" -> "PARENTS";
      case "finance" -> "FINANCE";
      case "library" -> "LIBRARY";
      case "notes" -> "NOTES";
      case "academic-years", "terms", "classes", "courses", "academicMarks", "marks" -> "ACADEMICS";
      case "cases", "deductions", "appeals" -> "DISCIPLINE";
      default -> "OTHER";
    };
  }

  private static String shortPath(String path) {
    return UUID_IN_PATH.matcher(path.replaceFirst("^/api/v1", "")).replaceAll("/{id}");
  }

  private static String bodyOf(HttpServletRequest request) {
    String type = Optional.ofNullable(request.getContentType()).orElse("");
    if (type.toLowerCase(Locale.ROOT).startsWith("multipart/")) {
      return "(file upload)";
    }
    if (request instanceof ContentCachingRequestWrapper cached) {
      byte[] buf = cached.getContentAsByteArray();
      if (buf.length == 0) return null;
      Charset charset = StandardCharsets.UTF_8;
      try {
        if (cached.getCharacterEncoding() != null) {
          charset = Charset.forName(cached.getCharacterEncoding());
        }
      } catch (Exception ignored) {
      }
      return new String(buf, charset);
    }
    return null;
  }

  private static String redact(String body) {
    if (body == null || body.isBlank()) return null;
    return SECRET.matcher(body).replaceAll("\"$1\":\"***\"");
  }

  private static String emailFromBody(String body) {
    if (body == null) return null;
    var matcher = Pattern.compile("(?i)\"email\"\\s*:\\s*\"([^\"]+)\"").matcher(body);
    return matcher.find() ? matcher.group(1) : null;
  }

  private static String clientIp(HttpServletRequest request) {
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      return forwarded.split(",")[0].trim();
    }
    return request.getRemoteAddr();
  }

  private static String blank(String value) {
    return value == null ? "" : value.trim();
  }

  private static String trim(String value, int max) {
    if (value == null) return null;
    String cut = value.strip();
    if (cut.isEmpty()) return null;
    return cut.length() <= max ? cut : cut.substring(0, max);
  }
}
