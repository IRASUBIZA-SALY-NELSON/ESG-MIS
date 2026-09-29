package rw.rca.mis.repo;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.Timetable;

public interface TimetableRepository extends JpaRepository<Timetable, UUID> {
  Optional<Timetable> findByTermId(UUID termId);
}
