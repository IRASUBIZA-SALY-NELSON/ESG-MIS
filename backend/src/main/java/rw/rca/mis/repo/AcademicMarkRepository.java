package rw.rca.mis.repo;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.AcademicMark;

public interface AcademicMarkRepository extends JpaRepository<AcademicMark, UUID> {
  List<AcademicMark> findByStudentId(UUID studentId);

  List<AcademicMark> findByTermId(UUID termId);

  List<AcademicMark> findByStudentIdAndCourseIdAndTermIdAndMarkType(
      UUID studentId, UUID courseId, UUID termId, String markType);

  long countByTermId(UUID termId);
}
