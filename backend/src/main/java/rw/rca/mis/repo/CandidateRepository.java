package rw.rca.mis.repo;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.Candidate;

public interface CandidateRepository extends JpaRepository<Candidate, UUID> {
  List<Candidate> findByStudentId(UUID studentId);
}
