package rw.rca.mis.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "courses")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Course extends BaseEntity {
  @Column(nullable = false)
  private String courseName;

  private String courseCredits = "3";
  private String courseWeight = "100";
  private Double passMark = 50.0;

  @ManyToOne(fetch = FetchType.EAGER)
  private AcademicYear academicYear;

  @ManyToMany(mappedBy = "courses")
  @JsonIgnoreProperties({"courses", "coursesList", "classTeacher"})
  private Set<SchoolClass> classList = new HashSet<>();
}
