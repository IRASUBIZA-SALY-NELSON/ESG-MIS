package rw.rca.mis.library;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "library_book_copies")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BookCopy extends BaseEntity {
  @ManyToOne(fetch = FetchType.EAGER, optional = false)
  private Book book;

  /** Barcode / accession number printed on the copy. */
  @Column(unique = true, nullable = false)
  private String accessionNumber;

  /** AVAILABLE, BORROWED, LOST, DAMAGED, RETIRED */
  private String status = "AVAILABLE";

  /** NEW, GOOD, FAIR, POOR */
  private String bookCondition = "GOOD";

  private LocalDate acquiredOn;
  private String notes;
}
