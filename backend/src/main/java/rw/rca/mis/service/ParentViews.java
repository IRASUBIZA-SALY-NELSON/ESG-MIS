package rw.rca.mis.service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Read models returned by the parent portal. Parents never receive raw entities of other students. */
public final class ParentViews {
  private ParentViews() {}

  public record TermInfo(
      UUID id,
      String name,
      LocalDate startDate,
      LocalDate endDate,
      String released,
      boolean current) {}

  public record Score(Double marks, Double weight, Double percentage, String status, String comment) {}

  public record CourseLine(
      UUID courseId,
      String courseName,
      String credits,
      Score cat,
      Score exam,
      Score secondSitting,
      Double obtained,
      Double max,
      Double percentage,
      String grade,
      String status,
      String teacherName) {}

  public record TermResult(
      TermInfo term,
      String className,
      List<CourseLine> courses,
      Double obtained,
      Double max,
      Double percentage,
      String grade,
      Integer position,
      Integer classSize,
      int coursesPassed,
      int coursesFailed,
      DisciplineTerm discipline) {}

  public record DisciplineTerm(
      TermInfo term,
      double max,
      double deducted,
      double score,
      double percentage,
      boolean pass,
      int cases) {}

  public record DeductionView(
      UUID id,
      Instant date,
      String termName,
      String category,
      String reason,
      Double marks,
      String status,
      String recordedBy) {}

  public record DisciplineView(
      Double passMark, List<DisciplineTerm> terms, List<DeductionView> deductions) {}

  public record ChildSummary(
      UUID id,
      String firstName,
      String lastName,
      String fullName,
      String email,
      String gender,
      String studentStatus,
      UUID classId,
      String className,
      String relationship,
      boolean primaryContact,
      TermInfo currentTerm,
      TermInfo resultsTerm,
      Double currentPercentage,
      Integer currentPosition,
      Integer classSize,
      Double disciplineScore,
      Double disciplineMax,
      Boolean disciplinePass,
      long pendingAppeals,
      long openConcerns,
      List<String> alerts) {}

  public record NewsView(UUID id, String title, String body, Instant createdAt) {}

  public record Overview(
      ChildSummary child,
      String academicYear,
      List<TermResult> terms,
      List<DeductionView> recentDeductions,
      List<NewsView> news) {}

  public record ReportCardView(
      ChildSummary child,
      UUID academicYearId,
      String academicYear,
      List<TermResult> terms,
      Double yearPercentage,
      String yearGrade,
      String decision,
      boolean complete,
      String reportCardToken) {}

  public record CommentView(String author, String authorRole, String comment, Instant createdAt) {}

  public record AppealView(
      UUID id,
      String kind,
      String category,
      String status,
      String message,
      String courseName,
      String teacherName,
      String termName,
      Instant createdAt,
      List<CommentView> comments) {}

  public record Contact(
      UUID id, String fullName, String email, String phoneNumber, String role, List<String> courses) {}

  public record ClassContacts(
      String className, Contact classTeacher, List<Contact> courseTeachers, List<Contact> schoolContacts) {}
}
