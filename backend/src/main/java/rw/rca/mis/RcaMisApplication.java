package rw.rca.mis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class RcaMisApplication {
  public static void main(String[] args) {
    SpringApplication.run(RcaMisApplication.class, args);
  }
}
