package rw.rca.mis.notes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class NotesViews {
  private NotesViews() {}

  public record ClassRef(UUID id, String name, int students) {}

  /** A note as the teacher sees it, with reach numbers for the classes it targets. */
  public record NoteView(
      UUID id,
      String title,
      String description,
      String topic,
      UUID courseId,
      String courseName,
      String teacherName,
      List<ClassRef> classes,
      UUID termId,
      String termName,
      String kind,
      String category,
      String fileName,
      String contentType,
      Long sizeBytes,
      Integer version,
      LocalDateTime fileUpdatedAt,
      String previewStatus,
      String linkUrl,
      String status,
      LocalDateTime publishAt,
      LocalDateTime publishedAt,
      LocalDateTime archivedAt,
      boolean allowDownload,
      boolean pinned,
      LocalDate readBy,
      LocalDateTime lastNudgedAt,
      int nudgeCount,
      int audience,
      int opened,
      int completed,
      int saved,
      int views,
      int downloads,
      double reach,
      LocalDateTime lastActivityAt,
      LocalDateTime createdAt,
      LocalDateTime updatedAt) {}

  /** One student in a note's audience and what they have done with it. */
  public record ReaderView(
      UUID studentId,
      String fullName,
      String email,
      String className,
      boolean inAudience,
      boolean opened,
      LocalDateTime firstViewedAt,
      LocalDateTime lastViewedAt,
      int views,
      int downloads,
      LocalDateTime lastDownloadedAt,
      boolean completed,
      LocalDateTime completedAt,
      boolean saved) {}

  public record ActivityView(
      UUID noteId,
      String noteTitle,
      String courseName,
      UUID studentId,
      String studentName,
      String className,
      String type,
      LocalDateTime at) {}

  public record DailyPoint(LocalDate date, long views, long downloads, long completions) {}

  /** A note as a student sees it, with their own progress. */
  public record StudentNoteView(
      UUID id,
      String title,
      String description,
      String topic,
      UUID courseId,
      String courseName,
      String teacherName,
      String kind,
      String category,
      String fileName,
      String contentType,
      Long sizeBytes,
      Integer version,
      String previewStatus,
      String linkUrl,
      LocalDateTime publishedAt,
      LocalDateTime fileUpdatedAt,
      boolean allowDownload,
      boolean pinned,
      LocalDate readBy,
      boolean readByPassed,
      boolean viewed,
      LocalDateTime firstViewedAt,
      LocalDateTime lastViewedAt,
      int views,
      int downloads,
      boolean completed,
      LocalDateTime completedAt,
      boolean saved,
      boolean isNew,
      boolean updatedSinceView,
      boolean nudged,
      LocalDateTime lastNudgedAt) {}

  public record StudentCourseView(
      UUID courseId, String courseName, String teacherName, int total, int unread, int completed) {}
}
