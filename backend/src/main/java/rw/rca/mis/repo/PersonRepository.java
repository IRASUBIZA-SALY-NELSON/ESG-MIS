package rw.rca.mis.repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.rca.mis.domain.Person;

public interface PersonRepository extends JpaRepository<Person, UUID> {
  Optional<Person> findByEmailIgnoreCase(String email);

  List<Person> findByRoleNameOrderByFirstNameAsc(String roleName);

  long countByRoleName(String roleName);

  List<Person> findByCurrentClassIdAndRoleName(UUID classId, String roleName);
}
