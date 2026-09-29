package rw.rca.mis.library;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;
import rw.rca.mis.domain.Person;

@Getter
@Setter
@Entity
@Table(name = "library_loans")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Loan extends BaseEntity {
  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  private BookCopy copy;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  private Person borrower;

  @ManyToOne(fetch = FetchType.EAGER)
  private Person issuedBy;

  @ManyToOne(fetch = FetchType.EAGER)
  private Person receivedBy;

  private LocalDateTime issuedAt;
  private LocalDate dueDate;
  private LocalDateTime returnedAt;

  /** ACTIVE, RETURNED, LOST */
  private String status = "ACTIVE";

  private int renewals;
  private String conditionOnIssue;
  private String conditionOnReturn;

  private String notes;
}
