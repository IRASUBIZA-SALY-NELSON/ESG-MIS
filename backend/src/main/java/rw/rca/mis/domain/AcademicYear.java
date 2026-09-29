package rw.rca.mis.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "academic_years")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AcademicYear extends BaseEntity {
  @Column(nullable = false)
  private String name;

  private Integer startYear;
  private Integer endYear;
  private String status = "ACTIVE";
  private Double disciplineMarksPassMark = 50.0;
}
