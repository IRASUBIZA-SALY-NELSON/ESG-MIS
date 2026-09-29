package rw.rca.mis.finance;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.Term;

/** Money a student owes the school. Amounts are whole Rwandan francs. */
@Getter
@Setter
@Entity
@Table(name = "finance_bills")
public class Bill extends BaseEntity {
  public static final String DRAFT = "DRAFT";
  public static final String PUBLISHED = "PUBLISHED";
  public static final String CANCELLED = "CANCELLED";

  public static final String FINANCE = "FINANCE";
  public static final String LIBRARY = "LIBRARY";

  @Column(unique = true, nullable = false)
  private String billNumber;

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  private Person student;

  /** Office that raised the bill: FINANCE or LIBRARY. */
  @Column(nullable = false)
  private String department = FINANCE;

  @Column(nullable = false)
  private String category;

  @Column(nullable = false)
  private String title;

  @Column(length = 4000)
  private String description;

  @ManyToOne(fetch = FetchType.EAGER)
  private Term term;

  private LocalDate dueDate;

  @Column(nullable = false)
  private String status = DRAFT;

  private long amount;
  private long paidAmount;

  /** Shared by bills created together for many students. */
  private String batchId;

  @ManyToOne(fetch = FetchType.EAGER)
  private Person createdBy;

  @ManyToOne(fetch = FetchType.EAGER)
  private Person publishedBy;

  private Instant publishedAt;

  @ManyToOne(fetch = FetchType.EAGER)
  private Person cancelledBy;

  private Instant cancelledAt;
  private String cancelReason;

  @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  @OrderBy("position ASC")
  private List<BillItem> items = new ArrayList<>();

  public long balance() {
    return Math.max(amount - paidAmount, 0);
  }

  public String paymentStatus() {
    if (CANCELLED.equals(status)) {
      return "CANCELLED";
    }
    if (amount > 0 && paidAmount >= amount) {
      return "PAID";
    }
    return paidAmount > 0 ? "PARTIAL" : "UNPAID";
  }

  public void recalculate() {
    amount = items.stream().mapToLong(BillItem::getAmount).sum();
  }
}
