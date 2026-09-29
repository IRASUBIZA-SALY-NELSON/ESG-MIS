package rw.rca.mis.service;

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

  public AuthService(PersonRepository people, PasswordEncoder encoder, JwtService jwt) {
    this.people = people;
    this.encoder = encoder;
    this.jwt = jwt;
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
}
