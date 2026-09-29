package rw.rca.mis.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.rca.mis.domain.AcademicMark;
import rw.rca.mis.domain.AcademicYear;
import rw.rca.mis.domain.Course;
import rw.rca.mis.domain.ParentLink;
import rw.rca.mis.domain.Person;
import rw.rca.mis.repo.AcademicMarkRepository;
import rw.rca.mis.repo.CourseRepository;
import rw.rca.mis.repo.ParentLinkRepository;

@Service
public class MarksService {
  private static final List<String> TERM_KEYS = List.of("FIRST_TERM", "SECOND_TERM", "THIRD_TERM");

  private final AcademicMarkRepository marks;
  private final CourseRepository courses;
  private final Lookup lookup;
  private final ParentLinkRepository parentLinks;

  public MarksService(
      AcademicMarkRepository marks, CourseRepository courses, Lookup lookup, ParentLinkRepository parentLinks) {
    this.marks = marks;
    this.courses = courses;
    this.lookup = lookup;
    this.parentLinks = parentLinks;
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
