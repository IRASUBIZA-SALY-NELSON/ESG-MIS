package rw.rca.mis.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.rca.mis.domain.AcademicYear;
import rw.rca.mis.domain.Deduction;
import rw.rca.mis.domain.Term;
import rw.rca.mis.repo.AcademicYearRepository;
import rw.rca.mis.repo.DeductionRepository;
import rw.rca.mis.repo.TermRepository;

/**
 * Assembles everything the official report-card PDF needs: marks, terms, remaining
 * discipline scores, and class placements. Used by students, staff, logged-in parents,
 * and the public verification page.
 */
@Service
@Transactional(readOnly = true)
public class ReportCardDocumentService {
  static final double DISCIPLINE_MAX = 40.0;

  private final MarksService marks;
  private final PeopleService people;
  private final TermRepository terms;
  private final DeductionRepository deductions;
  private final AcademicYearRepository years;

  public ReportCardDocumentService(
      MarksService marks,
      PeopleService people,
      TermRepository terms,
      DeductionRepository deductions,
      AcademicYearRepository years) {
    this.marks = marks;
    this.people = people;
    this.terms = terms;
    this.deductions = deductions;
    this.years = years;
  }

  public Map<String, Object> document(UUID studentId, UUID academicYearId) {
    UUID yearId = academicYearId != null ? academicYearId : activeYearId();
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("reportCard", marks.reportCard(studentId, yearId));
    body.put("terms", yearId == null ? List.of() : terms.findByAcademicYearIdOrderByStartDateAsc(yearId));
    body.put("dsMarks", dsReport(studentId, yearId));
    body.put("studentClassTermData", people.placementsForStudent(studentId));
    return body;
  }

  /** Remaining discipline marks per term (start at 40, minus recorded cases). */
  public Map<String, Object> dsReport(UUID studentId, UUID academicYearId) {
    UUID yearId = academicYearId != null ? academicYearId : activeYearId();
    List<Term> yearTerms =
        yearId == null ? List.of() : terms.findByAcademicYearIdOrderByStartDateAsc(yearId);
    List<Deduction> active =
        deductions.findByStudentId(studentId).stream()
            .filter(d -> !"CANCELLED".equalsIgnoreCase(d.getDeductionStatus()))
            .toList();

    Map<String, Object> remaining = new LinkedHashMap<>();
    remaining.put("firstTermMarks", DISCIPLINE_MAX);
    remaining.put("secondTermMarks", DISCIPLINE_MAX);
    remaining.put("thirdTermMarks", DISCIPLINE_MAX);

    for (Term term : yearTerms) {
      double deducted =
          active.stream()
              .filter(d -> d.getTerm() != null && term.getId().equals(d.getTerm().getId()))
              .mapToDouble(d -> d.getMarks() == null ? 0 : d.getMarks())
              .sum();
      double score = Math.round(Math.max(0, DISCIPLINE_MAX - deducted) * 100.0) / 100.0;
      String name = term.getName() == null ? "" : term.getName().toUpperCase();
      switch (name) {
        case "FIRST_TERM" -> remaining.put("firstTermMarks", score);
        case "SECOND_TERM" -> remaining.put("secondTermMarks", score);
        case "THIRD_TERM" -> remaining.put("thirdTermMarks", score);
        default -> {}
      }
    }
    return remaining;
  }

  private UUID activeYearId() {
    List<AcademicYear> all = years.findAllByOrderByStartYearDesc();
    AcademicYear year =
        all.stream()
            .filter(y -> "ACTIVE".equalsIgnoreCase(y.getStatus()))
            .findFirst()
            .orElse(all.isEmpty() ? null : all.get(0));
    return year == null ? null : year.getId();
  }
}
