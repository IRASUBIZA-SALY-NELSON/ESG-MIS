package rw.rca.mis.repo;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.AppealComment;

public interface AppealCommentRepository extends JpaRepository<AppealComment, UUID> {
  List<AppealComment> findByAppealIdOrderByCreatedAtAsc(UUID appealId);
}
