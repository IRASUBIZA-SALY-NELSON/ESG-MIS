package rw.rca.mis.repo;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.Term;

public interface TermRepository extends JpaRepository<Term, UUID> {
  List<Term> findByAcademicYearIdOrderByStartDateAsc(UUID academicYearId);

  List<Term> findAllByOrderByStartDateAsc();
}
