package rw.rca.mis.notes;

import java.net.URI;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import rw.rca.mis.domain.Course;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.SchoolClass;
import rw.rca.mis.domain.TeacherAssignment;
import rw.rca.mis.domain.Term;
import rw.rca.mis.notes.NotesViews.ActivityView;
import rw.rca.mis.notes.NotesViews.ClassRef;
import rw.rca.mis.notes.NotesViews.DailyPoint;
import rw.rca.mis.notes.NotesViews.NoteView;
import rw.rca.mis.notes.NotesViews.ReaderView;
import rw.rca.mis.notes.NotesViews.StudentCourseView;
import rw.rca.mis.notes.NotesViews.StudentNoteView;
import rw.rca.mis.repo.PersonRepository;
import rw.rca.mis.repo.TeacherAssignmentRepository;
import rw.rca.mis.repo.TermRepository;
import rw.rca.mis.service.Lookup;

@Service
@Transactional(readOnly = true)
public class NotesService {
  public static final String SCHEDULED = "SCHEDULED";
  private static final int VIEW_DEDUPE_MINUTES = 5;

  private final CourseNoteRepository notes;
  private final NoteReadRepository reads;
  private final NoteEventRepository events;
  private final TeacherAssignmentRepository assignments;
  private final PersonRepository people;
  private final TermRepository terms;
  private final Lookup lookup;
  private final NoteStorage storage;

  public NotesService(
      CourseNoteRepository notes,
      NoteReadRepository reads,
      NoteEventRepository events,
      TeacherAssignmentRepository assignments,
      PersonRepository people,
      TermRepository terms,
      Lookup lookup,
      NoteStorage storage) {
    this.notes = notes;
    this.reads = reads;
    this.events = events;
    this.assignments = assignments;
    this.people = people;
    this.terms = terms;
    this.lookup = lookup;
    this.storage = storage;
  }

  // ================================================================ status helpers

  /** DRAFT, SCHEDULED, PUBLISHED or ARCHIVED — SCHEDULED is a published note whose release time is still ahead. */
  public static String effectiveStatus(CourseNote n) {
    if (CourseNote.PUBLISHED.equals(n.getStatus())
        && n.getPublishAt() != null
        && n.getPublishAt().isAfter(LocalDateTime.now())) {
      return SCHEDULED;
    }
    return n.getStatus();
  }

  private static boolean visibleToStudents(CourseNote n) {
    return CourseNote.PUBLISHED.equals(effectiveStatus(n));
  }

  private static LocalDateTime releasedAt(CourseNote n) {
    return n.getPublishAt() != null ? n.getPublishAt() : n.getPublishedAt();
  }

  private static LocalDateTime local(Instant instant) {
    return instant == null ? null : LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
  }

  private static boolean isAdmin(Person p) {
    return "ADMIN".equals(p.getRoleName());
  }

  // ================================================================ teacher: scope

  private List<TeacherAssignment> scope(Person me) {
    return isAdmin(me) ? assignments.findAll() : assignments.findByTeacherId(me.getId());
  }

  /** Classes the current teacher may share a course's notes with. */
  private Map<UUID, SchoolClass> allowedClasses(Person me, UUID courseId) {
    Map<UUID, SchoolClass> out = new LinkedHashMap<>();
    for (TeacherAssignment a : scope(me)) {
      if (a.getCourse() != null && a.getCourse().getId().equals(courseId) && a.getSchoolClass() != null) {
        out.putIfAbsent(a.getSchoolClass().getId(), a.getSchoolClass());
      }
    }
    return out;
  }

  private CourseNote owned(UUID id) {
    Person me = lookup.currentUser();
    CourseNote note =
        notes.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));
    if (!isAdmin(me) && !note.getTeacher().getId().equals(me.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This note belongs to another teacher");
    }
    return note;
  }

  private Term currentTerm() {
    List<Term> all = terms.findAllByOrderByStartDateAsc();
    LocalDate today = LocalDate.now();
    Term latestStarted = null;
    for (Term t : all) {
      if (t.getStartDate() != null && !t.getStartDate().isAfter(today)) {
        latestStarted = t;
        if (t.getEndDate() != null && !t.getEndDate().isBefore(today)) return t;
      }
    }
    if (latestStarted != null) return latestStarted;
    return all.isEmpty() ? null : all.get(0);
  }

  public Map<String, Object> context() {
    Person me = lookup.currentUser();
    Map<UUID, Map<String, Object>> courses = new LinkedHashMap<>();
    Map<UUID, Integer> sizes = new HashMap<>();
    for (TeacherAssignment a : scope(me)) {
      if (a.getCourse() == null || a.getSchoolClass() == null) continue;
      Map<String, Object> c =
          courses.computeIfAbsent(
              a.getCourse().getId(),
              k -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", a.getCourse().getId());
                m.put("name", a.getCourse().getCourseName());
                m.put("classes", new LinkedHashMap<UUID, ClassRef>());
                return m;
              });
      @SuppressWarnings("unchecked")
      Map<UUID, ClassRef> classes = (Map<UUID, ClassRef>) c.get("classes");
      SchoolClass sc = a.getSchoolClass();
      classes.computeIfAbsent(sc.getId(), k -> new ClassRef(sc.getId(), sc.getClassName(), classSize(sc.getId(), sizes)));
    }
    List<Map<String, Object>> courseList = new ArrayList<>();
    for (Map<String, Object> c : courses.values()) {
      Map<String, Object> copy = new LinkedHashMap<>(c);
      copy.put("classes", new ArrayList<>(((Map<?, ?>) c.get("classes")).values()));
      courseList.add(copy);
    }
    courseList.sort(Comparator.comparing(m -> String.valueOf(m.get("name"))));

    Term current = currentTerm();
    List<Map<String, Object>> termList = new ArrayList<>();
    for (Term t : terms.findAllByOrderByStartDateAsc()) {
      Map<String, Object> m = new LinkedHashMap<>();
      m.put("id", t.getId());
      m.put("name", t.getName());
      m.put("academicYear", t.getAcademicYear() == null ? null : t.getAcademicYear().getName());
      m.put("current", current != null && current.getId().equals(t.getId()));
      termList.add(m);
    }

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("teacherName", me.fullName());
    body.put("courses", courseList);
    body.put("terms", termList);
    body.put("currentTermId", current == null ? null : current.getId());
    body.put("maxFileMb", NoteStorage.MAX_BYTES / (1024 * 1024));
    body.put("allowedTypes", NoteStorage.allowedList());
    return body;
  }

  private int classSize(UUID classId, Map<UUID, Integer> cache) {
    return cache.computeIfAbsent(classId, id -> people.findByCurrentClassIdAndRoleName(id, "STUDENT").size());
  }

  private List<Person> audienceOf(CourseNote n) {
    Map<UUID, Person> out = new LinkedHashMap<>();
    for (SchoolClass c : n.getClasses()) {
      for (Person p : people.findByCurrentClassIdAndRoleName(c.getId(), "STUDENT")) {
        out.putIfAbsent(p.getId(), p);
      }
    }
    return new ArrayList<>(out.values());
  }

  // ================================================================ teacher: views

  private NoteView view(CourseNote n, List<NoteRead> noteReads, Map<UUID, Integer> sizes) {
    Set<UUID> classIds = n.getClasses().stream().map(SchoolClass::getId).collect(Collectors.toSet());
    List<ClassRef> classes =
        n.getClasses().stream()
            .sorted(Comparator.comparing(SchoolClass::getClassName))
            .map(c -> new ClassRef(c.getId(), c.getClassName(), classSize(c.getId(), sizes)))
            .toList();
    int audience = classes.stream().mapToInt(ClassRef::students).sum();
    List<NoteRead> inAudience =
        noteReads.stream()
            .filter(r -> r.getStudent().getCurrentClass() != null
                && classIds.contains(r.getStudent().getCurrentClass().getId()))
            .toList();
    int opened = (int) inAudience.stream().filter(r -> r.getFirstViewedAt() != null).count();
    int completed = (int) inAudience.stream().filter(NoteRead::isCompleted).count();
    int saved = (int) noteReads.stream().filter(NoteRead::isSaved).count();
    int views = noteReads.stream().mapToInt(NoteRead::getViews).sum();
    int downloads = noteReads.stream().mapToInt(NoteRead::getDownloads).sum();
    LocalDateTime last =
        noteReads.stream()
            .flatMap(r -> java.util.stream.Stream.of(r.getLastViewedAt(), r.getLastDownloadedAt(), r.getCompletedAt()))
            .filter(Objects::nonNull)
            .max(Comparator.naturalOrder())
            .orElse(null);
    return new NoteView(
        n.getId(),
        n.getTitle(),
        n.getDescription(),
        n.getTopic(),
        n.getCourse().getId(),
        n.getCourse().getCourseName(),
        n.getTeacher().fullName(),
        classes,
        n.getTerm() == null ? null : n.getTerm().getId(),
        n.getTerm() == null ? null : n.getTerm().getName(),
        n.getKind(),
        NoteStorage.category(n.getKind(), n.getFileName()),
        n.getFileName(),
        n.getContentType(),
        n.getSizeBytes(),
        n.getVersion(),
        n.getFileUpdatedAt(),
        n.getPreviewStatus(),
        n.getLinkUrl(),
        effectiveStatus(n),
        n.getPublishAt(),
        n.getPublishedAt(),
        n.getArchivedAt(),
        n.isAllowDownload(),
        n.isPinned(),
        n.getReadBy(),
        n.getLastNudgedAt(),
        n.getNudgeCount() == null ? 0 : n.getNudgeCount(),
        audience,
        opened,
        completed,
        saved,
        views,
        downloads,
        audience == 0 ? 0 : Math.round(opened * 1000.0 / audience) / 10.0,
        last,
        local(n.getCreatedAt()),
        local(n.getUpdatedAt()));
  }

  private List<NoteView> views(List<CourseNote> list) {
    Map<UUID, List<NoteRead>> byNote =
        list.isEmpty()
            ? Map.of()
            : reads.findByNoteIdIn(list.stream().map(CourseNote::getId).toList()).stream()
                .collect(Collectors.groupingBy(r -> r.getNote().getId()));
    Map<UUID, Integer> sizes = new HashMap<>();
    return list.stream().map(n -> view(n, byNote.getOrDefault(n.getId(), List.of()), sizes)).toList();
  }

  private List<CourseNote> myNotes(Person me) {
    return isAdmin(me)
        ? notes.findAll().stream().sorted(Comparator.comparing(CourseNote::getCreatedAt,
            Comparator.nullsLast(Comparator.reverseOrder()))).toList()
        : notes.findByTeacherIdOrderByCreatedAtDesc(me.getId());
  }

  public List<NoteView> list() {
    return views(myNotes(lookup.currentUser()));
  }

  public Map<String, Object> stats() {
    Person me = lookup.currentUser();
    List<CourseNote> all = myNotes(me);
    List<NoteView> list = views(all);
    Map<String, Long> byStatus =
        list.stream().collect(Collectors.groupingBy(NoteView::status, Collectors.counting()));
    List<NoteView> live = list.stream().filter(v -> CourseNote.PUBLISHED.equals(v.status())).toList();
    int audience = live.stream().mapToInt(NoteView::audience).sum();
    int opened = live.stream().mapToInt(NoteView::opened).sum();
    int completed = live.stream().mapToInt(NoteView::completed).sum();

    LocalDateTime since = LocalDate.now().minusDays(29).atStartOfDay();
    List<NoteEvent> recentEvents =
        all.isEmpty()
            ? List.of()
            : events.findByNoteIdInAndAtAfterOrderByAtDesc(all.stream().map(CourseNote::getId).toList(), since);

    Map<String, Object> kpis = new LinkedHashMap<>();
    kpis.put("total", list.size());
    kpis.put("published", byStatus.getOrDefault(CourseNote.PUBLISHED, 0L));
    kpis.put("scheduled", byStatus.getOrDefault(SCHEDULED, 0L));
    kpis.put("drafts", byStatus.getOrDefault(CourseNote.DRAFT, 0L));
    kpis.put("archived", byStatus.getOrDefault(CourseNote.ARCHIVED, 0L));
    kpis.put("reach", audience == 0 ? 0 : Math.round(opened * 1000.0 / audience) / 10.0);
    kpis.put("completion", audience == 0 ? 0 : Math.round(completed * 1000.0 / audience) / 10.0);
    kpis.put("views", list.stream().mapToInt(NoteView::views).sum());
    kpis.put("downloads", list.stream().mapToInt(NoteView::downloads).sum());
    LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
    kpis.put("viewsThisWeek",
        recentEvents.stream().filter(e -> NoteEvent.VIEW.equals(e.getType()) && e.getAt().isAfter(weekAgo)).count());
    kpis.put("storageBytes", all.stream().map(CourseNote::getSizeBytes).filter(Objects::nonNull).mapToLong(Long::longValue).sum());
    kpis.put("unopenedStudents", live.stream().mapToInt(v -> v.audience() - v.opened()).sum());

    List<Map<String, Object>> byCourse = new ArrayList<>();
    live.stream()
        .collect(Collectors.groupingBy(NoteView::courseName, LinkedHashMap::new, Collectors.toList()))
        .forEach((course, vs) -> {
          int aud = vs.stream().mapToInt(NoteView::audience).sum();
          Map<String, Object> m = new LinkedHashMap<>();
          m.put("course", course);
          m.put("notes", vs.size());
          m.put("reach", aud == 0 ? 0 : Math.round(vs.stream().mapToInt(NoteView::opened).sum() * 1000.0 / aud) / 10.0);
          m.put("completion", aud == 0 ? 0 : Math.round(vs.stream().mapToInt(NoteView::completed).sum() * 1000.0 / aud) / 10.0);
          m.put("views", vs.stream().mapToInt(NoteView::views).sum());
          byCourse.add(m);
        });

    Map<String, Long> byType =
        list.stream().collect(Collectors.groupingBy(NoteView::category, LinkedHashMap::new, Collectors.counting()));

    List<NoteView> attention =
        live.stream()
            .filter(v -> v.audience() > 0 && v.reach() < 60)
            .filter(v -> releasedOlderThan(v, 1))
            .sorted(Comparator.comparingDouble(NoteView::reach))
            .limit(6)
            .toList();

    List<NoteView> top =
        list.stream().filter(v -> v.views() > 0).sorted(Comparator.comparingInt(NoteView::views).reversed()).limit(5).toList();

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("kpis", kpis);
    body.put("daily", daily(recentEvents, 30));
    body.put("byCourse", byCourse);
    body.put("byType", byType);
    body.put("attention", attention);
    body.put("top", top);
    body.put("recent", recentEvents.stream().limit(15).map(this::activity).toList());
    return body;
  }

  private static boolean releasedOlderThan(NoteView v, int days) {
    LocalDateTime released = v.publishAt() != null ? v.publishAt() : v.publishedAt();
    return released != null && released.isBefore(LocalDateTime.now().minusDays(days));
  }

  private ActivityView activity(NoteEvent e) {
    Person s = e.getStudent();
    return new ActivityView(
        e.getNote().getId(),
        e.getNote().getTitle(),
        e.getNote().getCourse().getCourseName(),
        s.getId(),
        s.fullName(),
        s.getCurrentClass() == null ? null : s.getCurrentClass().getClassName(),
        e.getType(),
        e.getAt());
  }

  private static List<DailyPoint> daily(List<NoteEvent> list, int days) {
    Map<LocalDate, long[]> buckets = new LinkedHashMap<>();
    LocalDate start = LocalDate.now().minusDays(days - 1L);
    for (int i = 0; i < days; i++) buckets.put(start.plusDays(i), new long[3]);
    for (NoteEvent e : list) {
      long[] b = buckets.get(e.getAt().toLocalDate());
      if (b == null) continue;
      switch (e.getType()) {
        case NoteEvent.VIEW -> b[0]++;
        case NoteEvent.DOWNLOAD -> b[1]++;
        case NoteEvent.COMPLETE -> b[2]++;
        default -> { }
      }
    }
    return buckets.entrySet().stream()
        .map(en -> new DailyPoint(en.getKey(), en.getValue()[0], en.getValue()[1], en.getValue()[2]))
        .toList();
  }

  public Map<String, Object> detail(UUID id) {
    CourseNote n = owned(id);
    List<NoteRead> noteReads = reads.findByNoteId(id);
    NoteView v = view(n, noteReads, new HashMap<>());
    Map<UUID, NoteRead> byStudent =
        noteReads.stream().collect(Collectors.toMap(r -> r.getStudent().getId(), Function.identity(), (a, b) -> a));
    List<ReaderView> readers = new ArrayList<>();
    Set<UUID> seen = new HashSet<>();
    for (Person p : audienceOf(n)) {
      seen.add(p.getId());
      readers.add(reader(p, byStudent.get(p.getId()), true));
    }
    for (NoteRead r : noteReads) {
      if (!seen.contains(r.getStudent().getId())) readers.add(reader(r.getStudent(), r, false));
    }
    readers.sort(Comparator.comparing(ReaderView::className, Comparator.nullsLast(Comparator.naturalOrder()))
        .thenComparing(ReaderView::fullName));

    List<NoteEvent> noteEvents = events.findByNoteIdAndAtAfterOrderByAtDesc(id, LocalDate.now().minusDays(29).atStartOfDay());
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("note", v);
    body.put("readers", readers);
    body.put("daily", daily(noteEvents, 30));
    body.put("recent", noteEvents.stream().limit(20).map(this::activity).toList());
    return body;
  }

  private static ReaderView reader(Person p, NoteRead r, boolean inAudience) {
    return new ReaderView(
        p.getId(),
        p.fullName(),
        p.getEmail(),
        p.getCurrentClass() == null ? null : p.getCurrentClass().getClassName(),
        inAudience,
        r != null && r.getFirstViewedAt() != null,
        r == null ? null : r.getFirstViewedAt(),
        r == null ? null : r.getLastViewedAt(),
        r == null ? 0 : r.getViews(),
        r == null ? 0 : r.getDownloads(),
        r == null ? null : r.getLastDownloadedAt(),
        r != null && r.isCompleted(),
        r == null ? null : r.getCompletedAt(),
        r != null && r.isSaved());
  }

  // ================================================================ teacher: changes

  @Transactional
  public NoteView create(Map<String, Object> meta, MultipartFile file) {
    Person me = lookup.currentUser();
    CourseNote n = new CourseNote();
    n.setTeacher(me);
    String kind = CourseNote.LINK.equalsIgnoreCase(str(meta.get("kind"))) ? CourseNote.LINK : CourseNote.FILE;
    n.setKind(kind);
    if (CourseNote.FILE.equals(kind)) {
      applyFile(n, storage.store(file));
    }
    applyMeta(n, meta, me, true);
    applyPublishMode(n, meta);
    n = notes.save(n);
    schedulePreview(n);
    return view(n, List.of(), new HashMap<>());
  }

  @Transactional
  public NoteView update(UUID id, Map<String, Object> meta) {
    CourseNote n = owned(id);
    applyMeta(n, meta, lookup.currentUser(), false);
    if (meta.containsKey("publish")) applyPublishMode(n, meta);
    if (CourseNote.PUBLISHED.equals(n.getStatus()) && n.getClasses().isEmpty()) {
      throw new IllegalArgumentException("A published note must be shared with at least one class");
    }
    return view(notes.save(n), reads.findByNoteId(id), new HashMap<>());
  }

  @Transactional
  public NoteView replaceFile(UUID id, MultipartFile file) {
    CourseNote n = owned(id);
    if (!CourseNote.FILE.equals(n.getKind())) {
      throw new IllegalArgumentException("This note is a link — edit it to change the address");
    }
    NoteStorage.StoredFile stored = storage.store(file);
    String oldFile = n.getStoredName();
    String oldPreview = n.getPreviewName();
    applyFile(n, stored);
    n.setVersion((n.getVersion() == null ? 1 : n.getVersion()) + 1);
    n = notes.save(n);
    afterCommit(() -> {
      storage.delete(oldFile);
      storage.delete(oldPreview);
    });
    schedulePreview(n);
    return view(n, reads.findByNoteId(id), new HashMap<>());
  }

  @Transactional
  public NoteView publish(UUID id, Map<String, Object> body) {
    CourseNote n = owned(id);
    LocalDateTime at = body == null ? null : dateTime(body.get("publishAt"));
    publishNote(n, at);
    return view(notes.save(n), reads.findByNoteId(id), new HashMap<>());
  }

  @Transactional
  public NoteView unpublish(UUID id) {
    CourseNote n = owned(id);
    n.setStatus(CourseNote.DRAFT);
    n.setPublishAt(null);
    return view(notes.save(n), reads.findByNoteId(id), new HashMap<>());
  }

  @Transactional
  public NoteView archive(UUID id) {
    CourseNote n = owned(id);
    if (!CourseNote.ARCHIVED.equals(n.getStatus())) n.setStatusBeforeArchive(n.getStatus());
    n.setStatus(CourseNote.ARCHIVED);
    n.setArchivedAt(LocalDateTime.now());
    n.setPinned(false);
    return view(notes.save(n), reads.findByNoteId(id), new HashMap<>());
  }

  @Transactional
  public NoteView restore(UUID id) {
    CourseNote n = owned(id);
    if (!CourseNote.ARCHIVED.equals(n.getStatus())) {
      throw new IllegalArgumentException("Only archived notes can be restored");
    }
    String previous = n.getStatusBeforeArchive();
    n.setStatus(previous != null ? previous : n.getPublishedAt() != null ? CourseNote.PUBLISHED : CourseNote.DRAFT);
    n.setStatusBeforeArchive(null);
    n.setArchivedAt(null);
    return view(notes.save(n), reads.findByNoteId(id), new HashMap<>());
  }

  @Transactional
  public NoteView togglePin(UUID id) {
    CourseNote n = owned(id);
    n.setPinned(!n.isPinned());
    return view(notes.save(n), reads.findByNoteId(id), new HashMap<>());
  }

  @Transactional
  public NoteView duplicate(UUID id) {
    CourseNote src = owned(id);
    CourseNote n = new CourseNote();
    n.setTeacher(lookup.currentUser());
    n.setTitle(src.getTitle() + " (copy)");
    n.setDescription(src.getDescription());
    n.setTopic(src.getTopic());
    n.setCourse(src.getCourse());
    n.setTerm(src.getTerm());
    n.setClasses(new HashSet<>(src.getClasses()));
    n.setKind(src.getKind());
    n.setLinkUrl(src.getLinkUrl());
    n.setAllowDownload(src.isAllowDownload());
    n.setReadBy(src.getReadBy());
    if (CourseNote.FILE.equals(src.getKind()) && src.getStoredName() != null) {
      applyFile(n, storage.copy(src.getStoredName(), src.getFileName()));
    }
    n.setStatus(CourseNote.DRAFT);
    n = notes.save(n);
    schedulePreview(n);
    return view(n, List.of(), new HashMap<>());
  }

  /** Flags the note so students who have not finished it see a reminder from the teacher. */
  @Transactional
  public Map<String, Object> nudge(UUID id) {
    CourseNote n = owned(id);
    if (!visibleToStudents(n)) {
      throw new IllegalArgumentException("Publish the note before reminding students");
    }
    Map<UUID, NoteRead> byStudent =
        reads.findByNoteId(id).stream().collect(Collectors.toMap(r -> r.getStudent().getId(), Function.identity(), (a, b) -> a));
    long pending = audienceOf(n).stream()
        .filter(p -> { NoteRead r = byStudent.get(p.getId()); return r == null || !r.isCompleted(); })
        .count();
    if (pending == 0) {
      throw new IllegalArgumentException("Every student has already studied this note");
    }
    n.setLastNudgedAt(LocalDateTime.now());
    n.setNudgeCount((n.getNudgeCount() == null ? 0 : n.getNudgeCount()) + 1);
    notes.save(n);
    Map<String, Object> out = new LinkedHashMap<>();
    out.put("reminded", pending);
    return out;
  }

  @Transactional
  public void delete(UUID id) {
    CourseNote n = owned(id);
    String file = n.getStoredName();
    String preview = n.getPreviewName();
    events.deleteByNoteId(id);
    reads.deleteByNoteId(id);
    notes.delete(n);
    afterCommit(() -> {
      storage.delete(file);
      storage.delete(preview);
    });
  }

  @Transactional
  public Map<String, Object> bulk(Map<String, Object> body) {
    String action = str(body.get("action"));
    Object raw = body.get("ids");
    if (!(raw instanceof Collection<?> ids) || ids.isEmpty()) {
      throw new IllegalArgumentException("Select at least one note");
    }
    int done = 0;
    List<String> skipped = new ArrayList<>();
    for (Object o : ids) {
      UUID id = UUID.fromString(String.valueOf(o));
      try {
        switch (action == null ? "" : action) {
          case "publish" -> publishNote(owned(id), null);
          case "unpublish" -> unpublish(id);
          case "archive" -> archive(id);
          case "restore" -> restore(id);
          case "delete" -> delete(id);
          case "pin" -> owned(id).setPinned(true);
          case "unpin" -> owned(id).setPinned(false);
          case "allowDownload" -> owned(id).setAllowDownload(true);
          case "blockDownload" -> owned(id).setAllowDownload(false);
          default -> throw new IllegalArgumentException("Unknown action " + action);
        }
        done++;
      } catch (IllegalArgumentException e) {
        if (e.getMessage() != null && e.getMessage().startsWith("Unknown action")) throw e;
        skipped.add(notes.findById(id).map(CourseNote::getTitle).orElse(id.toString()) + ": " + e.getMessage());
      }
    }
    Map<String, Object> out = new LinkedHashMap<>();
    out.put("done", done);
    out.put("skipped", skipped);
    return out;
  }

  private void publishNote(CourseNote n, LocalDateTime at) {
    if (n.getClasses().isEmpty()) {
      throw new IllegalArgumentException("Choose at least one class to share with");
    }
    if (CourseNote.FILE.equals(n.getKind()) && n.getStoredName() == null) {
      throw new IllegalArgumentException("Upload a file first");
    }
    if (CourseNote.ARCHIVED.equals(n.getStatus())) {
      n.setArchivedAt(null);
    }
    n.setStatus(CourseNote.PUBLISHED);
    LocalDateTime now = LocalDateTime.now();
    n.setPublishAt(at != null && at.isAfter(now) ? at : null);
    n.setPublishedAt(at != null && at.isAfter(now) ? at : now);
  }

  private void applyFile(CourseNote n, NoteStorage.StoredFile f) {
    n.setFileName(f.fileName());
    n.setStoredName(f.storedName());
    n.setContentType(f.contentType());
    n.setSizeBytes(f.sizeBytes());
    n.setFileUpdatedAt(LocalDateTime.now());
    n.setPreviewName(null);
    n.setPreviewStatus(NoteStorage.needsPdfPreview(f.fileName()) ? "PENDING" : "NONE");
    if (n.getTitle() == null || n.getTitle().isBlank()) {
      String base = f.fileName();
      int dot = base.lastIndexOf('.');
      n.setTitle((dot > 0 ? base.substring(0, dot) : base).replace('_', ' ').replace('-', ' ').trim());
    }
  }

  private void applyMeta(CourseNote n, Map<String, Object> meta, Person me, boolean creating) {
    if (meta.containsKey("title") || creating) {
      String title = str(meta.get("title"));
      if (title != null) n.setTitle(title);
      if (n.getTitle() == null || n.getTitle().isBlank()) throw new IllegalArgumentException("Give the note a title");
      if (n.getTitle().length() > 200) throw new IllegalArgumentException("Keep the title under 200 characters");
    }
    if (meta.containsKey("description")) {
      String d = str(meta.get("description"));
      if (d != null && d.length() > 4000) throw new IllegalArgumentException("Keep the description under 4000 characters");
      n.setDescription(d);
    }
    if (meta.containsKey("topic")) n.setTopic(str(meta.get("topic")));

    if (meta.containsKey("courseId") || creating) {
      String courseId = str(meta.get("courseId"));
      if (courseId == null) throw new IllegalArgumentException("Choose the course these notes are for");
      Course course = lookup.course(UUID.fromString(courseId));
      if (!isAdmin(me) && allowedClasses(me, course.getId()).isEmpty()) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not teach " + course.getCourseName());
      }
      n.setCourse(course);
    }
    if (meta.containsKey("classIds") || creating || meta.containsKey("courseId")) {
      Map<UUID, SchoolClass> allowed = allowedClasses(me, n.getCourse().getId());
      Set<SchoolClass> chosen = new HashSet<>();
      Object raw = meta.containsKey("classIds") ? meta.get("classIds")
          : n.getClasses().stream().map(c -> c.getId().toString()).toList();
      if (raw instanceof Collection<?> ids) {
        for (Object o : ids) {
          UUID cid = UUID.fromString(String.valueOf(o));
          SchoolClass c = allowed.get(cid);
          if (c == null && isAdmin(me)) c = lookup.schoolClass(cid);
          if (c == null) {
            throw new IllegalArgumentException("You do not teach " + n.getCourse().getCourseName() + " in one of the chosen classes");
          }
          chosen.add(c);
        }
      }
      n.setClasses(chosen);
    }
    if (meta.containsKey("termId") || creating) {
      String termId = str(meta.get("termId"));
      n.setTerm(termId == null ? currentTerm() : lookup.term(UUID.fromString(termId)));
    }
    if (CourseNote.LINK.equals(n.getKind()) && (meta.containsKey("linkUrl") || creating)) {
      n.setLinkUrl(validUrl(str(meta.get("linkUrl"))));
    }
    if (meta.containsKey("allowDownload")) n.setAllowDownload(bool(meta.get("allowDownload"), true));
    if (meta.containsKey("pinned")) n.setPinned(bool(meta.get("pinned"), false));
    if (meta.containsKey("readBy")) {
      String d = str(meta.get("readBy"));
      n.setReadBy(d == null ? null : LocalDate.parse(d.substring(0, 10)));
    }
  }

  /** publish = DRAFT | NOW | SCHEDULE (with publishAt). */
  private void applyPublishMode(CourseNote n, Map<String, Object> meta) {
    String mode = str(meta.get("publish"));
    if (mode == null || "DRAFT".equalsIgnoreCase(mode)) {
      if (!CourseNote.ARCHIVED.equals(n.getStatus())) {
        n.setStatus(CourseNote.DRAFT);
        n.setPublishAt(null);
      }
      return;
    }
    if ("SCHEDULE".equalsIgnoreCase(mode)) {
      LocalDateTime at = dateTime(meta.get("publishAt"));
      if (at == null || !at.isAfter(LocalDateTime.now())) {
        throw new IllegalArgumentException("Pick a future date and time to release the note");
      }
      publishNote(n, at);
      return;
    }
    publishNote(n, null);
  }

  private void schedulePreview(CourseNote n) {
    if (!"PENDING".equals(n.getPreviewStatus()) || n.getStoredName() == null) return;
    UUID id = n.getId();
    String stored = n.getStoredName();
    afterCommit(() -> queuePreview(id, stored));
  }

  void queuePreview(UUID id, String stored) {
    storage.convertLater(stored, preview -> notes.findById(id).ifPresent(note -> {
      if (!stored.equals(note.getStoredName())) {
        storage.delete(preview);
        return;
      }
      note.setPreviewName(preview);
      note.setPreviewStatus(preview == null ? "FAILED" : "READY");
      notes.save(note);
    }));
  }

  /** Re-queues conversions interrupted by a restart. */
  public void resumePendingPreviews() {
    for (CourseNote n : notes.findByPreviewStatus("PENDING")) {
      if (n.getStoredName() != null) queuePreview(n.getId(), n.getStoredName());
    }
  }

  private static void afterCommit(Runnable task) {
    if (TransactionSynchronizationManager.isSynchronizationActive()) {
      TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
        @Override
        public void afterCommit() {
          task.run();
        }
      });
    } else {
      task.run();
    }
  }

  // ================================================================ file access

  public record FileAccess(Path path, String fileName, String contentType) {}

  /** Streams the original file, or its PDF preview when {@code preview} is set and one exists. */
  @Transactional
  public FileAccess file(UUID id, boolean download, boolean preview) {
    Person me = lookup.currentUser();
    CourseNote n =
        notes.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));
    if (!CourseNote.FILE.equals(n.getKind()) || n.getStoredName() == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "This note has no file");
    }
    if ("STUDENT".equals(me.getRoleName())) {
      assertStudentCanSee(n, me);
      if (download) {
        if (!n.isAllowDownload()) {
          throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your teacher made this note view-only");
        }
        NoteRead r = readFor(n, me);
        LocalDateTime now = LocalDateTime.now();
        r.setDownloads(r.getDownloads() + 1);
        r.setLastDownloadedAt(now);
        if (r.getFirstViewedAt() == null) {
          r.setFirstViewedAt(now);
          r.setLastViewedAt(now);
          r.setViews(1);
        }
        reads.save(r);
        logEvent(n, me, NoteEvent.DOWNLOAD);
      }
    } else if (!isAdmin(me) && !n.getTeacher().getId().equals(me.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This note belongs to another teacher");
    }
    if (preview && !download && "READY".equals(n.getPreviewStatus()) && n.getPreviewName() != null) {
      String base = n.getFileName().contains(".") ? n.getFileName().substring(0, n.getFileName().lastIndexOf('.')) : n.getFileName();
      return new FileAccess(storage.path(n.getPreviewName()), base + ".pdf", "application/pdf");
    }
    return new FileAccess(storage.path(n.getStoredName()), n.getFileName(), NoteStorage.contentTypeFor(n.getFileName()));
  }

  // ================================================================ students

  private void assertStudentCanSee(CourseNote n, Person student) {
    SchoolClass mine = student.getCurrentClass();
    boolean inClass = mine != null && n.getClasses().stream().anyMatch(c -> c.getId().equals(mine.getId()));
    if (!inClass || !visibleToStudents(n)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "This note is not available");
    }
  }

  private NoteRead readFor(CourseNote n, Person student) {
    return reads.findByNoteIdAndStudentId(n.getId(), student.getId()).orElseGet(() -> {
      NoteRead r = new NoteRead();
      r.setNote(n);
      r.setStudent(student);
      return r;
    });
  }

  private void logEvent(CourseNote n, Person student, String type) {
    NoteEvent e = new NoteEvent();
    e.setNote(n);
    e.setStudent(student);
    e.setType(type);
    e.setAt(LocalDateTime.now());
    events.save(e);
  }

  private CourseNote studentNote(UUID id, Person me) {
    CourseNote n =
        notes.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "This note is not available"));
    assertStudentCanSee(n, me);
    return n;
  }

  private StudentNoteView studentView(CourseNote n, NoteRead r) {
    boolean viewed = r != null && r.getFirstViewedAt() != null;
    boolean completed = r != null && r.isCompleted();
    boolean nudged = n.getLastNudgedAt() != null && !completed
        && (r == null || r.getLastViewedAt() == null || r.getLastViewedAt().isBefore(n.getLastNudgedAt()));
    boolean updated = viewed && n.getFileUpdatedAt() != null && n.getVersion() != null && n.getVersion() > 1
        && n.getFileUpdatedAt().isAfter(r.getLastViewedAt());
    return new StudentNoteView(
        n.getId(),
        n.getTitle(),
        n.getDescription(),
        n.getTopic(),
        n.getCourse().getId(),
        n.getCourse().getCourseName(),
        n.getTeacher().fullName(),
        n.getKind(),
        NoteStorage.category(n.getKind(), n.getFileName()),
        n.getFileName(),
        n.getContentType(),
        n.getSizeBytes(),
        n.getVersion(),
        n.getPreviewStatus(),
        n.getLinkUrl(),
        releasedAt(n),
        n.getFileUpdatedAt(),
        n.isAllowDownload(),
        n.isPinned(),
        n.getReadBy(),
        n.getReadBy() != null && n.getReadBy().isBefore(LocalDate.now()) && !completed,
        viewed,
        r == null ? null : r.getFirstViewedAt(),
        r == null ? null : r.getLastViewedAt(),
        r == null ? 0 : r.getViews(),
        r == null ? 0 : r.getDownloads(),
        completed,
        r == null ? null : r.getCompletedAt(),
        r != null && r.isSaved(),
        !viewed,
        updated,
        nudged,
        n.getLastNudgedAt());
  }

  public Map<String, Object> myNotes() {
    Person me = lookup.currentUser();
    SchoolClass mine = me.getCurrentClass();
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("className", mine == null ? null : mine.getClassName());
    if (mine == null) {
      body.put("courses", List.of());
      body.put("notes", List.of());
      body.put("stats", Map.of("total", 0, "unread", 0, "completed", 0, "saved", 0, "toStudy", 0, "dueSoon", 0));
      return body;
    }
    List<CourseNote> visible = notes.findPublishedForClass(mine.getId()).stream().filter(NotesService::visibleToStudents).toList();
    Map<UUID, NoteRead> myReads =
        reads.findByStudentId(me.getId()).stream().collect(Collectors.toMap(r -> r.getNote().getId(), Function.identity(), (a, b) -> a));
    List<StudentNoteView> list =
        visible.stream()
            .map(n -> studentView(n, myReads.get(n.getId())))
            .sorted(Comparator.comparing(StudentNoteView::pinned).reversed()
                .thenComparing(StudentNoteView::publishedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .toList();

    Map<UUID, String> teacherByCourse = new HashMap<>();
    for (TeacherAssignment a : assignments.findBySchoolClassId(mine.getId())) {
      if (a.getCourse() != null && a.getTeacher() != null) teacherByCourse.putIfAbsent(a.getCourse().getId(), a.getTeacher().fullName());
    }
    Map<UUID, StudentCourseView> courses = new LinkedHashMap<>();
    for (Course c : mine.getCourses().stream().sorted(Comparator.comparing(Course::getCourseName)).toList()) {
      courses.put(c.getId(), courseSummary(c.getId(), c.getCourseName(), teacherByCourse.get(c.getId()), list));
    }
    for (StudentNoteView v : list) {
      courses.computeIfAbsent(v.courseId(), k -> courseSummary(v.courseId(), v.courseName(), v.teacherName(), list));
    }

    LocalDate soon = LocalDate.now().plusDays(3);
    Map<String, Object> stats = new LinkedHashMap<>();
    stats.put("total", list.size());
    stats.put("unread", list.stream().filter(StudentNoteView::isNew).count());
    stats.put("completed", list.stream().filter(StudentNoteView::completed).count());
    stats.put("saved", list.stream().filter(StudentNoteView::saved).count());
    stats.put("toStudy", list.stream().filter(v -> !v.completed()).count());
    stats.put("dueSoon", list.stream()
        .filter(v -> !v.completed() && v.readBy() != null && !v.readBy().isAfter(soon))
        .count());
    body.put("courses", new ArrayList<>(courses.values()));
    body.put("notes", list);
    body.put("stats", stats);
    return body;
  }

  private static StudentCourseView courseSummary(UUID id, String name, String teacher, List<StudentNoteView> list) {
    List<StudentNoteView> mine = list.stream().filter(v -> v.courseId().equals(id)).toList();
    String t = teacher != null ? teacher : mine.stream().map(StudentNoteView::teacherName).findFirst().orElse(null);
    return new StudentCourseView(
        id,
        name,
        t,
        mine.size(),
        (int) mine.stream().filter(StudentNoteView::isNew).count(),
        (int) mine.stream().filter(StudentNoteView::completed).count());
  }

  @Transactional
  public StudentNoteView markViewed(UUID id) {
    Person me = lookup.currentUser();
    CourseNote n = studentNote(id, me);
    NoteRead r = readFor(n, me);
    LocalDateTime now = LocalDateTime.now();
    boolean fresh = r.getLastViewedAt() == null || r.getLastViewedAt().isBefore(now.minusMinutes(VIEW_DEDUPE_MINUTES));
    if (r.getFirstViewedAt() == null) r.setFirstViewedAt(now);
    r.setLastViewedAt(now);
    if (fresh) {
      r.setViews(r.getViews() + 1);
      logEvent(n, me, NoteEvent.VIEW);
    }
    return studentView(n, reads.save(r));
  }

  @Transactional
  public StudentNoteView toggleCompleted(UUID id) {
    Person me = lookup.currentUser();
    CourseNote n = studentNote(id, me);
    NoteRead r = readFor(n, me);
    LocalDateTime now = LocalDateTime.now();
    r.setCompleted(!r.isCompleted());
    r.setCompletedAt(r.isCompleted() ? now : null);
    if (r.getFirstViewedAt() == null) {
      r.setFirstViewedAt(now);
      r.setLastViewedAt(now);
      r.setViews(1);
    }
    if (r.isCompleted()) logEvent(n, me, NoteEvent.COMPLETE);
    return studentView(n, reads.save(r));
  }

  @Transactional
  public StudentNoteView toggleSaved(UUID id) {
    Person me = lookup.currentUser();
    CourseNote n = studentNote(id, me);
    NoteRead r = readFor(n, me);
    r.setSaved(!r.isSaved());
    return studentView(n, reads.save(r));
  }

  // ================================================================ parsing

  private static String str(Object o) {
    if (o == null) return null;
    String s = String.valueOf(o).trim();
    return s.isEmpty() || "null".equals(s) ? null : s;
  }

  private static boolean bool(Object o, boolean fallback) {
    if (o == null) return fallback;
    if (o instanceof Boolean b) return b;
    return Boolean.parseBoolean(String.valueOf(o));
  }

  private static LocalDateTime dateTime(Object o) {
    String s = str(o);
    if (s == null) return null;
    try {
      if (s.endsWith("Z") || s.matches(".*[+-]\\d\\d:\\d\\d$")) {
        return LocalDateTime.ofInstant(Instant.parse(s.endsWith("Z") ? s : java.time.OffsetDateTime.parse(s).toInstant().toString()),
            ZoneId.systemDefault());
      }
      return LocalDateTime.parse(s.length() == 16 ? s + ":00" : s.replace(' ', 'T'));
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid date and time: " + s);
    }
  }

  private static String validUrl(String url) {
    if (url == null) throw new IllegalArgumentException("Paste the link you want to share");
    String u = url.matches("(?i)^https?://.*") ? url : "https://" + url;
    try {
      URI uri = URI.create(u);
      if (uri.getHost() == null || !uri.getHost().contains(".")) throw new IllegalArgumentException();
      return uri.toString();
    } catch (Exception e) {
      throw new IllegalArgumentException("That does not look like a valid web address");
    }
  }
}
