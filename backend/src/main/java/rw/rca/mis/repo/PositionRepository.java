package rw.rca.mis.repo;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.Position;

public interface PositionRepository extends JpaRepository<Position, UUID> {}
