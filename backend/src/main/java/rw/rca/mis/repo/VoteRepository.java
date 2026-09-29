package rw.rca.mis.repo;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.Vote;

public interface VoteRepository extends JpaRepository<Vote, UUID> {}
