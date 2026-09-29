package rw.rca.mis.library;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "library_settings")
public class LibrarySettings extends BaseEntity {
  private int loanDays = 14;
  private int maxActiveLoans = 3;
  private int maxRenewals = 2;
  private int renewalDays = 7;
  /** Days before the due date when a loan counts as "due soon". */
  private int dueSoonDays = 3;
  private boolean blockWhenOverdue = true;
}
