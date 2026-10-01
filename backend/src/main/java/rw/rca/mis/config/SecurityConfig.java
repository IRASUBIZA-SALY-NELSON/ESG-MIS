package rw.rca.mis.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {
  private static final String[] SCHOOL_ROLES = {"ADMIN", "PM", "DOS", "TEACHER", "DS", "ACCOUNTANT", "STUDENT", "STAFF"};

  private final JwtAuthFilter jwtAuthFilter;
  private final AuditFilter auditFilter;

  @Value("${app.cors.origins}")
  private String origins;

  public SecurityConfig(JwtAuthFilter jwtAuthFilter, AuditFilter auditFilter) {
    this.jwtAuthFilter = jwtAuthFilter;
    this.auditFilter = auditFilter;
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(AbstractHttpConfigurer::disable)
        .cors(Customizer.withDefaults())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers(
                        "/api/v1/auth/login",
                        "/api/v1/auth/initiate-reset-password",
                        "/api/v1/auth/reset-password",
                        "/api/v1/auth/verify-reset-code",
                        "/api/v1/auth/verify-account",
                        "/api/v1/academicMarks/report-card/by-parent",
                        "/api/v1/academicMarks/report-card-document/by-parent",
                        "/api/v1/deductions/ds-marks/by-parent",
                        "/api/parents/destructure-token/**")
                    .permitAll()
                    .requestMatchers("/api/v1/parent-portal/**")
                    .hasRole("PARENT")
                    .requestMatchers("/api/v1/finance/me", "/api/v1/finance/me/**")
                    .hasRole("STUDENT")
                    .requestMatchers(HttpMethod.GET, "/api/v1/finance/**")
                    .hasAnyRole("ACCOUNTANT", "PM", "ADMIN")
                    .requestMatchers("/api/v1/finance/**")
                    .hasRole("ACCOUNTANT")
                    .requestMatchers("/api/v1/library/me", "/api/v1/library/me/**")
                    .hasAnyRole("STUDENT", "TEACHER", "STAFF", "LIBRARIAN")
                    .requestMatchers("/api/v1/library/bills/**")
                    .hasAnyRole("LIBRARIAN", "ADMIN")
                    .requestMatchers("/api/v1/library/**")
                    .hasAnyRole("LIBRARIAN", "ADMIN")
                    .requestMatchers("/api/v1/notes/me", "/api/v1/notes/me/**")
                    .hasRole("STUDENT")
                    .requestMatchers("/api/v1/notes/teaching", "/api/v1/notes/teaching/**")
                    .hasAnyRole("TEACHER", "ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/v1/notes/*/file")
                    .hasAnyRole("STUDENT", "TEACHER", "ADMIN")
                    .requestMatchers("/api/v1/notes/**")
                    .denyAll()
                    .requestMatchers("/api/v1/parents/**")
                    .hasAnyRole("ADMIN", "PM", "DOS")
                    .requestMatchers("/api/v1/audit", "/api/v1/audit/**")
                    .hasRole("ADMIN")
                    .requestMatchers("/api/v1/auth/profile", "/api/v1/auth/profile/**", "/api/v1/auth/change-password")
                    .authenticated()
                    // Parents are deliberately excluded: they only see their own children via /parent-portal.
                    .anyRequest()
                    .hasAnyRole(SCHOOL_ROLES))
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .addFilterBefore(auditFilter, JwtAuthFilter.class);
    return http.build();
  }

  /** Keep the audit filter inside Spring Security only, so it does not run twice. */
  @Bean
  FilterRegistrationBean<AuditFilter> auditFilterRegistration(AuditFilter filter) {
    FilterRegistrationBean<AuditFilter> registration = new FilterRegistrationBean<>(filter);
    registration.setEnabled(false);
    return registration;
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(Arrays.asList(origins.split(",")));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}
