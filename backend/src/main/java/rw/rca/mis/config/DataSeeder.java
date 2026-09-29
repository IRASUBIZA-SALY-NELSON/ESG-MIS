package rw.rca.mis.config;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import rw.rca.mis.domain.AcademicMark;
import rw.rca.mis.domain.AcademicYear;
import rw.rca.mis.domain.Appeal;
import rw.rca.mis.domain.AppealComment;
import rw.rca.mis.domain.Candidate;
import rw.rca.mis.domain.CaseCategory;
import rw.rca.mis.domain.Course;
import rw.rca.mis.domain.Deduction;
import rw.rca.mis.domain.NewsItem;
import rw.rca.mis.domain.ParentConcern;
import rw.rca.mis.domain.ParentLink;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.Position;
import rw.rca.mis.domain.SchoolClass;
import rw.rca.mis.domain.StudentClassTerm;
import rw.rca.mis.domain.TeacherAssignment;
import rw.rca.mis.domain.Term;
import rw.rca.mis.domain.Vote;
import rw.rca.mis.domain.VotingSession;
import rw.rca.mis.repo.AcademicMarkRepository;
import rw.rca.mis.repo.AcademicYearRepository;
import rw.rca.mis.repo.AppealCommentRepository;
import rw.rca.mis.repo.AppealRepository;
import rw.rca.mis.repo.CandidateRepository;
import rw.rca.mis.repo.CaseCategoryRepository;
import rw.rca.mis.repo.CourseRepository;
import rw.rca.mis.repo.DeductionRepository;
import rw.rca.mis.repo.NewsRepository;
import rw.rca.mis.repo.ParentConcernRepository;
import rw.rca.mis.repo.ParentLinkRepository;
import rw.rca.mis.repo.PersonRepository;
import rw.rca.mis.repo.PositionRepository;
import rw.rca.mis.repo.SchoolClassRepository;
import rw.rca.mis.repo.StudentClassTermRepository;
import rw.rca.mis.repo.TeacherAssignmentRepository;
import rw.rca.mis.repo.TermRepository;
import rw.rca.mis.repo.VoteRepository;
import rw.rca.mis.repo.VotingSessionRepository;
import rw.rca.mis.service.ParentAdminService;

/**
 * Builds the demo school Ecole des Sciences de Gisenyi on an empty database: staff, six classes, about
 * 100 students with a full year of results, discipline cases, appeals, parents and their concerns, news and
 * an election. Runs only when the admin account does not exist yet. The random generator is seeded, so every
 * fresh database gets the same data.
 */
@Component
@Profile("!test")
@Order(10)
public class DataSeeder implements CommandLineRunner {
  public static final String PASSWORD = "Esg@2026";
  public static final String DOMAIN = "@esg.test";
  public static final String ADMIN_EMAIL = "admin" + DOMAIN;
  public static final String TEACHER_EMAIL = "teacher" + DOMAIN;
  public static final String STUDENT_EMAIL = "student" + DOMAIN;
  public static final String PARENT_EMAIL = "parent" + DOMAIN;
  public static final String DS_EMAIL = "ds" + DOMAIN;
  private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

  private static final String[] BOYS = {
    "Eric", "Olivier", "Kevin", "Yves", "Fabrice", "Emmanuel", "Innocent", "Claude", "Didier", "Aimable",
    "Gilbert", "Alain", "Moise", "David", "Samuel", "Christian", "Brian", "Cedric", "Prince", "Elvis",
    "Thierry", "Herve", "Jean Paul", "Bosco", "Arsene", "Serge", "Gad", "Blaise"
  };
  private static final String[] GIRLS = {
    "Diane", "Aline", "Grace", "Josiane", "Clarisse", "Divine", "Ange", "Sandrine", "Chantal", "Nadine",
    "Ornella", "Belise", "Gisele", "Liliane", "Esther", "Joella", "Kellia", "Aurore", "Deborah", "Vanessa",
    "Ariane", "Honorine", "Solange", "Marie Claire", "Pacifique", "Tresor", "Umuhoza", "Linda"
  };
  private static final String[] SURNAMES = {
    "Niyonsenga", "Mugisha", "Iradukunda", "Ishimwe", "Uwimana", "Nsengiyumva", "Hakizimana", "Bizimana",
    "Nshimiyimana", "Mutoni", "Ingabire", "Umutoni", "Uwera", "Munyaneza", "Twizerimana", "Niyomugabo",
    "Kayitesi", "Uwamahoro", "Byiringiro", "Irakoze", "Manzi", "Gatete", "Kamanzi", "Rukundo", "Gasana",
    "Ntwari", "Mbabazi", "Murenzi", "Nkurunziza", "Tuyishime", "Shema", "Habimana", "Mukamana", "Ndayisaba",
    "Uwase", "Nyiraneza", "Sibomana", "Dusabimana", "Habiyaremye", "Mukeshimana"
  };

  private static final String[] O_LEVEL = {
    "Mathematics", "Physics", "Chemistry", "Biology", "English", "Kinyarwanda", "Entrepreneurship", "Computer Science"
  };

  /** Class name, code, size, combination subjects (empty for O-level). */
  private static final Object[][] CLASSES = {
    {"S1 A", "S1A", 17, new String[] {}},
    {"S2 A", "S2A", 17, new String[] {}},
    {"S3 A", "S3A", 17, new String[] {}},
    {"S4 PCM", "S4PCM", 17, new String[] {"Mathematics", "Physics", "Chemistry"}},
    {"S5 PCB", "S5PCB", 16, new String[] {"Physics", "Chemistry", "Biology"}},
    {"S6 MCB", "S6MCB", 16, new String[] {"Mathematics", "Chemistry", "Biology"}},
  };

  /** Subject, teacher first name, last name, email, gender. */
  private static final String[][] TEACHERS = {
    {"Mathematics", "Theo", "Niyonzima", TEACHER_EMAIL, "MALE"},
    {"Physics", "Claudine", "Mukeshimana", "claudine.physics" + DOMAIN, "FEMALE"},
    {"Chemistry", "Samuel", "Hakizimana", "samuel.chemistry" + DOMAIN, "MALE"},
    {"Biology", "Aimee", "Uwimana", "aimee.biology" + DOMAIN, "FEMALE"},
    {"English", "Jean de Dieu", "Nshimiyimana", "jdd.english" + DOMAIN, "MALE"},
    {"Kinyarwanda", "Beata", "Mukandayisenga", "beata.kinyarwanda" + DOMAIN, "FEMALE"},
    {"Entrepreneurship", "Emmanuel", "Twagirayezu", "emmanuel.entrepreneurship" + DOMAIN, "MALE"},
    {"Computer Science", "Josiane", "Ingabire", "josiane.ict" + DOMAIN, "FEMALE"},
    {"General Studies", "Fabrice", "Mugisha", "fabrice.gs" + DOMAIN, "MALE"},
  };

  /** Name, description, marks deducted, sample reasons. */
  private static final Object[][] CASES = {
    {"Late coming", "Arrived after the morning assembly", 3.0,
      new String[] {"Arrived 20 minutes after assembly", "Late for the first lesson", "Came back late from the weekend"}},
    {"Absence without permission", "Missed classes without a written permission", 10.0,
      new String[] {"Missed the afternoon classes", "Absent on Friday without permission", "Skipped evening preparation"}},
    {"Uniform", "Not wearing the full school uniform", 2.0,
      new String[] {"No school tie", "Wrong shoes", "Civilian sweater in class"}},
    {"Phone in class", "Using a phone during lessons or preparation", 8.0,
      new String[] {"Phone confiscated during Physics", "Using a phone in the dormitory after lights out"}},
    {"Disrespect", "Rude behaviour towards staff or students", 10.0,
      new String[] {"Answered back to the teacher on duty", "Insulted a classmate"}},
    {"Fighting", "Physical fight with another student", 20.0,
      new String[] {"Fight in the refectory", "Fight on the football pitch"}},
    {"Exam malpractice", "Cheating during a test or exam", 15.0,
      new String[] {"Found with notes during the Chemistry CAT", "Copying during the Mathematics test"}},
    {"Leaving school without permission", "Out of the school compound without a pass", 15.0,
      new String[] {"Went to Gisenyi town without a pass", "Left through the back gate after supper"}},
  };

  private final PersonRepository people;
  private final PasswordEncoder encoder;
  private final AcademicYearRepository years;
  private final TermRepository terms;
  private final SchoolClassRepository classes;
  private final CourseRepository courses;
  private final AcademicMarkRepository marks;
  private final StudentClassTermRepository placements;
  private final TeacherAssignmentRepository assignments;
  private final CaseCategoryRepository categories;
  private final DeductionRepository deductions;
  private final AppealRepository appeals;
  private final AppealCommentRepository appealComments;
  private final ParentLinkRepository links;
  private final ParentConcernRepository concerns;
  private final NewsRepository news;
  private final PositionRepository positions;
  private final CandidateRepository candidates;
  private final VotingSessionRepository sessions;
  private final VoteRepository votes;
  private final JdbcTemplate jdbc;

  private final Random random = new Random(2026);
  private final Set<String> usedEmails = new HashSet<>();
  private final List<Object[]> backdates = new ArrayList<>();
  private String hash;

  public DataSeeder(
      PersonRepository people,
      PasswordEncoder encoder,
      AcademicYearRepository years,
      TermRepository terms,
      SchoolClassRepository classes,
      CourseRepository courses,
      AcademicMarkRepository marks,
      StudentClassTermRepository placements,
      TeacherAssignmentRepository assignments,
      CaseCategoryRepository categories,
      DeductionRepository deductions,
      AppealRepository appeals,
      AppealCommentRepository appealComments,
      ParentLinkRepository links,
      ParentConcernRepository concerns,
      NewsRepository news,
      PositionRepository positions,
      CandidateRepository candidates,
      VotingSessionRepository sessions,
      VoteRepository votes,
      JdbcTemplate jdbc) {
    this.people = people;
    this.encoder = encoder;
    this.years = years;
    this.terms = terms;
    this.classes = classes;
    this.courses = courses;
    this.marks = marks;
    this.placements = placements;
    this.assignments = assignments;
    this.categories = categories;
    this.deductions = deductions;
    this.appeals = appeals;
    this.appealComments = appealComments;
    this.links = links;
    this.concerns = concerns;
    this.news = news;
    this.positions = positions;
    this.candidates = candidates;
    this.sessions = sessions;
    this.votes = votes;
    this.jdbc = jdbc;
  }

  @Override
  @Transactional
  public void run(String... args) {
    if (people.findByEmailIgnoreCase(ADMIN_EMAIL).isPresent()) {
      return;
    }
    hash = encoder.encode(PASSWORD);

    AcademicYear year = new AcademicYear();
    year.setName("2025-2026");
    year.setStartYear(2025);
    year.setEndYear(2026);
    year.setStatus("ACTIVE");
    year.setDisciplineMarksPassMark(50.0);
    year = years.save(year);
    List<Term> yearTerms =
        List.of(
            term("FIRST_TERM", year, LocalDate.of(2025, 9, 8), LocalDate.of(2025, 12, 12)),
            term("SECOND_TERM", year, LocalDate.of(2026, 1, 5), LocalDate.of(2026, 4, 3)),
            term("THIRD_TERM", year, LocalDate.of(2026, 4, 20), LocalDate.of(2026, 7, 10)));

    Map<String, Course> subjects = new LinkedHashMap<>();
    for (String name : List.of(
        "Mathematics", "Physics", "Chemistry", "Biology", "English", "Kinyarwanda", "Entrepreneurship",
        "Computer Science", "General Studies")) {
      boolean principal = List.of("Mathematics", "Physics", "Chemistry", "Biology").contains(name);
      subjects.put(name, course(name, principal ? "100" : "60", principal ? "5" : "3", year));
    }

    Person admin = staff("Aline", "Uwamahoro", ADMIN_EMAIL, "ADMIN", "FEMALE", "0788100100");
    staff("Innocent", "Kalisa", "pm" + DOMAIN, "PM", "MALE", "0788100200");
    staff("Claudine", "Ingabire", "dos" + DOMAIN, "DOS", "FEMALE", "0788100500");
    Person ds = staff("Didier", "Habyarimana", DS_EMAIL, "DS", "MALE", "0788100300");
    staff("Alice", "Mutoni", "accountant" + DOMAIN, "ACCOUNTANT", "FEMALE", "0788100400");

    Map<String, Person> teacherBySubject = new HashMap<>();
    List<Person> teachers = new ArrayList<>();
    for (String[] t : TEACHERS) {
      Person teacher = staff(t[1], t[2], t[3], "TEACHER", t[4], phone());
      teacherBySubject.put(t[0], teacher);
      teachers.add(teacher);
    }

    List<SchoolClass> schoolClasses = new ArrayList<>();
    Map<SchoolClass, List<Person>> roster = new LinkedHashMap<>();
    List<Person> allStudents = new ArrayList<>();
    String[] classTeachers = {"Mathematics", "Biology", "English", "Physics", "Chemistry", "Entrepreneurship"};
    for (int c = 0; c < CLASSES.length; c++) {
      Object[] row = CLASSES[c];
      SchoolClass schoolClass = new SchoolClass();
      schoolClass.setClassName((String) row[0]);
      schoolClass.setCode((String) row[1]);
      String[] combination = (String[]) row[3];
      List<String> names = combination.length == 0 ? List.of(O_LEVEL) : new ArrayList<>(List.of(combination));
      if (combination.length > 0) {
        names.addAll(List.of("English", "Entrepreneurship", "General Studies"));
      }
      for (String name : names) {
        schoolClass.getCourses().add(subjects.get(name));
      }
      schoolClass.setClassTeacher(teacherBySubject.get(classTeachers[c]));
      schoolClass.setStudentsNumber((Integer) row[2]);
      schoolClass.setStudentsRemaining((Integer) row[2]);
      schoolClass = classes.save(schoolClass);
      schoolClasses.add(schoolClass);

      List<Person> members = new ArrayList<>();
      int size = (Integer) row[2];
      for (int i = 0; i < size; i++) {
        Person student;
        if (c == 0 && i == 0) {
          student = student("Keza", "Uwase", STUDENT_EMAIL, "FEMALE", schoolClass);
        } else if (c == 3 && i == 0) {
          student = student("Jean", "Ndayisaba", "jean" + DOMAIN, "MALE", schoolClass);
        } else {
          boolean girl = random.nextBoolean();
          String first = pick(girl ? GIRLS : BOYS);
          String last = pick(SURNAMES);
          student = student(first, last, null, girl ? "FEMALE" : "MALE", schoolClass);
        }
        members.add(student);
      }
      roster.put(schoolClass, members);
      allStudents.addAll(members);
    }

    for (SchoolClass schoolClass : schoolClasses) {
      for (Term term : yearTerms) {
        for (Course course : schoolClass.getCourses()) {
          TeacherAssignment assignment = new TeacherAssignment();
          assignment.setTeacher(teacherBySubject.get(course.getCourseName()));
          assignment.setSchoolClass(schoolClass);
          assignment.setCourse(course);
          assignment.setTerm(term);
          assignment.setAcademicYear(year);
          assignments.save(assignment);
        }
        List<StudentClassTerm> rows = new ArrayList<>();
        for (Person student : roster.get(schoolClass)) {
          StudentClassTerm placement = new StudentClassTerm();
          placement.setStudent(student);
          placement.setSchoolClass(schoolClass);
          placement.setTerm(term);
          placement.setAcademicYear(year);
          rows.add(placement);
        }
        placements.saveAll(rows);
      }
    }

    seedMarks(roster, yearTerms);
    List<Deduction> cases = seedDiscipline(allStudents, yearTerms, year, ds, teachers);
    seedAppeals(allStudents, yearTerms, year, teacherBySubject, ds, cases);
    seedParents(allStudents, admin, ds, teacherBySubject);
    seedNews();
    seedElection(year, roster);

    for (Object[] b : backdates) {
      jdbc.update("UPDATE " + b[0] + " SET created_at = ? WHERE id = ?", Timestamp.from((Instant) b[2]), b[1]);
    }
    log.info(
        "Seeded Ecole des Sciences de Gisenyi: {} students in {} classes, {} teachers. Password for every account is {}",
        allStudents.size(), schoolClasses.size(), teachers.size(), PASSWORD);
  }

  // ------------------------------------------------------------------ marks

  private void seedMarks(Map<SchoolClass, List<Person>> roster, List<Term> yearTerms) {
    for (Map.Entry<SchoolClass, List<Person>> entry : roster.entrySet()) {
      for (Person student : entry.getValue()) {
        double ability = clamp(gaussian(63, 13), 28, 96);
        if (STUDENT_EMAIL.equals(student.getEmail())) ability = 66;
        double trend = gaussian(0, 3);
        Map<Course, Double> aptitude = new HashMap<>();
        for (Course course : entry.getKey().getCourses()) {
          aptitude.put(course, gaussian(0, 9));
        }
        List<AcademicMark> rows = new ArrayList<>();
        for (int t = 0; t < yearTerms.size(); t++) {
          Term term = yearTerms.get(t);
          for (Course course : entry.getKey().getCourses()) {
            double level = ability + aptitude.get(course) + trend * t;
            double cat = clamp(Math.round(40 * clamp(level + gaussian(2, 7), 8, 100) / 100.0), 3, 40);
            double exam = clamp(Math.round(60 * clamp(level + gaussian(-2, 8), 5, 100) / 100.0), 4, 60);
            rows.add(mark(student, course, term, "CAT", cat, 40));
            rows.add(mark(student, course, term, "EXAM", exam, 60));
          }
        }
        marks.saveAll(rows);
      }
    }
  }

  // ------------------------------------------------------------------ discipline

  private List<Deduction> seedDiscipline(
      List<Person> students, List<Term> yearTerms, AcademicYear year, Person ds, List<Person> teachers) {
    List<CaseCategory> cats = new ArrayList<>();
    for (Object[] row : CASES) {
      CaseCategory category = new CaseCategory();
      category.setName((String) row[0]);
      category.setDescription((String) row[1]);
      category.setMarks((Double) row[2]);
      cats.add(categories.save(category));
    }
    int[] weights = {30, 10, 22, 12, 8, 3, 5, 5};
    List<Deduction> saved = new ArrayList<>();
    for (Person student : students) {
      double risk = random.nextDouble();
      int count = risk < 0.35 ? 0 : risk < 0.75 ? 1 + random.nextInt(2) : risk < 0.94 ? 2 + random.nextInt(3) : 5 + random.nextInt(4);
      if (STUDENT_EMAIL.equals(student.getEmail())) count = 2;
      for (int i = 0; i < count; i++) {
        int idx = weighted(weights);
        CaseCategory category = cats.get(idx);
        String[] reasons = (String[]) CASES[idx][3];
        Term term = yearTerms.get(random.nextInt(yearTerms.size()));
        Deduction deduction = new Deduction();
        deduction.setStudent(student);
        deduction.setStaffMember(random.nextInt(4) == 0 ? teachers.get(random.nextInt(teachers.size())) : ds);
        deduction.setCasesCategories(category);
        deduction.setTerm(term);
        deduction.setAcademicYear(year);
        deduction.setMyClazz(student.getCurrentClass());
        deduction.setMarks(category.getMarks());
        deduction.setReason(reasons[random.nextInt(reasons.length)]);
        if (random.nextInt(25) == 0) deduction.setDeductionStatus("CANCELLED");
        deduction = deductions.save(deduction);
        saved.add(deduction);
        backdate("deductions", deduction.getId(), within(term));
      }
    }
    return saved;
  }

  // ------------------------------------------------------------------ appeals

  private void seedAppeals(
      List<Person> students, List<Term> yearTerms, AcademicYear year, Map<String, Person> teacherBySubject,
      Person ds, List<Deduction> cases) {
    String[] academicMessages = {
      "I believe question %d of the %s exam was not marked.",
      "My %s CAT marks are missing from the system although I sat for the test.",
      "The total on my %s script is different from what is recorded.",
      "I was sick during the %s exam and have a medical note. Can I resit?",
      "Question %d in %s was marked wrong but my answer matches the marking guide."
    };
    String[] statuses = {"PENDING", "PENDING", "REVIEWING", "APPROVED", "APPROVED", "REJECTED"};
    String[] replies = {
      "Received. I will re-check the script this week.",
      "I have checked the script: the marks were added correctly.",
      "You are right, the marks have been corrected.",
      "Please bring your script to the staff room on Monday.",
    };
    Person keza = students.get(0);
    List<Person> appellants = new ArrayList<>(students);
    java.util.Collections.shuffle(appellants, random);
    appellants.remove(keza);
    appellants.add(0, keza);
    for (int i = 0; i < 34; i++) {
      Person student = appellants.get(i);
      List<Course> list = new ArrayList<>(student.getCurrentClass().getCourses());
      Course course =
          i == 0
              ? list.stream().filter(c -> c.getCourseName().equals("Entrepreneurship")).findFirst().orElse(list.get(0))
              : list.get(random.nextInt(list.size()));
      Term term = i == 0 ? yearTerms.get(2) : yearTerms.get(random.nextInt(yearTerms.size()));
      Person teacher = teacherBySubject.get(course.getCourseName());
      Appeal appeal = new Appeal();
      appeal.setKind("ACADEMIC");
      appeal.setCategory(random.nextBoolean() ? "EXAM" : "CAT");
      appeal.setStatus(i == 0 ? "PENDING" : statuses[random.nextInt(statuses.length)]);
      String template = academicMessages[i == 0 ? 0 : random.nextInt(academicMessages.length)];
      appeal.setMessage(template.contains("%d")
          ? String.format(template, 2 + random.nextInt(8), course.getCourseName())
          : String.format(template, course.getCourseName()));
      appeal.setStudent(student);
      appeal.setTeacher(teacher);
      appeal.setCourse(course);
      appeal.setTerm(term);
      appeal.setAcademicYear(year);
      appeal = appeals.save(appeal);
      Instant created = within(term);
      backdate("appeals", appeal.getId(), created);
      if (!"PENDING".equals(appeal.getStatus()) || i == 0) {
        AppealComment comment = new AppealComment();
        comment.setAppeal(appeal);
        comment.setAuthor(teacher);
        comment.setComment(
            "APPROVED".equals(appeal.getStatus()) ? replies[2]
                : "REJECTED".equals(appeal.getStatus()) ? replies[1]
                : replies[random.nextBoolean() ? 0 : 3]);
        comment = appealComments.save(comment);
        backdate("appeal_comments", comment.getId(), created.plusSeconds(86400L * (1 + random.nextInt(4))));
      }
    }

    String[] dsMessages = {
      "I was late because the bus from Musanze broke down. My parent can confirm.",
      "I had permission from the class teacher to leave early.",
      "The phone was not mine, I was keeping it for a friend.",
      "I was wearing a sweater because I was sick with flu.",
      "I did not start the fight, I was defending myself."
    };
    int made = 0;
    for (Deduction deduction : cases) {
      if (made >= 16 || random.nextInt(4) != 0) continue;
      Appeal appeal = new Appeal();
      appeal.setKind("DS");
      appeal.setCategory("DISCIPLINE");
      appeal.setStatus(statuses[random.nextInt(statuses.length)]);
      appeal.setMessage(dsMessages[random.nextInt(dsMessages.length)] + " (" + deduction.getCasesCategories().getName() + ")");
      appeal.setStudent(deduction.getStudent());
      appeal.setTeacher(ds);
      appeal.setTerm(deduction.getTerm());
      appeal.setAcademicYear(year);
      appeal = appeals.save(appeal);
      backdate("appeals", appeal.getId(), within(deduction.getTerm()));
      made++;
    }
  }

  // ------------------------------------------------------------------ parents

  private void seedParents(List<Person> students, Person admin, Person ds, Map<String, Person> teacherBySubject) {
    String[] fathers = {"Jean Bosco", "Emmanuel", "Theoneste", "Faustin", "Celestin", "Alphonse", "Jean Claude", "Vianney", "Augustin", "Pierre"};
    String[] mothers = {"Grace", "Vestine", "Josephine", "Speciose", "Immaculee", "Donatha", "Claudine", "Esperance", "Agnes", "Marie Rose"};
    List<Person> parents = new ArrayList<>();

    Person grace = parent("Grace", "Uwase", PARENT_EMAIL, "FEMALE");
    parents.add(grace);
    Person keza = students.get(0);
    link(grace, keza, "MOTHER", true);
    Set<String> taken = students.stream().map(Person::getEmail).collect(java.util.stream.Collectors.toSet());
    Person sibling = students.stream()
        .filter(s -> s.getCurrentClass().getCode().equals("S4PCM") && !s.getEmail().startsWith("jean@"))
        .filter(s -> !taken.contains(s.getFirstName().toLowerCase() + ".uwase" + DOMAIN))
        .findFirst().orElse(null);
    if (sibling != null) {
      sibling.setLastName("Uwase");
      sibling.setEmail(sibling.getFirstName().toLowerCase() + ".uwase" + DOMAIN);
      people.save(sibling);
      link(grace, sibling, "MOTHER", true);
    }

    for (int i = 1; i < students.size(); i++) {
      Person student = students.get(i);
      if (!links.findByStudentId(student.getId()).isEmpty()) continue;
      boolean mother = random.nextInt(3) != 0;
      Person parent = parent(pick(mother ? mothers : fathers), student.getLastName(), null, mother ? "FEMALE" : "MALE");
      parents.add(parent);
      link(parent, student, mother ? "MOTHER" : "FATHER", true);
      if (random.nextInt(5) == 0 && i + 7 < students.size()) {
        Person other = students.get(i + 7);
        if (links.findByStudentId(other.getId()).isEmpty()) {
          other.setLastName(student.getLastName());
          people.save(other);
          link(parent, other, mother ? "MOTHER" : "FATHER", true);
        }
      }
      if (random.nextInt(8) == 0) {
        Person guardian = parent(pick(fathers), pick(SURNAMES), null, "MALE");
        link(guardian, student, "GUARDIAN", false);
      }
    }

    Object[][] topics = {
      {"ACADEMIC", "Mathematics results", "My child's Mathematics marks dropped this term. What can we do at home to help?",
        "Thank you for reaching out. We run remedial classes on Wednesday afternoons; your child is welcome to join."},
      {"ACADEMIC", "Extra lessons", "Is there any holiday programme for students preparing for national exams?",
        "Yes, a two-week revision camp starts on the first Monday of the holiday. Details will be shared by SMS."},
      {"DISCIPLINE", "Discipline case", "I would like to understand the discipline case recorded last week.",
        "The student left the compound without a pass. We would like to meet you on Friday at 10:00."},
      {"FEES", "School fees balance", "I paid the second instalment by bank. Please confirm it was received.",
        "Confirmed. The accountant has updated your balance; the receipt is available at the bursar's office."},
      {"HEALTH", "Medical follow-up", "My daughter has asthma. Please make sure the dormitory matron knows.",
        "The school nurse and matron have been informed and her inhaler is kept at the infirmary."},
      {"OTHER", "Visiting day", "When is the next visiting day for parents?",
        "Visiting day is the last Sunday of the month from 10:00 to 15:00."},
      {"ACADEMIC", "Report card", "I cannot find the third term report card on the parent portal.",
        null},
      {"OTHER", "Transport at end of term", "Will the school organise buses to Kigali at the end of term?",
        null},
    };
    Person mathTeacher = teacherBySubject.get("Mathematics");
    for (int i = 0; i < 28; i++) {
      Person parent = i < 3 ? grace : parents.get(1 + random.nextInt(parents.size() - 1));
      List<ParentLink> children = links.findByParentId(parent.getId());
      if (children.isEmpty()) continue;
      Object[] topic = topics[i < 3 ? i : random.nextInt(topics.length)];
      ParentConcern concern = new ParentConcern();
      concern.setParent(parent);
      concern.setStudent(children.get(random.nextInt(children.size())).getStudent());
      concern.setCategory((String) topic[0]);
      concern.setSubject((String) topic[1]);
      concern.setMessage((String) topic[2]);
      Instant created = Instant.now().minusSeconds(86400L * (1 + random.nextInt(90)));
      String answer = (String) topic[3];
      if (answer != null && (i == 0 || random.nextInt(4) != 0)) {
        concern.setStatus(random.nextInt(4) == 0 ? "CLOSED" : "ANSWERED");
        concern.setResponse(answer);
        concern.setRespondedBy("DISCIPLINE".equals(topic[0]) ? ds : "ACADEMIC".equals(topic[0]) ? mathTeacher : admin);
        concern.setRespondedAt(created.plusSeconds(86400L * (1 + random.nextInt(3))));
      } else {
        concern.setStatus("OPEN");
      }
      concern = concerns.save(concern);
      backdate("parent_concerns", concern.getId(), created);
    }
  }

  // ------------------------------------------------------------------ news and elections

  private void seedNews() {
    String[][] items = {
      {"Welcome to the ESG management system", "Parents, students and staff of Ecole des Sciences de Gisenyi can now follow results, discipline, library and course notes online.", "60"},
      {"Science fair 2026", "S4 to S6 students presented 24 projects. The S5 PCB water-filtration project won first prize and will represent the school at district level.", "45"},
      {"Third term results published", "Third term report cards are available on the student and parent portals.", "20"},
      {"Inter-school football tournament", "Our team reached the semi-finals of the Rubavu district tournament. Congratulations to the players and coaches!", "14"},
      {"New books in the library", "Thirty new science and literature titles are available. Ask the librarian for the new arrivals list.", "8"},
      {"Parents' meeting", "The general parents' meeting will take place on the last Saturday of the month at 09:00 in the main hall.", "3"},
    };
    for (String[] row : items) {
      NewsItem item = new NewsItem();
      item.setTitle(row[0]);
      item.setBody(row[1]);
      item = news.save(item);
      backdate("news_items", item.getId(), Instant.now().minusSeconds(86400L * Long.parseLong(row[2])));
    }
  }

  private void seedElection(AcademicYear year, Map<SchoolClass, List<Person>> roster) {
    List<Person> seniors = new ArrayList<>();
    roster.forEach((c, list) -> { if (c.getCode().startsWith("S5") || c.getCode().startsWith("S6")) seniors.addAll(list); });
    List<Person> everyone = new ArrayList<>();
    roster.values().forEach(everyone::addAll);
    VotingSession session = new VotingSession();
    session.setTitle("Student leadership elections 2026");
    session.setStartDate(LocalDate.now().minusDays(2));
    session.setEndDate(LocalDate.now().plusDays(5));
    Map<Position, List<Candidate>> ballot = new LinkedHashMap<>();
    int cursor = 0;
    for (String name : List.of("Head Boy", "Head Girl", "Sports Captain", "Health Prefect", "Entertainment Prefect")) {
      Position position = new Position();
      position.setName(name);
      position.setAcademicYear(year);
      position = positions.save(position);
      session.getPositions().add(position);
      List<Candidate> list = new ArrayList<>();
      String gender = name.equals("Head Boy") ? "MALE" : name.equals("Head Girl") ? "FEMALE" : null;
      int added = 0;
      for (int i = 0; i < seniors.size() && added < 3; i++) {
        Person s = seniors.get((cursor + i) % seniors.size());
        if (gender != null && !gender.equals(s.getGender())) continue;
        Candidate candidate = new Candidate();
        candidate.setStudent(s);
        candidate.setPosition(position);
        list.add(candidates.save(candidate));
        added++;
        cursor = (cursor + i + 1) % seniors.size();
      }
      ballot.put(position, list);
    }
    session = sessions.save(session);
    for (Person voter : everyone) {
      if (random.nextInt(10) < 3) continue;
      for (Map.Entry<Position, List<Candidate>> e : ballot.entrySet()) {
        if (e.getValue().isEmpty()) continue;
        Vote vote = new Vote();
        vote.setVoter(voter);
        vote.setPosition(e.getKey());
        vote.setCandidate(e.getValue().get(weighted(new int[] {5, 3, 2}) % e.getValue().size()));
        vote.setSession(session);
        votes.save(vote);
      }
    }
  }

  // ------------------------------------------------------------------ builders

  private Term term(String name, AcademicYear year, LocalDate start, LocalDate end) {
    Term term = new Term();
    term.setName(name);
    term.setAcademicYear(year);
    term.setStartDate(start);
    term.setEndDate(end);
    term.setTermMarksStatus("EXAM");
    return terms.save(term);
  }

  private Course course(String name, String weight, String credits, AcademicYear year) {
    Course course = new Course();
    course.setCourseName(name);
    course.setCourseWeight(weight);
    course.setCourseCredits(credits);
    course.setPassMark(50.0);
    course.setAcademicYear(year);
    return courses.save(course);
  }

  private Person staff(String first, String last, String email, String role, String gender, String phone) {
    Person person = base(first, last, email, role, gender);
    person.setStaffKind(role);
    person.setStudentStatus(null);
    person.setPhoneNumber(phone);
    return people.save(person);
  }

  private Person student(String first, String last, String email, String gender, SchoolClass schoolClass) {
    Person person = base(first, last, email == null ? email(first, last) : email, "STUDENT", gender);
    person.setStaffKind("STUDENT");
    person.setStudentStatus("ACTIVE");
    person.setCurrentClass(schoolClass);
    person.setPhoneNumber(phone());
    return people.save(person);
  }

  private Person parent(String first, String last, String email, String gender) {
    Person person = base(first, last, email == null ? email(first, last) : email, ParentAdminService.ROLE, gender);
    person.setStudentStatus(null);
    person.setPhoneNumber(phone());
    return people.save(person);
  }

  private Person base(String first, String last, String email, String role, String gender) {
    usedEmails.add(email.toLowerCase(Locale.ROOT));
    Person person = new Person();
    person.setFirstName(first);
    person.setLastName(last);
    person.setEmail(email);
    person.setUsername(email);
    person.setPassword(hash);
    person.setRoleName(role);
    person.setGender(gender);
    person.setStatus("ACTIVE");
    person.setNationalId("11" + (1970 + random.nextInt(40)) + String.format("%012d", Math.abs(random.nextLong()) % 1_000_000_000_000L));
    return person;
  }

  private String email(String first, String last) {
    String stem = (first.split(" ")[0] + "." + last).toLowerCase(Locale.ROOT).replaceAll("[^a-z.]", "");
    String candidate = stem + DOMAIN;
    for (int n = 2; usedEmails.contains(candidate); n++) candidate = stem + n + DOMAIN;
    return candidate;
  }

  private String phone() {
    String[] prefixes = {"078", "079", "072", "073"};
    return pick(prefixes) + String.format("%07d", random.nextInt(10_000_000));
  }

  private void link(Person parent, Person student, String relationship, boolean primary) {
    String token =
        links.findByParentId(parent.getId()).stream()
            .map(ParentLink::getReportCardToken)
            .filter(t -> t != null && !t.isBlank())
            .findFirst()
            .orElseGet(ParentAdminService::newToken);
    ParentLink link = new ParentLink();
    link.setParent(parent);
    link.setStudent(student);
    link.setRelationship(relationship);
    link.setPrimaryContact(primary);
    link.setReportCardToken(token);
    links.save(link);
  }

  private AcademicMark mark(Person student, Course course, Term term, String type, double score, double weight) {
    AcademicMark mark = new AcademicMark();
    mark.setStudent(student);
    mark.setCourse(course);
    mark.setTerm(term);
    mark.setMarkType(type);
    mark.setMarks(score);
    mark.setWeight(weight);
    mark.setPassMark(50.0);
    mark.setLockStatus("LOCKED");
    mark.refreshStatus();
    return mark;
  }

  private void backdate(String table, UUID id, Instant at) {
    backdates.add(new Object[] {table, id, at.isAfter(Instant.now()) ? Instant.now().minusSeconds(3600) : at});
  }

  private Instant within(Term term) {
    LocalDate start = term.getStartDate();
    long days = Math.max(1, java.time.temporal.ChronoUnit.DAYS.between(start, term.getEndDate()));
    LocalDateTime at = start.plusDays(random.nextLong(days)).atTime(7 + random.nextInt(11), random.nextInt(60));
    return at.atZone(ZoneId.systemDefault()).toInstant();
  }

  private <T> T pick(T[] values) {
    return values[random.nextInt(values.length)];
  }

  private int weighted(int[] weights) {
    int total = 0;
    for (int w : weights) total += w;
    int r = random.nextInt(total);
    for (int i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r < 0) return i;
    }
    return weights.length - 1;
  }

  private double gaussian(double mean, double sd) {
    return mean + random.nextGaussian() * sd;
  }

  private static double clamp(double v, double lo, double hi) {
    return Math.max(lo, Math.min(hi, v));
  }
}
