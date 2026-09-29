package rw.rca.mis.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "votes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Vote extends BaseEntity {
  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"password"})
  private Person voter;

  @ManyToOne(fetch = FetchType.EAGER)
  private Candidate candidate;

  @ManyToOne(fetch = FetchType.EAGER)
  private Position position;

  @ManyToOne(fetch = FetchType.EAGER)
  private VotingSession session;
}
