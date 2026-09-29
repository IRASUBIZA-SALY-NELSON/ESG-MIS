package rw.rca.mis.library;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;
import rw.rca.mis.domain.Person;

@Getter
@Setter
@Entity
@Table(name = "library_reminders")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LoanReminder extends BaseEntity {
  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  private Loan loan;

  @ManyToOne(fetch = FetchType.EAGER)
  private Person sentBy;

  /** DUE_SOON, OVERDUE, CUSTOM */
  private String kind = "CUSTOM";

  @Column(length = 1000)
  private String message;

  private LocalDateTime sentAt;
  private boolean seen;
}
