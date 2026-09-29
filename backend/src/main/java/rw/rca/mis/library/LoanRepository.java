package rw.rca.mis.library;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoanRepository extends JpaRepository<Loan, UUID> {
  List<Loan> findAllByOrderByIssuedAtDesc();

  List<Loan> findByStatusOrderByDueDateAsc(String status);

  List<Loan> findByBorrowerIdOrderByIssuedAtDesc(UUID borrowerId);

  List<Loan> findByCopyBookIdOrderByIssuedAtDesc(UUID bookId);

  List<Loan> findByCopyIdAndStatus(UUID copyId, String status);

  long countByBorrowerIdAndStatus(UUID borrowerId, String status);

  long countByCopyId(UUID copyId);
}
