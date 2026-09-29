package rw.rca.mis.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "timetables")
public class Timetable extends BaseEntity {
  @OneToOne
  private Term term;

  @Lob
  private String payload;
}
