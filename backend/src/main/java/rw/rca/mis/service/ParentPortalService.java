package rw.rca.mis.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import rw.rca.mis.domain.AcademicMark;
import rw.rca.mis.domain.AcademicYear;
import rw.rca.mis.domain.Appeal;
import rw.rca.mis.domain.Course;
import rw.rca.mis.domain.Deduction;
import rw.rca.mis.domain.ParentConcern;
import rw.rca.mis.domain.ParentLink;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.SchoolClass;
import rw.rca.mis.domain.StudentClassTerm;
import rw.rca.mis.domain.TeacherAssignment;
import rw.rca.mis.domain.Term;
import rw.rca.mis.repo.AcademicMarkRepository;
import rw.rca.mis.repo.AcademicYearRepository;
import rw.rca.mis.repo.AppealCommentRepository;
import rw.rca.mis.repo.AppealRepository;
import rw.rca.mis.repo.DeductionRepository;
import rw.rca.mis.repo.NewsRepository;
import rw.rca.mis.repo.ParentConcernRepository;
import rw.rca.mis.repo.ParentLinkRepository;
import rw.rca.mis.repo.PersonRepository;
import rw.rca.mis.repo.StudentClassTermRepository;
import rw.rca.mis.repo.TeacherAssignmentRepository;
import rw.rca.mis.repo.TermRepository;
import rw.rca.mis.service.ParentViews.AppealView;
import rw.rca.mis.service.ParentViews.ChildSummary;
import rw.rca.mis.service.ParentViews.ClassContacts;
import rw.rca.mis.service.ParentViews.CommentView;
import rw.rca.mis.service.ParentViews.Contact;
import rw.rca.mis.service.ParentViews.CourseLine;
import rw.rca.mis.service.ParentViews.DeductionView;
import rw.rca.mis.service.ParentViews.DisciplineTerm;
import rw.rca.mis.service.ParentViews.DisciplineView;
import rw.rca.mis.service.ParentViews.NewsView;
import rw.rca.mis.service.ParentViews.Overview;
import rw.rca.mis.service.ParentViews.ReportCardView;
import rw.rca.mis.service.ParentViews.Score;
import rw.rca.mis.service.ParentViews.TermInfo;
import rw.rca.mis.service.ParentViews.TermResult;

@Service
@Transactional(readOnly = true)
public class ParentPortalService {
  public static final double DISCIPLINE_MAX = 40.0;
  private static final List<String> CONCERN_CATEGORIES =
      List.of("ACADEMIC", "DISCIPLINE", "FEES", "HEALTH", "OTHER");

  private final Lookup lookup;
  private final ParentLinkRepository links;
  private final ParentConcernRepository concerns;
  private final AcademicYearRepository years;
  private final TermRepository terms;
  private final AcademicMarkRepository marks;
  private final DeductionRepository deductions;
  private final AppealRepository appeals;
  private final AppealCommentRepository appealComments;
  private final StudentClassTermRepository placements;
  private final TeacherAssignmentRepository assignments;
  private final PersonRepository people;
  private final NewsRepository news;

  public ParentPortalService(
      Lookup lookup,
      ParentLinkRepository links,
      ParentConcernRepository concerns,
      AcademicYearRepository years,
      TermRepository terms,
      AcademicMarkRepository marks,
      DeductionRepository deductions,
      AppealRepository appeals,
      AppealCommentRepository appealComments,
      StudentClassTermRepository placements,
      TeacherAssignmentRepository assignments,
      PersonRepository people,
      NewsRepository news) {
    this.lookup = lookup;
    this.links = links;
    this.concerns = concerns;
    this.years = years;
    this.terms = terms;
    this.marks = marks;
    this.deductions = deductions;
    this.appeals = appeals;
    this.appealComments = appealComments;
    this.placements = placements;
    this.assignments = assignments;
    this.people = people;
    this.news = news;
  }

  // ---------------------------------------------------------------- endpoints

  public List<ChildSummary> children() {
    Person parent = lookup.currentUser();
    return links.findByParentId(parent.getId()).stream()
        .map(link -> summary(parent, link))
        .sorted(Comparator.comparing(ChildSummary::firstName, Comparator.nullsLast(String::compareToIgnoreCase)))
        .toList();
  }

  public Overview overview(UUID studentId) {
    Person parent = lookup.currentUser();
    ParentLink link = requireChild(parent, studentId);
    AcademicYear year = activeYear();
    List<TermResult> results =
        visibleTerms(year).stream().map(term -> termResult(link.getStudent(), term, year)).toList();
    List<DeductionView> recent =
        visibleDeductions(studentId).stream().limit(5).map(this::deductionView).toList();
    List<NewsView> latest =
        news.findAll().stream()
            .sorted(Comparator.comparing(item -> item.getCreatedAt() == null ? Instant.EPOCH : item.getCreatedAt(), Comparator.reverseOrder()))
            .limit(5)
            .map(item -> new NewsView(item.getId(), item.getTitle(), item.getBody(), item.getCreatedAt()))
            .toList();
    return new Overview(summary(parent, link), year == null ? null : year.getName(), results, recent, latest);
  }

  public TermResult marks(UUID studentId, UUID termId) {
    Person parent = lookup.currentUser();
    ParentLink link = requireChild(parent, studentId);
    Term term;
    if (termId != null) {
      term = lookup.term(termId);
    } else {
      term = currentTerm(activeYear());
      if (term == null) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No academic term is configured yet");
      }
    }
    return termResult(link.getStudent(), term, term.getAcademicYear());
  }

  public List<TermInfo> termsFor(UUID studentId, UUID academicYearId) {
    requireChild(lookup.currentUser(), studentId);
    AcademicYear year = academicYearId == null ? activeYear() : lookup.year(academicYearId);
    return visibleTerms(year).stream().map(term -> termInfo(term, year)).toList();
  }

  public List<Map<String, Object>> yearsFor(UUID studentId) {
    requireChild(lookup.currentUser(), studentId);
    Set<UUID> ids = new LinkedHashSet<>();
    placements.findByStudentId(studentId).stream()
        .map(StudentClassTerm::getAcademicYear)
        .filter(Objects::nonNull)
        .forEach(year -> ids.add(year.getId()));
    marks.findByStudentId(studentId).stream()
        .map(mark -> mark.getTerm() == null ? null : mark.getTerm().getAcademicYear())
        .filter(Objects::nonNull)
        .forEach(year -> ids.add(year.getId()));
    AcademicYear active = activeYear();
    if (active != null) {
      ids.add(active.getId());
    }
    List<Map<String, Object>> list = new ArrayList<>();
    for (AcademicYear year : years.findAllByOrderByStartYearDesc()) {
      if (ids.contains(year.getId())) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", year.getId());
        row.put("name", year.getName());
        row.put("status", year.getStatus());
        list.add(row);
      }
    }
    return list;
  }

  public ReportCardView reportCard(UUID studentId, UUID academicYearId) {
    Person parent = lookup.currentUser();
    ParentLink link = requireChild(parent, studentId);
    AcademicYear year = academicYearId == null ? activeYear() : lookup.year(academicYearId);
    if (year == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No academic year is configured yet");
    }
    List<Term> yearTerms = terms.findByAcademicYearIdOrderByStartDateAsc(year.getId());
    List<TermResult> results = new ArrayList<>();
    double obtained = 0;
    double max = 0;
    int finalTerms = 0;
    for (Term term : visibleTerms(year)) {
      TermResult result = termResult(link.getStudent(), term, year);
      results.add(result);
      if ("EXAM".equals(result.term().released()) && result.max() != null && result.max() > 0) {
        obtained += result.obtained();
        max += result.max();
        finalTerms++;
      }
    }
    Double yearPercent = max > 0 ? round(obtained * 100 / max) : null;
    boolean complete = !yearTerms.isEmpty() && finalTerms == yearTerms.size();
    String decision = complete && yearPercent != null ? decision(yearPercent) : "IN_PROGRESS";
    return new ReportCardView(
        summary(parent, link),
        year.getId(),
        year.getName(),
        results,
        yearPercent,
        yearPercent == null ? null : grade(yearPercent),
        decision,
        complete,
        link.getReportCardToken());
  }

  public DisciplineView discipline(UUID studentId, UUID academicYearId) {
    requireChild(lookup.currentUser(), studentId);
    AcademicYear year = academicYearId == null ? activeYear() : lookup.year(academicYearId);
    List<DisciplineTerm> perTerm =
        visibleTerms(year).stream().map(term -> disciplineTerm(studentId, term, year)).toList();
    List<DeductionView> list =
        visibleDeductions(studentId).stream()
            .filter(d -> year == null || (d.getAcademicYear() != null && year.getId().equals(d.getAcademicYear().getId()))
                || (d.getTerm() != null && d.getTerm().getAcademicYear() != null && year != null
                    && year.getId().equals(d.getTerm().getAcademicYear().getId())))
            .map(this::deductionView)
            .toList();
    return new DisciplineView(passMark(year), perTerm, list);
  }

  public List<AppealView> appeals(UUID studentId) {
    requireChild(lookup.currentUser(), studentId);
    return appeals.findByStudentIdOrderByCreatedAtDesc(studentId).stream().map(this::appealView).toList();
  }

  public ClassContacts contacts(UUID studentId) {
    ParentLink link = requireChild(lookup.currentUser(), studentId);
    Person student = link.getStudent();
    Term term = currentTerm(activeYear());
    SchoolClass schoolClass = classOf(student, term);
    Contact classTeacher = null;
    Map<UUID, Contact> teachers = new LinkedHashMap<>();
    if (schoolClass != null) {
      if (schoolClass.getClassTeacher() != null) {
        classTeacher = contact(schoolClass.getClassTeacher(), "CLASS_TEACHER", List.of());
      }
      List<TeacherAssignment> classAssignments = assignments.findBySchoolClassId(schoolClass.getId());
      List<TeacherAssignment> forTerm =
          classAssignments.stream()
              .filter(a -> term != null && a.getTerm() != null && term.getId().equals(a.getTerm().getId()))
              .toList();
      Map<UUID, List<String>> coursesByTeacher = new LinkedHashMap<>();
      Map<UUID, Person> teacherById = new HashMap<>();
      for (TeacherAssignment assignment : forTerm.isEmpty() ? classAssignments : forTerm) {
        if (assignment.getTeacher() == null) {
          continue;
        }
        teacherById.put(assignment.getTeacher().getId(), assignment.getTeacher());
        List<String> courseNames = coursesByTeacher.computeIfAbsent(assignment.getTeacher().getId(), id -> new ArrayList<>());
        if (assignment.getCourse() != null && !courseNames.contains(assignment.getCourse().getCourseName())) {
          courseNames.add(assignment.getCourse().getCourseName());
        }
      }
      coursesByTeacher.forEach(
          (id, courseNames) -> teachers.put(id, contact(teacherById.get(id), "TEACHER", courseNames)));
    }
    List<Contact> school = new ArrayList<>();
    people.findByRoleNameOrderByFirstNameAsc("DS").forEach(p -> school.add(contact(p, "DISCIPLINE", List.of())));
    people.findByRoleNameOrderByFirstNameAsc("DOS").forEach(p -> school.add(contact(p, "DIRECTOR_OF_STUDIES", List.of())));
    people.findByRoleNameOrderByFirstNameAsc("PM").forEach(p -> school.add(contact(p, "HEADMASTER", List.of())));
    return new ClassContacts(
        schoolClass == null ? null : schoolClass.getClassName(),
        classTeacher,
        new ArrayList<>(teachers.values()),
        school);
  }

  public List<ParentConcern> myConcerns() {
    return concerns.findByParentIdOrderByCreatedAtDesc(lookup.currentUser().getId());
  }

  @Transactional
  public ParentConcern raiseConcern(Map<String, Object> body) {
    Person parent = lookup.currentUser();
    String subject = Lookup.text(body, "subject", "title");
    String message = Lookup.text(body, "message", "description");
    if (subject == null || message == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subject and message are required");
    }
    if (subject.length() > 200) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subject must be at most 200 characters");
    }
    if (message.length() > 4000) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message must be at most 4000 characters");
    }
    String category = Lookup.text(body, "category");
    category = category == null ? "OTHER" : category.toUpperCase();
    if (!CONCERN_CATEGORIES.contains(category)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown category " + category);
    }
    ParentConcern concern = new ParentConcern();
    concern.setParent(parent);
    UUID studentId = Lookup.uuid(body.get("studentId"));
    if (studentId != null) {
      concern.setStudent(requireChild(parent, studentId).getStudent());
    }
    concern.setCategory(category);
    concern.setSubject(subject);
    concern.setMessage(message);
    concern.setStatus("OPEN");
    return concerns.save(concern);
  }

  @Transactional
  public ParentConcern closeConcern(UUID concernId) {
    Person parent = lookup.currentUser();
    ParentConcern concern =
        concerns.findById(concernId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Concern not found"));
    if (!concern.getParent().getId().equals(parent.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This concern belongs to another parent");
    }
    concern.setStatus("CLOSED");
    return concerns.save(concern);
  }

  // ---------------------------------------------------------------- access

  public void assertChild(UUID studentId) {
    requireChild(lookup.currentUser(), studentId);
  }

  ParentLink requireChild(Person parent, UUID studentId) {
    if (studentId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId is required");
    }
    return links
        .findByParentIdAndStudentId(parent.getId(), studentId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "This student is not linked to your account"));
  }

  // ---------------------------------------------------------------- summaries

  private ChildSummary summary(Person parent, ParentLink link) {
    Person student = link.getStudent();
    AcademicYear year = activeYear();
    Term term = currentTerm(year);
    TermResult current = term == null ? null : termResult(student, term, year);
    if (current == null || current.percentage() == null) {
      List<Term> started = visibleTerms(year);
      for (int i = started.size() - 1; i >= 0; i--) {
        TermResult candidate = termResult(student, started.get(i), year);
        if (candidate.percentage() != null) {
          current = candidate;
          break;
        }
      }
    }
    SchoolClass schoolClass = classOf(student, term);
    long pendingAppeals =
        appeals.findByStudentIdOrderByCreatedAtDesc(student.getId()).stream()
            .filter(a -> "PENDING".equalsIgnoreCase(a.getStatus()))
            .count();
    long openConcerns = concerns.countByParentIdAndStudentIdAndStatus(parent.getId(), student.getId(), "OPEN");

    List<String> alerts = new ArrayList<>();
    if (student.getStudentStatus() != null && !"ACTIVE".equalsIgnoreCase(student.getStudentStatus())) {
      alerts.add("Student status is " + student.getStudentStatus());
    }
    if (current != null) {
      List<String> failing =
          current.courses().stream().filter(c -> "FAIL".equals(c.status())).map(CourseLine::courseName).toList();
      if (!failing.isEmpty()) {
        alerts.add("Below pass mark in " + String.join(", ", failing) + " (" + readable(current.term().name()) + ")");
      }
      if (current.discipline() != null && !current.discipline().pass()) {
        alerts.add("Discipline marks are below the pass mark this term");
      }
    }
    Instant twoWeeksAgo = Instant.now().minus(14, ChronoUnit.DAYS);
    long recentCases =
        activeDeductions(student.getId()).stream()
            .filter(d -> d.getCreatedAt() != null && d.getCreatedAt().isAfter(twoWeeksAgo))
            .count();
    if (recentCases > 0) {
      alerts.add(recentCases + " discipline case(s) recorded in the last 14 days");
    }
    if (pendingAppeals > 0) {
      alerts.add(pendingAppeals + " appeal(s) waiting for a decision");
    }

    return new ChildSummary(
        student.getId(),
        student.getFirstName(),
        student.getLastName(),
        student.fullName(),
        student.getEmail(),
        student.getGender(),
        student.getStudentStatus(),
        schoolClass == null ? null : schoolClass.getId(),
        schoolClass == null ? null : schoolClass.getClassName(),
        link.getRelationship(),
        link.isPrimaryContact(),
        term == null ? null : termInfo(term, year),
        current == null ? null : current.term(),
        current == null ? null : current.percentage(),
        current == null ? null : current.position(),
        current == null ? null : current.classSize(),
        current == null || current.discipline() == null ? null : current.discipline().score(),
        DISCIPLINE_MAX,
        current == null || current.discipline() == null ? null : current.discipline().pass(),
        pendingAppeals,
        openConcerns,
        alerts);
  }

  // ---------------------------------------------------------------- academics

  private TermResult termResult(Person student, Term term, AcademicYear year) {
    String released = released(term);
    SchoolClass schoolClass = classOf(student, term);
    List<AcademicMark> termMarks = marks.findByTermId(term.getId());
    Map<UUID, List<AcademicMark>> byStudent =
        termMarks.stream()
            .filter(m -> m.getStudent() != null && m.getCourse() != null && isReleased(m, released))
            .collect(Collectors.groupingBy(m -> m.getStudent().getId()));
    List<AcademicMark> mine = byStudent.getOrDefault(student.getId(), List.of());

    Map<UUID, Course> courseMap = new LinkedHashMap<>();
    if (schoolClass != null) {
      schoolClass.getCourses().stream()
          .sorted(Comparator.comparing(Course::getCourseName, String.CASE_INSENSITIVE_ORDER))
          .forEach(c -> courseMap.put(c.getId(), c));
    }
    mine.forEach(m -> courseMap.putIfAbsent(m.getCourse().getId(), m.getCourse()));

    Map<UUID, String> teacherNames = teacherNames(schoolClass, term);
    List<CourseLine> lines = new ArrayList<>();
    double obtained = 0;
    double max = 0;
    int passed = 0;
    int failed = 0;
    for (Course course : courseMap.values()) {
      List<AcademicMark> courseMarks = mine.stream().filter(m -> course.getId().equals(m.getCourse().getId())).toList();
      AcademicMark cat = pick(courseMarks, "CAT");
      AcademicMark exam = pick(courseMarks, "EXAM");
      AcademicMark sitting = pick(courseMarks, "SECOND_SITTING");
      double courseObtained = 0;
      double courseMax = 0;
      for (AcademicMark mark : new AcademicMark[] {cat, exam}) {
        if (mark != null && mark.getMarks() != null) {
          courseObtained += mark.getMarks();
          courseMax += weight(mark);
        }
      }
      Double percent = courseMax > 0 ? round(courseObtained * 100 / courseMax) : null;
      double pass = course.getPassMark() == null ? 50 : course.getPassMark();
      String status = percent == null ? "PENDING" : percent >= pass ? "PASS" : "FAIL";
      if ("PASS".equals(status)) {
        passed++;
      } else if ("FAIL".equals(status)) {
        failed++;
      }
      obtained += courseObtained;
      max += courseMax;
      lines.add(
          new CourseLine(
              course.getId(),
              course.getCourseName(),
              course.getCourseCredits(),
              score(cat),
              score(exam),
              score(sitting),
              courseMax > 0 ? round(courseObtained) : null,
              courseMax > 0 ? round(courseMax) : null,
              percent,
              percent == null ? null : grade(percent),
              status,
              teacherNames.get(course.getId())));
    }
    Double percent = max > 0 ? round(obtained * 100 / max) : null;

    Integer position = null;
    Integer classSize = null;
    if (schoolClass != null) {
      List<UUID> classmates = classmates(schoolClass, term);
      classSize = classmates.size();
      if (percent != null) {
        double me = obtained * 100 / max;
        int ahead = 0;
        for (UUID other : classmates) {
          if (other.equals(student.getId())) {
            continue;
          }
          Double theirs = percentOf(byStudent.getOrDefault(other, List.of()));
          if (theirs != null && theirs > me + 1e-9) {
            ahead++;
          }
        }
        position = ahead + 1;
      }
    }

    return new TermResult(
        termInfo(term, year),
        schoolClass == null ? null : schoolClass.getClassName(),
        lines,
        max > 0 ? round(obtained) : null,
        max > 0 ? round(max) : null,
        percent,
        percent == null ? null : grade(percent),
        position,
        classSize,
        passed,
        failed,
        disciplineTerm(student.getId(), term, year));
  }

  private Double percentOf(List<AcademicMark> list) {
    double obtained = 0;
    double max = 0;
    for (AcademicMark mark : list) {
      if (mark.getMarks() == null || "SECOND_SITTING".equals(mark.getMarkType())) {
        continue;
      }
      obtained += mark.getMarks();
      max += weight(mark);
    }
    return max > 0 ? obtained * 100 / max : null;
  }

  private List<UUID> classmates(SchoolClass schoolClass, Term term) {
    List<UUID> ids =
        placements.findBySchoolClassIdAndTermId(schoolClass.getId(), term.getId()).stream()
            .map(p -> p.getStudent().getId())
            .distinct()
            .collect(Collectors.toCollection(ArrayList::new));
    if (ids.isEmpty()) {
      people.findByCurrentClassIdAndRoleName(schoolClass.getId(), "STUDENT").forEach(p -> ids.add(p.getId()));
    }
    return ids;
  }

  private Map<UUID, String> teacherNames(SchoolClass schoolClass, Term term) {
    Map<UUID, String> names = new HashMap<>();
    if (schoolClass == null) {
      return names;
    }
    for (TeacherAssignment assignment : assignments.findBySchoolClassId(schoolClass.getId())) {
      if (assignment.getCourse() == null || assignment.getTeacher() == null) {
        continue;
      }
      boolean sameTerm = assignment.getTerm() != null && assignment.getTerm().getId().equals(term.getId());
      if (sameTerm || !names.containsKey(assignment.getCourse().getId())) {
        names.put(assignment.getCourse().getId(), assignment.getTeacher().fullName());
      }
    }
    return names;
  }

  private static AcademicMark pick(List<AcademicMark> list, String type) {
    return list.stream().filter(m -> type.equalsIgnoreCase(m.getMarkType())).findFirst().orElse(null);
  }

  private static Score score(AcademicMark mark) {
    if (mark == null || mark.getMarks() == null) {
      return null;
    }
    double outOf = weight(mark);
    double percent = mark.getMarks() * 100 / outOf;
    double pass = mark.getPassMark() == null ? 50 : mark.getPassMark();
    return new Score(
        round(mark.getMarks()), round(outOf), round(percent), percent >= pass ? "PASS" : "FAIL", mark.getComment());
  }

  private static double weight(AcademicMark mark) {
    return mark.getWeight() == null || mark.getWeight() <= 0 ? 100 : mark.getWeight();
  }

  /** NONE hides everything, CAT releases only CAT, EXAM releases all mark types. */
  private static boolean isReleased(AcademicMark mark, String released) {
    return switch (released) {
      case "EXAM" -> true;
      case "CAT" -> "CAT".equalsIgnoreCase(mark.getMarkType());
      default -> false;
    };
  }

  private static String released(Term term) {
    String status = term.getTermMarksStatus();
    return status == null ? "NONE" : status.toUpperCase();
  }

  // ---------------------------------------------------------------- discipline

  private DisciplineTerm disciplineTerm(UUID studentId, Term term, AcademicYear year) {
    List<Deduction> list =
        activeDeductions(studentId).stream()
            .filter(d -> d.getTerm() != null && term.getId().equals(d.getTerm().getId()))
            .toList();
    double deducted = list.stream().mapToDouble(d -> d.getMarks() == null ? 0 : d.getMarks()).sum();
    double score = Math.max(0, DISCIPLINE_MAX - deducted);
    double percent = score * 100 / DISCIPLINE_MAX;
    return new DisciplineTerm(
        termInfo(term, year), DISCIPLINE_MAX, round(deducted), round(score), round(percent), percent >= passMark(year), list.size());
  }

  private List<Deduction> activeDeductions(UUID studentId) {
    return deductions.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
        .filter(d -> !"CANCELLED".equalsIgnoreCase(d.getDeductionStatus()))
        .toList();
  }

  private List<Deduction> visibleDeductions(UUID studentId) {
    return activeDeductions(studentId).stream()
        .filter(d -> d.getVisibility() == null || !"HIDDEN".equalsIgnoreCase(d.getVisibility()))
        .toList();
  }

  private DeductionView deductionView(Deduction d) {
    return new DeductionView(
        d.getId(),
        d.getCreatedAt(),
        d.getTerm() == null ? null : d.getTerm().getName(),
        d.getCasesCategories() == null ? null : d.getCasesCategories().getName(),
        d.getReason(),
        d.getMarks(),
        d.getDeductionStatus(),
        d.getStaffMember() == null ? null : d.getStaffMember().fullName());
  }

  private static double passMark(AcademicYear year) {
    return year == null || year.getDisciplineMarksPassMark() == null ? 50 : year.getDisciplineMarksPassMark();
  }

  // ---------------------------------------------------------------- appeals and contacts

  private AppealView appealView(Appeal appeal) {
    List<CommentView> comments =
        appealComments.findByAppealIdOrderByCreatedAtAsc(appeal.getId()).stream()
            .map(
                c ->
                    new CommentView(
                        c.getAuthor() == null ? null : c.getAuthor().fullName(),
                        c.getAuthor() == null ? null : c.getAuthor().getRoleName(),
                        c.getComment(),
                        c.getCreatedAt()))
            .toList();
    return new AppealView(
        appeal.getId(),
        appeal.getKind(),
        appeal.getCategory(),
        appeal.getStatus(),
        appeal.getMessage(),
        appeal.getCourse() == null ? null : appeal.getCourse().getCourseName(),
        appeal.getTeacher() == null ? null : appeal.getTeacher().fullName(),
        appeal.getTerm() == null ? null : appeal.getTerm().getName(),
        appeal.getCreatedAt(),
        comments);
  }

  private static Contact contact(Person person, String role, List<String> courses) {
    return new Contact(person.getId(), person.fullName(), person.getEmail(), person.getPhoneNumber(), role, courses);
  }

  // ---------------------------------------------------------------- calendar

  AcademicYear activeYear() {
    List<AcademicYear> all = years.findAllByOrderByStartYearDesc();
    return all.stream()
        .filter(y -> "ACTIVE".equalsIgnoreCase(y.getStatus()))
        .findFirst()
        .orElse(all.isEmpty() ? null : all.get(0));
  }

  private Term currentTerm(AcademicYear year) {
    if (year == null) {
      return null;
    }
    List<Term> yearTerms = terms.findByAcademicYearIdOrderByStartDateAsc(year.getId());
    LocalDate today = LocalDate.now();
    Term latestStarted = null;
    for (Term term : yearTerms) {
      boolean started = term.getStartDate() == null || !term.getStartDate().isAfter(today);
      boolean notEnded = term.getEndDate() == null || !term.getEndDate().isBefore(today);
      if (started && notEnded) {
        return term;
      }
      if (started) {
        latestStarted = term;
      }
    }
    if (latestStarted != null) {
      return latestStarted;
    }
    return yearTerms.isEmpty() ? null : yearTerms.get(0);
  }

  private List<Term> visibleTerms(AcademicYear year) {
    if (year == null) {
      return List.of();
    }
    LocalDate today = LocalDate.now();
    return terms.findByAcademicYearIdOrderByStartDateAsc(year.getId()).stream()
        .filter(t -> t.getStartDate() == null || !t.getStartDate().isAfter(today) || marks.countByTermId(t.getId()) > 0)
        .toList();
  }

  private TermInfo termInfo(Term term, AcademicYear year) {
    Term current = currentTerm(year != null ? year : term.getAcademicYear());
    return new TermInfo(
        term.getId(),
        term.getName(),
        term.getStartDate(),
        term.getEndDate(),
        released(term),
        current != null && current.getId().equals(term.getId()));
  }

  private SchoolClass classOf(Person student, Term term) {
    if (term != null) {
      for (StudentClassTerm placement : placements.findByStudentId(student.getId())) {
        if (placement.getTerm() != null && placement.getTerm().getId().equals(term.getId())) {
          return placement.getSchoolClass();
        }
      }
    }
    return student.getCurrentClass();
  }

  // ---------------------------------------------------------------- grading

  static String grade(double percent) {
    if (percent >= 70) return "A";
    if (percent >= 65) return "B";
    if (percent >= 60) return "C";
    if (percent >= 55) return "D";
    if (percent >= 50) return "E";
    return "F";
  }

  static String decision(double percent) {
    if (percent >= 60) return "PROMOTED";
    if (percent >= 50) return "SITTING";
    return "REPEATING";
  }

  private static String readable(String termName) {
    if (termName == null) {
      return "";
    }
    StringBuilder out = new StringBuilder();
    for (String word : termName.toLowerCase().split("_")) {
      if (!word.isEmpty()) {
        out.append(out.length() == 0 ? "" : " ").append(Character.toUpperCase(word.charAt(0))).append(word.substring(1));
      }
    }
    return out.toString();
  }

  private static double round(double value) {
    return Math.round(value * 100.0) / 100.0;
  }
}
