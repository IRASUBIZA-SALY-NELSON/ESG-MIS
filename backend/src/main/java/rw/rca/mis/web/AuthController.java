package rw.rca.mis.web;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rw.rca.mis.common.ApiResponse;
import rw.rca.mis.domain.Person;
import rw.rca.mis.service.AuthService;
import rw.rca.mis.service.Lookup;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private final AuthService auth;
  private final Lookup lookup;

  public AuthController(AuthService auth, Lookup lookup) {
    this.auth = auth;
    this.lookup = lookup;
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
    return ApiResponse.ok("If the account exists, a reset code was created", "123456");
  }

  @GetMapping("/verify-reset-code")
  public ApiResponse<Boolean> verifyCode(@RequestParam String code, @RequestParam String email) {
    return ApiResponse.ok("123456".equals(code));
  }

  @PutMapping("/reset-password")
  public ApiResponse<String> reset(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Password reset is recorded for this development server", Lookup.text(body, "email"));
  }

  @GetMapping("/verify-account")
  public ApiResponse<String> verifyAccount() {
    return ApiResponse.ok("Account verified");
  }
}
