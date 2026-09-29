package rw.rca.mis.web;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import rw.rca.mis.common.ApiResponse;
import rw.rca.mis.domain.Person;
import rw.rca.mis.service.AuthService;
import rw.rca.mis.service.Lookup;
import rw.rca.mis.service.MailService;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private final AuthService auth;
  private final Lookup lookup;
  private final MailService mail;

  public AuthController(AuthService auth, Lookup lookup, MailService mail) {
    this.auth = auth;
    this.lookup = lookup;
    this.mail = mail;
  }

  @PostMapping("/login")
  public ApiResponse<Map<String, Object>> login(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Logged in", auth.login(Lookup.text(body, "email"), Lookup.text(body, "password")));
  }

  @GetMapping("/profile")
  public ApiResponse<?> profile() {
    Person me = lookup.currentUser();
    return ApiResponse.ok(Map.of("user", me, "person", me));
  }

  @PatchMapping("/profile/{id}")
  public ApiResponse<?> updateProfile(@RequestBody Map<String, Object> body) {
    Person me = auth.updateOwnProfile(lookup.currentUser(), body);
    return ApiResponse.ok("Profile updated", Map.of("user", me, "person", me));
  }

  @PutMapping("/change-password")
  public ApiResponse<String> changePassword(@RequestBody Map<String, Object> body) {
    auth.changePassword(
        lookup.currentUser(),
        Lookup.text(body, "currentPassword", "oldPassword"),
        Lookup.text(body, "newPassword", "password"));
    return ApiResponse.ok("Password changed", null);
  }

  @PostMapping("/initiate-reset-password")
  public ApiResponse<String> initiate(@RequestParam String email) {
    auth.initiatePasswordReset(email);
    return ApiResponse.ok("If an account uses this email, a reset code has been sent to it", null);
  }

  @GetMapping("/verify-reset-code")
  public ApiResponse<Boolean> verifyCode(@RequestParam String code, @RequestParam String email) {
    auth.verifyResetCode(email, code);
    return ApiResponse.ok("Code verified", true);
  }

  @PutMapping("/reset-password")
  public ApiResponse<String> reset(@RequestBody Map<String, Object> body) {
    auth.resetPassword(
        Lookup.text(body, "email"), Lookup.text(body, "code"), Lookup.text(body, "newPassword", "password"));
    return ApiResponse.ok("Password has been reset", null);
  }

  @PostMapping("/mail/test")
  public ApiResponse<String> testMail(@RequestBody(required = false) Map<String, Object> body) {
    Person me = lookup.currentUser();
    if (!"ADMIN".equals(me.getRoleName())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the IT Manager can send test emails");
    }
    String to = body == null ? null : Lookup.text(body, "to", "email");
    String target = to == null ? me.getEmail() : to;
    try {
      mail.send(
          target,
          "Test email from the school system",
          "Email is working",
          "<p>This is a test message sent by %s from the school management system.</p><p>If you received it, email notifications are set up correctly.</p>"
              .formatted(MailService.escape(me.fullName())));
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, e.getMessage());
    }
    return ApiResponse.ok("Test email sent to " + target, target);
  }

  @GetMapping("/verify-account")
  public ApiResponse<String> verifyAccount() {
    return ApiResponse.ok("Account verified");
  }
}
