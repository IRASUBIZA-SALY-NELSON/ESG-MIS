package rw.rca.mis.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "appeals")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Appeal extends BaseEntity {
  private String category;
  private String status = "PENDING";
  private String kind = "ACADEMIC";

  @Lob
  @Column(length = 4000)
  private String message;

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"password"})
  private Person student;

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"password"})
  private Person teacher;

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"classList"})
  private Course course;

  @ManyToOne(fetch = FetchType.EAGER)
  private Term term;

  @ManyToOne(fetch = FetchType.EAGER)
  private AcademicYear academicYear;
}
