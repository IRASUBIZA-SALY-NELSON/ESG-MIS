package rw.rca.mis.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import rw.rca.mis.domain.AcademicYear;
import rw.rca.mis.domain.Course;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.SchoolClass;
import rw.rca.mis.domain.Term;
import rw.rca.mis.domain.Timetable;
import rw.rca.mis.repo.AcademicYearRepository;
import rw.rca.mis.repo.CourseRepository;
import rw.rca.mis.repo.PersonRepository;
import rw.rca.mis.repo.SchoolClassRepository;
import rw.rca.mis.repo.TermRepository;
import rw.rca.mis.repo.TimetableRepository;

@Service
public class AcademicService {
  private final AcademicYearRepository years;
  private final TermRepository terms;
  private final SchoolClassRepository classes;
  private final CourseRepository courses;
  private final TimetableRepository timetables;
  private final PersonRepository people;
  private final Lookup lookup;

  public AcademicService(
      AcademicYearRepository years,
      TermRepository terms,
      SchoolClassRepository classes,
      CourseRepository courses,
      TimetableRepository timetables,
      PersonRepository people,
      Lookup lookup) {
    this.years = years;
    this.terms = terms;
    this.classes = classes;
    this.courses = courses;
    this.timetables = timetables;
    this.people = people;
    this.lookup = lookup;
  }

  @Transactional
  public List<AcademicYear> years() {
    ensureOneActive();
    return years.findAllByOrderByStartYearDesc();
  }

  @Transactional
  public AcademicYear createYear(Map<String, Object> body) {
    AcademicYear year = new AcademicYear();
    applyYear(year, body);
    year.setStatus("ACTIVE");
    year = years.save(year);
    closeOthers(year.getId());
    promoteStudents();
    return year;
  }

  @Transactional
  public AcademicYear updateYear(UUID id, Map<String, Object> body) {
    AcademicYear year = lookup.year(id);
    applyYear(year, body);
    year = years.save(year);
    if ("ACTIVE".equalsIgnoreCase(year.getStatus())) {
      closeOthers(year.getId());
    } else {
      activateNewestExcept(year.getId());
    }
    return year;
  }

  @Transactional
  public AcademicYear closeYear(UUID id) {
    AcademicYear year = lookup.year(id);
    boolean anotherYearExists = years.findAll().stream().anyMatch(existing -> !existing.getId().equals(id));
    if (!anotherYearExists) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "The school needs one active academic year. Create the next year before closing this one.");
    }
    year.setStatus("FINISHED");
    years.save(year);
    activateNewestExcept(id);
    return year;
  }

  public List<Term> termsForYear(UUID yearId) {
    return terms.findByAcademicYearIdOrderByStartDateAsc(yearId);
  }

  public List<Term> allTerms() {
    return terms.findAllByOrderByStartDateAsc();
  }

  @Transactional
  public Term createTerm(Map<String, Object> body) {
    Term term = new Term();
    applyTerm(term, body);
    return terms.save(term);
  }

  @Transactional
  public Term updateTerm(UUID id, Map<String, Object> body) {
    Term term = lookup.term(id);
    applyTerm(term, body);
    return terms.save(term);
  }

  @Transactional
  public Term updateMarkStatus(UUID id, String status) {
    Term term = lookup.term(id);
    term.setTermMarksStatus(status == null ? "NONE" : status);
    return terms.save(term);
  }

  public List<SchoolClass> classes() {
    List<SchoolClass> all = classes.findAllByOrderByClassNameAsc();
    all.forEach(this::fillCounts);
    return all;
  }

  /** Classes are shared across the year. The year id is checked so a bad filter fails clearly. */
  public List<SchoolClass> classesForYear(UUID yearId) {
    lookup.year(yearId);
    return classes();
  }

  @Transactional
  public SchoolClass createClass(Map<String, Object> body) {
    SchoolClass schoolClass = new SchoolClass();
    schoolClass.setClassName(Lookup.text(body, "className", "name"));
    schoolClass.setCode(Lookup.text(body, "code"));
    return classes.save(schoolClass);
  }

  @Transactional
  public SchoolClass updateClass(Map<String, Object> body) {
    SchoolClass schoolClass = lookup.schoolClass(Lookup.uuid(body.get("id")));
    String name = Lookup.text(body, "className", "name");
    if (name != null) {
      schoolClass.setClassName(name);
    }
    return classes.save(schoolClass);
  }

  @Transactional
  public SchoolClass assignCourse(Map<String, Object> body) {
    SchoolClass schoolClass = lookup.schoolClass(Lookup.uuid(first(body, "classId", "id")));
    Course course = lookup.course(Lookup.uuid(body.get("courseId")));
    String action = Lookup.text(body, "action");
    if ("remove".equalsIgnoreCase(action)) {
      schoolClass.getCourses().remove(course);
    } else {
      schoolClass.getCourses().add(course);
    }
    return classes.save(schoolClass);
  }

  public List<Course> courses() {
    return courses.findAllByOrderByCourseNameAsc();
  }

  public Course course(UUID id) {
    return lookup.course(id);
  }

  public List<Course> coursesForClass(UUID classId) {
    return List.copyOf(lookup.schoolClass(classId).getCourses());
  }

  @Transactional
  public Course createCourse(Map<String, Object> body) {
    Course course = new Course();
    applyCourse(course, body);
    return courses.save(course);
  }

  @Transactional
  public Course updateCourse(UUID id, Map<String, Object> body) {
    Course course = lookup.course(id);
    applyCourse(course, body);
    return courses.save(course);
  }

  public Timetable timetable(UUID termId) {
    return timetables.findByTermId(termId).orElse(null);
  }

  @Transactional
  public Timetable saveTimetable(UUID termId, Map<String, Object> body) {
    Timetable timetable = timetables.findByTermId(termId).orElseGet(Timetable::new);
    timetable.setTerm(lookup.term(termId));
    timetable.setPayload(body == null ? "{}" : body.toString());
    return timetables.save(timetable);
  }

  private void applyYear(AcademicYear year, Map<String, Object> body) {
    String name = Lookup.text(body, "name");
    if (name != null) {
      year.setName(name);
    }
    if (body.get("startYear") != null) {
      year.setStartYear(Lookup.number(body.get("startYear"), 2025).intValue());
    }
    if (body.get("endYear") != null) {
      year.setEndYear(Lookup.number(body.get("endYear"), 2026).intValue());
    }
    if (body.get("disciplineMarksPassMark") != null) {
      year.setDisciplineMarksPassMark(Lookup.number(body.get("disciplineMarksPassMark"), 50));
    }
    String status = Lookup.text(body, "status");
    if (status != null) {
      year.setStatus(status);
    }
  }

  private void applyTerm(Term term, Map<String, Object> body) {
    String name = Lookup.text(body, "name");
    if (name != null) {
      term.setName(name);
    }
    if (body.get("startDate") != null) {
      term.setStartDate(Lookup.date(body.get("startDate")));
    }
    if (body.get("endDate") != null) {
      term.setEndDate(Lookup.date(body.get("endDate")));
    }
    UUID yearId = Lookup.uuid(first(body, "academicYearId", "academicYear"));
    if (yearId != null) {
      term.setAcademicYear(lookup.year(yearId));
    }
    String status = Lookup.text(body, "termMarksStatus");
    if (status != null) {
      term.setTermMarksStatus(status);
    }
  }

  private void applyCourse(Course course, Map<String, Object> body) {
    String name = Lookup.text(body, "courseName", "name");
    if (name != null) {
      course.setCourseName(name);
    }
    String credits = Lookup.text(body, "courseCredits");
    if (credits != null) {
      course.setCourseCredits(credits);
    }
    String weight = Lookup.text(body, "courseWeight");
    if (weight != null) {
      course.setCourseWeight(weight);
    }
    if (body.get("passMark") != null) {
      course.setPassMark(Lookup.number(body.get("passMark"), 50));
    }
    UUID yearId = Lookup.uuid(body.get("academicYearId"));
    if (yearId != null) {
      course.setAcademicYear(lookup.year(yearId));
    }
  }

  /**
   * Moves each current student up one senior level. S1 A goes to S2 A, and so on. S6 leaves the class
   * and becomes an alumnus. The class each student is in is read before anyone moves, so an S5 student
   * is not graduated in the same step as the S6 class they are about to join. Students already marked
   * repeating, dropout, relocated, or alumni stay as they are.
   */
  private void promoteStudents() {
    List<SchoolClass> allClasses = classes.findAll();
    List<LevelClass> levels = new ArrayList<>();
    for (SchoolClass schoolClass : allClasses) {
      LevelClass parsed = levelOf(schoolClass);
      if (parsed != null) {
        levels.add(parsed);
      }
    }
    List<Person> students = people.findByRoleNameOrderByFirstNameAsc("STUDENT");
    for (Person student : students) {
      if (staysPut(student) || student.getCurrentClass() == null) {
        continue;
      }
      LevelClass current = levelOf(student.getCurrentClass());
      if (current == null) {
        continue;
      }
      if (current.level() >= 6) {
        student.setStudentStatus("ALUMNI");
        student.setCurrentClass(null);
        people.save(student);
        continue;
      }
      SchoolClass next = nextClass(current, levels);
      if (next != null && !next.getId().equals(student.getCurrentClass().getId())) {
        student.setCurrentClass(next);
        people.save(student);
      }
    }
  }

  private SchoolClass nextClass(LevelClass current, List<LevelClass> levels) {
    List<LevelClass> sameStream = new ArrayList<>();
    List<LevelClass> anyStream = new ArrayList<>();
    for (LevelClass candidate : levels) {
      if (candidate.level() != current.level() + 1) {
        continue;
      }
      anyStream.add(candidate);
      if (candidate.stream().equals(current.stream())) {
        sameStream.add(candidate);
      }
    }
    if (sameStream.size() == 1) {
      return sameStream.get(0).schoolClass();
    }
    if (sameStream.isEmpty() && anyStream.size() == 1) {
      return anyStream.get(0).schoolClass();
    }
    return null;
  }

  private boolean staysPut(Person student) {
    String status = student.getStudentStatus();
    if (status == null) {
      return false;
    }
    return switch (status.toUpperCase(Locale.ROOT)) {
      case "REPEATING", "DROPOUT", "RELOCATED", "ALUMNI" -> true;
      default -> false;
    };
  }

  private LevelClass levelOf(SchoolClass schoolClass) {
    if (schoolClass == null) {
      return null;
    }
    LevelClass fromName = levelOf(schoolClass.getClassName(), schoolClass);
    return fromName != null ? fromName : levelOf(schoolClass.getCode(), schoolClass);
  }

  private static final Pattern CLASS_LEVEL = Pattern.compile("(?i)^(S|YEAR\\s*)(\\d+)\\s*(.*)$");

  private LevelClass levelOf(String label, SchoolClass schoolClass) {
    if (label == null || label.isBlank()) {
      return null;
    }
    Matcher matcher = CLASS_LEVEL.matcher(label.trim());
    if (!matcher.matches()) {
      return null;
    }
    int level = Integer.parseInt(matcher.group(2));
    String stream = matcher.group(3).replaceAll("[^A-Za-z]", "").toUpperCase(Locale.ROOT);
    return new LevelClass(level, stream, schoolClass);
  }

  private record LevelClass(int level, String stream, SchoolClass schoolClass) {}

  /** One year is the current year. If none is active, the newest one is. */
  private void ensureOneActive() {
    activateNewestExcept(null);
  }

  private void activateNewestExcept(UUID except) {
    List<AcademicYear> all = years.findAll();
    boolean alreadyActive =
        all.stream()
            .anyMatch(year -> (except == null || !except.equals(year.getId())) && "ACTIVE".equalsIgnoreCase(year.getStatus()));
    if (alreadyActive) {
      return;
    }
    all.stream()
        .filter(year -> except == null || !except.equals(year.getId()))
        .max(
            Comparator.comparingInt((AcademicYear year) -> year.getStartYear() == null ? 0 : year.getStartYear())
                .thenComparingInt(year -> year.getEndYear() == null ? 0 : year.getEndYear()))
        .ifPresent(newest -> {
          newest.setStatus("ACTIVE");
          years.save(newest);
        });
  }

  private void closeOthers(UUID keep) {
    years.findAll().forEach(year -> {
      if (keep == null || !keep.equals(year.getId())) {
        if (!"FINISHED".equalsIgnoreCase(year.getStatus())) {
          year.setStatus("FINISHED");
          years.save(year);
        }
      }
    });
  }

  private void fillCounts(SchoolClass schoolClass) {
    int count =
        (int)
            people.findByRoleNameOrderByFirstNameAsc("STUDENT").stream()
                .filter(person -> person.getCurrentClass() != null)
                .filter(person -> !"ALUMNI".equalsIgnoreCase(person.getStudentStatus()))
                .filter(person -> schoolClass.getId().equals(person.getCurrentClass().getId()))
                .count();
    schoolClass.setStudentsNumber(count);
    schoolClass.setStudentsRemaining(Math.max(0, 40 - count));
  }

  private Object first(Map<String, Object> body, String... keys) {
    for (String key : keys) {
      if (body.get(key) != null) {
        Object value = body.get(key);
        if (value instanceof Map<?, ?> map && map.get("id") != null) {
          return map.get("id");
        }
        return value;
      }
    }
    return null;
  }
}
