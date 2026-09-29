package rw.rca.mis.notes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;
import rw.rca.mis.domain.Course;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.SchoolClass;
import rw.rca.mis.domain.Term;

/** A document or link a teacher shares with one or more classes for a course. */
@Getter
@Setter
@Entity
@Table(name = "course_notes")
public class CourseNote extends BaseEntity {
  public static final String FILE = "FILE";
  public static final String LINK = "LINK";

  public static final String DRAFT = "DRAFT";
  public static final String PUBLISHED = "PUBLISHED";
  public static final String ARCHIVED = "ARCHIVED";

  @Column(nullable = false)
  private String title;

  @Column(length = 4000)
  private String description;

  /** Unit, chapter or topic the note belongs to, e.g. "Unit 3 — Derivatives". */
  private String topic;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  private Course course;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  private Person teacher;

  @ManyToOne(fetch = FetchType.EAGER)
  private Term term;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(name = "course_note_classes")
  private Set<SchoolClass> classes = new HashSet<>();

  private String kind = FILE;

  private String fileName;
  private String storedName;
  private String contentType;
  private Long sizeBytes;
  private Integer version = 1;
  private LocalDateTime fileUpdatedAt;

  /** PDF rendition of office documents so they can be previewed in the browser. */
  private String previewName;

  /** NONE, PENDING, READY or FAILED. */
  private String previewStatus = "NONE";

  @Column(length = 2000)
  private String linkUrl;

  private String status = DRAFT;

  /** When set in the future on a published note, students only see it from that moment. */
  private LocalDateTime publishAt;

  private LocalDateTime publishedAt;
  private LocalDateTime archivedAt;

  /** DRAFT or PUBLISHED — what a restore brings the note back to. */
  private String statusBeforeArchive;

  private boolean allowDownload = true;
  private boolean pinned = false;

  /** Optional date the teacher expects students to have studied the note by. */
  private LocalDate readBy;

  private LocalDateTime lastNudgedAt;
  private Integer nudgeCount = 0;
}
