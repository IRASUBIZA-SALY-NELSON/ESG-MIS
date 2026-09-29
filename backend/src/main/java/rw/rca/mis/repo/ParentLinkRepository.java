package rw.rca.mis.repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.ParentLink;

public interface ParentLinkRepository extends JpaRepository<ParentLink, UUID> {
  List<ParentLink> findByParentId(UUID parentId);

  List<ParentLink> findByStudentId(UUID studentId);

  Optional<ParentLink> findByParentIdAndStudentId(UUID parentId, UUID studentId);

  List<ParentLink> findByReportCardToken(String reportCardToken);

  boolean existsByReportCardTokenAndStudentId(String reportCardToken, UUID studentId);
}
