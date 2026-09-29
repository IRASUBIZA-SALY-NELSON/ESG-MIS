package rw.rca.mis.repo;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.TeacherAssignment;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, UUID> {
  List<TeacherAssignment> findByTeacherId(UUID teacherId);

  List<TeacherAssignment> findByCourseIdAndTermId(UUID courseId, UUID termId);

  List<TeacherAssignment> findBySchoolClassId(UUID classId);
}
