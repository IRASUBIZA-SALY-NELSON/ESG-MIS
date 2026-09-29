package rw.rca.mis.library;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, UUID> {
  List<Book> findAllByOrderByTitleAsc();

  Optional<Book> findByIsbnIgnoreCase(String isbn);
}
