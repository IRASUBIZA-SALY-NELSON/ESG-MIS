package rw.rca.mis.service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.SchoolClass;
import rw.rca.mis.domain.StudentClassTerm;
import rw.rca.mis.domain.TeacherAssignment;
import rw.rca.mis.repo.PersonRepository;
import rw.rca.mis.repo.StudentClassTermRepository;
import rw.rca.mis.repo.TeacherAssignmentRepository;

@Service
public class PeopleService {
  private final PersonRepository people;
  private final StudentClassTermRepository placements;
  private final TeacherAssignmentRepository assignments;
  private final PasswordEncoder encoder;
  private final Lookup lookup;

  public PeopleService(
      PersonRepository people,
      StudentClassTermRepository placements,
      TeacherAssignmentRepository assignments,
      PasswordEncoder encoder,
      Lookup lookup) {
    this.people = people;
    this.placements = placements;
    this.assignments = assignments;
    this.encoder = encoder;
    this.lookup = lookup;
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
    return people.save(person);
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
    set(text(body, "gender"), person::setGender);
    set(text(body, "phoneNumber", "phonenumber"), person::setPhoneNumber);
    set(text(body, "nationalId", "national_id"), person::setNationalId);
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
}
