package rw.rca.mis.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "teacher_assignments")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TeacherAssignment extends BaseEntity {
  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"password", "currentClass"})
  private Person teacher;

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"courses", "classTeacher"})
  private SchoolClass schoolClass;

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"classList"})
  private Course course;

  @ManyToOne(fetch = FetchType.EAGER)
  private Term term;

  @ManyToOne(fetch = FetchType.EAGER)
  private AcademicYear academicYear;
}
