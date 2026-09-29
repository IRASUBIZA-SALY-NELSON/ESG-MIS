package rw.rca.mis.repo;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.NewsItem;

public interface NewsRepository extends JpaRepository<NewsItem, UUID> {}
