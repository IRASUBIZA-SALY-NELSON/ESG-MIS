package rw.rca.mis.finance;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/** Stores payment proof files (photos of slips, Mobile Money screenshots, PDFs). */
@Component
public class PaymentProofStorage {
  public static final long MAX_BYTES = 8L * 1024 * 1024;

  private static final Map<String, String> TYPES =
      Map.of(
          "pdf", "application/pdf",
          "png", "image/png",
          "jpg", "image/jpeg",
          "jpeg", "image/jpeg",
          "webp", "image/webp");

  private final Path root;

  public PaymentProofStorage(@Value("${app.finance.proof-dir:./data/payment-proofs}") String dir) throws IOException {
    this.root = Path.of(dir).toAbsolutePath().normalize();
    Files.createDirectories(root);
  }

  public StoredProof store(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw bad("Upload a photo or PDF of the payment as proof");
    }
    if (file.getSize() > MAX_BYTES) {
      throw bad("Proof files can be at most 8 MB");
    }
    String original = clean(file.getOriginalFilename());
    String ext = extension(original);
    if (!TYPES.containsKey(ext)) {
      throw bad("Proof must be a PDF or image (png, jpg, webp)");
    }
    String stored = UUID.randomUUID() + "." + ext;
    try (InputStream in = file.getInputStream()) {
      Files.copy(in, root.resolve(stored), StandardCopyOption.REPLACE_EXISTING);
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save the proof file");
    }
    return new StoredProof(stored, original, TYPES.get(ext), file.getSize());
  }

  public Path path(String storedName) {
    Path p = root.resolve(storedName).normalize();
    if (!p.startsWith(root) || !Files.exists(p)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The proof file is no longer available");
    }
    return p;
  }

  public void delete(String storedName) {
    if (storedName == null) {
      return;
    }
    try {
      Files.deleteIfExists(root.resolve(storedName).normalize());
    } catch (IOException ignored) {
      // best-effort cleanup
    }
  }

  private static String clean(String name) {
    if (name == null || name.isBlank()) {
      return "proof.jpg";
    }
    return Path.of(name).getFileName().toString().replaceAll("[^A-Za-z0-9._-]", "_");
  }

  private static String extension(String name) {
    int dot = name.lastIndexOf('.');
    return dot < 0 ? "" : name.substring(dot + 1).toLowerCase(Locale.ROOT);
  }

  private static ResponseStatusException bad(String message) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
  }

  public record StoredProof(String storedName, String fileName, String contentType, long sizeBytes) {}
}
