package rw.rca.mis.library;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rw.rca.mis.common.ApiResponse;

@RestController
@RequestMapping("/api/v1/library")
public class LibraryController {
  private final LibraryService library;

  public LibraryController(LibraryService library) {
    this.library = library;
  }

  // ---------------------------------------------------------------- borrower self-service

  @GetMapping("/me")
  public ApiResponse<?> me() {
    return ApiResponse.ok(library.myLibrary());
  }

  @GetMapping("/me/catalog")
  public ApiResponse<?> catalog() {
    return ApiResponse.ok(library.publicCatalog());
  }

  @PutMapping("/me/reminders/seen")
  public ApiResponse<?> seen() {
    library.markRemindersSeen();
    return ApiResponse.ok("Reminders marked as read", null);
  }

  // ---------------------------------------------------------------- dashboard

  @GetMapping("/stats")
  public ApiResponse<?> stats() {
    return ApiResponse.ok(library.stats());
  }

  @GetMapping("/settings")
  public ApiResponse<?> settings() {
    return ApiResponse.ok(library.settings());
  }

  @PutMapping("/settings")
  public ApiResponse<?> updateSettings(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Library rules saved", library.updateSettings(body));
  }

  // ---------------------------------------------------------------- catalog

  @GetMapping("/books")
  public ApiResponse<?> books() {
    return ApiResponse.ok(library.books());
  }

  @GetMapping("/books/categories")
  public ApiResponse<?> categories() {
    return ApiResponse.ok(library.categories());
  }

  @GetMapping("/books/{bookId}")
  public ApiResponse<?> book(@PathVariable UUID bookId) {
    return ApiResponse.ok(library.bookDetail(bookId));
  }

  @PostMapping("/books")
  public ApiResponse<?> createBook(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Book registered", library.createBook(body));
  }

  @PutMapping("/books/{bookId}")
  public ApiResponse<?> updateBook(@PathVariable UUID bookId, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Book updated", library.updateBook(bookId, body));
  }

  @DeleteMapping("/books/{bookId}")
  public ApiResponse<?> deleteBook(@PathVariable UUID bookId) {
    String result = library.deleteBook(bookId);
    return ApiResponse.ok(
        "ARCHIVED".equals(result) ? "The book has loan history, so it was archived instead of deleted" : "Book deleted",
        result);
  }

  @PostMapping("/books/{bookId}/copies")
  public ApiResponse<?> addCopies(@PathVariable UUID bookId, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Copies added", library.addCopies(bookId, body));
  }

  @PutMapping("/copies/{copyId}")
  public ApiResponse<?> updateCopy(@PathVariable UUID copyId, @RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Copy updated", library.updateCopy(copyId, body));
  }

  @DeleteMapping("/copies/{copyId}")
  public ApiResponse<?> deleteCopy(@PathVariable UUID copyId) {
    library.deleteCopy(copyId);
    return ApiResponse.ok("Copy deleted", null);
  }

  // ---------------------------------------------------------------- circulation

  @GetMapping("/loans")
  public ApiResponse<?> loans(
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String from,
      @RequestParam(required = false) String to) {
    return ApiResponse.ok(library.loans(status, parse(from), parse(to)));
  }

  @PostMapping("/loans/issue")
  public ApiResponse<?> issue(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Book issued", library.issue(body));
  }

  @PostMapping("/loans/return")
  public ApiResponse<?> returnBook(@RequestBody Map<String, Object> body) {
    return ApiResponse.ok("Book received back", library.returnLoan(body));
  }

  @PostMapping("/loans/{loanId}/renew")
  public ApiResponse<?> renew(@PathVariable UUID loanId, @RequestBody(required = false) Map<String, Object> body) {
    return ApiResponse.ok("Loan renewed", library.renew(loanId, body));
  }

  @PostMapping("/loans/{loanId}/lost")
  public ApiResponse<?> lost(@PathVariable UUID loanId, @RequestBody(required = false) Map<String, Object> body) {
    return ApiResponse.ok("Book marked as lost", library.markLost(loanId, body));
  }

  // ---------------------------------------------------------------- borrowers & reminders

  @GetMapping("/borrowers")
  public ApiResponse<?> borrowers() {
    return ApiResponse.ok(library.borrowers());
  }

  @GetMapping("/borrowers/search")
  public ApiResponse<?> searchBorrowers(@RequestParam(required = false) String q) {
    return ApiResponse.ok(library.searchBorrowers(q));
  }

  @GetMapping("/borrowers/{personId}")
  public ApiResponse<?> borrower(@PathVariable UUID personId) {
    return ApiResponse.ok(library.borrowerDetail(personId));
  }

  @GetMapping("/reminders")
  public ApiResponse<?> reminders() {
    return ApiResponse.ok(library.reminders());
  }

  @PostMapping("/loans/{loanId}/remind")
  public ApiResponse<?> remind(@PathVariable UUID loanId, @RequestBody(required = false) Map<String, Object> body) {
    return ApiResponse.ok("Reminder sent", library.remind(loanId, body));
  }

  @PostMapping("/reminders/bulk")
  public ApiResponse<?> remindBulk(@RequestParam(defaultValue = "OVERDUE") String kind) {
    return ApiResponse.ok("Reminders sent", library.remindBulk(kind));
  }

  private static LocalDate parse(String value) {
    return value == null || value.isBlank() ? null : LocalDate.parse(value.substring(0, 10));
  }
}
