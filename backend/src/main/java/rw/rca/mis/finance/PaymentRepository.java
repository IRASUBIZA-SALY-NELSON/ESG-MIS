package rw.rca.mis.finance;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
  List<Payment> findAllByOrderByCreatedAtDesc();

  List<Payment> findByBillIdOrderByCreatedAtAsc(UUID billId);

  List<Payment> findByBillStudentIdOrderByCreatedAtDesc(UUID studentId);

  long countByReceiptNumberStartingWith(String prefix);

  boolean existsByReceiptNumber(String receiptNumber);
}
