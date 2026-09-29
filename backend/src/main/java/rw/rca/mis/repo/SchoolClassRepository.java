package rw.rca.mis.repo;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.SchoolClass;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, UUID> {
  List<SchoolClass> findAllByOrderByClassNameAsc();
}
