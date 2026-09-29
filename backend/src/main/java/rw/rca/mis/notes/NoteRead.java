package rw.rca.mis.notes;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;
import rw.rca.mis.domain.Person;

/** One row per student per note: what the student has done with it. */
@Getter
@Setter
@Entity
@Table(
    name = "course_note_reads",
    uniqueConstraints = @UniqueConstraint(columnNames = {"note_id", "student_id"}))
public class NoteRead extends BaseEntity {
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  private CourseNote note;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  private Person student;

  private LocalDateTime firstViewedAt;
  private LocalDateTime lastViewedAt;
  private int views;
  private int downloads;
  private LocalDateTime lastDownloadedAt;
  private boolean saved;
  private boolean completed;
  private LocalDateTime completedAt;
}
