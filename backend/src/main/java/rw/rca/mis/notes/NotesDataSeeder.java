package rw.rca.mis.notes;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import rw.rca.mis.domain.Course;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.SchoolClass;
import rw.rca.mis.config.DataSeeder;
import rw.rca.mis.domain.Term;
import rw.rca.mis.repo.PersonRepository;
import rw.rca.mis.repo.SchoolClassRepository;
import rw.rca.mis.repo.TeacherAssignmentRepository;
import rw.rca.mis.repo.TermRepository;

/** Demo notes from several teachers, with realistic reach data for every student in the target classes. */
@Component
@Order(40)
public class NotesDataSeeder implements CommandLineRunner {
  private static final Logger log = LoggerFactory.getLogger(NotesDataSeeder.class);

  private final CourseNoteRepository notes;
  private final NoteReadRepository reads;
  private final NoteEventRepository events;
  private final PersonRepository people;
  private final SchoolClassRepository classes;
  private final TeacherAssignmentRepository assignments;
  private final TermRepository terms;
  private final NoteStorage storage;
  private final NotesService service;

  public NotesDataSeeder(
      CourseNoteRepository notes,
      NoteReadRepository reads,
      NoteEventRepository events,
      PersonRepository people,
      SchoolClassRepository classes,
      TeacherAssignmentRepository assignments,
      TermRepository terms,
      NoteStorage storage,
      NotesService service) {
    this.notes = notes;
    this.reads = reads;
    this.events = events;
    this.people = people;
    this.classes = classes;
    this.assignments = assignments;
    this.terms = terms;
    this.storage = storage;
    this.service = service;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void convertPendingPreviews() {
    service.resumePendingPreviews();
  }

  @Override
  @Transactional
  public void run(String... args) {
    if (notes.count() > 0) return;
    List<SchoolClass> all = classes.findAll();
    if (all.isEmpty()) return;
    Map<String, SchoolClass> byCode = new java.util.HashMap<>();
    all.forEach(c -> byCode.put(c.getCode(), c));
    List<Term> allTerms = terms.findAllByOrderByStartDateAsc();
    Term term = allTerms.isEmpty() ? null : allTerms.get(allTerms.size() - 1);
    LocalDateTime now = LocalDateTime.now();
    LocalDate today = LocalDate.now();
    List<CourseNote> made = new ArrayList<>();

    Person theo = teacher(DataSeeder.TEACHER_EMAIL);
    Course math = subject(all, "Mathematics");
    if (theo != null && math != null) {
      Set<SchoolClass> senior = classes(byCode, "S4PCM", "S6MCB");
      made.add(note(theo, math, term, senior, "Unit 1 — Functions and Graphs", "Unit 1",
          "Definitions, domain and range, graph transformations and 12 worked examples. Read before Thursday's quiz.",
          pdf("functions-and-graphs.pdf", "Unit 1 - Functions and Graphs", List.of(
              "1. What is a function?",
              "A function f from a set A to a set B assigns to every x in A exactly one y in B.",
              "We write y = f(x). A is the domain; the set of all outputs is the range.",
              "",
              "2. Transformations",
              "f(x) + k shifts the graph up by k units.",
              "f(x - h) shifts the graph right by h units.",
              "-f(x) reflects the graph in the x-axis.",
              "",
              "Worked example: find the domain of g(x) = sqrt(x - 4).",
              "We need x - 4 >= 0, so the domain is x >= 4.")),
          now.minusDays(20), true, true, today.minusDays(10)));
      made.add(note(theo, math, term, senior, "Unit 2 — Limits and Continuity", "Unit 2",
          "Intuitive limits, limit laws and continuity. Includes a one-page summary at the end.",
          pdf("limits-and-continuity.pdf", "Unit 2 - Limits and Continuity", List.of(
              "lim (x -> a) f(x) = L means f(x) gets as close as we like to L as x approaches a.",
              "The limit of a sum is the sum of the limits (when both exist).",
              "f is continuous at a if f(a) exists, the limit exists, and they are equal.",
              "Summary: always try direct substitution first; factor when you get 0/0.")),
          now.minusDays(9), false, true, today.plusDays(2)));
      made.add(note(theo, math, term, classes(byCode, "S4PCM"), "Derivatives practice worksheet", "Unit 3",
          "Twenty practice questions on the power, product and chain rules. Answers will be discussed in class.",
          docx("derivatives-worksheet.docx", "Derivatives practice worksheet", List.of(
              "Instructions: show all your working. Calculators are not allowed.",
              "1. Differentiate f(x) = 3x^4 - 2x^2 + 7.",
              "2. Differentiate g(x) = (2x + 1)(x^2 - 5).",
              "3. Differentiate h(x) = (3x - 2)^5 using the chain rule.",
              "4. Find the gradient of y = x^3 at the point (2, 8).",
              "5. Find the stationary points of y = x^2 - 6x + 1.")),
          now.minusDays(3), false, true, null));
      made.add(note(theo, math, term, senior, "Unit 4 — Integration (draft)", "Unit 4",
          "Still being prepared: antiderivatives and the definite integral.",
          pdf("integration-draft.pdf", "Unit 4 - Integration", List.of(
              "Draft - not yet shared with students.", "1. Antiderivatives", "2. The definite integral as area")),
          null, false, true, null));
      made.add(note(theo, math, term, classes(byCode, "S1A"), "Linear equations — notes and exercises", "Algebra",
          "How to solve equations in one unknown, with 15 exercises. Study before the Friday test.",
          pdf("linear-equations.pdf", "Linear equations", List.of(
              "An equation is balanced: whatever you do to one side, do to the other.",
              "Example: 3x + 5 = 20  ->  3x = 15  ->  x = 5.",
              "Word problems: define the unknown, write the equation, solve, check.",
              "Exercises 1-15 on page 2.")),
          now.minusDays(15), true, true, today.minusDays(3)));
      made.add(note(theo, math, term, classes(byCode, "S1A", "S2A"), "Fractions, ratios and percentages revision", "Number",
          "Revision sheet for the mid-term test.",
          docx("fractions-revision.docx", "Fractions, ratios and percentages", List.of(
              "1. Simplify 18/24.", "2. Share 45 000 RWF in the ratio 2:3.", "3. Increase 2 400 by 15%.")),
          now.minusDays(6), false, true, today.plusDays(5)));
      made.add(link(theo, math, term, classes(byCode, "S1A", "S2A", "S3A"), "Geometry videos — Khan Academy", "Geometry",
          "Angles, triangles and polygons. Watch the first four videos.",
          "https://www.khanacademy.org/math/geometry", now.minusDays(4)));
      made.add(note(theo, math, term, classes(byCode, "S3A"), "Statistics: mean, median and mode", "Statistics",
          "Measures of central tendency with examples from our class survey.",
          pdf("statistics-basics.pdf", "Statistics basics", List.of(
              "Mean = sum of values / number of values.", "Median = middle value after sorting.",
              "Mode = most frequent value.")),
          now.minusDays(11), false, true, null));
      CourseNote scheduled = note(theo, math, term, classes(byCode, "S1A"), "Mid-term test preparation", "Revision",
          "Past questions for the S1 mid-term test. Released on Wednesday morning.",
          pdf("s1-midterm-prep.pdf", "S1 mid-term preparation", List.of("Past questions 2023-2025.")),
          null, false, true, null);
      scheduled.setStatus(CourseNote.PUBLISHED);
      scheduled.setPublishAt(now.plusDays(2).withHour(8).withMinute(0).withSecond(0).withNano(0));
      scheduled.setPublishedAt(scheduled.getPublishAt());
      made.add(scheduled);
      CourseNote oldPack = note(theo, math, term, classes(byCode, "S4PCM"), "Last year's revision pack", "Revision",
          "Kept for reference.",
          pdf("revision-pack-old.pdf", "Revision pack (previous year)", List.of("Archived material.")),
          now.minusDays(60), false, true, null);
      oldPack.setStatus(CourseNote.ARCHIVED);
      oldPack.setArchivedAt(now.minusDays(15));
      oldPack.setStatusBeforeArchive(CourseNote.PUBLISHED);
      made.add(oldPack);
    }

    Person claudine = teacher("claudine.physics" + DataSeeder.DOMAIN);
    Course physics = subject(all, "Physics");
    if (claudine != null && physics != null) {
      made.add(note(claudine, physics, term, classes(byCode, "S1A"), "Measurements and SI units", "Unit 1",
          "Base units, prefixes and converting between units.",
          pdf("si-units.pdf", "Measurements and SI units", List.of(
              "Base units: metre (m), kilogram (kg), second (s), ampere (A), kelvin (K).",
              "Prefixes: kilo = 10^3, centi = 10^-2, milli = 10^-3, micro = 10^-6.")),
          now.minusDays(18), false, true, null));
      made.add(note(claudine, physics, term, classes(byCode, "S2A", "S3A"), "Forces and Newton's laws", "Mechanics",
          "Newton's three laws with everyday examples and practice problems.",
          pdf("newtons-laws.pdf", "Forces and Newton's laws", List.of(
              "1st law: a body stays at rest or moves uniformly unless a force acts on it.",
              "2nd law: F = m a.", "3rd law: every action has an equal and opposite reaction.")),
          now.minusDays(10), true, true, today.minusDays(1)));
      made.add(note(claudine, physics, term, classes(byCode, "S4PCM", "S5PCB"), "Electricity lab worksheet", "Electricity",
          "Fill in the worksheet during Tuesday's practical on Ohm's law.",
          docx("ohms-law-lab.docx", "Ohm's law practical", List.of(
              "Aim: verify that V is proportional to I for a metal wire.",
              "Record V and I for five settings of the rheostat.", "Plot V against I and find the resistance.")),
          now.minusDays(5), false, true, today.plusDays(4)));
      made.add(link(claudine, physics, term, classes(byCode, "S1A", "S2A", "S3A", "S4PCM", "S5PCB"),
          "PhET physics simulations", "Simulations", "Interactive simulations we use in class.",
          "https://phet.colorado.edu/en/simulations/filter?subjects=physics", now.minusDays(7)));
    }

    Person samuel = teacher("samuel.chemistry" + DataSeeder.DOMAIN);
    Course chemistry = subject(all, "Chemistry");
    if (samuel != null && chemistry != null) {
      made.add(note(samuel, chemistry, term, classes(byCode, "S1A", "S2A", "S3A", "S4PCM", "S5PCB", "S6MCB"),
          "Laboratory safety rules", "Safety",
          "Everyone must read these rules before the next practical.",
          text("lab-safety.md", String.join("\n",
              "# Laboratory safety rules", "", "1. Wear a lab coat and goggles.", "2. Never taste chemicals.",
              "3. Report every spill or breakage to the teacher.", "4. Wash your hands before leaving the lab.")),
          now.minusDays(25), true, true, today.minusDays(18)));
      made.add(note(samuel, chemistry, term, classes(byCode, "S1A", "S2A"), "The periodic table", "Unit 2",
          "Groups, periods and trends in the periodic table.",
          pdf("periodic-table.pdf", "The periodic table", List.of(
              "Elements are arranged by increasing atomic number.",
              "Groups (columns) have similar chemical properties.",
              "Across a period, atomic radius decreases.")),
          now.minusDays(16), false, true, null));
      CourseNote organic = note(samuel, chemistry, term, classes(byCode, "S5PCB", "S6MCB"), "Introduction to organic chemistry", "Organic",
          "Functional groups and naming (IUPAC). Needed for the next CAT.",
          pdf("organic-intro.pdf", "Introduction to organic chemistry", List.of(
              "Alkanes CnH2n+2, alkenes CnH2n, alcohols -OH, carboxylic acids -COOH.",
              "Naming: find the longest chain, number from the end nearest the functional group.")),
          now.minusDays(8), false, true, today.minusDays(1));
      organic.setLastNudgedAt(now.minusDays(1));
      organic.setNudgeCount(1);
      made.add(organic);
    }

    Person aimee = teacher("aimee.biology" + DataSeeder.DOMAIN);
    Course biology = subject(all, "Biology");
    if (aimee != null && biology != null) {
      made.add(note(aimee, biology, term, classes(byCode, "S1A"), "Cell structure and functions", "Unit 1",
          "Plant and animal cells, organelles and their functions.",
          pdf("cell-structure.pdf", "Cell structure", List.of(
              "Nucleus: controls the cell.", "Mitochondria: respiration.", "Chloroplast (plants): photosynthesis.",
              "Cell wall (plants): support.")),
          now.minusDays(12), false, true, null));
      made.add(note(aimee, biology, term, classes(byCode, "S5PCB", "S6MCB"), "Genetics and inheritance", "Genetics",
          "Mendel's laws, monohybrid crosses and pedigree charts.",
          pdf("genetics.pdf", "Genetics and inheritance", List.of(
              "Genotype vs phenotype. Dominant and recessive alleles.",
              "Monohybrid cross Aa x Aa gives 3:1 phenotype ratio.")),
          now.minusDays(6), true, true, today.plusDays(6)));
      made.add(link(aimee, biology, term, classes(byCode, "S2A", "S3A"), "Photosynthesis explained (video)", "Plants",
          "A 10-minute video. Take notes on the light and dark reactions.",
          "https://www.youtube.com/watch?v=sQK3Yr4Sc_k", now.minusDays(2)));
    }

    Person jdd = teacher("jdd.english" + DataSeeder.DOMAIN);
    Course english = subject(all, "English");
    if (jdd != null && english != null) {
      CourseNote essay = note(jdd, english, term, classes(byCode, "S1A", "S2A", "S3A"), "Essay writing guide", "Writing",
          "How to plan, structure and proofread an argumentative essay, with a model answer.",
          pdf("essay-writing-guide.pdf", "Essay Writing Guide", List.of(
              "1. Understand the question: underline the command words.",
              "2. Plan: thesis statement, three main points, evidence for each.",
              "3. Structure: introduction, body paragraphs (PEEL), conclusion.",
              "4. Proofread: grammar, spelling, and whether every paragraph answers the question.")),
          now.minusDays(14), false, true, today.minusDays(4));
      essay.setLastNudgedAt(now.minusDays(2));
      essay.setNudgeCount(1);
      made.add(essay);
      made.add(note(jdd, english, term, classes(byCode, "S1A", "S2A", "S3A"), "Reading list for this term", "Literature",
          "Books we will study, and optional extra reading. All are in the school library.",
          text("reading-list.md", String.join("\n",
              "# Reading list", "", "## Required", "1. *Things Fall Apart* — Chinua Achebe",
              "2. *Weep Not, Child* — Ngugi wa Thiong'o", "", "## Optional", "- *Our Lady of the Nile* — Scholastique Mukasonga",
              "- *Animal Farm* — George Orwell")),
          now.minusDays(6), false, true, null));
      made.add(link(jdd, english, term, classes(byCode, "S1A", "S2A", "S3A"), "Grammar videos — BBC Learning English", "Grammar",
          "Short videos on tenses and conditionals. Watch at least the first three.",
          "https://www.bbc.co.uk/learningenglish/english/course/intermediate", now.minusDays(5)));
    }

    Person emmanuel = teacher("emmanuel.entrepreneurship" + DataSeeder.DOMAIN);
    Course entre = subject(all, "Entrepreneurship");
    if (emmanuel != null && entre != null) {
      made.add(note(emmanuel, entre, term, classes(byCode, "S1A", "S4PCM"), "Business Model Canvas explained", "Unit 2",
          "The nine building blocks of a business model, with a filled-in example for a school canteen.",
          pdf("business-model-canvas.pdf", "The Business Model Canvas", List.of(
              "1. Customer segments  2. Value propositions  3. Channels",
              "4. Customer relationships  5. Revenue streams  6. Key resources",
              "7. Key activities  8. Key partnerships  9. Cost structure",
              "Example: ESG canteen. Customers: students and staff.")),
          now.minusDays(12), false, false, null));
      CourseNote survey = note(emmanuel, entre, term, classes(byCode, "S4PCM", "S5PCB"), "Market research survey template", "Unit 3",
          "Template for the group project. Released on Wednesday morning.",
          docx("market-research-survey.docx", "Market research survey", List.of(
              "Group name:", "Product or service idea:", "Target customers:",
              "Q1. How often would you use this product?", "Q2. How much would you pay for it?")),
          null, false, true, null);
      survey.setStatus(CourseNote.PUBLISHED);
      survey.setPublishAt(now.plusDays(2).withHour(8).withMinute(0).withSecond(0).withNano(0));
      survey.setPublishedAt(survey.getPublishAt());
      made.add(survey);
    }

    Person josiane = teacher("josiane.ict" + DataSeeder.DOMAIN);
    Course ict = subject(all, "Computer Science");
    if (josiane != null && ict != null) {
      made.add(note(josiane, ict, term, classes(byCode, "S2A", "S3A"), "Python: your first program", "Programming",
          "Type and run this program, then change it to print your own name.",
          text("first_program.py", String.join("\n",
              "# My first Python program", "name = input(\"What is your name? \")",
              "print(\"Hello,\", name, \"welcome to ESG!\")", "", "for i in range(1, 6):",
              "    print(i, \"x 7 =\", i * 7)")),
          now.minusDays(9), false, true, null));
      made.add(link(josiane, ict, term, classes(byCode, "S1A"), "Scratch projects to try", "Programming",
          "Create an account and try the three starter projects.", "https://scratch.mit.edu/ideas", now.minusDays(3)));
    }

    notes.saveAll(made);

    Random random = new Random(7);
    Map<java.util.UUID, Double> diligence = new java.util.HashMap<>();
    for (CourseNote note : made) {
      boolean live = CourseNote.ARCHIVED.equals(note.getStatus())
          || (CourseNote.PUBLISHED.equals(note.getStatus()) && note.getPublishedAt() != null && note.getPublishedAt().isBefore(now));
      if (!live) continue;
      long age = java.time.Duration.between(note.getPublishedAt(), now).toDays();
      for (SchoolClass c : note.getClasses()) {
        for (Person student : people.findByCurrentClassIdAndRoleName(c.getId(), "STUDENT")) {
          boolean keza = DataSeeder.STUDENT_EMAIL.equals(student.getEmail());
          if (keza && note.getTitle().startsWith("Essay")) continue;
          if (keza && age < 5) continue;
          double d = diligence.computeIfAbsent(student.getId(), id -> 0.45 + random.nextDouble() * 0.6);
          double open = Math.min(0.97, (0.3 + 0.06 * age) * d);
          if (random.nextDouble() > open) continue;
          long firstAfter = Math.max(0, (long) (random.nextDouble() * Math.max(1, age - 1)));
          LocalDateTime first = note.getPublishedAt().plusDays(firstAfter).plusHours(random.nextInt(10));
          int views = 1 + random.nextInt(age > 7 ? 4 : 2);
          int downloads = note.isAllowDownload() && CourseNote.FILE.equals(note.getKind()) && random.nextInt(2) == 0 ? 1 : 0;
          boolean completed = random.nextDouble() < Math.min(0.85, 0.2 + 0.04 * age) * d;
          boolean saved = random.nextInt(5) == 0;
          activity(note, student, first, views, downloads, completed, saved);
        }
      }
    }
    log.info("Seeded {} course notes with {} student reads", notes.count(), reads.count());
  }

  private Person teacher(String email) {
    return people.findByEmailIgnoreCase(email).orElse(null);
  }

  private static Course subject(List<SchoolClass> all, String name) {
    for (SchoolClass c : all) {
      Course found = course(c, name);
      if (found != null) return found;
    }
    return null;
  }

  private static Set<SchoolClass> classes(Map<String, SchoolClass> byCode, String... codes) {
    Set<SchoolClass> set = new java.util.HashSet<>();
    for (String code : codes) {
      SchoolClass c = byCode.get(code);
      if (c != null) set.add(c);
    }
    return set;
  }

  private static Course course(SchoolClass c, String name) {
    return c.getCourses().stream().filter(x -> name.equals(x.getCourseName())).findFirst().orElse(null);
  }

  private CourseNote note(Person teacher, Course course, Term term, Set<SchoolClass> audience, String title, String topic,
      String description, NoteStorage.StoredFile file, LocalDateTime publishedAt, boolean pinned, boolean allowDownload,
      LocalDate readBy) {
    CourseNote n = base(teacher, course, term, audience, title, topic, description, publishedAt);
    n.setKind(CourseNote.FILE);
    n.setFileName(file.fileName());
    n.setStoredName(file.storedName());
    n.setContentType(file.contentType());
    n.setSizeBytes(file.sizeBytes());
    n.setFileUpdatedAt(publishedAt != null ? publishedAt.minusHours(1) : LocalDateTime.now());
    n.setPreviewStatus(NoteStorage.needsPdfPreview(file.fileName()) ? "PENDING" : "NONE");
    n.setPinned(pinned);
    n.setAllowDownload(allowDownload);
    n.setReadBy(readBy);
    return n;
  }

  private CourseNote link(Person teacher, Course course, Term term, Set<SchoolClass> audience, String title, String topic,
      String description, String url, LocalDateTime publishedAt) {
    CourseNote n = base(teacher, course, term, audience, title, topic, description, publishedAt);
    n.setKind(CourseNote.LINK);
    n.setLinkUrl(url);
    return n;
  }

  private static CourseNote base(Person teacher, Course course, Term term, Set<SchoolClass> audience, String title,
      String topic, String description, LocalDateTime publishedAt) {
    CourseNote n = new CourseNote();
    n.setTeacher(teacher);
    n.setCourse(course);
    n.setTerm(term);
    n.setClasses(new java.util.HashSet<>(audience));
    n.setTitle(title);
    n.setTopic(topic);
    n.setDescription(description);
    if (publishedAt != null) {
      n.setStatus(CourseNote.PUBLISHED);
      n.setPublishedAt(publishedAt);
    }
    return n;
  }

  private void activity(CourseNote note, Person student, LocalDateTime first, int views, int downloads,
      boolean completed, boolean saved) {
    if (student == null) return;
    NoteRead r = new NoteRead();
    r.setNote(note);
    r.setStudent(student);
    r.setFirstViewedAt(first);
    r.setViews(views);
    r.setDownloads(downloads);
    r.setSaved(saved);
    List<NoteEvent> log = new ArrayList<>();
    LocalDateTime last = first;
    for (int i = 0; i < views; i++) {
      last = first.plusHours(i * 26L);
      log.add(event(note, student, NoteEvent.VIEW, last));
    }
    r.setLastViewedAt(last);
    if (downloads > 0) {
      r.setLastDownloadedAt(first.plusMinutes(3));
      for (int i = 0; i < downloads; i++) log.add(event(note, student, NoteEvent.DOWNLOAD, first.plusMinutes(3 + i)));
    }
    if (completed) {
      r.setCompleted(true);
      r.setCompletedAt(last.plusMinutes(40));
      log.add(event(note, student, NoteEvent.COMPLETE, last.plusMinutes(40)));
    }
    reads.save(r);
    events.saveAll(log);
  }

  private static NoteEvent event(CourseNote note, Person student, String type, LocalDateTime at) {
    NoteEvent e = new NoteEvent();
    e.setNote(note);
    e.setStudent(student);
    e.setType(type);
    e.setAt(at.isAfter(LocalDateTime.now()) ? LocalDateTime.now().minusMinutes(5) : at);
    return e;
  }

  // ---------------------------------------------------------------- sample files

  private NoteStorage.StoredFile text(String name, String body) {
    return storage.storeBytes(name, body.getBytes(StandardCharsets.UTF_8));
  }

  /** A small single-page PDF with a title and lines of Helvetica text. */
  private NoteStorage.StoredFile pdf(String name, String title, List<String> lines) {
    StringBuilder content = new StringBuilder();
    content.append("0.01 0.31 0.23 rg 0 782 595 60 re f\n");
    content.append("BT /F2 20 Tf 1 1 1 rg 50 804 Td (").append(esc(title)).append(") Tj ET\n");
    content.append("BT /F1 10 Tf 1 1 1 rg 50 788 Td (Ecole des Sciences de Gisenyi - Course notes) Tj ET\n");
    content.append("BT /F1 12 Tf 0.1 0.1 0.1 rg 50 740 Td 18 TL\n");
    for (String line : lines) content.append("(").append(esc(line)).append(") '\n");
    content.append("ET\n");
    byte[] stream = content.toString().getBytes(StandardCharsets.ISO_8859_1);

    List<String> objects = List.of(
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    List<Integer> offsets = new ArrayList<>();
    write(out, "%PDF-1.4\n");
    for (int i = 0; i < objects.size(); i++) {
      offsets.add(out.size());
      write(out, (i + 1) + " 0 obj\n" + objects.get(i) + "\nendobj\n");
    }
    offsets.add(out.size());
    write(out, "6 0 obj\n<< /Length " + stream.length + " >>\nstream\n");
    out.writeBytes(stream);
    write(out, "\nendstream\nendobj\n");
    int xref = out.size();
    StringBuilder table = new StringBuilder("xref\n0 7\n0000000000 65535 f \n");
    for (int off : offsets) table.append(String.format("%010d 00000 n \n", off));
    table.append("trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n").append(xref).append("\n%%EOF\n");
    write(out, table.toString());
    return storage.storeBytes(name, out.toByteArray());
  }

  /** A minimal Word document: a heading followed by paragraphs. */
  private NoteStorage.StoredFile docx(String name, String title, List<String> paragraphs) {
    StringBuilder body = new StringBuilder();
    body.append("<w:p><w:pPr><w:spacing w:after=\"240\"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val=\"36\"/></w:rPr><w:t>")
        .append(xml(title)).append("</w:t></w:r></w:p>");
    for (String p : paragraphs) {
      body.append("<w:p><w:r><w:rPr><w:sz w:val=\"24\"/></w:rPr><w:t xml:space=\"preserve\">")
          .append(xml(p)).append("</w:t></w:r></w:p>");
    }
    Map<String, String> parts = Map.of(
        "[Content_Types].xml",
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
            + "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">"
            + "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>"
            + "<Default Extension=\"xml\" ContentType=\"application/xml\"/>"
            + "<Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/>"
            + "</Types>",
        "_rels/.rels",
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
            + "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
            + "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/>"
            + "</Relationships>",
        "word/document.xml",
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
            + "<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body>"
            + body
            + "</w:body></w:document>");
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    try (ZipOutputStream zip = new ZipOutputStream(out)) {
      for (String part : List.of("[Content_Types].xml", "_rels/.rels", "word/document.xml")) {
        zip.putNextEntry(new ZipEntry(part));
        zip.write(parts.get(part).getBytes(StandardCharsets.UTF_8));
        zip.closeEntry();
      }
    } catch (IOException e) {
      throw new IllegalStateException(e);
    }
    return storage.storeBytes(name, out.toByteArray());
  }

  private static void write(ByteArrayOutputStream out, String s) {
    out.writeBytes(s.getBytes(StandardCharsets.ISO_8859_1));
  }

  private static String esc(String s) {
    return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)").replaceAll("[^\\x20-\\x7E]", "-");
  }

  private static String xml(String s) {
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
  }
}
