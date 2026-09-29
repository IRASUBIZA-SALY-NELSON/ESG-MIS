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
@Table(name = "appeal_comments")
public class AppealComment extends BaseEntity {
  @Lob
  @Column(length = 4000)
  private String comment;

  @ManyToOne(fetch = FetchType.EAGER)
  private Appeal appeal;

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"password"})
  private Person author;
}
