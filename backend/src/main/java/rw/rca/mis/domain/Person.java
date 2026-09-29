package rw.rca.mis.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "people")
@JsonIgnoreProperties({
  "hibernateLazyInitializer", "handler", "password", "resetCodeHash", "resetCodeExpiresAt", "resetAttempts"
})
public class Person extends BaseEntity {
  private String firstName;
  private String lastName;

  @Column(unique = true)
  private String email;

  private String username;

  @JsonIgnore
  private String password;

  @JsonIgnore
  private String resetCodeHash;

  @JsonIgnore
  private Instant resetCodeExpiresAt;

  @JsonIgnore
  private Integer resetAttempts;

  private String gender = "MALE";
  private String status = "ACTIVE";
  private String phoneNumber;
  private String nationalId;
  private String roleName;
  private String staffKind;
  private String studentStatus = "ACTIVE";

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"courses", "classTeacher", "students"})
  private SchoolClass currentClass;

  @JsonProperty("currentClazz")
  public SchoolClass getCurrentClazz() {
    return currentClass;
  }

  @JsonProperty("roles")
  public List<Map<String, String>> roles() {
    if (roleName == null) {
      return List.of();
    }
    return List.of(Map.of("roleName", roleName));
  }

  @JsonProperty("fullName")
  public String fullName() {
    return ((firstName == null ? "" : firstName) + " " + (lastName == null ? "" : lastName)).trim();
  }
}
