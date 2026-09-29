package rw.rca.mis.finance;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BillRepository extends JpaRepository<Bill, UUID> {
  List<Bill> findAllByOrderByCreatedAtDesc();

  List<Bill> findByDepartmentOrderByCreatedAtDesc(String department);

  List<Bill> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

  List<Bill> findByStudentIdAndStatusOrderByCreatedAtDesc(UUID studentId, String status);

  long countByBillNumberStartingWith(String prefix);

  boolean existsByBillNumber(String billNumber);

  @Query(
      "select count(i) > 0 from BillItem i where i.loanId = ?1 and i.bill.status <> 'CANCELLED'")
  boolean loanAlreadyBilled(UUID loanId);
}
