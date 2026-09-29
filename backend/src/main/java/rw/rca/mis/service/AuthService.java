package rw.rca.mis.service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import rw.rca.mis.config.JwtService;
import rw.rca.mis.domain.Person;
import rw.rca.mis.repo.PersonRepository;

@Service
public class AuthService {
  private final PersonRepository people;
  private final PasswordEncoder encoder;
  private final JwtService jwt;
  private final MailService mail;
  private final SecureRandom random = new SecureRandom();

  private static final Duration RESET_CODE_TTL = Duration.ofMinutes(15);
  private static final Duration RESET_RESEND_GAP = Duration.ofSeconds(60);
  private static final int RESET_MAX_ATTEMPTS = 5;

  public AuthService(PersonRepository people, PasswordEncoder encoder, JwtService jwt, MailService mail) {
    this.people = people;
    this.encoder = encoder;
    this.jwt = jwt;
    this.mail = mail;
  }

  public Map<String, Object> login(String email, String password) {
    Person person =
        people
            .findByEmailIgnoreCase(email == null ? "" : email.trim())
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Incorrect Email or Password"));
    if (person.getPassword() == null || !encoder.matches(password == null ? "" : password, person.getPassword())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect Email or Password");
    }
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("token", jwt.generate(person));
    data.put("roles", person.roles());
    data.put("user", person);
    return data;
  }

  @Transactional
  public Person updateOwnProfile(Person me, Map<String, Object> body) {
    String first = Lookup.text(body, "firstName");
    String last = Lookup.text(body, "lastName");
    String phone = Lookup.text(body, "phoneNumber");
    String gender = Lookup.text(body, "gender");
    if (first != null) {
      me.setFirstName(first);
    }
    if (last != null) {
      me.setLastName(last);
    }
    if (phone != null) {
      me.setPhoneNumber(phone);
    }
    if (gender != null) {
      me.setGender(gender);
    }
    return people.save(me);
  }

  @Transactional
  public void changePassword(Person me, String current, String next) {
    if (current == null || me.getPassword() == null || !encoder.matches(current, me.getPassword())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
    }
    if (next == null || next.length() < 8) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 8 characters");
    }
    me.setPassword(encoder.encode(next));
    people.save(me);
  }

  /** Never reveals whether the email belongs to an account. */
  @Transactional
  public void initiatePasswordReset(String email) {
    Person person = people.findByEmailIgnoreCase(email == null ? "" : email.trim()).orElse(null);
    if (person == null || person.getEmail() == null) {
      return;
    }
    Instant now = Instant.now();
    Instant expires = person.getResetCodeExpiresAt();
    if (expires != null && expires.minus(RESET_CODE_TTL).plus(RESET_RESEND_GAP).isAfter(now)) {
      return;
    }
    String code = String.format("%06d", random.nextInt(1_000_000));
    person.setResetCodeHash(encoder.encode(code));
    person.setResetCodeExpiresAt(now.plus(RESET_CODE_TTL));
    person.setResetAttempts(0);
    people.save(person);
    mail.sendLater(
        person.getEmail(),
        "Your password reset code",
        "Reset your password",
        """
        <p>Hello %s,</p>
        <p>We received a request to reset the password of your school account. Use this code to continue:</p>
        <p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#024F3A;margin:18px 0">%s</p>
        <p>The code expires in %d minutes. If you did not ask for a password reset, you can ignore this email; your password stays the same.</p>
        """
            .formatted(MailService.escape(person.getFirstName()), code, RESET_CODE_TTL.toMinutes()));
  }

  @Transactional(noRollbackFor = ResponseStatusException.class)
  public void verifyResetCode(String email, String code) {
    checkResetCode(email, code);
  }

  @Transactional(noRollbackFor = ResponseStatusException.class)
  public void resetPassword(String email, String code, String newPassword) {
    if (newPassword == null || newPassword.length() < 8) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 8 characters");
    }
    Person person = checkResetCode(email, code);
    person.setPassword(encoder.encode(newPassword));
    person.setResetCodeHash(null);
    person.setResetCodeExpiresAt(null);
    person.setResetAttempts(0);
    people.save(person);
    mail.sendLater(
        person.getEmail(),
        "Your password was changed",
        "Password changed",
        """
        <p>Hello %s,</p>
        <p>The password of your school account was just reset. If this was you, no action is needed.</p>
        <p>If you did not do this, contact the school IT office immediately.</p>
        """
            .formatted(MailService.escape(person.getFirstName())));
  }

  private Person checkResetCode(String email, String code) {
    ResponseStatusException invalid =
        new ResponseStatusException(HttpStatus.BAD_REQUEST, "The code is invalid or has expired. Request a new one.");
    Person person = people.findByEmailIgnoreCase(email == null ? "" : email.trim()).orElseThrow(() -> invalid);
    if (person.getResetCodeHash() == null
        || person.getResetCodeExpiresAt() == null
        || person.getResetCodeExpiresAt().isBefore(Instant.now())) {
      throw invalid;
    }
    int attempts = person.getResetAttempts() == null ? 0 : person.getResetAttempts();
    if (attempts >= RESET_MAX_ATTEMPTS) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Too many wrong attempts. Request a new code.");
    }
    if (code == null || !encoder.matches(code.trim(), person.getResetCodeHash())) {
      person.setResetAttempts(attempts + 1);
      people.save(person);
      throw invalid;
    }
    return person;
  }
}
