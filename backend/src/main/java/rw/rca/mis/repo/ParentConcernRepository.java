package rw.rca.mis.repo;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.ParentConcern;

public interface ParentConcernRepository extends JpaRepository<ParentConcern, UUID> {
  List<ParentConcern> findByParentIdOrderByCreatedAtDesc(UUID parentId);

  List<ParentConcern> findAllByOrderByCreatedAtDesc();

  long countByParentIdAndStudentIdAndStatus(UUID parentId, UUID studentId, String status);
}
