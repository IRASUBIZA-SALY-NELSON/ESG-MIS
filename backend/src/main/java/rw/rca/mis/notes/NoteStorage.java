package rw.rca.mis.notes;

import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/** Keeps note files on disk and produces PDF previews of office documents with LibreOffice. */
@Component
public class NoteStorage {
  private static final Logger log = LoggerFactory.getLogger(NoteStorage.class);

  public static final long MAX_BYTES = 50L * 1024 * 1024;

  private static final Map<String, String> TYPES =
      Map.ofEntries(
          Map.entry("pdf", "application/pdf"),
          Map.entry("doc", "application/msword"),
          Map.entry("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
          Map.entry("ppt", "application/vnd.ms-powerpoint"),
          Map.entry("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
          Map.entry("xls", "application/vnd.ms-excel"),
          Map.entry("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
          Map.entry("odt", "application/vnd.oasis.opendocument.text"),
          Map.entry("odp", "application/vnd.oasis.opendocument.presentation"),
          Map.entry("ods", "application/vnd.oasis.opendocument.spreadsheet"),
          Map.entry("rtf", "application/rtf"),
          Map.entry("txt", "text/plain"),
          Map.entry("md", "text/markdown"),
          Map.entry("csv", "text/csv"),
          Map.entry("json", "application/json"),
          Map.entry("xml", "text/plain"),
          Map.entry("html", "text/plain"),
          Map.entry("css", "text/plain"),
          Map.entry("js", "text/plain"),
          Map.entry("ts", "text/plain"),
          Map.entry("java", "text/plain"),
          Map.entry("py", "text/plain"),
          Map.entry("c", "text/plain"),
          Map.entry("cpp", "text/plain"),
          Map.entry("h", "text/plain"),
          Map.entry("sql", "text/plain"),
          Map.entry("sh", "text/plain"),
          Map.entry("png", "image/png"),
          Map.entry("jpg", "image/jpeg"),
          Map.entry("jpeg", "image/jpeg"),
          Map.entry("gif", "image/gif"),
          Map.entry("webp", "image/webp"),
          Map.entry("mp4", "video/mp4"),
          Map.entry("webm", "video/webm"),
          Map.entry("mp3", "audio/mpeg"),
          Map.entry("wav", "audio/wav"),
          Map.entry("ogg", "audio/ogg"),
          Map.entry("zip", "application/zip"),
          Map.entry("rar", "application/vnd.rar"),
          Map.entry("7z", "application/x-7z-compressed"));

  private static final Set<String> OFFICE =
      Set.of("doc", "docx", "ppt", "pptx", "xls", "xlsx", "odt", "odp", "ods", "rtf");
  private static final Set<String> TEXT =
      Set.of("txt", "md", "csv", "json", "xml", "html", "css", "js", "ts", "java", "py", "c", "cpp", "h", "sql", "sh");

  public record StoredFile(String storedName, String fileName, String contentType, long sizeBytes) {}

  private final Path root;
  private final String soffice;
  private final ExecutorService converter = Executors.newSingleThreadExecutor(r -> {
    Thread t = new Thread(r, "note-preview");
    t.setDaemon(true);
    return t;
  });

  public NoteStorage(
      @Value("${app.notes.storage-dir:./data/notes}") String dir,
      @Value("${app.notes.soffice:soffice}") String soffice) throws IOException {
    this.root = Path.of(dir).toAbsolutePath().normalize();
    this.soffice = soffice;
    Files.createDirectories(root);
  }

  @PreDestroy
  void shutdown() {
    converter.shutdownNow();
  }

  public static String extension(String fileName) {
    if (fileName == null) return "";
    int dot = fileName.lastIndexOf('.');
    return dot < 0 ? "" : fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
  }

  public static String contentTypeFor(String fileName) {
    return TYPES.getOrDefault(extension(fileName), "application/octet-stream");
  }

  /** pdf, image, video, audio, text, office, archive or link — drives icons and preview mode in the UI. */
  public static String category(String kind, String fileName) {
    if (CourseNote.LINK.equals(kind)) return "link";
    String ext = extension(fileName);
    if (ext.equals("pdf")) return "pdf";
    if (OFFICE.contains(ext)) return ext.startsWith("ppt") || ext.equals("odp") ? "slides"
        : ext.startsWith("xls") || ext.equals("ods") ? "sheet" : "doc";
    if (TEXT.contains(ext)) return "text";
    String type = contentTypeFor(fileName);
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    if (type.startsWith("audio/")) return "audio";
    if (Set.of("zip", "rar", "7z").contains(ext)) return "archive";
    return "other";
  }

  public static boolean needsPdfPreview(String fileName) {
    return OFFICE.contains(extension(fileName));
  }

  public static String allowedList() {
    return String.join(", ", TYPES.keySet().stream().sorted().toList());
  }

  public StoredFile store(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("Choose a file to upload");
    }
    if (file.getSize() > MAX_BYTES) {
      throw new IllegalArgumentException("Files can be at most 50 MB");
    }
    String original = cleanName(file.getOriginalFilename());
    String ext = extension(original);
    if (!TYPES.containsKey(ext)) {
      throw new IllegalArgumentException(
          "." + (ext.isEmpty() ? "?" : ext) + " files are not allowed. Allowed: " + allowedList());
    }
    String stored = UUID.randomUUID() + "." + ext;
    try (InputStream in = file.getInputStream()) {
      Files.copy(in, root.resolve(stored), StandardCopyOption.REPLACE_EXISTING);
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save the file");
    }
    return new StoredFile(stored, original, contentTypeFor(original), file.getSize());
  }

  public StoredFile storeBytes(String fileName, byte[] bytes) {
    String stored = UUID.randomUUID() + "." + extension(fileName);
    try {
      Files.write(root.resolve(stored), bytes);
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save the file");
    }
    return new StoredFile(stored, fileName, contentTypeFor(fileName), bytes.length);
  }

  public StoredFile copy(String storedName, String fileName) {
    try {
      return storeBytes(fileName, Files.readAllBytes(path(storedName)));
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not copy the file");
    }
  }

  public Path path(String storedName) {
    Path p = root.resolve(storedName).normalize();
    if (!p.startsWith(root) || !Files.exists(p)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The file is no longer available");
    }
    return p;
  }

  public void delete(String storedName) {
    if (storedName == null) return;
    try {
      Files.deleteIfExists(root.resolve(storedName).normalize());
    } catch (IOException e) {
      log.warn("Could not delete note file {}", storedName);
    }
  }

  /** Converts in the background; the callback receives the PDF's stored name, or null on failure. */
  public void convertLater(String storedName, Consumer<String> done) {
    converter.submit(() -> done.accept(convert(storedName)));
  }

  private String convert(String storedName) {
    Path work = null;
    try {
      Path source = path(storedName);
      work = Files.createTempDirectory("rca-note-");
      Path profile = Path.of(System.getProperty("java.io.tmpdir"), "rca-soffice-profile");
      Process process =
          new ProcessBuilder(
                  soffice,
                  "-env:UserInstallation=" + profile.toUri(),
                  "--headless",
                  "--norestore",
                  "--convert-to",
                  "pdf",
                  "--outdir",
                  work.toString(),
                  source.toString())
              .redirectErrorStream(true)
              .redirectOutput(ProcessBuilder.Redirect.DISCARD)
              .start();
      if (!process.waitFor(120, TimeUnit.SECONDS)) {
        process.destroyForcibly();
        log.warn("Preview conversion timed out for {}", storedName);
        return null;
      }
      String base = storedName.substring(0, storedName.lastIndexOf('.'));
      Path pdf = work.resolve(base + ".pdf");
      if (!Files.exists(pdf)) {
        log.warn("Preview conversion produced no PDF for {}", storedName);
        return null;
      }
      String previewName = base + ".preview.pdf";
      Files.move(pdf, root.resolve(previewName), StandardCopyOption.REPLACE_EXISTING);
      return previewName;
    } catch (Exception e) {
      log.warn("Preview conversion failed for {}: {}", storedName, e.getMessage());
      return null;
    } finally {
      if (work != null) {
        try (Stream<Path> files = Files.walk(work)) {
          files.sorted(Comparator.reverseOrder()).forEach(p -> p.toFile().delete());
        } catch (IOException ignored) {
          // temp dir cleanup is best effort
        }
      }
    }
  }

  private static String cleanName(String name) {
    String n = name == null ? "file" : name.replace("\\", "/");
    n = n.substring(n.lastIndexOf('/') + 1).replaceAll("[\\r\\n\"]", "").trim();
    return n.isEmpty() ? "file" : n;
  }
}
