package rw.rca.mis.repo;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.Appeal;

public interface AppealRepository extends JpaRepository<Appeal, UUID> {
  List<Appeal> findByKindOrderByCreatedAtDesc(String kind);

  List<Appeal> findByTeacherIdAndStatus(UUID teacherId, String status);

  List<Appeal> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
}
