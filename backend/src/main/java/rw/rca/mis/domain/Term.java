package rw.rca.mis.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "terms")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Term extends BaseEntity {
  @Column(nullable = false)
  private String name;

  private LocalDate startDate;
  private LocalDate endDate;
  private String termMarksStatus = "EXAM";

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private AcademicYear academicYear;
}
