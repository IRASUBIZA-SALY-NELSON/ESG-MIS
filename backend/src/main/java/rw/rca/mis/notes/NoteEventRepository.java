package rw.rca.mis.notes;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface NoteEventRepository extends JpaRepository<NoteEvent, UUID> {
  List<NoteEvent> findByNoteIdInAndAtAfterOrderByAtDesc(Collection<UUID> noteIds, LocalDateTime after);

  List<NoteEvent> findByNoteIdAndAtAfterOrderByAtDesc(UUID noteId, LocalDateTime after);

  @Modifying
  @Query("delete from NoteEvent e where e.note.id = :noteId")
  void deleteByNoteId(UUID noteId);
}
