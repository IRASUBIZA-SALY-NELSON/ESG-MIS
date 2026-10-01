package rw.rca.mis.service;

import jakarta.annotation.PreDestroy;
import jakarta.mail.internet.MimeMessage;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
public class MailService {
  private static final Logger log = LoggerFactory.getLogger(MailService.class);

  private final JavaMailSender sender;
  private final ExecutorService background =
      Executors.newFixedThreadPool(
          2,
          runnable -> {
            Thread thread = new Thread(runnable, "mail-sender");
            thread.setDaemon(true);
            return thread;
          });

  @Value("${spring.mail.username:}")
  private String username;

  @Value("${app.mail.from-name:Ecole des Sciences de Gisenyi}")
  private String fromName;

  public MailService(JavaMailSender sender) {
    this.sender = sender;
  }

  @PreDestroy
  void shutdownMailPool() {
    background.shutdownNow();
    try {
      background.awaitTermination(2, TimeUnit.SECONDS);
    } catch (InterruptedException interrupted) {
      Thread.currentThread().interrupt();
    }
  }

  public boolean isConfigured() {
    return username != null && !username.isBlank();
  }

  public String senderAddress() {
    return username;
  }

  /** Sends now and throws on failure, so callers can report the SMTP error. */
  public void send(String to, String subject, String heading, String bodyHtml) {
    if (!isConfigured()) {
      throw new IllegalStateException("Email is not configured on the server");
    }
    try {
      MimeMessage message = sender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(username, fromName);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(plainText(heading, bodyHtml), layout(heading, bodyHtml));
      sender.send(message);
      log.info("Email sent to {}: {}", to, subject);
    } catch (Exception e) {
      log.warn("Email to {} failed: {}", to, e.getMessage());
      throw new IllegalStateException("Could not send email: " + e.getMessage(), e);
    }
  }

  /** Sends in the background; failures are only logged. */
  public void sendLater(String to, String subject, String heading, String bodyHtml) {
    if (!isConfigured()) {
      log.warn("Email not configured; skipped \"{}\" to {}", subject, to);
      return;
    }
    background.submit(
        () -> {
          try {
            send(to, subject, heading, bodyHtml);
          } catch (Exception ignored) {
            // already logged in send()
          }
        });
  }

  public static String escape(String value) {
    return value == null ? "" : HtmlUtils.htmlEscape(value);
  }

  private String layout(String heading, String bodyHtml) {
    return """
        <div style="margin:0;padding:24px;background:#f3f7f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
            <div style="background:#024F3A;padding:18px 24px;color:#ffffff">
              <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#FCB90A">%s</div>
              <div style="font-size:20px;font-weight:bold;margin-top:4px">%s</div>
            </div>
            <div style="padding:24px;font-size:14px;line-height:1.6">%s</div>
            <div style="padding:14px 24px;background:#f9fafb;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb">
              This message was sent automatically by the %s management system. Please do not reply to it.
            </div>
          </div>
        </div>
        """
        .formatted(escape(fromName), escape(heading), bodyHtml, escape(fromName));
  }

  private String plainText(String heading, String bodyHtml) {
    String text = bodyHtml.replaceAll("(?i)<br\\s*/?>|</p>|</div>|</li>", "\n").replaceAll("<[^>]+>", "");
    return heading + "\n\n" + HtmlUtils.htmlUnescape(text).trim() + "\n\n— " + fromName;
  }
}
