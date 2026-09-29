package rw.rca.mis.service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import rw.rca.mis.domain.ParentLink;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.SchoolClass;
import rw.rca.mis.domain.StudentClassTerm;
import rw.rca.mis.domain.TeacherAssignment;
import rw.rca.mis.repo.ParentLinkRepository;
import rw.rca.mis.repo.PersonRepository;
import rw.rca.mis.repo.StudentClassTermRepository;
import rw.rca.mis.repo.TeacherAssignmentRepository;

@Service
public class PeopleService {
  private final PersonRepository people;
  private final StudentClassTermRepository placements;
  private final TeacherAssignmentRepository assignments;
  private final ParentLinkRepository links;
  private final PasswordEncoder encoder;
  private final Lookup lookup;

  public PeopleService(
      PersonRepository people,
      StudentClassTermRepository placements,
      TeacherAssignmentRepository assignments,
      ParentLinkRepository links,
      PasswordEncoder encoder,
      Lookup lookup) {
    this.people = people;
    this.placements = placements;
    this.assignments = assignments;
    this.links = links;
    this.encoder = encoder;
    this.lookup = lookup;
  }

  /** Shape expected by the student-details dialog: the student plus linked parents. */
  public Map<String, Object> studentProfile(UUID id) {
    Person student = lookup.person(id);
    List<Map<String, Object>> parents =
        links.findByStudentId(id).stream().map(this::parentRow).toList();
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("user", student);
    body.put("person", student);
    body.put("parent", parents);
    return body;
  }

  private Map<String, Object> parentRow(ParentLink link) {
    Person parent = link.getParent();
    String type = link.getRelationship() == null ? "GUARDIAN" : link.getRelationship().toUpperCase(Locale.ROOT);
    if (!type.equals("FATHER") && !type.equals("MOTHER") && !type.equals("GUARDIAN")) {
      type = "GUARDIAN";
    }
    Map<String, Object> row = new LinkedHashMap<>();
    row.put("id", parent.getId());
    row.put("firstName", parent.fullName());
    row.put("lastName", parent.getLastName());
    row.put("email", parent.getEmail());
    row.put("gender", parent.getGender());
    row.put("phoneNumber", parent.getPhoneNumber());
    row.put("nationalId", parent.getNationalId());
    row.put("status", parent.getStatus());
    row.put("parentType", type);
    return row;
  }

  public List<Person> byRole(String role) {
    return people.findByRoleNameOrderByFirstNameAsc(role);
  }

  public List<Person> everyone() {
    return people.findAll();
  }

  public List<Person> searchStudents(String academicYearId, String classId, String query) {
    return byRole("STUDENT").stream()
        .filter(student -> classId == null || classId.isBlank() || (student.getCurrentClass() != null && classId.equals(student.getCurrentClass().getId().toString())))
        .filter(student -> matches(student, query))
        .sorted(Comparator.comparing(Person::getFirstName, Comparator.nullsLast(String::compareToIgnoreCase)))
        .toList();
  }

  public Person get(UUID id) {
    return lookup.person(id);
  }

  @Transactional
  public Person create(String role, Map<String, Object> body) {
    String email = text(body, "email");
    if (email != null && people.findByEmailIgnoreCase(email).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
    }
    Person person = new Person();
    person.setRoleName(role);
    person.setPassword(encoder.encode(text(body, "password") == null ? rw.rca.mis.config.DataSeeder.PASSWORD : text(body, "password")));
    person.setStatus("ACTIVE");
    apply(person, body);
    if (person.getEmail() == null) {
      person.setEmail(role.toLowerCase(Locale.ROOT) + "." + UUID.randomUUID().toString().substring(0, 8) + "@esg.test");
    }
    if (person.getUsername() == null) {
      person.setUsername(person.getEmail());
    }
    if ("STUDENT".equals(role)) {
      person.setStudentStatus("ACTIVE");
    }
    if ("TEACHER".equals(role) || "DS".equals(role) || "DOS".equals(role) || "ACCOUNTANT".equals(role)) {
      person.setStaffKind(role);
    }
    String staffKind = text(body, "staffKind", "type");
    if (staffKind != null) {
      person.setStaffKind(staffKind);
    }
    person = people.save(person);
    if ("STUDENT".equals(role)) {
      attachParents(person, body);
    }
    return person;
  }

  public Map<String, Object> importStudents(List<Map<String, Object>> rows) {
    int created = 0;
    int skipped = 0;
    List<Map<String, Object>> errors = new java.util.ArrayList<>();
    if (rows == null) {
      return Map.of("created", 0, "skipped", 0, "failed", 0, "errors", errors);
    }
    int excelRow = 1;
    for (Map<String, Object> raw : rows) {
      excelRow++;
      try {
        Map<String, Object> body = studentRow(raw);
        String first = text(body, "firstName");
        String last = text(body, "lastName");
        String email = text(body, "email");
        if ((first == null || first.isBlank()) && (last == null || last.isBlank()) && email == null) {
          skipped++;
          continue;
        }
        create("STUDENT", body);
        created++;
      } catch (Exception exception) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("row", excelRow);
        error.put("email", raw != null ? raw.get("Email") : null);
        error.put("message", errorMessage(exception));
        errors.add(error);
      }
    }
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("created", created);
    result.put("skipped", skipped);
    result.put("failed", errors.size());
    result.put("errors", errors);
    return result;
  }

  @Transactional
  public Person update(UUID id, Map<String, Object> body) {
    Person person = lookup.person(id);
    apply(person, body);
    String password = text(body, "password");
    if (password != null) {
      person.setPassword(encoder.encode(password));
    }
    return people.save(person);
  }

  @Transactional
  public void delete(UUID id) {
    people.deleteById(id);
  }

  @Transactional
  public Person assignClass(Map<String, Object> body) {
    Person student = lookup.person(Lookup.uuid(first(body, "studentId", "id")));
    SchoolClass schoolClass = lookup.schoolClass(Lookup.uuid(first(body, "classId")));
    student.setCurrentClass(schoolClass);
    return people.save(student);
  }

  @Transactional
  public Person assignRole(Map<String, Object> body) {
    Person person = lookup.person(Lookup.uuid(first(body, "studentId", "userId", "id")));
    String role = text(body, "role", "roleName");
    if (role != null) {
      person.setRoleName(role);
    }
    return people.save(person);
  }

  @Transactional
  public Person updateStatus(Map<String, Object> body) {
    Person person = lookup.person(Lookup.uuid(first(body, "studentId", "id")));
    String status = text(body, "studentStatus", "status");
    if (status != null) {
      person.setStudentStatus(status);
      person.setStatus(status);
    }
    return people.save(person);
  }

  public List<Person> alumni() {
    return byRole("STUDENT").stream().filter(student -> "ALUMNI".equals(student.getStudentStatus())).toList();
  }

  public List<StudentClassTerm> placementsForStudent(UUID studentId) {
    return placements.findByStudentId(studentId);
  }

  public List<StudentClassTerm> placementsForClassTerm(UUID classId, UUID termId) {
    return placements.findBySchoolClassIdAndTermId(classId, termId);
  }

  public List<TeacherAssignment> teacherCourses(UUID teacherId) {
    return assignments.findByTeacherId(teacherId);
  }

  public List<SchoolClass> classesForTeacher(UUID teacherId) {
    return assignments.findByTeacherId(teacherId).stream()
        .map(TeacherAssignment::getSchoolClass)
        .distinct()
        .toList();
  }

  @Transactional
  public Person assignTeacherClass(UUID teacherId, UUID classId) {
    Person teacher = lookup.person(teacherId);
    teacher.setCurrentClass(lookup.schoolClass(classId));
    SchoolClass schoolClass = lookup.schoolClass(classId);
    schoolClass.setClassTeacher(teacher);
    return people.save(teacher);
  }

  private void apply(Person person, Map<String, Object> body) {
    set(text(body, "firstName"), person::setFirstName);
    set(text(body, "lastName"), person::setLastName);
    set(text(body, "email"), person::setEmail);
    set(text(body, "username"), person::setUsername);
    set(text(body, "phoneNumber", "phonenumber", "phone"), person::setPhoneNumber);
    set(text(body, "nationalId", "national_id"), person::setNationalId);
    String gender = text(body, "gender");
    if (gender != null) {
      person.setGender(normalizeGender(gender));
    }
    UUID classId = Lookup.uuid(first(body, "classId", "currentClassId"));
    if (classId != null) {
      person.setCurrentClass(lookup.schoolClass(classId));
    }
  }

  private boolean matches(Person student, String query) {
    if (query == null || query.isBlank()) {
      return true;
    }
    String haystack = (student.getFirstName() + " " + student.getLastName() + " " + student.getEmail()).toLowerCase(Locale.ROOT);
    return haystack.contains(query.toLowerCase(Locale.ROOT));
  }

  private String text(Map<String, Object> body, String... keys) {
    return Lookup.text(body, keys);
  }

  private Object first(Map<String, Object> body, String... keys) {
    for (String key : keys) {
      if (body.get(key) != null) {
        return body.get(key);
      }
    }
    return null;
  }

  private void set(String value, java.util.function.Consumer<String> setter) {
    if (value != null) {
      setter.accept(value);
    }
  }

  private static String normalizeGender(String gender) {
    String upper = gender.trim().toUpperCase(Locale.ROOT);
    if (upper.startsWith("F")) {
      return "FEMALE";
    }
    return "MALE";
  }

  private void attachParents(Person student, Map<String, Object> body) {
    attachParent(student, nested(body, "father"), "FATHER", true);
    attachParent(student, nested(body, "mother"), "MOTHER", false);
    attachParent(student, nested(body, "guardian"), "GUARDIAN", false);
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> nested(Map<String, Object> body, String key) {
    Object value = body.get(key);
    if (value instanceof Map<?, ?> map) {
      return (Map<String, Object>) map;
    }
    Object dto = body.get("createParentsDTO");
    if (dto instanceof Map<?, ?> outer) {
      Object inner = outer.get(key);
      if (inner instanceof Map<?, ?> map) {
        return (Map<String, Object>) map;
      }
    }
    return null;
  }

  private void attachParent(Person student, Map<String, Object> raw, String relationship, boolean primary) {
    if (raw == null) {
      return;
    }
    String fullName = text(raw, "fullName", "name");
    String first = text(raw, "firstName");
    String last = text(raw, "lastName");
    if (first == null && fullName != null) {
      String[] parts = fullName.trim().split("\\s+", 2);
      first = parts[0];
      last = parts.length > 1 ? parts[1] : "-";
    }
    String email = text(raw, "email");
    String phone = text(raw, "phoneNumber", "phone");
    String nationalId = text(raw, "nationalId");
    if ((first == null || first.isBlank()) && email == null) {
      return;
    }
    if (first == null || first.isBlank()) {
      first = email.split("@")[0];
    }
    if (last == null || last.isBlank()) {
      last = "-";
    }
    Person parent;
    if (email != null) {
      Optional<Person> existing = people.findByEmailIgnoreCase(email);
      if (existing.isPresent()) {
        parent = existing.get();
        if (!"PARENT".equals(parent.getRoleName())) {
          throw new ResponseStatusException(
              HttpStatus.CONFLICT, email + " is already used by a " + parent.getRoleName().toLowerCase(Locale.ROOT));
        }
      } else {
        parent = newParent(first, last, email, phone, nationalId, relationship);
      }
    } else {
      String generated =
          (first + "." + last).toLowerCase(Locale.ROOT).replaceAll("[^a-z.]", "")
              + "."
              + UUID.randomUUID().toString().substring(0, 6)
              + "@esg.test";
      parent = newParent(first, last, generated, phone, nationalId, relationship);
    }
    if (links.findByParentIdAndStudentId(parent.getId(), student.getId()).isPresent()) {
      return;
    }
    ParentLink link = new ParentLink();
    link.setParent(parent);
    link.setStudent(student);
    link.setRelationship(relationship);
    link.setPrimaryContact(primary);
    link.setReportCardToken(ParentAdminService.newToken());
    links.save(link);
  }

  private Map<String, Object> studentRow(Map<String, Object> raw) {
    Map<String, String> flat = flatten(raw);
    Map<String, Object> body = new LinkedHashMap<>();
    put(body, "firstName", pick(flat, "firstname", "givenname"));
    put(body, "lastName", pick(flat, "lastname", "surname", "familyname"));
    put(body, "email", pick(flat, "email", "studentemail"));
    put(body, "gender", pick(flat, "gender", "sex"));
    put(body, "phoneNumber", pick(flat, "phonenumber", "phone", "tel"));
    put(body, "nationalId", pick(flat, "nationalid", "nid"));
    String classCode = pick(flat, "classcode", "class", "classname", "currentclass");
    if (classCode != null) {
      lookup
          .classByCodeOrName(classCode)
          .ifPresentOrElse(
              schoolClass -> body.put("classId", schoolClass.getId().toString()),
              () -> {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown class: " + classCode);
              });
    }
    Map<String, Object> father = parentFrom(flat, "father");
    Map<String, Object> mother = parentFrom(flat, "mother");
    Map<String, Object> guardian = parentFrom(flat, "guardian");
    if (father != null) {
      body.put("father", father);
    }
    if (mother != null) {
      body.put("mother", mother);
    }
    if (guardian != null) {
      body.put("guardian", guardian);
    }
    return body;
  }

  private static Map<String, Object> parentFrom(Map<String, String> flat, String prefix) {
    String name = pick(flat, prefix + "name", prefix + "fullname", prefix + "sname");
    String email = pick(flat, prefix + "email");
    String phone = pick(flat, prefix + "phone", prefix + "phonenumber");
    String nationalId = pick(flat, prefix + "nationalid");
    String gender = pick(flat, prefix + "gender");
    if (name == null && email == null) {
      return null;
    }
    Map<String, Object> parent = new LinkedHashMap<>();
    put(parent, "fullName", name);
    put(parent, "email", email);
    put(parent, "phoneNumber", phone);
    put(parent, "nationalId", nationalId);
    put(parent, "gender", gender);
    return parent;
  }

  private static Map<String, String> flatten(Map<String, Object> raw) {
    Map<String, String> flat = new java.util.HashMap<>();
    if (raw == null) {
      return flat;
    }
    for (Map.Entry<String, Object> entry : raw.entrySet()) {
      if (entry.getKey() == null || entry.getValue() == null) {
        continue;
      }
      String value = entry.getValue().toString().trim();
      if (value.isEmpty()) {
        continue;
      }
      flat.put(norm(entry.getKey()), value);
    }
    return flat;
  }

  private static String pick(Map<String, String> flat, String... keys) {
    for (String key : keys) {
      String value = flat.get(key);
      if (value != null && !value.isBlank()) {
        return value;
      }
    }
    return null;
  }

  private static void put(Map<String, Object> body, String key, String value) {
    if (value != null) {
      body.put(key, value);
    }
  }

  private static String norm(String key) {
    return key.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
  }

  private static String errorMessage(Exception exception) {
    if (exception instanceof ResponseStatusException status) {
      return status.getReason() != null ? status.getReason() : status.getMessage();
    }
    return exception.getMessage() != null ? exception.getMessage() : exception.getClass().getSimpleName();
  }

  private Person newParent(
      String first, String last, String email, String phone, String nationalId, String relationship) {
    Person parent = new Person();
    parent.setFirstName(first);
    parent.setLastName(last);
    parent.setEmail(email.toLowerCase(Locale.ROOT));
    parent.setUsername(email.toLowerCase(Locale.ROOT));
    parent.setPassword(encoder.encode(rw.rca.mis.config.DataSeeder.PASSWORD));
    parent.setRoleName("PARENT");
    parent.setStatus("ACTIVE");
    parent.setPhoneNumber(phone);
    parent.setNationalId(nationalId);
    parent.setGender("MOTHER".equals(relationship) ? "FEMALE" : "MALE");
    return people.save(parent);
  }
}
