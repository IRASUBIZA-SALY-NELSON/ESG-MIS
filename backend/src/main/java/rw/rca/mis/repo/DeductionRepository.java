package rw.rca.mis.repo;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.Deduction;

public interface DeductionRepository extends JpaRepository<Deduction, UUID> {
  List<Deduction> findByStudentId(UUID studentId);

  List<Deduction> findByTermId(UUID termId);

  List<Deduction> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
}
