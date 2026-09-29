package rw.rca.mis.notes;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;
import rw.rca.mis.domain.Person;

/** Activity log used for charts and the teacher's recent-activity feed. */
@Getter
@Setter
@Entity
@Table(name = "course_note_events")
public class NoteEvent extends BaseEntity {
  public static final String VIEW = "VIEW";
  public static final String DOWNLOAD = "DOWNLOAD";
  public static final String COMPLETE = "COMPLETE";

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  private CourseNote note;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  private Person student;

  private String type;
  private LocalDateTime at;
}
