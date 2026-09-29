package rw.rca.mis.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "parent_concerns")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ParentConcern extends BaseEntity {
  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JsonIgnoreProperties({"currentClass", "currentClazz"})
  private Person parent;

  @ManyToOne(fetch = FetchType.EAGER)
  private Person student;

  /** ACADEMIC, DISCIPLINE, FEES, HEALTH, OTHER */
  private String category = "OTHER";

  @Column(nullable = false)
  private String subject;

  @Lob
  @Column(length = 4000)
  private String message;

  /** OPEN, ANSWERED, CLOSED */
  private String status = "OPEN";

  @Lob
  @Column(length = 4000)
  private String response;

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"currentClass", "currentClazz"})
  private Person respondedBy;

  private Instant respondedAt;
}
