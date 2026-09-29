package rw.rca.mis.repo;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.StudentClassTerm;

public interface StudentClassTermRepository extends JpaRepository<StudentClassTerm, UUID> {
  List<StudentClassTerm> findByStudentId(UUID studentId);

  List<StudentClassTerm> findBySchoolClassIdAndTermId(UUID classId, UUID termId);
}
