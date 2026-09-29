package rw.rca.mis.web;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import rw.rca.mis.config.DataSeeder;
import rw.rca.mis.service.PeopleService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StudentApiTests {
  @Autowired private MockMvc mvc;
  @Autowired private ObjectMapper mapper;
  @Autowired private PeopleService people;

  private String token;

  @BeforeEach
  void adminLogin() throws Exception {
    String email = "itest.admin+" + UUID.randomUUID().toString().substring(0, 8) + "@esg.test";
    people.create(
        "ADMIN",
        Map.of(
            "firstName",
            "Test",
            "lastName",
            "Admin",
            "email",
            email,
            "gender",
            "FEMALE",
            "password",
            DataSeeder.PASSWORD));
    String body =
        mvc.perform(
                post("/api/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(Map.of("email", email, "password", DataSeeder.PASSWORD))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    JsonNode json = mapper.readTree(body);
    token = json.path("data").path("token").asText();
  }

  @Test
  void createStudentAcceptsJsonAndNormalizesGender() throws Exception {
    String email = "itest.student+" + UUID.randomUUID().toString().substring(0, 8) + "@esg.test";
    mvc.perform(
            post("/api/v1/students/create")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    mapper.writeValueAsString(
                        Map.of(
                            "firstName",
                            "Keza",
                            "lastName",
                            "Uwase",
                            "email",
                            email,
                            "gender",
                            "Female",
                            "father",
                            Map.of("fullName", "Jean Bosco", "email", "father." + email)))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.gender").value("FEMALE"))
        .andExpect(jsonPath("$.data.roleName").value("STUDENT"));
  }

  @Test
  void createStudentRejectsDuplicateEmail() throws Exception {
    String email = "itest.dup+" + UUID.randomUUID().toString().substring(0, 8) + "@esg.test";
    Map<String, Object> payload = Map.of("firstName", "Aline", "lastName", "Iradukunda", "email", email, "gender", "Female");
    mvc.perform(
            post("/api/v1/students/create")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
        .andExpect(status().isOk());
    mvc.perform(
            post("/api/v1/students/create")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message", containsString("already exists")));
  }

  @Test
  void importStudentsReadsExcelStyleHeaders() throws Exception {
    String email = "itest.import+" + UUID.randomUUID().toString().substring(0, 8) + "@esg.test";
    mvc.perform(
            post("/api/v1/students/import")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    mapper.writeValueAsString(
                        List.of(
                            Map.of(
                                "First Name",
                                "Import",
                                "Last Name",
                                "Keza",
                                "Email",
                                email,
                                "Gender",
                                "Male")))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.created").value(1))
        .andExpect(jsonPath("$.data.failed").value(0));
  }
}
