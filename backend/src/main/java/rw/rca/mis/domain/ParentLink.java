package rw.rca.mis.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(
    name = "parent_links",
    uniqueConstraints = @UniqueConstraint(columnNames = {"parent_id", "student_id"}))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ParentLink extends BaseEntity {
  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  @JsonIgnoreProperties({"currentClass", "currentClazz"})
  private Person parent;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  private Person student;

  private String relationship = "GUARDIAN";

  private boolean primaryContact;

  /** Shared by all links of one parent; used by the public report-card verification page. */
  private String reportCardToken;
}
