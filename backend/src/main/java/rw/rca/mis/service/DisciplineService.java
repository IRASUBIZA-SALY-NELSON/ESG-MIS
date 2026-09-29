package rw.rca.mis.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.rca.mis.domain.Appeal;
import rw.rca.mis.domain.AppealComment;
import rw.rca.mis.domain.CaseCategory;
import rw.rca.mis.domain.Deduction;
import rw.rca.mis.repo.AppealCommentRepository;
import rw.rca.mis.repo.AppealRepository;
import rw.rca.mis.repo.CaseCategoryRepository;
import rw.rca.mis.repo.DeductionRepository;

@Service
public class DisciplineService {
  private final DeductionRepository deductions;
  private final CaseCategoryRepository categories;
  private final AppealRepository appeals;
  private final AppealCommentRepository comments;
  private final Lookup lookup;

  public DisciplineService(
      DeductionRepository deductions,
      CaseCategoryRepository categories,
      AppealRepository appeals,
      AppealCommentRepository comments,
      Lookup lookup) {
    this.deductions = deductions;
    this.categories = categories;
    this.appeals = appeals;
    this.comments = comments;
    this.lookup = lookup;
  }

  public List<CaseCategory> categories() {
    return categories.findAll();
  }

  @Transactional
  public CaseCategory saveCategory(Map<String, Object> body, UUID id) {
    CaseCategory category = id == null ? new CaseCategory() : categories.findById(id).orElseThrow();
    String name = Lookup.text(body, "name");
    if (name != null) {
      category.setName(name);
    }
    String description = Lookup.text(body, "description");
    if (description != null) {
      category.setDescription(description);
    }
    if (body.get("marks") != null) {
      category.setMarks(Lookup.number(body.get("marks"), 5));
    }
    return categories.save(category);
  }

  @Transactional
  public void deleteCategory(UUID id) {
    categories.deleteById(id);
  }

  public List<Deduction> deductionsForStudent(UUID studentId) {
    return deductions.findByStudentId(studentId);
  }

  public List<Deduction> allDeductions() {
    return deductions.findAll();
  }

  @Transactional
  public Deduction createDeduction(Map<String, Object> body) {
    Deduction deduction = new Deduction();
    fillDeduction(deduction, body);
    return deductions.save(deduction);
  }

  @Transactional
  public List<Deduction> createMany(Map<String, Object> body) {
    Object ids = body.get("studentIds");
    if (!(ids instanceof List<?> list)) {
      return List.of(createDeduction(body));
    }
    return list.stream()
        .map(id -> {
          body.put("studentId", id);
          return createDeduction(body);
        })
        .toList();
  }

  @Transactional
  public Deduction cancel(UUID id) {
    Deduction deduction = deductions.findById(id).orElseThrow();
    deduction.setDeductionStatus("CANCELLED");
    return deductions.save(deduction);
  }

  public List<Appeal> appeals(String kind) {
    return appeals.findByKindOrderByCreatedAtDesc(kind);
  }

  @Transactional
  public Appeal createAppeal(String kind, String category, Map<String, Object> body) {
    Appeal appeal = new Appeal();
    appeal.setKind(kind);
    appeal.setCategory(category == null ? Lookup.text(body, "category") : category);
    appeal.setMessage(Lookup.text(body, "message", "reason", "comment"));
    appeal.setStatus("PENDING");
    if (body.get("studentId") != null) {
      appeal.setStudent(lookup.person(Lookup.uuid(body.get("studentId"))));
    } else if ("STUDENT".equals(lookup.currentUser().getRoleName())) {
      appeal.setStudent(lookup.currentUser());
    }
    if (body.get("teacherId") != null) {
      appeal.setTeacher(lookup.person(Lookup.uuid(body.get("teacherId"))));
    }
    if (body.get("courseId") != null) {
      appeal.setCourse(lookup.course(Lookup.uuid(body.get("courseId"))));
    }
    if (body.get("termId") != null) {
      appeal.setTerm(lookup.term(Lookup.uuid(body.get("termId"))));
    }
    if (body.get("academicYearId") != null) {
      appeal.setAcademicYear(lookup.year(Lookup.uuid(body.get("academicYearId"))));
    }
    return appeals.save(appeal);
  }

  @Transactional
  public Appeal setStatus(UUID id, String status) {
    Appeal appeal = appeals.findById(id).orElseThrow();
    appeal.setStatus(status);
    return appeals.save(appeal);
  }

  public List<AppealComment> comments(UUID appealId) {
    return comments.findByAppealIdOrderByCreatedAtAsc(appealId);
  }

  @Transactional
  public AppealComment comment(UUID appealId, Map<String, Object> body) {
    AppealComment comment = new AppealComment();
    comment.setAppeal(appeals.findById(appealId).orElseThrow());
    comment.setComment(Lookup.text(body, "comment", "message"));
    comment.setAuthor(lookup.currentUser());
    return comments.save(comment);
  }

  private void fillDeduction(Deduction deduction, Map<String, Object> body) {
    if (body.get("studentId") != null) {
      deduction.setStudent(lookup.person(Lookup.uuid(body.get("studentId"))));
      if (deduction.getStudent().getCurrentClass() != null) {
        deduction.setMyClazz(deduction.getStudent().getCurrentClass());
      }
    }
    if (body.get("staffId") != null) {
      deduction.setStaffMember(lookup.person(Lookup.uuid(body.get("staffId"))));
    } else {
      deduction.setStaffMember(lookup.currentUser());
    }
    if (body.get("caseCategoryId") != null) {
      deduction.setCasesCategories(categories.findById(Lookup.uuid(body.get("caseCategoryId"))).orElse(null));
    }
    if (body.get("termId") != null) {
      deduction.setTerm(lookup.term(Lookup.uuid(body.get("termId"))));
      deduction.setAcademicYear(deduction.getTerm().getAcademicYear());
    }
    deduction.setMarks(Lookup.number(body.get("marks"), deduction.getCasesCategories() == null ? 5 : deduction.getCasesCategories().getMarks()));
    deduction.setReason(Lookup.text(body, "reason", "comment"));
    deduction.setDeductionStatus("ACTIVE");
  }
}
