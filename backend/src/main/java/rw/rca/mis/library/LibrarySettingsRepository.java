package rw.rca.mis.library;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LibrarySettingsRepository extends JpaRepository<LibrarySettings, UUID> {}
