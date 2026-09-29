package rw.rca.mis.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import rw.rca.mis.domain.AcademicMark;
import rw.rca.mis.domain.Course;
import rw.rca.mis.domain.Deduction;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.SchoolClass;
import rw.rca.mis.domain.TeacherAssignment;
import rw.rca.mis.repo.AcademicMarkRepository;
import rw.rca.mis.repo.AppealRepository;
import rw.rca.mis.repo.TeacherAssignmentRepository;
import rw.rca.mis.repo.CourseRepository;
import rw.rca.mis.repo.DeductionRepository;
import rw.rca.mis.repo.PersonRepository;
import rw.rca.mis.repo.SchoolClassRepository;

@Service
public class DashboardService {
  private final PersonRepository people;
  private final CourseRepository courses;
  private final SchoolClassRepository classes;
  private final AcademicMarkRepository marks;
  private final DeductionRepository deductions;
  private final TeacherAssignmentRepository assignments;
  private final AppealRepository appeals;

  public DashboardService(
      PersonRepository people,
      CourseRepository courses,
      SchoolClassRepository classes,
      AcademicMarkRepository marks,
      DeductionRepository deductions,
      TeacherAssignmentRepository assignments,
      AppealRepository appeals) {
    this.people = people;
    this.courses = courses;
    this.classes = classes;
    this.marks = marks;
    this.deductions = deductions;
    this.assignments = assignments;
    this.appeals = appeals;
  }

  public Map<String, Object> summary(UUID termId) {
    List<SchoolClass> allClasses = classes.findAll();
    List<AcademicMark> termMarks = termId == null ? List.of() : marks.findByTermId(termId);
    List<Map<String, Object>> classRows = allClasses.stream().map(schoolClass -> classRow(schoolClass, termMarks)).toList();
    List<Map<String, Object>> courseRows = courses.findAll().stream().map(course -> courseRow(course, termMarks)).toList();
    String worst = classRows.stream().min((a, b) -> Double.compare(score(a), score(b))).map(row -> String.valueOf(row.get("name"))).orElse("None");
    String best = classRows.stream().max((a, b) -> Double.compare(score(a), score(b))).map(row -> String.valueOf(row.get("name"))).orElse("None");
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("coursesNumber", courses.count());
    body.put("studentsNumber", people.countByRoleName("STUDENT"));
    body.put("classesNumber", classes.count());
    body.put("teachersNumber", people.countByRoleName("TEACHER"));
    body.put("staffNumber", people.count() - people.countByRoleName("STUDENT") - people.countByRoleName("PARENT"));
    body.put("totalMarksRegistered", termMarks.size());
    body.put("bestClass", best);
    body.put("worstClass", worst);
    body.put("overAllMarksForClasses", classRows);
    body.put("overAllMarksForCourses", courseRows);
    body.put("myCourses", courses.findAll().stream().limit(6).toList());
    putDiscipline(body, allClasses, termId);
    return body;
  }

  private void putDiscipline(Map<String, Object> body, List<SchoolClass> allClasses, UUID termId) {
    List<Deduction> termDeductions =
        (termId == null ? List.<Deduction>of() : deductions.findByTermId(termId)).stream()
            .filter(d -> !"CANCELLED".equals(d.getDeductionStatus()))
            .toList();
    List<Map<String, Object>> rows = new java.util.ArrayList<>();
    long students = 0;
    double total = 0;
    for (SchoolClass schoolClass : allClasses) {
      int size = people.findByCurrentClassIdAndRoleName(schoolClass.getId(), "STUDENT").size();
      double lost =
          termDeductions.stream()
              .filter(d -> d.getStudent().getCurrentClass() != null && schoolClass.getId().equals(d.getStudent().getCurrentClass().getId()))
              .mapToDouble(d -> d.getMarks() == null ? 0 : d.getMarks())
              .sum();
      Map<String, Object> clazz = new LinkedHashMap<>();
      clazz.put("id", schoolClass.getId());
      clazz.put("className", schoolClass.getClassName());
      clazz.put("studentsNumber", size);
      Map<String, Object> row = new LinkedHashMap<>();
      row.put("myClazz", clazz);
      row.put("disciplineMarks", lost);
      row.put("performance", size == 0 ? 100.0 : (size * 40 - lost) / (size * 40) * 100);
      rows.add(row);
      students += size;
      total += lost;
    }
    java.util.Comparator<Map<String, Object>> byPerformance = java.util.Comparator.comparingDouble(r -> ((Number) r.get("performance")).doubleValue());
    body.put("casesNumber", termDeductions.size());
    body.put("dsAppealsNumber", appeals.findByKindOrderByCreatedAtDesc("DS").size());
    body.put("totalDisciplineMarks", total);
    body.put("disciplinePerformance", students == 0 ? 100.0 : (students * 40 - total) / (students * 40) * 100);
    body.put("classDisciplineResponseDTOList", rows);
    body.put("bestDisciplineClass", rows.stream().max(byPerformance).map(r -> String.valueOf(((Map<?, ?>) r.get("myClazz")).get("className"))).orElse("None"));
    body.put("worstDisciplineClass", rows.stream().min(byPerformance).map(r -> String.valueOf(((Map<?, ?>) r.get("myClazz")).get("className"))).orElse("None"));
  }

  public Map<String, Object> studentSummary(Person student) {
    Map<String, Object> body = summary(null);
    List<AcademicMark> mine = student == null ? List.of() : marks.findByStudentId(student.getId());
    body.put("marks", mine);
    body.put("coursesNumber", mine.stream().map(mark -> mark.getCourse().getId()).distinct().count());
    if (student != null) {
      body.put("dsAppeals", deductions.findByStudentId(student.getId()).stream().filter(d -> !"CANCELLED".equals(d.getDeductionStatus())).count());
      body.put("myAppealsNumber", appeals.findByStudentIdOrderByCreatedAtDesc(student.getId()).size());
    }
    return body;
  }

  public Map<String, Object> teacherSummary(Person teacher, UUID termId) {
    List<TeacherAssignment> mine = assignments.findByTeacherId(teacher.getId());
    Set<UUID> courseIds = mine.stream().map(a -> a.getCourse().getId()).collect(Collectors.toSet());
    Set<UUID> classIds = mine.stream().map(a -> a.getSchoolClass().getId()).collect(Collectors.toSet());
    List<AcademicMark> termMarks =
        (termId == null ? List.<AcademicMark>of() : marks.findByTermId(termId)).stream()
            .filter(mark -> courseIds.contains(mark.getCourse().getId()))
            .toList();
    List<Map<String, Object>> classRows =
        classes.findAllByOrderByClassNameAsc().stream()
            .filter(c -> classIds.contains(c.getId()))
            .map(c -> classRow(c, termMarks))
            .toList();
    List<Map<String, Object>> courseRows =
        courses.findAll().stream().filter(c -> courseIds.contains(c.getId())).map(c -> courseRow(c, termMarks)).toList();
    String classTeacher =
        classes.findAll().stream()
            .filter(c -> c.getClassTeacher() != null && teacher.getId().equals(c.getClassTeacher().getId()))
            .map(SchoolClass::getClassName)
            .findFirst()
            .orElse("You are not a class Teacher");
    long openAppeals =
        appeals.findByTeacherIdAndStatus(teacher.getId(), "PENDING").size()
            + appeals.findByTeacherIdAndStatus(teacher.getId(), "REVIEWING").size();
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("coursesNumber", courseIds.size());
    body.put("classesNumber", classIds.size());
    body.put("myAppealsNumber", openAppeals);
    body.put("classTeacher", classTeacher);
    body.put("totalMarksRegistered", termMarks.size());
    body.put("overAllMarksForClasses", classRows);
    body.put("overAllMarksForCourses", courseRows);
    return body;
  }

  private Map<String, Object> classRow(SchoolClass schoolClass, List<AcademicMark> termMarks) {
    List<AcademicMark> classMarks =
        termMarks.stream()
            .filter(mark -> mark.getStudent().getCurrentClass() != null)
            .filter(mark -> schoolClass.getId().equals(mark.getStudent().getCurrentClass().getId()))
            .toList();
    Map<String, Object> row = new LinkedHashMap<>();
    row.put("name", schoolClass.getClassName());
    row.put("myClazz", schoolClass);
    row.put("catOverAll", average(classMarks, "CAT"));
    row.put("examOverAll", average(classMarks, "EXAM"));
    return row;
  }

  private Map<String, Object> courseRow(Course course, List<AcademicMark> termMarks) {
    List<AcademicMark> courseMarks = termMarks.stream().filter(mark -> course.getId().equals(mark.getCourse().getId())).toList();
    Map<String, Object> row = new LinkedHashMap<>();
    row.put("course", course);
    row.put("catOverAll", average(courseMarks, "CAT"));
    row.put("examOverAll", average(courseMarks, "EXAM"));
    return row;
  }

  private double average(List<AcademicMark> marks, String type) {
    return marks.stream()
        .filter(mark -> type.equals(mark.getMarkType()))
        .mapToDouble(mark -> mark.getWeight() == null || mark.getWeight() == 0 ? 0 : (mark.getMarks() / mark.getWeight()) * 100)
        .average()
        .orElse(0);
  }

  private double score(Map<String, Object> row) {
    return ((Number) row.get("catOverAll")).doubleValue() + ((Number) row.get("examOverAll")).doubleValue();
  }

  public List<Deduction> disciplineMarks(UUID studentId) {
    return deductions.findByStudentId(studentId);
  }
}
