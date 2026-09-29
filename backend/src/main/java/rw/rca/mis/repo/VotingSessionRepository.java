package rw.rca.mis.repo;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.VotingSession;

public interface VotingSessionRepository extends JpaRepository<VotingSession, UUID> {}
