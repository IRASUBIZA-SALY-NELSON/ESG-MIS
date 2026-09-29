package rw.rca.mis.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(
    name = "audit_events",
    indexes = {
      @Index(name = "idx_audit_created", columnList = "createdAt"),
      @Index(name = "idx_audit_module", columnList = "module"),
      @Index(name = "idx_audit_actor", columnList = "actorEmail")
    })
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AuditEvent extends BaseEntity {
  private UUID actorId;
  private String actorName;
  private String actorEmail;
  private String actorRole;

  @Column(nullable = false, length = 16)
  private String method;

  @Column(nullable = false, length = 512)
  private String path;

  @Column(length = 512)
  private String queryString;

  @Column(nullable = false, length = 160)
  private String action;

  @Column(nullable = false, length = 40)
  private String module;

  @Column(nullable = false)
  private int status;

  @Column(nullable = false, length = 16)
  private String outcome;

  private String ip;
  private String userAgent;
  private long durationMs;

  @Lob
  @Column(length = 4000)
  private String detail;
}
