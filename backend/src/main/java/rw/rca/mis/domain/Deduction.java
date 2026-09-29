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
@Table(name = "deductions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Deduction extends BaseEntity {
  private Double marks;
  private String reason;
  private String deductionStatus = "ACTIVE";
  private String lockStatus = "UNLOCKED";
  private String visibility = "VISIBLE";

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"password", "currentClass"})
  private Person student;

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"password", "currentClass"})
  private Person staffMember;

  @ManyToOne(fetch = FetchType.EAGER)
  private CaseCategory casesCategories;

  @ManyToOne(fetch = FetchType.EAGER)
  private Term term;

  @ManyToOne(fetch = FetchType.EAGER)
  private AcademicYear academicYear;

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"courses", "classTeacher"})
  private SchoolClass myClazz;
}
