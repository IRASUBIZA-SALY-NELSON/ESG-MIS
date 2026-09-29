package rw.rca.mis.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import rw.rca.mis.domain.ParentConcern;
import rw.rca.mis.domain.ParentLink;
import rw.rca.mis.domain.Person;
import rw.rca.mis.repo.ParentConcernRepository;
import rw.rca.mis.repo.ParentLinkRepository;
import rw.rca.mis.repo.PersonRepository;

@Service
@Transactional(readOnly = true)
public class ParentAdminService {
  public static final String ROLE = "PARENT";
  private static final List<String> RELATIONSHIPS = List.of("FATHER", "MOTHER", "GUARDIAN");
  private static final SecureRandom RANDOM = new SecureRandom();

  private final PersonRepository people;
  private final ParentLinkRepository links;
  private final ParentConcernRepository concerns;
  private final PasswordEncoder encoder;
  private final Lookup lookup;

  public ParentAdminService(
      PersonRepository people,
      ParentLinkRepository links,
      ParentConcernRepository concerns,
      PasswordEncoder encoder,
      Lookup lookup) {
    this.people = people;
    this.links = links;
    this.concerns = concerns;
    this.encoder = encoder;
    this.lookup = lookup;
  }

  public List<Map<String, Object>> all() {
    return people.findByRoleNameOrderByFirstNameAsc(ROLE).stream().map(this::row).toList();
  }

  public Map<String, Object> one(UUID parentId) {
    return row(parent(parentId));
  }

  public List<Map<String, Object>> byStudent(UUID studentId) {
    List<Map<String, Object>> list = new ArrayList<>();
    for (ParentLink link : links.findByStudentId(studentId)) {
      Map<String, Object> row = row(link.getParent());
      row.put("relationship", link.getRelationship());
      row.put("primaryContact", link.isPrimaryContact());
      list.add(row);
    }
    return list;
  }

  @Transactional
  public Map<String, Object> create(Map<String, Object> body) {
    String email = Lookup.text(body, "email");
    String first = Lookup.text(body, "firstName");
    String last = Lookup.text(body, "lastName");
    if (email == null || first == null || last == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "firstName, lastName and email are required");
    }
    if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is not valid");
    }
    if (people.findByEmailIgnoreCase(email).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
    }
    String password = Lookup.text(body, "password");
    if (password == null) {
      password = rw.rca.mis.config.DataSeeder.PASSWORD;
    } else if (password.length() < 8) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
    }
    Person parent = new Person();
    parent.setFirstName(first);
    parent.setLastName(last);
    parent.setEmail(email.toLowerCase());
    parent.setUsername(email.toLowerCase());
    parent.setPassword(encoder.encode(password));
    parent.setRoleName(ROLE);
    parent.setStaffKind(null);
    parent.setStudentStatus(null);
    parent.setStatus("ACTIVE");
    applyContact(parent, body);
    parent = people.save(parent);

    String relationship = relationship(Lookup.text(body, "relationship", "parentType"));
    Object ids = body.get("studentIds");
    if (ids instanceof List<?> list) {
      for (Object id : list) {
        link(parent, Lookup.uuid(id), relationship, Boolean.TRUE.equals(body.get("primaryContact")));
      }
    } else if (body.get("studentId") != null) {
      link(parent, Lookup.uuid(body.get("studentId")), relationship, Boolean.TRUE.equals(body.get("primaryContact")));
    }
    return row(parent);
  }

  @Transactional
  public Map<String, Object> update(UUID parentId, Map<String, Object> body) {
    Person parent = parent(parentId);
    String first = Lookup.text(body, "firstName");
    String last = Lookup.text(body, "lastName");
    String status = Lookup.text(body, "status");
    if (first != null) {
      parent.setFirstName(first);
    }
    if (last != null) {
      parent.setLastName(last);
    }
    if (status != null) {
      parent.setStatus(status.toUpperCase());
    }
    applyContact(parent, body);
    String password = Lookup.text(body, "password");
    if (password != null) {
      if (password.length() < 8) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
      }
      parent.setPassword(encoder.encode(password));
    }
    people.save(parent);
    return row(parent);
  }

  @Transactional
  public Map<String, Object> link(UUID parentId, Map<String, Object> body) {
    Person parent = parent(parentId);
    link(
        parent,
        Lookup.uuid(body.get("studentId")),
        relationship(Lookup.text(body, "relationship", "parentType")),
        Boolean.TRUE.equals(body.get("primaryContact")));
    return row(parent);
  }

  @Transactional
  public Map<String, Object> unlink(UUID parentId, UUID studentId) {
    Person parent = parent(parentId);
    links.findByParentIdAndStudentId(parentId, studentId).ifPresent(links::delete);
    return row(parent);
  }

  @Transactional
  public void delete(UUID parentId) {
    Person parent = parent(parentId);
    links.deleteAll(links.findByParentId(parentId));
    concerns.deleteAll(concerns.findByParentIdOrderByCreatedAtDesc(parentId));
    people.delete(parent);
  }

  public List<ParentConcern> allConcerns() {
    return concerns.findAllByOrderByCreatedAtDesc();
  }

  @Transactional
  public ParentConcern respond(UUID concernId, Map<String, Object> body) {
    ParentConcern concern =
        concerns.findById(concernId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Concern not found"));
    String response = Lookup.text(body, "response", "message");
    String status = Lookup.text(body, "status");
    if (response == null && status == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A response or a status is required");
    }
    if (response != null) {
      concern.setResponse(response);
      concern.setRespondedBy(lookup.currentUser());
      concern.setRespondedAt(Instant.now());
      concern.setStatus("ANSWERED");
    }
    if (status != null) {
      String upper = status.toUpperCase();
      if (!List.of("OPEN", "ANSWERED", "CLOSED").contains(upper)) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown status " + status);
      }
      concern.setStatus(upper);
    }
    return concerns.save(concern);
  }

  /** Students visible on the public verification page for a report-card token. */
  public List<Person> studentsForToken(String token) {
    if (token == null || token.isBlank()) {
      return List.of();
    }
    return links.findByReportCardToken(token).stream().map(ParentLink::getStudent).toList();
  }

  // ---------------------------------------------------------------- helpers

  void link(Person parent, UUID studentId, String relationship, boolean primary) {
    if (studentId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId is required");
    }
    Person student = lookup.person(studentId);
    if (!"STUDENT".equals(student.getRoleName())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, student.fullName() + " is not a student");
    }
    ParentLink link = links.findByParentIdAndStudentId(parent.getId(), studentId).orElseGet(ParentLink::new);
    link.setParent(parent);
    link.setStudent(student);
    link.setRelationship(relationship);
    link.setPrimaryContact(primary);
    link.setReportCardToken(tokenFor(parent));
    links.save(link);
  }

  private String tokenFor(Person parent) {
    return links.findByParentId(parent.getId()).stream()
        .map(ParentLink::getReportCardToken)
        .filter(token -> token != null && !token.isBlank())
        .findFirst()
        .orElseGet(ParentAdminService::newToken);
  }

  public static String newToken() {
    byte[] bytes = new byte[24];
    RANDOM.nextBytes(bytes);
    return HexFormat.of().formatHex(bytes);
  }

  private static String relationship(String value) {
    if (value == null) {
      return "GUARDIAN";
    }
    String upper = value.toUpperCase();
    if (!RELATIONSHIPS.contains(upper)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "relationship must be FATHER, MOTHER or GUARDIAN");
    }
    return upper;
  }

  private static void applyContact(Person parent, Map<String, Object> body) {
    String phone = Lookup.text(body, "phoneNumber");
    String gender = Lookup.text(body, "gender");
    String nationalId = Lookup.text(body, "nationalId");
    if (phone != null) {
      parent.setPhoneNumber(phone);
    }
    if (gender != null) {
      parent.setGender(gender.toUpperCase());
    }
    if (nationalId != null) {
      parent.setNationalId(nationalId);
    }
  }

  private Person parent(UUID id) {
    Person person = lookup.person(id);
    if (!ROLE.equals(person.getRoleName())) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent not found");
    }
    return person;
  }

  private Map<String, Object> row(Person parent) {
    Map<String, Object> row = new LinkedHashMap<>();
    row.put("id", parent.getId());
    row.put("firstName", parent.getFirstName());
    row.put("lastName", parent.getLastName());
    row.put("fullName", parent.fullName());
    row.put("email", parent.getEmail());
    row.put("phoneNumber", parent.getPhoneNumber());
    row.put("gender", parent.getGender());
    row.put("nationalId", parent.getNationalId());
    row.put("status", parent.getStatus());
    row.put("createdAt", parent.getCreatedAt());
    List<Map<String, Object>> children = new ArrayList<>();
    String token = null;
    for (ParentLink link : links.findByParentId(parent.getId())) {
      Person student = link.getStudent();
      Map<String, Object> child = new LinkedHashMap<>();
      child.put("id", student.getId());
      child.put("fullName", student.fullName());
      child.put("email", student.getEmail());
      child.put("className", student.getCurrentClass() == null ? null : student.getCurrentClass().getClassName());
      child.put("relationship", link.getRelationship());
      child.put("primaryContact", link.isPrimaryContact());
      children.add(child);
      token = token == null ? link.getReportCardToken() : token;
    }
    row.put("children", children);
    row.put("reportCardToken", token);
    return row;
  }
}
