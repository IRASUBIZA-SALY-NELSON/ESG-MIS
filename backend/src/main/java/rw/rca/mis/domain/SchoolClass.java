package rw.rca.mis.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "school_classes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SchoolClass extends BaseEntity {
  @Column(nullable = false)
  private String className;

  private String code;

  @ManyToOne
  @JsonIgnoreProperties({"currentClass", "currentClazz", "password", "courses"})
  private Person classTeacher;

  @ManyToMany
  @JoinTable(name = "class_courses")
  @JsonIgnoreProperties({"classList", "classes", "termsList"})
  private Set<Course> courses = new HashSet<>();

  @Transient
  private Integer studentsNumber = 0;

  @Transient
  private Integer studentsRemaining = 0;

  @JsonIgnore
  public Set<Course> courseSet() {
    return courses;
  }
}
