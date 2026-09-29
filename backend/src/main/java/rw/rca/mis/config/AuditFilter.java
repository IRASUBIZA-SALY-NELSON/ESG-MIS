package rw.rca.mis.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import rw.rca.mis.service.AuditService;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class AuditFilter extends OncePerRequestFilter {
  private final AuditService audit;

  public AuditFilter(AuditService audit) {
    this.audit = audit;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    ContentCachingRequestWrapper wrapped =
        request instanceof ContentCachingRequestWrapper cached
            ? cached
            : new ContentCachingRequestWrapper(request, 4096);
    long started = System.nanoTime();
    try {
      filterChain.doFilter(wrapped, response);
    } finally {
      try {
        audit.record(wrapped, response, started);
      } catch (Exception ignored) {
        // Audit must never break the real request.
      }
    }
  }
}
