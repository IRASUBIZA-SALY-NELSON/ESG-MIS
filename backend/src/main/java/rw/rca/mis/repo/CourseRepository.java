package rw.rca.mis.repo;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.Course;

public interface CourseRepository extends JpaRepository<Course, UUID> {
  List<Course> findAllByOrderByCourseNameAsc();
}
