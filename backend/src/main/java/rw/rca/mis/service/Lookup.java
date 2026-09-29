package rw.rca.mis.service;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import rw.rca.mis.domain.AcademicYear;
import rw.rca.mis.domain.Course;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.SchoolClass;
import rw.rca.mis.domain.Term;
import rw.rca.mis.repo.AcademicYearRepository;
import rw.rca.mis.repo.CourseRepository;
import rw.rca.mis.repo.PersonRepository;
import rw.rca.mis.repo.SchoolClassRepository;
import rw.rca.mis.repo.TermRepository;

@Service
public class Lookup {
  private final PersonRepository people;
  private final AcademicYearRepository years;
  private final TermRepository terms;
  private final SchoolClassRepository classes;
  private final CourseRepository courses;

  public Lookup(
      PersonRepository people,
      AcademicYearRepository years,
      TermRepository terms,
      SchoolClassRepository classes,
      CourseRepository courses) {
    this.people = people;
    this.years = years;
    this.terms = terms;
    this.classes = classes;
    this.courses = courses;
  }

  public Person currentUser() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || auth.getName() == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
    }
    return people
        .findByEmailIgnoreCase(auth.getName())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required"));
  }

  public Person person(UUID id) {
    return people
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Person not found"));
  }

  public AcademicYear year(UUID id) {
    return years
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Academic year not found"));
  }

  public Term term(UUID id) {
    return terms
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Term not found"));
  }

  public SchoolClass schoolClass(UUID id) {
    return classes
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));
  }

  public Course course(UUID id) {
    return courses
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
  }

  public static String text(Map<String, Object> body, String... keys) {
    if (body == null) {
      return null;
    }
    for (String key : keys) {
      Object value = body.get(key);
      if (value != null && !value.toString().isBlank()) {
        return value.toString().trim();
      }
    }
    return null;
  }

  public static UUID uuid(Object value) {
    if (value == null || value.toString().isBlank()) {
      return null;
    }
    return UUID.fromString(value.toString());
  }

  public static Double number(Object value, double fallback) {
    if (value == null || value.toString().isBlank()) {
      return fallback;
    }
    return Double.parseDouble(value.toString());
  }

  public static LocalDate date(Object value) {
    if (value == null || value.toString().isBlank()) {
      return null;
    }
    return LocalDate.parse(value.toString().substring(0, 10));
  }

  public static int queryInt(Map<String, String> query, String key, int fallback) {
    if (query == null || query.get(key) == null || query.get(key).isBlank()) {
      return fallback;
    }
    return Integer.parseInt(query.get(key));
  }
}
