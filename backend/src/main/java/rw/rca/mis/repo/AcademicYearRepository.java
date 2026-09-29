package rw.rca.mis.repo;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.AcademicYear;

public interface AcademicYearRepository extends JpaRepository<AcademicYear, UUID> {
  List<AcademicYear> findAllByOrderByStartYearDesc();
}
