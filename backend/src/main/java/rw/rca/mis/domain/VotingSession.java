package rw.rca.mis.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "voting_sessions")
public class VotingSession extends BaseEntity {
  private String title;
  private LocalDate startDate;
  private LocalDate endDate;
  private String resultStatus = "HOLD";

  @ManyToMany(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"academicYear"})
  private Set<Position> positions = new HashSet<>();
}
