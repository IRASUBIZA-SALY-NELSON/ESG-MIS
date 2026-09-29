package rw.rca.mis.finance;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;
import rw.rca.mis.domain.Person;

/**
 * Money against a bill.
 *
 * <p>Office-recorded payments go straight to VALID. Student submissions with a proof file start as
 * PENDING_REVIEW until the librarian (library bills) or accountant (school bills) approves them.
 */
@Getter
@Setter
@Entity
@Table(name = "finance_payments")
public class Payment extends BaseEntity {
  public static final String PENDING_REVIEW = "PENDING_REVIEW";
  public static final String VALID = "VALID";
  public static final String REJECTED = "REJECTED";
  public static final String VOIDED = "VOIDED";

  public static final String SOURCE_OFFICE = "OFFICE";
  public static final String SOURCE_STUDENT = "STUDENT";

  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  private Bill bill;

  @Column(unique = true, nullable = false)
  private String receiptNumber;

  private long amount;

  /** CASH, BANK or MOBILE_MONEY */
  @Column(nullable = false)
  private String method;

  /** Bank slip, Mobile Money transaction id, etc. */
  private String reference;

  private LocalDate paidOn;
  private String note;

  /** OFFICE (accountant/librarian recorded) or STUDENT (student uploaded proof). */
  @Column(nullable = false)
  private String source = SOURCE_OFFICE;

  @ManyToOne(fetch = FetchType.EAGER)
  private Person recordedBy;

  @Column(nullable = false)
  private String status = VALID;

  private String proofFileName;
  private String proofStoredName;
  private String proofContentType;
  private Long proofSizeBytes;

  @ManyToOne(fetch = FetchType.EAGER)
  private Person reviewedBy;

  private Instant reviewedAt;
  private String reviewNote;

  @ManyToOne(fetch = FetchType.EAGER)
  private Person voidedBy;

  private Instant voidedAt;
  private String voidReason;
}
