package rw.rca.mis.repo;

import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rw.rca.mis.domain.AuditEvent;

public interface AuditEventRepository extends JpaRepository<AuditEvent, UUID> {
  @Query(
      """
      SELECT e FROM AuditEvent e
      WHERE (:module = '' OR e.module = :module)
        AND (:outcome = '' OR e.outcome = :outcome)
        AND (:role = '' OR e.actorRole = :role)
        AND (
          :q = '' OR LOWER(CONCAT(
            COALESCE(e.actorName, ''), ' ',
            COALESCE(e.actorEmail, ''), ' ',
            COALESCE(e.action, ''), ' ',
            COALESCE(e.path, ''), ' ',
            COALESCE(e.detail, '')
          )) LIKE LOWER(CONCAT('%', :q, '%'))
        )
      """)
  Page<AuditEvent> search(
      @Param("q") String q,
      @Param("module") String module,
      @Param("outcome") String outcome,
      @Param("role") String role,
      Pageable pageable);

  long countByCreatedAtAfter(Instant after);

  long countByCreatedAtAfterAndOutcome(Instant after, String outcome);

  long countByCreatedAtAfterAndModule(Instant after, String module);
}
