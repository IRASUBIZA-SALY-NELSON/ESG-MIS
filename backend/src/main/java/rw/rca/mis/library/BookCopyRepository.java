package rw.rca.mis.library;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookCopyRepository extends JpaRepository<BookCopy, UUID> {
  List<BookCopy> findByBookIdOrderByAccessionNumberAsc(UUID bookId);

  Optional<BookCopy> findByAccessionNumberIgnoreCase(String accessionNumber);

  long countByBookId(UUID bookId);
}
