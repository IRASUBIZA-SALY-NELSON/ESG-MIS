package rw.rca.mis.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.SchoolClass;
import rw.rca.mis.repo.PersonRepository;
import rw.rca.mis.repo.SchoolClassRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class YearPromotionTests {
  @Autowired private AcademicService academic;
  @Autowired private PeopleService people;
  @Autowired private PersonRepository personRepository;
  @Autowired private SchoolClassRepository classes;

  @Test
  void newYearPromotesStudentsAndGraduatesSeniorSix() {
    SchoolClass s1a = clazz("S1 A", "S1A");
    SchoolClass s2a = clazz("S2 A", "S2A");
    SchoolClass s2b = clazz("S2 B", "S2B");
    SchoolClass s5 = clazz("S5 PCB", "S5PCB");
    SchoolClass s6 = clazz("S6 MCB", "S6MCB");

    Person junior = student("Keza", s1a, "ACTIVE");
    Person otherStream = student("Eric", clazz("S1 B", "S1B"), "ENROLLED");
    Person repeating = student("Aline", s1a, "REPEATING");
    Person seniorFive = student("Patrick", s5, "ACTIVE");
    Person seniorSix = student("Diane", s6, "ACTIVE");
    Person dropout = student("Grace", s2a, "DROPOUT");

    academic.createYear(Map.of("name", "2028/2029", "startYear", 2028, "endYear", 2029));

    assertEquals(s2a.getId(), reload(junior).getCurrentClass().getId());
    assertEquals(s2b.getId(), reload(otherStream).getCurrentClass().getId());
    assertEquals(s1a.getId(), reload(repeating).getCurrentClass().getId());
    assertEquals("REPEATING", reload(repeating).getStudentStatus());
    assertEquals(s6.getId(), reload(seniorFive).getCurrentClass().getId());
    assertEquals("ALUMNI", reload(seniorSix).getStudentStatus());
    assertNull(reload(seniorSix).getCurrentClass());
    assertEquals(s2a.getId(), reload(dropout).getCurrentClass().getId());
    assertEquals("DROPOUT", reload(dropout).getStudentStatus());
    assertTrue(
        people.studentsInClass(s6.getId()).stream().noneMatch(student -> student.getId().equals(seniorSix.getId())));
    assertEquals(1, people.studentsInClass(s6.getId()).size());
    assertTrue(people.alumni().stream().anyMatch(student -> student.getId().equals(seniorSix.getId())));
  }

  private SchoolClass clazz(String name, String code) {
    SchoolClass schoolClass = new SchoolClass();
    schoolClass.setClassName(name);
    schoolClass.setCode(code);
    return classes.save(schoolClass);
  }

  private Person student(String firstName, SchoolClass schoolClass, String status) {
    Person student =
        people.create(
            "STUDENT",
            Map.of(
                "firstName",
                firstName,
                "lastName",
                "Promotion",
                "email",
                firstName.toLowerCase() + "." + UUID.randomUUID().toString().substring(0, 8) + "@esg.test",
                "classId",
                schoolClass.getId().toString()));
    student.setStudentStatus(status);
    return personRepository.save(student);
  }

  private Person reload(Person student) {
    return personRepository.findById(student.getId()).orElseThrow();
  }
}
