package rw.rca.mis.repo;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.PastPaper;

public interface PastPaperRepository extends JpaRepository<PastPaper, UUID> {
  List<PastPaper> findByCourseId(UUID courseId);
}
