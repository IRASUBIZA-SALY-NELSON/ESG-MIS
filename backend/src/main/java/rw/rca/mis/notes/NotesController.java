package rw.rca.mis.notes;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import rw.rca.mis.common.ApiResponse;

@RestController
@RequestMapping("/api/v1/notes")
public class NotesController {
  private final NotesService notes;
  private final ObjectMapper mapper;

  public NotesController(NotesService notes, ObjectMapper mapper) {
    this.notes = notes;
    this.mapper = mapper;
  }

  // ---------------------------------------------------------------- teacher

  @GetMapping("/teaching/context")
  public ApiResponse<?> context() {
    return ApiResponse.ok(notes.context());
  }

  @GetMapping("/teaching/stats")
  public ApiResponse<?> stats() {
    return ApiResponse.ok(notes.stats());
  }

  @GetMapping("/teaching")
  public ApiResponse<?> list() {
    return ApiResponse.ok(notes.list());
  }

  @GetMapping("/teaching/{id}")
  public ApiResponse<?> detail(@PathVariable UUID id) {
    return ApiResponse.ok(notes.detail(id));
  }

  /** Multipart: a "meta" JSON part plus an optional "file" part (required for file notes). */
  @PostMapping(value = "/teaching", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<?> create(
      @RequestPart("meta") String meta, @RequestPart(value = "file", required = false) MultipartFile file) {
    NotesViews.NoteView view = notes.create(parse(meta), file);
    String message = switch (view.status()) {
      case "PUBLISHED" -> "Shared with " + view.audience() + " student(s)";
      case NotesService.SCHEDULED -> "Scheduled — students will see it on release";
      default -> "Saved as draft";
    };
    return ApiResponse.ok(message, view);
  }

  @PutMapping("/teaching/{id}")
  public ApiResponse<?> update(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Note updated", notes.update(id, body));
  }

  @PostMapping(value = "/teaching/{id}/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<?> replaceFile(@PathVariable UUID id, @RequestPart("file") MultipartFile file) {
    NotesViews.NoteView view = notes.replaceFile(id, file);
    return ApiResponse.ok("File replaced — now version " + view.version(), view);
  }

  @PostMapping("/teaching/{id}/publish")
  public ApiResponse<?> publish(@PathVariable UUID id, @RequestBody(required = false) Map<String, Object> body) {
    NotesViews.NoteView view = notes.publish(id, body == null ? new HashMap<>() : body);
    return ApiResponse.ok(
        NotesService.SCHEDULED.equals(view.status())
            ? "Scheduled for release"
            : "Published to " + view.audience() + " student(s)",
        view);
  }

  @PostMapping("/teaching/{id}/unpublish")
  public ApiResponse<?> unpublish(@PathVariable UUID id) {
    return ApiResponse.ok("Moved back to drafts — students can no longer see it", notes.unpublish(id));
  }

  @PostMapping("/teaching/{id}/archive")
  public ApiResponse<?> archive(@PathVariable UUID id) {
    return ApiResponse.ok("Archived — hidden from students", notes.archive(id));
  }

  @PostMapping("/teaching/{id}/restore")
  public ApiResponse<?> restore(@PathVariable UUID id) {
    NotesViews.NoteView view = notes.restore(id);
    return ApiResponse.ok("Restored as " + view.status().toLowerCase(), view);
  }

  @PostMapping("/teaching/{id}/pin")
  public ApiResponse<?> pin(@PathVariable UUID id) {
    NotesViews.NoteView view = notes.togglePin(id);
    return ApiResponse.ok(view.pinned() ? "Pinned to the top for students" : "Unpinned", view);
  }

  @PostMapping("/teaching/{id}/duplicate")
  public ApiResponse<?> duplicate(@PathVariable UUID id) {
    return ApiResponse.ok("Copy created as a draft", notes.duplicate(id));
  }

  @PostMapping("/teaching/{id}/nudge")
  public ApiResponse<?> nudge(@PathVariable UUID id) {
    Map<String, Object> out = notes.nudge(id);
    return ApiResponse.ok("Reminder sent to " + out.get("reminded") + " student(s)", out);
  }

  @DeleteMapping("/teaching/{id}")
  public ApiResponse<?> delete(@PathVariable UUID id) {
    notes.delete(id);
    return ApiResponse.ok("Note deleted permanently", null);
  }

  @PostMapping("/teaching/bulk")
  public ApiResponse<?> bulk(@RequestBody Map<String, Object> body) {
    Map<String, Object> out = notes.bulk(body);
    return ApiResponse.ok(out.get("done") + " note(s) updated", out);
  }

  // ---------------------------------------------------------------- files (teacher, admin and students)

  @GetMapping("/{id}/file")
  public ResponseEntity<Resource> file(
      @PathVariable UUID id,
      @RequestParam(defaultValue = "false") boolean download,
      @RequestParam(defaultValue = "false") boolean preview) {
    NotesService.FileAccess f = notes.file(id, download, preview);
    String type = f.contentType();
    MediaType media = type.startsWith("text/")
        ? new MediaType("text", "plain", StandardCharsets.UTF_8)
        : MediaType.parseMediaType(type);
    ContentDisposition disposition =
        (download ? ContentDisposition.attachment() : ContentDisposition.inline())
            .filename(f.fileName(), StandardCharsets.UTF_8)
            .build();
    return ResponseEntity.ok()
        .contentType(media)
        .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
        .header("X-Content-Type-Options", "nosniff")
        .header(HttpHeaders.CACHE_CONTROL, "private, no-store")
        .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
        .body(new FileSystemResource(f.path()));
  }

  // ---------------------------------------------------------------- students

  @GetMapping("/me")
  public ApiResponse<?> mine() {
    return ApiResponse.ok(notes.myNotes());
  }

  @PostMapping("/me/{id}/view")
  public ApiResponse<?> viewed(@PathVariable UUID id) {
    return ApiResponse.ok(notes.markViewed(id));
  }

  @PostMapping("/me/{id}/complete")
  public ApiResponse<?> complete(@PathVariable UUID id) {
    NotesViews.StudentNoteView view = notes.toggleCompleted(id);
    return ApiResponse.ok(view.completed() ? "Marked as studied" : "Marked as not studied yet", view);
  }

  @PostMapping("/me/{id}/save")
  public ApiResponse<?> save(@PathVariable UUID id) {
    NotesViews.StudentNoteView view = notes.toggleSaved(id);
    return ApiResponse.ok(view.saved() ? "Saved to your list" : "Removed from saved", view);
  }

  private Map<String, Object> parse(String json) {
    try {
      return mapper.readValue(json, new TypeReference<Map<String, Object>>() {});
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid note details");
    }
  }
}
