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
@Table(name = "past_papers")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PastPaper extends BaseEntity {
  private String title;
  private String fileName;
  private String yearLabel;

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"classList"})
  private Course course;

  @ManyToOne(fetch = FetchType.EAGER)
  private AcademicYear academicYear;
}
