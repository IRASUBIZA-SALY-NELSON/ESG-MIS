package rw.rca.mis.notes;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface NoteReadRepository extends JpaRepository<NoteRead, UUID> {
  Optional<NoteRead> findByNoteIdAndStudentId(UUID noteId, UUID studentId);

  List<NoteRead> findByNoteId(UUID noteId);

  List<NoteRead> findByNoteIdIn(Collection<UUID> noteIds);

  List<NoteRead> findByStudentId(UUID studentId);

  @Modifying
  @Query("delete from NoteRead r where r.note.id = :noteId")
  void deleteByNoteId(UUID noteId);
}
