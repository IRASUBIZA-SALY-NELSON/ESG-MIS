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
@Table(name = "academic_marks")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AcademicMark extends BaseEntity {
  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"password", "currentClass", "currentClazz"})
  private Person student;

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"classList", "classes"})
  private Course course;

  @ManyToOne(fetch = FetchType.EAGER)
  private Term term;

  private String markType;
  private Double marks;
  private Double weight = 100.0;
  private Double passMark = 50.0;
  private String comment;
  private String lockStatus = "UNLOCKED";
  private String marksStatus = "PASS";

  /** passMark is a percentage; marks are out of weight. */
  public void refreshStatus() {
    double outOf = weight == null || weight <= 0 ? 100 : weight;
    double pass = passMark == null ? 50 : passMark;
    marksStatus = marks != null && marks * 100.0 / outOf >= pass ? "PASS" : "FAIL";
  }
}
