package rw.rca.mis.notes;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CourseNoteRepository extends JpaRepository<CourseNote, UUID> {
  List<CourseNote> findByTeacherIdOrderByCreatedAtDesc(UUID teacherId);

  @Query("select distinct n from CourseNote n join n.classes c where c.id = :classId and n.status = 'PUBLISHED'")
  List<CourseNote> findPublishedForClass(UUID classId);

  List<CourseNote> findByPreviewStatus(String previewStatus);
}
