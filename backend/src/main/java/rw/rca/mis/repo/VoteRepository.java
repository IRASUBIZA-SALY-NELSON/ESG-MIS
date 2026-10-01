package rw.rca.mis.repo;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.Vote;

public interface VoteRepository extends JpaRepository<Vote, UUID> {
  List<Vote> findBySessionId(UUID sessionId);
}
