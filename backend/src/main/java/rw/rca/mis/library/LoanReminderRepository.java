package rw.rca.mis.library;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoanReminderRepository extends JpaRepository<LoanReminder, UUID> {
  List<LoanReminder> findAllByOrderBySentAtDesc();

  List<LoanReminder> findByLoanBorrowerIdOrderBySentAtDesc(UUID borrowerId);

  List<LoanReminder> findByLoanIdOrderBySentAtDesc(UUID loanId);

  void deleteByLoanId(UUID loanId);
}
