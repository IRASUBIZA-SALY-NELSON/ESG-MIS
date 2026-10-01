package rw.rca.mis.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import rw.rca.mis.domain.AcademicMark;
import rw.rca.mis.domain.AcademicYear;
import rw.rca.mis.domain.Course;
import rw.rca.mis.domain.ParentLink;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.SchoolClass;
import rw.rca.mis.domain.Term;
import rw.rca.mis.repo.AcademicMarkRepository;
import rw.rca.mis.repo.CourseRepository;
import rw.rca.mis.repo.ParentLinkRepository;
import rw.rca.mis.repo.SchoolClassRepository;
import rw.rca.mis.repo.TermRepository;

@Service
public class MarksService {
  private static final List<String> TERM_KEYS = List.of("FIRST_TERM", "SECOND_TERM", "THIRD_TERM");

  private final AcademicMarkRepository marks;
  private final CourseRepository courses;
  private final Lookup lookup;
  private final ParentLinkRepository parentLinks;
  private final TermRepository terms;
  private final SchoolClassRepository classes;
  private final PeopleService people;

  public MarksService(
      AcademicMarkRepository marks,
      CourseRepository courses,
      Lookup lookup,
      ParentLinkRepository parentLinks,
      TermRepository terms,
      SchoolClassRepository classes,
      PeopleService people) {
    this.marks = marks;
    this.courses = courses;
    this.lookup = lookup;
    this.parentLinks = parentLinks;
    this.terms = terms;
    this.classes = classes;
    this.people = people;
  }

  public List<AcademicMark> forStudent(UUID studentId) {
    return marks.findByStudentId(studentId);
  }

  @Transactional
  public AcademicMark create(Map<String, Object> body) {
    UUID studentId = Lookup.uuid(body.get("studentId"));
    UUID courseId = Lookup.uuid(body.get("courseId"));
    UUID termId = Lookup.uuid(body.get("termId"));
    String type = Lookup.text(body, "markType", "academicMarkType");
    if (type == null) {
      type = "CAT";
    }
    AcademicMark mark =
        marks
            .findByStudentIdAndCourseIdAndTermIdAndMarkType(studentId, courseId, termId, type)
            .stream()
            .findFirst()
            .orElseGet(AcademicMark::new);
    mark.setStudent(lookup.person(studentId));
    mark.setCourse(lookup.course(courseId));
    mark.setTerm(lookup.term(termId));
    mark.setMarkType(type);
    mark.setMarks(Lookup.number(body.get("marks"), 0));
    mark.setWeight(Lookup.number(body.get("weight"), weightOf(mark.getCourse())));
    mark.setPassMark(Lookup.number(body.get("passMark"), mark.getCourse().getPassMark() == null ? 50 : mark.getCourse().getPassMark()));
    mark.setComment(Lookup.text(body, "comment"));
    mark.setLockStatus(mark.getLockStatus() == null ? "UNLOCKED" : mark.getLockStatus());
    mark.refreshStatus();
    return marks.save(mark);
  }

  @Transactional
  public AcademicMark update(UUID id, Map<String, Object> body) {
    AcademicMark mark = marks.findById(id).orElseThrow(() -> new IllegalArgumentException("Mark not found"));
    if (body.get("marks") != null) {
      mark.setMarks(Lookup.number(body.get("marks"), mark.getMarks()));
    }
    if (body.get("comment") != null) {
      mark.setComment(body.get("comment").toString());
    }
    if (body.get("weight") != null) {
      mark.setWeight(Lookup.number(body.get("weight"), mark.getWeight()));
    }
    mark.refreshStatus();
    return marks.save(mark);
  }

  @Transactional
  public void delete(UUID id) {
    marks.deleteById(id);
  }

  @Transactional
  public int lock(UUID termId, String markType, boolean locked, UUID classId, UUID courseId, List<String> studentIds) {
    List<AcademicMark> found = marks.findByTermId(termId);
    int changed = 0;
    for (AcademicMark mark : found) {
      if (markType != null && !markType.equalsIgnoreCase(mark.getMarkType())) {
        continue;
      }
      if (classId != null && (mark.getStudent().getCurrentClass() == null || !classId.equals(mark.getStudent().getCurrentClass().getId()))) {
        continue;
      }
      if (courseId != null && !courseId.equals(mark.getCourse().getId())) {
        continue;
      }
      if (studentIds != null && !studentIds.isEmpty() && !studentIds.contains(mark.getStudent().getId().toString())) {
        continue;
      }
      mark.setLockStatus(locked ? "LOCKED" : "UNLOCKED");
      marks.save(mark);
      changed++;
    }
    return changed;
  }

  @Transactional(readOnly = true)
  public Map<String, Object> validateReportCards(Map<String, Object> body) {
    UUID yearId = Lookup.uuid(body.get("academicYearId"));
    if (yearId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select an academic year");
    }
    lookup.year(yearId);
    UUID classId = Lookup.uuid(body.get("classId"));
    UUID termId = Lookup.uuid(body.get("termId"));

    List<Term> scope = terms.findByAcademicYearIdOrderByStartDateAsc(yearId);
    if (termId != null) {
      scope = scope.stream().filter(term -> termId.equals(term.getId())).toList();
      if (scope.isEmpty()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "That term is not in the selected academic year");
      }
    }

    Map<UUID, List<AcademicMark>> marksByStudent = new LinkedHashMap<>();
    for (Term term : scope) {
      for (AcademicMark mark : marks.findByTermId(term.getId())) {
        if (mark.getStudent() == null || mark.getCourse() == null || mark.getMarks() == null) {
          continue;
        }
        if ("SECOND_SITTING".equalsIgnoreCase(mark.getMarkType())) {
          continue;
        }
        marksByStudent.computeIfAbsent(mark.getStudent().getId(), id -> new ArrayList<>()).add(mark);
      }
    }

    List<SchoolClass> classList =
        classId == null ? classes.findAllByOrderByClassNameAsc() : List.of(lookup.schoolClass(classId));
    Map<String, Object> results = new LinkedHashMap<>();
    for (SchoolClass schoolClass : classList) {
      List<Person> students =
          termId == null ? people.studentsInClass(schoolClass.getId()) : people.studentsForClassTerm(schoolClass.getId(), termId);
      List<Course> courseList = new ArrayList<>(schoolClass.getCourses());
      courseList.sort(Comparator.comparing(Course::getCourseName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));
      for (Person student : students) {
        results.put(
            student.getId().toString(),
            studentValidation(student, schoolClass, courseList, marksByStudent.getOrDefault(student.getId(), List.of())));
      }
    }
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("results", results);
    return data;
  }

  private Map<String, Object> studentValidation(
      Person student, SchoolClass schoolClass, List<Course> courseList, List<AcademicMark> studentMarks) {
    List<Map<String, Object>> subjectMarks = new ArrayList<>();
    boolean needsSecondSitting = false;
    for (Course course : courseList) {
      double obtained = 0;
      double max = 0;
      for (AcademicMark mark : studentMarks) {
        if (!course.getId().equals(mark.getCourse().getId())) {
          continue;
        }
        obtained += mark.getMarks();
        max += mark.getWeight() == null || mark.getWeight() <= 0 ? 100 : mark.getWeight();
      }
      double pass = course.getPassMark() == null ? 50 : course.getPassMark();
      double percentage = max > 0 ? obtained * 100 / max : 0;
      boolean subjectNeedsSitting = percentage + 1e-9 < pass;
      needsSecondSitting = needsSecondSitting || subjectNeedsSitting;
      Map<String, Object> subject = new LinkedHashMap<>();
      subject.put("courseId", course.getId());
      subject.put("courseName", course.getCourseName());
      subject.put("marks", round(obtained));
      subject.put("courseWeight", round(max > 0 ? max : weightOf(course)));
      subject.put("percentage", round(percentage));
      subject.put("needsSecondSitting", subjectNeedsSitting);
      subjectMarks.add(subject);
    }
    Map<String, Object> row = new LinkedHashMap<>();
    row.put("studentName", student.fullName());
    row.put("className", schoolClass.getClassName());
    row.put("needsSecondSitting", needsSecondSitting);
    row.put("subjectMarks", subjectMarks);
    return row;
  }

  private static double round(double value) {
    return Math.round(value * 100.0) / 100.0;
  }

  public Map<String, Object> reportCard(UUID studentId) {
    return reportCard(studentId, null);
  }

  public Map<String, Object> reportCard(UUID studentId, UUID academicYearId) {
    Person student = lookup.person(studentId);
    List<AcademicMark> studentMarks =
        marks.findByStudentId(studentId).stream()
            .filter(mark -> mark.getTerm() != null && mark.getCourse() != null)
            .filter(
                mark ->
                    academicYearId == null
                        || (mark.getTerm().getAcademicYear() != null
                            && academicYearId.equals(mark.getTerm().getAcademicYear().getId())))
            .toList();
    Map<String, Object> report = new LinkedHashMap<>();
    Map<UUID, Course> usedCourses = new LinkedHashMap<>();
    for (String key : TERM_KEYS) {
      Map<String, List<AcademicMark>> byCourse = new LinkedHashMap<>();
      studentMarks.stream()
          .filter(mark -> key.equals(mark.getTerm().getName()))
          .sorted((a, b) -> a.getCourse().getCourseName().compareToIgnoreCase(b.getCourse().getCourseName()))
          .forEach(
              mark -> {
                usedCourses.putIfAbsent(mark.getCourse().getId(), mark.getCourse());
                byCourse.computeIfAbsent(mark.getCourse().getCourseName(), name -> new ArrayList<>()).add(mark);
              });
      if (!byCourse.isEmpty()) {
        report.put(key, byCourse);
      }
    }
    AcademicYear year =
        academicYearId != null
            ? lookup.year(academicYearId)
            : studentMarks.isEmpty() ? null : studentMarks.get(0).getTerm().getAcademicYear();
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("studentInfo", student);
    body.put("academicYearInfo", year);
    body.put("courses", new ArrayList<>(usedCourses.values()));
    body.put("parents", parentsOf(studentId));
    body.put("reportCard", report);
    return body;
  }

  private List<Map<String, Object>> parentsOf(UUID studentId) {
    List<Map<String, Object>> list = new ArrayList<>();
    for (ParentLink link : parentLinks.findByStudentId(studentId)) {
      Person parent = link.getParent();
      Map<String, Object> row = new LinkedHashMap<>();
      row.put("id", parent.getId());
      row.put("firstName", parent.getFirstName());
      row.put("lastName", parent.getLastName());
      row.put("email", parent.getEmail());
      row.put("phoneNumber", parent.getPhoneNumber());
      row.put("gender", parent.getGender());
      row.put("status", parent.getStatus());
      row.put("parentType", link.getRelationship());
      row.put("reportCardToken", link.getReportCardToken());
      list.add(row);
    }
    return list;
  }

  private double weightOf(Course course) {
    try {
      return Double.parseDouble(course.getCourseWeight());
    } catch (Exception ex) {
      return 100;
    }
  }
}
