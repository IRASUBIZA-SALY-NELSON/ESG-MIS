package rw.rca.mis.repo;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.CaseCategory;

public interface CaseCategoryRepository extends JpaRepository<CaseCategory, UUID> {}
