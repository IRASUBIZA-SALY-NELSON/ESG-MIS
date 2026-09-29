package rw.rca.mis.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "case_categories")
public class CaseCategory extends BaseEntity {
  @Column(nullable = false)
  private String name;

  private String description;
  private Double marks = 5.0;
}
