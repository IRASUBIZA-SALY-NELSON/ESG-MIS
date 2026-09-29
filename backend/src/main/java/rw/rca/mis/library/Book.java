package rw.rca.mis.library;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "library_books")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Book extends BaseEntity {
  @Column(nullable = false)
  private String title;

  private String author;

  @Column(unique = true)
  private String isbn;

  private String category;
  private String publisher;
  private Integer publishedYear;
  private String edition;
  private String language = "English";
  private String shelfLocation;

  @Lob
  @Column(length = 4000)
  private String description;

  /** ACTIVE or ARCHIVED. Archived titles stay in history but cannot be issued. */
  private String status = "ACTIVE";
}
