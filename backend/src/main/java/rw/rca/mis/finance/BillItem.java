package rw.rca.mis.finance;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "finance_bill_items")
public class BillItem extends BaseEntity {
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  private Bill bill;

  private int position;

  /** What is charged, e.g. "Term 1 tuition" or the title of a lost book. */
  @Column(nullable = false)
  private String description;

  private int quantity = 1;
  private long unitPrice;
  private long amount;

  /** Library loan this line charges for, when the lost book is registered in the catalog. */
  private UUID loanId;
}
