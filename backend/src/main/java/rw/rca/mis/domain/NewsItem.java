package rw.rca.mis.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import rw.rca.mis.common.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "news_items")
public class NewsItem extends BaseEntity {
  private String title;

  @Lob
  private String body;

  private String image;
}
