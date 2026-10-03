package rw.rca.mis.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

/** Maps Render Postgres {@code DATABASE_URL} (postgres://…) to a JDBC pool for Spring Data JPA. */
@Configuration
@Profile("!test")
@ConditionalOnProperty(name = "DATABASE_URL")
public class RenderDatabaseConfig {

  @Bean
  @Primary
  DataSource renderDataSource(@Value("${DATABASE_URL}") String databaseUrl) {
    URI uri = parseUri(databaseUrl);
    String userInfo = uri.getUserInfo();
    if (userInfo == null || userInfo.isBlank()) {
      throw new IllegalStateException("DATABASE_URL must include username and password");
    }
    String[] creds = userInfo.split(":", 2);
    String username = decode(creds[0]);
    String password = creds.length > 1 ? decode(creds[1]) : "";

    HikariConfig config = new HikariConfig();
    config.setJdbcUrl(toJdbcUrl(uri));
    config.setUsername(username);
    config.setPassword(password);
    config.setDriverClassName("org.postgresql.Driver");
    config.setMaximumPoolSize(5);
    return new HikariDataSource(config);
  }

  private static URI parseUri(String url) {
    String normalized = url.trim();
    if (normalized.startsWith("postgres://")) {
      normalized = "postgresql://" + normalized.substring("postgres://".length());
    }
    return URI.create(normalized);
  }

  private static String toJdbcUrl(URI uri) {
    StringBuilder jdbc = new StringBuilder("jdbc:postgresql://");
    jdbc.append(uri.getHost());
    if (uri.getPort() > 0) {
      jdbc.append(':').append(uri.getPort());
    }
    jdbc.append(uri.getRawPath());
    if (uri.getRawQuery() != null && !uri.getRawQuery().isBlank()) {
      jdbc.append('?').append(uri.getRawQuery());
    } else {
      jdbc.append("?sslmode=require");
    }
    return jdbc.toString();
  }

  private static String decode(String value) {
    return URLDecoder.decode(value, StandardCharsets.UTF_8);
  }
}
