package rw.rca.mis.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import rw.rca.mis.domain.AcademicMark;
import rw.rca.mis.domain.AcademicYear;
import rw.rca.mis.domain.Deduction;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.SchoolClass;
import rw.rca.mis.domain.StudentClassTerm;
import rw.rca.mis.domain.Term;
import rw.rca.mis.repo.AcademicMarkRepository;
import rw.rca.mis.repo.DeductionRepository;
import rw.rca.mis.repo.PersonRepository;
import rw.rca.mis.repo.SchoolClassRepository;
import rw.rca.mis.repo.StudentClassTermRepository;

@Service
public class PerformanceExportService {
  public static final double DISCIPLINE_MAX = 40.0;

  private final Lookup lookup;
  private final SchoolClassRepository classes;
  private final PersonRepository people;
  private final StudentClassTermRepository placements;
  private final AcademicMarkRepository marks;
  private final DeductionRepository deductions;

  public PerformanceExportService(
      Lookup lookup,
      SchoolClassRepository classes,
      PersonRepository people,
      StudentClassTermRepository placements,
      AcademicMarkRepository marks,
      DeductionRepository deductions) {
    this.lookup = lookup;
    this.classes = classes;
    this.people = people;
    this.placements = placements;
    this.marks = marks;
    this.deductions = deductions;
  }

  public Map<String, Object> ranking(UUID termId, UUID academicYearId, UUID classId, String markType) {
    if (termId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "termId is required");
    }
    Term term = lookup.term(termId);
    AcademicYear year = academicYearId != null ? lookup.year(academicYearId) : term.getAcademicYear();
    String kind = kind(markType);
    List<SchoolClass> scope =
        classId != null ? List.of(lookup.schoolClass(classId)) : classes.findAllByOrderByClassNameAsc();

    List<Map<String, Object>> classReports = new ArrayList<>();
    for (SchoolClass schoolClass : scope) {
      classReports.add("DISCIPLINE".equals(kind) ? disciplineClass(schoolClass, term, year) : academicClass(schoolClass, term));
    }

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("schoolName", "Ecole des Sciences de Gisenyi");
    body.put("academicYear", year == null ? "" : year.getName());
    body.put("termName", pretty(term.getName()));
    body.put("termId", term.getId());
    body.put("markType", kind);
    body.put("classes", classReports);
    return body;
  }

  private Map<String, Object> academicClass(SchoolClass schoolClass, Term term) {
    List<Person> students = studentsOf(schoolClass, term);
    List<AcademicMark> termMarks = marks.findByTermId(term.getId());
    Map<UUID, List<AcademicMark>> byStudent =
        termMarks.stream()
            .filter(mark -> mark.getStudent() != null)
            .collect(Collectors.groupingBy(mark -> mark.getStudent().getId()));

    List<Map<String, Object>> rows = new ArrayList<>();
    for (Person student : students) {
      List<AcademicMark> list = byStudent.getOrDefault(student.getId(), List.of());
      double cat = 0;
      double catMax = 0;
      double exam = 0;
      double examMax = 0;
      for (AcademicMark mark : list) {
        if ("SECOND_SITTING".equalsIgnoreCase(mark.getMarkType())) {
          continue;
        }
        double value = mark.getMarks() == null ? 0 : mark.getMarks();
        double outOf = weight(mark);
        if ("CAT".equalsIgnoreCase(mark.getMarkType())) {
          cat += value;
          catMax += outOf;
        } else if ("EXAM".equalsIgnoreCase(mark.getMarkType())) {
          exam += value;
          examMax += outOf;
        }
      }
      double total = cat + exam;
      double max = catMax + examMax;
      Double percentage = max > 0 ? round(total * 100 / max) : null;
      Map<String, Object> row = studentBase(student);
      row.put("cat", max > 0 || catMax > 0 ? round(cat) : null);
      row.put("exam", max > 0 || examMax > 0 ? round(exam) : null);
      row.put("total", max > 0 ? round(total) : null);
      row.put("max", max > 0 ? round(max) : null);
      row.put("percentage", percentage);
      row.put("decision", decision(percentage, 50));
      rows.add(row);
    }
    return classBody(schoolClass, rank(rows));
  }

  private Map<String, Object> disciplineClass(SchoolClass schoolClass, Term term, AcademicYear year) {
    List<Person> students = studentsOf(schoolClass, term);
    List<Deduction> termDeductions =
        deductions.findByTermId(term.getId()).stream()
            .filter(d -> d.getStudent() != null && !"CANCELLED".equalsIgnoreCase(d.getDeductionStatus()))
            .toList();
    Map<UUID, Double> lost =
        termDeductions.stream()
            .collect(
                Collectors.groupingBy(
                    d -> d.getStudent().getId(),
                    Collectors.summingDouble(d -> d.getMarks() == null ? 0 : d.getMarks())));
    double pass = year == null || year.getDisciplineMarksPassMark() == null ? 50 : year.getDisciplineMarksPassMark();

    List<Map<String, Object>> rows = new ArrayList<>();
    for (Person student : students) {
      double deducted = lost.getOrDefault(student.getId(), 0.0);
      double remaining = Math.max(0, DISCIPLINE_MAX - deducted);
      double percentage = remaining * 100 / DISCIPLINE_MAX;
      Map<String, Object> row = studentBase(student);
      row.put("deducted", round(deducted));
      row.put("remaining", round(remaining));
      row.put("max", DISCIPLINE_MAX);
      row.put("percentage", round(percentage));
      row.put("decision", decision(percentage, pass));
      rows.add(row);
    }
    return classBody(schoolClass, rank(rows));
  }

  private Map<String, Object> classBody(SchoolClass schoolClass, List<Map<String, Object>> students) {
    Person teacher = schoolClass.getClassTeacher();
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("classId", schoolClass.getId());
    body.put("className", schoolClass.getClassName());
    body.put("classCode", schoolClass.getCode());
    body.put("classTeacher", teacher == null ? "" : teacher.fullName());
    body.put("students", students);
    return body;
  }

  private Map<String, Object> studentBase(Person student) {
    Map<String, Object> row = new LinkedHashMap<>();
    row.put("studentId", student.getId());
    row.put("studentCode", code(student));
    row.put("name", student.fullName());
    return row;
  }

  private List<Map<String, Object>> rank(List<Map<String, Object>> rows) {
    rows.sort(
        Comparator.comparing((Map<String, Object> row) -> percentage(row), Comparator.nullsLast(Comparator.reverseOrder()))
            .thenComparing(row -> String.valueOf(row.get("name")), String.CASE_INSENSITIVE_ORDER));
    Double previous = null;
    int rank = 1;
    for (int i = 0; i < rows.size(); i++) {
      Double current = percentage(rows.get(i));
      if (current == null) {
        rows.get(i).put("rank", null);
        continue;
      }
      if (previous != null && Double.compare(previous, current) != 0) {
        rank = i + 1;
      }
      rows.get(i).put("rank", rank);
      previous = current;
    }
    return rows;
  }

  private List<Person> studentsOf(SchoolClass schoolClass, Term term) {
    List<Person> fromPlacements =
        placements.findBySchoolClassIdAndTermId(schoolClass.getId(), term.getId()).stream()
            .map(StudentClassTerm::getStudent)
            .filter(person -> person != null)
            .distinct()
            .sorted(byName())
            .toList();
    if (!fromPlacements.isEmpty()) {
      return fromPlacements;
    }
    return people.findByCurrentClassIdAndRoleName(schoolClass.getId(), "STUDENT").stream().sorted(byName()).toList();
  }

  private static Comparator<Person> byName() {
    return Comparator.comparing(Person::getLastName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
        .thenComparing(Person::getFirstName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
  }

  private static String kind(String markType) {
    if (markType != null && markType.toUpperCase(Locale.ROOT).contains("DISCIPLINE")) {
      return "DISCIPLINE";
    }
    return "ACADEMIC";
  }

  private static String pretty(String name) {
    if (name == null || name.isBlank()) {
      return "";
    }
    String[] parts = name.replace('_', ' ').toLowerCase(Locale.ROOT).split("\\s+");
    StringBuilder out = new StringBuilder();
    for (String part : parts) {
      if (part.isEmpty()) {
        continue;
      }
      if (!out.isEmpty()) {
        out.append(' ');
      }
      out.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1));
    }
    return out.toString();
  }

  private static String code(Person student) {
    if (student.getUsername() != null && !student.getUsername().isBlank() && !student.getUsername().contains("@")) {
      return student.getUsername();
    }
    String email = student.getEmail();
    if (email != null && email.contains("@")) {
      return email.substring(0, email.indexOf('@'));
    }
    return student.getUsername() == null ? "" : student.getUsername();
  }

  private static double weight(AcademicMark mark) {
    return mark.getWeight() == null || mark.getWeight() <= 0 ? 100 : mark.getWeight();
  }

  private static Double percentage(Map<String, Object> row) {
    Object value = row.get("percentage");
    return value instanceof Number number ? number.doubleValue() : null;
  }

  private static String decision(Double percentage, double passMark) {
    if (percentage == null) {
      return "—";
    }
    return percentage + 1e-9 >= passMark ? "Pass" : "Fail";
  }

  private static double round(double value) {
    return Math.round(value * 100.0) / 100.0;
  }
}
