package rw.rca.mis.library;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import rw.rca.mis.domain.Person;
import rw.rca.mis.library.LibraryViews.BookView;
import rw.rca.mis.library.LibraryViews.BorrowerView;
import rw.rca.mis.library.LibraryViews.CopyView;
import rw.rca.mis.library.LibraryViews.LoanView;
import rw.rca.mis.library.LibraryViews.ReminderView;
import rw.rca.mis.repo.PersonRepository;
import rw.rca.mis.service.Lookup;

@Service
@Transactional(readOnly = true)
public class LibraryService {
  public static final Set<String> BORROWER_ROLES = Set.of("STUDENT", "TEACHER", "STAFF");
  private static final Set<String> COPY_STATUSES = Set.of("AVAILABLE", "LOST", "DAMAGED", "RETIRED");
  private static final Set<String> CONDITIONS = Set.of("NEW", "GOOD", "FAIR", "POOR", "DAMAGED");

  private final BookRepository books;
  private final BookCopyRepository copies;
  private final LoanRepository loans;
  private final LoanReminderRepository reminders;
  private final LibrarySettingsRepository settingsRepo;
  private final PersonRepository people;
  private final Lookup lookup;

  public LibraryService(
      BookRepository books,
      BookCopyRepository copies,
      LoanRepository loans,
      LoanReminderRepository reminders,
      LibrarySettingsRepository settingsRepo,
      PersonRepository people,
      Lookup lookup) {
    this.books = books;
    this.copies = copies;
    this.loans = loans;
    this.reminders = reminders;
    this.settingsRepo = settingsRepo;
    this.people = people;
    this.lookup = lookup;
  }

  // ================================================================ settings

  public LibrarySettings settings() {
    return settingsRepo.findAll().stream().findFirst().orElseGet(LibrarySettings::new);
  }

  @Transactional
  public LibrarySettings updateSettings(Map<String, Object> body) {
    LibrarySettings s = settingsRepo.findAll().stream().findFirst().orElseGet(LibrarySettings::new);
    s.setLoanDays(positiveInt(body, "loanDays", s.getLoanDays(), 1, 180));
    s.setMaxActiveLoans(positiveInt(body, "maxActiveLoans", s.getMaxActiveLoans(), 1, 50));
    s.setMaxRenewals(positiveInt(body, "maxRenewals", s.getMaxRenewals(), 0, 20));
    s.setRenewalDays(positiveInt(body, "renewalDays", s.getRenewalDays(), 1, 90));
    s.setDueSoonDays(positiveInt(body, "dueSoonDays", s.getDueSoonDays(), 0, 30));
    if (body.get("blockWhenOverdue") != null) {
      s.setBlockWhenOverdue(Boolean.parseBoolean(body.get("blockWhenOverdue").toString()));
    }
    return settingsRepo.save(s);
  }

  // ================================================================ catalog

  public List<BookView> books() {
    Map<UUID, List<BookCopy>> copiesByBook =
        copies.findAll().stream().collect(Collectors.groupingBy(c -> c.getBook().getId()));
    Map<UUID, Long> loansByBook =
        loans.findAll().stream().collect(Collectors.groupingBy(l -> l.getCopy().getBook().getId(), Collectors.counting()));
    return books.findAllByOrderByTitleAsc().stream()
        .map(b -> bookView(b, copiesByBook.getOrDefault(b.getId(), List.of()), loansByBook.getOrDefault(b.getId(), 0L)))
        .toList();
  }

  public Map<String, Object> bookDetail(UUID bookId) {
    Book book = book(bookId);
    List<BookCopy> bookCopies = copies.findByBookIdOrderByAccessionNumberAsc(bookId);
    List<Loan> history = loans.findByCopyBookIdOrderByIssuedAtDesc(bookId);
    LibrarySettings s = settings();
    Map<UUID, Loan> activeByCopy = new HashMap<>();
    Map<UUID, Long> countByCopy = new HashMap<>();
    for (Loan loan : history) {
      countByCopy.merge(loan.getCopy().getId(), 1L, Long::sum);
      if ("ACTIVE".equals(loan.getStatus())) {
        activeByCopy.put(loan.getCopy().getId(), loan);
      }
    }
    List<CopyView> copyViews =
        bookCopies.stream()
            .map(
                c -> {
                  Loan active = activeByCopy.get(c.getId());
                  return new CopyView(
                      c.getId(),
                      c.getAccessionNumber(),
                      c.getStatus(),
                      c.getBookCondition(),
                      c.getAcquiredOn(),
                      c.getNotes(),
                      countByCopy.getOrDefault(c.getId(), 0L),
                      active == null ? null : active.getBorrower().fullName(),
                      active == null ? null : active.getDueDate());
                })
            .toList();
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("book", bookView(book, bookCopies, history.size()));
    body.put("copies", copyViews);
    body.put("loans", history.stream().map(l -> loanView(l, s)).toList());
    return body;
  }

  public List<String> categories() {
    return books.findAll().stream()
        .map(Book::getCategory)
        .filter(c -> c != null && !c.isBlank())
        .distinct()
        .sorted(String.CASE_INSENSITIVE_ORDER)
        .toList();
  }

  @Transactional
  public BookView createBook(Map<String, Object> body) {
    Book book = new Book();
    applyBook(book, body, true);
    book = books.save(book);
    int count = positiveInt(body, "copies", 1, 0, 500);
    String condition = condition(Lookup.text(body, "bookCondition"), "NEW");
    for (int i = 0; i < count; i++) {
      newCopy(book, condition, LocalDate.now(), null);
    }
    return bookView(book, copies.findByBookIdOrderByAccessionNumberAsc(book.getId()), 0);
  }

  @Transactional
  public BookView updateBook(UUID bookId, Map<String, Object> body) {
    Book book = book(bookId);
    applyBook(book, body, false);
    String status = Lookup.text(body, "status");
    if (status != null) {
      String upper = status.toUpperCase();
      if (!Set.of("ACTIVE", "ARCHIVED").contains(upper)) {
        throw bad("Book status must be ACTIVE or ARCHIVED");
      }
      book.setStatus(upper);
    }
    books.save(book);
    return bookView(
        book, copies.findByBookIdOrderByAccessionNumberAsc(bookId), loans.findByCopyBookIdOrderByIssuedAtDesc(bookId).size());
  }

  /** Deletes a title that was never borrowed; otherwise archives it so history is kept. */
  @Transactional
  public String deleteBook(UUID bookId) {
    Book book = book(bookId);
    List<Loan> history = loans.findByCopyBookIdOrderByIssuedAtDesc(bookId);
    if (history.stream().anyMatch(l -> "ACTIVE".equals(l.getStatus()))) {
      throw bad("This book has copies on loan. Receive them back before removing the book.");
    }
    if (!history.isEmpty()) {
      book.setStatus("ARCHIVED");
      books.save(book);
      return "ARCHIVED";
    }
    copies.deleteAll(copies.findByBookIdOrderByAccessionNumberAsc(bookId));
    books.delete(book);
    return "DELETED";
  }

  @Transactional
  public List<CopyView> addCopies(UUID bookId, Map<String, Object> body) {
    Book book = book(bookId);
    int count = positiveInt(body, "count", 1, 1, 500);
    String condition = condition(Lookup.text(body, "bookCondition"), "NEW");
    LocalDate acquired = Lookup.date(body.get("acquiredOn"));
    String accession = Lookup.text(body, "accessionNumber");
    if (accession != null && count == 1) {
      if (copies.findByAccessionNumberIgnoreCase(accession).isPresent()) {
        throw conflict("Accession number " + accession + " is already used");
      }
      BookCopy copy = newCopy(book, condition, acquired == null ? LocalDate.now() : acquired, accession);
      copy.setNotes(Lookup.text(body, "notes"));
      copies.save(copy);
    } else {
      for (int i = 0; i < count; i++) {
        newCopy(book, condition, acquired == null ? LocalDate.now() : acquired, null);
      }
    }
    @SuppressWarnings("unchecked")
    List<CopyView> list = (List<CopyView>) bookDetail(bookId).get("copies");
    return list;
  }

  @Transactional
  public Map<String, Object> updateCopy(UUID copyId, Map<String, Object> body) {
    BookCopy copy = copy(copyId);
    String status = Lookup.text(body, "status");
    if (status != null) {
      String upper = status.toUpperCase();
      if ("BORROWED".equals(copy.getStatus()) && !upper.equals("BORROWED")) {
        throw bad("This copy is on loan. Use Return or Mark lost from the loan instead.");
      }
      if (!COPY_STATUSES.contains(upper)) {
        throw bad("Copy status must be one of " + COPY_STATUSES);
      }
      if ("BORROWED".equals(upper) && !"BORROWED".equals(copy.getStatus())) {
        throw bad("Issue the copy from the circulation desk to mark it as borrowed.");
      }
      copy.setStatus(upper);
    }
    String condition = Lookup.text(body, "bookCondition");
    if (condition != null) {
      copy.setBookCondition(condition(condition, copy.getBookCondition()));
    }
    if (body.containsKey("notes")) {
      copy.setNotes(Lookup.text(body, "notes"));
    }
    copies.save(copy);
    Map<String, Object> view = new LinkedHashMap<>();
    view.put("id", copy.getId());
    view.put("accessionNumber", copy.getAccessionNumber());
    view.put("status", copy.getStatus());
    view.put("bookCondition", copy.getBookCondition());
    view.put("notes", copy.getNotes());
    return view;
  }

  @Transactional
  public void deleteCopy(UUID copyId) {
    BookCopy copy = copy(copyId);
    if (loans.countByCopyId(copyId) > 0) {
      throw bad("This copy has loan history. Set its status to RETIRED instead of deleting it.");
    }
    copies.delete(copy);
  }

  // ================================================================ circulation

  @Transactional
  public LoanView issue(Map<String, Object> body) {
    LibrarySettings s = settings();
    Person borrower = lookup.person(requireUuid(body, "borrowerId"));
    if (!BORROWER_ROLES.contains(borrower.getRoleName())) {
      throw bad(borrower.fullName() + " cannot borrow books (role " + borrower.getRoleName() + ")");
    }
    if (borrower.getStatus() != null && !"ACTIVE".equalsIgnoreCase(borrower.getStatus())) {
      throw bad(borrower.fullName() + " is not an active user");
    }
    BookCopy copy;
    String accession = Lookup.text(body, "accessionNumber");
    if (accession != null) {
      copy =
          copies
              .findByAccessionNumberIgnoreCase(accession)
              .orElseThrow(() -> notFound("No copy with accession number " + accession));
    } else {
      UUID bookId = requireUuid(body, "bookId");
      copy =
          copies.findByBookIdOrderByAccessionNumberAsc(bookId).stream()
              .filter(c -> "AVAILABLE".equals(c.getStatus()))
              .findFirst()
              .orElseThrow(() -> bad("No copy of this book is available right now"));
    }
    if (!"AVAILABLE".equals(copy.getStatus())) {
      throw bad("Copy " + copy.getAccessionNumber() + " is " + copy.getStatus().toLowerCase(Locale.ROOT));
    }
    if (!"ACTIVE".equals(copy.getBook().getStatus())) {
      throw bad("This book is archived and cannot be issued");
    }
    List<Loan> active = loans.findByBorrowerIdOrderByIssuedAtDesc(borrower.getId()).stream()
        .filter(l -> "ACTIVE".equals(l.getStatus()))
        .toList();
    if (active.size() >= s.getMaxActiveLoans()) {
      throw bad(borrower.fullName() + " already has " + active.size() + " book(s). The limit is " + s.getMaxActiveLoans() + ".");
    }
    if (s.isBlockWhenOverdue() && active.stream().anyMatch(l -> daysOverdue(l) > 0)) {
      throw bad(borrower.fullName() + " has an overdue book. It must be returned before borrowing another.");
    }
    UUID bookId = copy.getBook().getId();
    if (active.stream().anyMatch(l -> l.getCopy().getBook().getId().equals(bookId))) {
      throw bad(borrower.fullName() + " already has a copy of this book");
    }
    LocalDate due = Lookup.date(body.get("dueDate"));
    if (due == null) {
      due = LocalDate.now().plusDays(s.getLoanDays());
    } else if (due.isBefore(LocalDate.now())) {
      throw bad("Due date cannot be in the past");
    }
    Loan loan = new Loan();
    loan.setCopy(copy);
    loan.setBorrower(borrower);
    loan.setIssuedBy(lookup.currentUser());
    loan.setIssuedAt(LocalDateTime.now());
    loan.setDueDate(due);
    loan.setStatus("ACTIVE");
    loan.setConditionOnIssue(copy.getBookCondition());
    loan.setNotes(Lookup.text(body, "notes"));
    copy.setStatus("BORROWED");
    copies.save(copy);
    return loanView(loans.save(loan), s);
  }

  @Transactional
  public LoanView returnLoan(Map<String, Object> body) {
    LibrarySettings s = settings();
    Loan loan;
    UUID loanId = Lookup.uuid(body.get("loanId"));
    if (loanId != null) {
      loan = loan(loanId);
    } else {
      String accession = Lookup.text(body, "accessionNumber");
      if (accession == null) {
        throw bad("loanId or accessionNumber is required");
      }
      BookCopy copy =
          copies.findByAccessionNumberIgnoreCase(accession).orElseThrow(() -> notFound("No copy with accession number " + accession));
      loan =
          loans.findByCopyIdAndStatus(copy.getId(), "ACTIVE").stream()
              .findFirst()
              .orElseThrow(() -> bad("Copy " + accession + " is not on loan"));
    }
    if (!"ACTIVE".equals(loan.getStatus())) {
      throw bad("This loan is already " + loan.getStatus().toLowerCase(Locale.ROOT));
    }
    String condition = condition(Lookup.text(body, "condition", "conditionOnReturn"), loan.getCopy().getBookCondition());
    loan.setReturnedAt(LocalDateTime.now());
    loan.setReceivedBy(lookup.currentUser());
    loan.setStatus("RETURNED");
    loan.setConditionOnReturn(condition);
    String notes = Lookup.text(body, "notes");
    if (notes != null) {
      loan.setNotes(loan.getNotes() == null ? notes : loan.getNotes() + " | " + notes);
    }
    BookCopy copy = loan.getCopy();
    copy.setBookCondition("DAMAGED".equals(condition) ? "POOR" : condition);
    copy.setStatus("DAMAGED".equals(condition) ? "DAMAGED" : "AVAILABLE");
    copies.save(copy);
    return loanView(loans.save(loan), s);
  }

  @Transactional
  public LoanView renew(UUID loanId, Map<String, Object> body) {
    LibrarySettings s = settings();
    Loan loan = loan(loanId);
    if (!"ACTIVE".equals(loan.getStatus())) {
      throw bad("Only active loans can be renewed");
    }
    if (loan.getRenewals() >= s.getMaxRenewals()) {
      throw bad("This loan was already renewed " + loan.getRenewals() + " time(s). The limit is " + s.getMaxRenewals() + ".");
    }
    if (daysOverdue(loan) > 0) {
      throw bad("Overdue loans cannot be renewed. Receive the book and issue it again.");
    }
    int days = body == null ? s.getRenewalDays() : positiveInt(body, "days", s.getRenewalDays(), 1, 90);
    loan.setDueDate(loan.getDueDate().plusDays(days));
    loan.setRenewals(loan.getRenewals() + 1);
    return loanView(loans.save(loan), s);
  }

  @Transactional
  public LoanView markLost(UUID loanId, Map<String, Object> body) {
    LibrarySettings s = settings();
    Loan loan = loan(loanId);
    if (!"ACTIVE".equals(loan.getStatus())) {
      throw bad("Only active loans can be marked as lost");
    }
    loan.setStatus("LOST");
    loan.setReturnedAt(LocalDateTime.now());
    loan.setReceivedBy(lookup.currentUser());
    String notes = body == null ? null : Lookup.text(body, "notes");
    if (notes != null) {
      loan.setNotes(notes);
    }
    BookCopy copy = loan.getCopy();
    copy.setStatus("LOST");
    copies.save(copy);
    return loanView(loans.save(loan), s);
  }

  public List<LoanView> loans(String status, LocalDate from, LocalDate to) {
    LibrarySettings s = settings();
    String filter = status == null ? "ALL" : status.toUpperCase();
    return loans.findAllByOrderByIssuedAtDesc().stream()
        .filter(l -> from == null || !l.getIssuedAt().toLocalDate().isBefore(from))
        .filter(l -> to == null || !l.getIssuedAt().toLocalDate().isAfter(to))
        .filter(
            l ->
                switch (filter) {
                  case "ACTIVE" -> "ACTIVE".equals(l.getStatus());
                  case "OVERDUE" -> "ACTIVE".equals(l.getStatus()) && daysOverdue(l) > 0;
                  case "DUE_SOON" -> isDueSoon(l, s);
                  case "RETURNED" -> "RETURNED".equals(l.getStatus());
                  case "LOST" -> "LOST".equals(l.getStatus());
                  default -> true;
                })
        .map(l -> loanView(l, s))
        .toList();
  }

  // ================================================================ borrowers

  public List<Map<String, Object>> searchBorrowers(String q) {
    String query = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
    LibrarySettings s = settings();
    Map<UUID, List<Loan>> byBorrower = loans.findAll().stream().collect(Collectors.groupingBy(l -> l.getBorrower().getId()));
    return people.findAll().stream()
        .filter(p -> BORROWER_ROLES.contains(p.getRoleName()))
        .filter(
            p ->
                query.isEmpty()
                    || p.fullName().toLowerCase(Locale.ROOT).contains(query)
                    || (p.getEmail() != null && p.getEmail().toLowerCase(Locale.ROOT).contains(query)))
        .sorted(Comparator.comparing(Person::fullName, String.CASE_INSENSITIVE_ORDER))
        .limit(50)
        .map(
            p -> {
              List<Loan> list = byBorrower.getOrDefault(p.getId(), List.of());
              long active = list.stream().filter(l -> "ACTIVE".equals(l.getStatus())).count();
              boolean overdue = list.stream().anyMatch(l -> "ACTIVE".equals(l.getStatus()) && daysOverdue(l) > 0);
              Map<String, Object> row = new LinkedHashMap<>();
              row.put("id", p.getId());
              row.put("fullName", p.fullName());
              row.put("email", p.getEmail());
              row.put("role", p.getRoleName());
              row.put("className", classOf(p));
              row.put("activeLoans", active);
              row.put("hasOverdue", overdue);
              row.put("canBorrow", active < s.getMaxActiveLoans() && !(s.isBlockWhenOverdue() && overdue));
              return row;
            })
        .toList();
  }

  public List<BorrowerView> borrowers() {
    LibrarySettings s = settings();
    Map<UUID, List<Loan>> byBorrower = loans.findAll().stream().collect(Collectors.groupingBy(l -> l.getBorrower().getId()));
    return people.findAll().stream()
        .filter(p -> BORROWER_ROLES.contains(p.getRoleName()) || byBorrower.containsKey(p.getId()))
        .map(p -> borrowerView(p, byBorrower.getOrDefault(p.getId(), List.of()), s))
        .sorted(Comparator.comparing(BorrowerView::activeLoans).reversed().thenComparing(BorrowerView::fullName))
        .toList();
  }

  public Map<String, Object> borrowerDetail(UUID personId) {
    LibrarySettings s = settings();
    Person person = lookup.person(personId);
    List<Loan> list = loans.findByBorrowerIdOrderByIssuedAtDesc(personId);
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("borrower", borrowerView(person, list, s));
    body.put("loans", list.stream().map(l -> loanView(l, s)).toList());
    body.put(
        "reminders", reminders.findByLoanBorrowerIdOrderBySentAtDesc(personId).stream().map(this::reminderView).toList());
    return body;
  }

  // ================================================================ reminders

  public List<ReminderView> reminders() {
    return reminders.findAllByOrderBySentAtDesc().stream().map(this::reminderView).toList();
  }

  @Transactional
  public ReminderView remind(UUID loanId, Map<String, Object> body) {
    LibrarySettings s = settings();
    Loan loan = loan(loanId);
    if (!"ACTIVE".equals(loan.getStatus())) {
      throw bad("Reminders can only be sent for books still on loan");
    }
    String message = body == null ? null : Lookup.text(body, "message");
    return reminderView(saveReminder(loan, message, s));
  }

  /** Sends one reminder per matching loan, skipping loans already reminded today. */
  @Transactional
  public Map<String, Object> remindBulk(String kind) {
    LibrarySettings s = settings();
    String filter = kind == null ? "OVERDUE" : kind.toUpperCase();
    LocalDate today = LocalDate.now();
    int sent = 0;
    int skipped = 0;
    for (Loan loan : loans.findByStatusOrderByDueDateAsc("ACTIVE")) {
      boolean match = "OVERDUE".equals(filter) ? daysOverdue(loan) > 0 : isDueSoon(loan, s);
      if (!match) {
        continue;
      }
      boolean remindedToday =
          reminders.findByLoanIdOrderBySentAtDesc(loan.getId()).stream()
              .anyMatch(r -> r.getSentAt() != null && r.getSentAt().toLocalDate().equals(today));
      if (remindedToday) {
        skipped++;
        continue;
      }
      saveReminder(loan, null, s);
      sent++;
    }
    return Map.of("sent", sent, "skipped", skipped);
  }

  private LoanReminder saveReminder(Loan loan, String custom, LibrarySettings s) {
    long late = daysOverdue(loan);
    String title = loan.getCopy().getBook().getTitle();
    String kind = late > 0 ? "OVERDUE" : isDueSoon(loan, s) ? "DUE_SOON" : "CUSTOM";
    String message = custom;
    if (message == null) {
      message =
          late > 0
              ? String.format(
                  "\"%s\" (%s) was due on %s and is %d day(s) late. Please return it to the library.",
                  title, loan.getCopy().getAccessionNumber(), loan.getDueDate(), late)
              : String.format(
                  "Reminder: \"%s\" (%s) is due on %s. Please return or renew it on time.",
                  title, loan.getCopy().getAccessionNumber(), loan.getDueDate());
    }
    LoanReminder reminder = new LoanReminder();
    reminder.setLoan(loan);
    reminder.setSentBy(lookup.currentUser());
    reminder.setKind(custom != null ? "CUSTOM" : kind);
    reminder.setMessage(message.length() > 1000 ? message.substring(0, 1000) : message);
    reminder.setSentAt(LocalDateTime.now());
    return reminders.save(reminder);
  }

  // ================================================================ analytics

  public Map<String, Object> stats() {
    LibrarySettings s = settings();
    List<Book> allBooks = books.findAll();
    List<BookCopy> allCopies = copies.findAll();
    List<Loan> allLoans = loans.findAll();
    LocalDate today = LocalDate.now();
    YearMonth thisMonth = YearMonth.from(today);

    Map<String, Long> copyStatus = new LinkedHashMap<>();
    for (String st : List.of("AVAILABLE", "BORROWED", "DAMAGED", "LOST", "RETIRED")) {
      copyStatus.put(st, allCopies.stream().filter(c -> st.equals(c.getStatus())).count());
    }
    List<Loan> active = allLoans.stream().filter(l -> "ACTIVE".equals(l.getStatus())).toList();
    long overdue = active.stream().filter(l -> daysOverdue(l) > 0).count();
    long dueSoon = active.stream().filter(l -> isDueSoon(l, s)).count();
    List<Loan> returned = allLoans.stream().filter(l -> "RETURNED".equals(l.getStatus()) && l.getReturnedAt() != null).toList();
    long onTime = returned.stream().filter(l -> !l.getReturnedAt().toLocalDate().isAfter(l.getDueDate())).count();
    double avgDays =
        returned.stream().mapToLong(l -> ChronoUnit.DAYS.between(l.getIssuedAt().toLocalDate(), l.getReturnedAt().toLocalDate())).average().orElse(0);

    Map<String, Object> totals = new LinkedHashMap<>();
    totals.put("titles", allBooks.stream().filter(b -> "ACTIVE".equals(b.getStatus())).count());
    totals.put("archivedTitles", allBooks.stream().filter(b -> "ARCHIVED".equals(b.getStatus())).count());
    totals.put("copies", allCopies.size());
    totals.put("availableCopies", copyStatus.get("AVAILABLE"));
    totals.put("borrowedCopies", copyStatus.get("BORROWED"));
    totals.put("activeLoans", active.size());
    totals.put("overdueLoans", overdue);
    totals.put("dueSoonLoans", dueSoon);
    totals.put("borrowersWithBooks", active.stream().map(l -> l.getBorrower().getId()).distinct().count());
    totals.put("loansThisMonth", allLoans.stream().filter(l -> YearMonth.from(l.getIssuedAt()).equals(thisMonth)).count());
    totals.put(
        "returnsThisMonth",
        returned.stream().filter(l -> YearMonth.from(l.getReturnedAt()).equals(thisMonth)).count());
    totals.put("totalLoans", allLoans.size());
    totals.put("lostLoans", allLoans.stream().filter(l -> "LOST".equals(l.getStatus())).count());
    totals.put(
        "readersThisMonth",
        allLoans.stream().filter(l -> YearMonth.from(l.getIssuedAt()).equals(thisMonth)).map(l -> l.getBorrower().getId()).distinct().count());
    totals.put("onTimeReturnRate", returned.isEmpty() ? null : round(onTime * 100.0 / returned.size()));
    totals.put("averageLoanDays", round(avgDays));
    totals.put("utilizationRate", allCopies.isEmpty() ? 0 : round(copyStatus.get("BORROWED") * 100.0 / allCopies.size()));

    DateTimeFormatter monthLabel = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);
    List<Map<String, Object>> monthly = new ArrayList<>();
    for (int i = 11; i >= 0; i--) {
      YearMonth month = thisMonth.minusMonths(i);
      Map<String, Object> row = new LinkedHashMap<>();
      row.put("month", month.toString());
      row.put("label", month.format(monthLabel));
      row.put("issued", allLoans.stream().filter(l -> YearMonth.from(l.getIssuedAt()).equals(month)).count());
      row.put("returned", returned.stream().filter(l -> YearMonth.from(l.getReturnedAt()).equals(month)).count());
      monthly.add(row);
    }

    List<Map<String, Object>> daily = new ArrayList<>();
    for (int i = 29; i >= 0; i--) {
      LocalDate day = today.minusDays(i);
      Map<String, Object> row = new LinkedHashMap<>();
      row.put("date", day.toString());
      row.put("issued", allLoans.stream().filter(l -> l.getIssuedAt().toLocalDate().equals(day)).count());
      row.put("returned", returned.stream().filter(l -> l.getReturnedAt().toLocalDate().equals(day)).count());
      daily.add(row);
    }

    Map<String, long[]> byCategory = new LinkedHashMap<>();
    Map<UUID, String> categoryOfBook = new HashMap<>();
    for (Book b : allBooks) {
      String cat = b.getCategory() == null || b.getCategory().isBlank() ? "Uncategorised" : b.getCategory();
      categoryOfBook.put(b.getId(), cat);
      byCategory.computeIfAbsent(cat, k -> new long[3])[0]++;
    }
    for (BookCopy c : allCopies) {
      byCategory.computeIfAbsent(categoryOfBook.getOrDefault(c.getBook().getId(), "Uncategorised"), k -> new long[3])[1]++;
    }
    for (Loan l : allLoans) {
      byCategory.computeIfAbsent(categoryOfBook.getOrDefault(l.getCopy().getBook().getId(), "Uncategorised"), k -> new long[3])[2]++;
    }
    List<Map<String, Object>> categories =
        byCategory.entrySet().stream()
            .sorted((a, b) -> Long.compare(b.getValue()[2], a.getValue()[2]))
            .map(e -> {
              Map<String, Object> row = new LinkedHashMap<>();
              row.put("category", e.getKey());
              row.put("titles", e.getValue()[0]);
              row.put("copies", e.getValue()[1]);
              row.put("loans", e.getValue()[2]);
              return row;
            })
            .toList();

    Map<UUID, Long> bookCounts =
        allLoans.stream().collect(Collectors.groupingBy(l -> l.getCopy().getBook().getId(), Collectors.counting()));
    Map<UUID, Book> bookById = allBooks.stream().collect(Collectors.toMap(Book::getId, b -> b));
    List<Map<String, Object>> topBooks =
        bookCounts.entrySet().stream()
            .sorted(Map.Entry.<UUID, Long>comparingByValue().reversed())
            .limit(10)
            .map(e -> {
              Book b = bookById.get(e.getKey());
              Map<String, Object> row = new LinkedHashMap<>();
              row.put("bookId", e.getKey());
              row.put("title", b == null ? "?" : b.getTitle());
              row.put("author", b == null ? null : b.getAuthor());
              row.put("category", b == null ? null : b.getCategory());
              row.put("loans", e.getValue());
              return row;
            })
            .toList();

    Map<UUID, List<Loan>> byBorrower = allLoans.stream().collect(Collectors.groupingBy(l -> l.getBorrower().getId()));
    List<Map<String, Object>> topBorrowers =
        byBorrower.values().stream()
            .sorted((a, b) -> Integer.compare(b.size(), a.size()))
            .limit(10)
            .map(list -> {
              Person p = list.get(0).getBorrower();
              Map<String, Object> row = new LinkedHashMap<>();
              row.put("id", p.getId());
              row.put("fullName", p.fullName());
              row.put("className", classOf(p));
              row.put("loans", list.size());
              row.put("active", list.stream().filter(l -> "ACTIVE".equals(l.getStatus())).count());
              return row;
            })
            .toList();

    Map<String, Long> byClass =
        allLoans.stream()
            .collect(Collectors.groupingBy(
                l -> classOf(l.getBorrower()) != null
                    ? classOf(l.getBorrower())
                    : "TEACHER".equals(l.getBorrower().getRoleName()) || "STAFF".equals(l.getBorrower().getRoleName()) ? "Staff" : "No class",
                LinkedHashMap::new,
                Collectors.counting()));

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("settings", s);
    body.put("totals", totals);
    body.put("copyStatus", copyStatus);
    body.put("monthly", monthly);
    body.put("daily", daily);
    body.put("categories", categories);
    body.put("topBooks", topBooks);
    body.put("topBorrowers", topBorrowers);
    body.put("byClass", byClass);
    body.put("overdue", loans("OVERDUE", null, null).stream().limit(8).toList());
    body.put("dueSoon", loans("DUE_SOON", null, null).stream().limit(8).toList());
    body.put("recent", allLoans.stream()
        .sorted(Comparator.comparing((Loan l) -> latestActivity(l)).reversed())
        .limit(10)
        .map(l -> loanView(l, s))
        .toList());
    return body;
  }

  // ================================================================ student self-service

  public Map<String, Object> myLibrary() {
    Person me = lookup.currentUser();
    LibrarySettings s = settings();
    List<LoanView> mine = loans.findByBorrowerIdOrderByIssuedAtDesc(me.getId()).stream().map(l -> loanView(l, s)).toList();
    List<LoanView> current = mine.stream().filter(l -> "ACTIVE".equals(l.status())).toList();
    Map<String, Object> summary = new LinkedHashMap<>();
    summary.put("current", current.size());
    summary.put("overdue", current.stream().filter(LoanView::overdue).count());
    summary.put("dueSoon", current.stream().filter(LoanView::dueSoon).count());
    summary.put("totalBorrowed", mine.size());
    summary.put("maxActiveLoans", s.getMaxActiveLoans());
    summary.put("loanDays", s.getLoanDays());
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("summary", summary);
    body.put("current", current);
    body.put("history", mine.stream().filter(l -> !"ACTIVE".equals(l.status())).toList());
    body.put("reminders", reminders.findByLoanBorrowerIdOrderBySentAtDesc(me.getId()).stream().map(this::reminderView).toList());
    return body;
  }

  /** Catalog for borrowers: availability only, no borrower names. */
  public List<Map<String, Object>> publicCatalog() {
    return books().stream()
        .filter(b -> "ACTIVE".equals(b.status()))
        .map(b -> {
          Map<String, Object> row = new LinkedHashMap<>();
          row.put("id", b.id());
          row.put("title", b.title());
          row.put("author", b.author());
          row.put("category", b.category());
          row.put("shelfLocation", b.shelfLocation());
          row.put("availableCopies", b.availableCopies());
          row.put("totalCopies", b.totalCopies());
          return row;
        })
        .toList();
  }

  @Transactional
  public void markRemindersSeen() {
    Person me = lookup.currentUser();
    List<LoanReminder> list = reminders.findByLoanBorrowerIdOrderBySentAtDesc(me.getId());
    list.forEach(r -> r.setSeen(true));
    reminders.saveAll(list);
  }

  // ================================================================ mapping

  BookView bookView(Book b, List<BookCopy> bookCopies, long timesBorrowed) {
    return new BookView(
        b.getId(),
        b.getTitle(),
        b.getAuthor(),
        b.getIsbn(),
        b.getCategory(),
        b.getPublisher(),
        b.getPublishedYear(),
        b.getEdition(),
        b.getLanguage(),
        b.getShelfLocation(),
        b.getDescription(),
        b.getStatus(),
        bookCopies.stream().filter(c -> !"RETIRED".equals(c.getStatus())).count(),
        bookCopies.stream().filter(c -> "AVAILABLE".equals(c.getStatus())).count(),
        bookCopies.stream().filter(c -> "BORROWED".equals(c.getStatus())).count(),
        bookCopies.stream().filter(c -> "LOST".equals(c.getStatus())).count(),
        bookCopies.stream().filter(c -> "DAMAGED".equals(c.getStatus())).count(),
        timesBorrowed,
        b.getCreatedAt());
  }

  LoanView loanView(Loan l, LibrarySettings s) {
    long late = daysOverdue(l);
    boolean active = "ACTIVE".equals(l.getStatus());
    List<LoanReminder> sent = reminders.findByLoanIdOrderBySentAtDesc(l.getId());
    Person b = l.getBorrower();
    Book book = l.getCopy().getBook();
    return new LoanView(
        l.getId(),
        book.getId(),
        book.getTitle(),
        book.getAuthor(),
        book.getCategory(),
        l.getCopy().getId(),
        l.getCopy().getAccessionNumber(),
        b.getId(),
        b.fullName(),
        b.getEmail(),
        b.getRoleName(),
        classOf(b),
        l.getIssuedAt(),
        l.getDueDate(),
        l.getReturnedAt(),
        l.getStatus(),
        l.getRenewals(),
        late,
        active && late > 0,
        isDueSoon(l, s),
        l.getIssuedBy() == null ? null : l.getIssuedBy().fullName(),
        l.getReceivedBy() == null ? null : l.getReceivedBy().fullName(),
        l.getConditionOnIssue(),
        l.getConditionOnReturn(),
        l.getNotes(),
        sent.size(),
        sent.isEmpty() ? null : sent.get(0).getSentAt());
  }

  private static String classOf(Person p) {
    if (!"STUDENT".equals(p.getRoleName()) || p.getCurrentClass() == null) return null;
    return p.getCurrentClass().getClassName();
  }

  private BorrowerView borrowerView(Person p, List<Loan> list, LibrarySettings s) {
    return new BorrowerView(
        p.getId(),
        p.fullName(),
        p.getEmail(),
        p.getRoleName(),
        classOf(p),
        list.size(),
        list.stream().filter(l -> "ACTIVE".equals(l.getStatus())).count(),
        list.stream().filter(l -> "ACTIVE".equals(l.getStatus()) && daysOverdue(l) > 0).count(),
        list.stream().filter(l -> "LOST".equals(l.getStatus())).count(),
        list.stream().map(Loan::getIssuedAt).filter(Objects::nonNull).max(Comparator.naturalOrder()).orElse(null));
  }

  private ReminderView reminderView(LoanReminder r) {
    Loan l = r.getLoan();
    return new ReminderView(
        r.getId(),
        l.getId(),
        l.getCopy().getBook().getTitle(),
        l.getCopy().getAccessionNumber(),
        l.getBorrower().getId(),
        l.getBorrower().fullName(),
        r.getKind(),
        r.getMessage(),
        r.getSentAt(),
        r.getSentBy() == null ? null : r.getSentBy().fullName(),
        r.isSeen(),
        l.getDueDate());
  }

  // ================================================================ helpers

  static long daysOverdue(Loan l) {
    if (l.getDueDate() == null) {
      return 0;
    }
    LocalDate end = l.getReturnedAt() != null ? l.getReturnedAt().toLocalDate() : LocalDate.now();
    return Math.max(0, ChronoUnit.DAYS.between(l.getDueDate(), end));
  }

  private static boolean isDueSoon(Loan l, LibrarySettings s) {
    if (!"ACTIVE".equals(l.getStatus()) || l.getDueDate() == null) {
      return false;
    }
    long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), l.getDueDate());
    return daysLeft >= 0 && daysLeft <= s.getDueSoonDays();
  }

  private static LocalDateTime latestActivity(Loan l) {
    return l.getReturnedAt() != null && l.getReturnedAt().isAfter(l.getIssuedAt()) ? l.getReturnedAt() : l.getIssuedAt();
  }

  private void applyBook(Book book, Map<String, Object> body, boolean creating) {
    String title = Lookup.text(body, "title");
    if (creating && title == null) {
      throw bad("Title is required");
    }
    if (title != null) {
      book.setTitle(title);
    }
    String isbn = Lookup.text(body, "isbn");
    if (isbn != null) {
      String normalized = isbn.replaceAll("[\\s-]", "");
      if (!normalized.matches("\\d{9}[\\dXx]|\\d{13}")) {
        throw bad("ISBN must have 10 or 13 digits");
      }
      books.findByIsbnIgnoreCase(normalized)
          .filter(other -> !other.getId().equals(book.getId()))
          .ifPresent(other -> { throw conflict("Another book already uses ISBN " + normalized + ": " + other.getTitle()); });
      book.setIsbn(normalized);
    } else if (body.containsKey("isbn")) {
      book.setIsbn(null);
    }
    if (body.containsKey("author")) book.setAuthor(Lookup.text(body, "author"));
    if (body.containsKey("category")) book.setCategory(Lookup.text(body, "category"));
    if (body.containsKey("publisher")) book.setPublisher(Lookup.text(body, "publisher"));
    if (body.containsKey("edition")) book.setEdition(Lookup.text(body, "edition"));
    if (body.containsKey("language")) book.setLanguage(Lookup.text(body, "language"));
    if (body.containsKey("shelfLocation")) book.setShelfLocation(Lookup.text(body, "shelfLocation"));
    if (body.containsKey("description")) book.setDescription(Lookup.text(body, "description"));
    if (body.containsKey("publishedYear")) {
      Object y = body.get("publishedYear");
      Integer year = y == null || y.toString().isBlank() ? null : (int) Double.parseDouble(y.toString());
      if (year != null && (year < 1000 || year > LocalDate.now().getYear() + 1)) {
        throw bad("Published year is not valid");
      }
      book.setPublishedYear(year);
    }
  }

  private BookCopy newCopy(Book book, String condition, LocalDate acquired, String accession) {
    BookCopy copy = new BookCopy();
    copy.setBook(book);
    copy.setAccessionNumber(accession != null ? accession.toUpperCase(Locale.ROOT) : nextAccession());
    copy.setBookCondition(condition);
    copy.setAcquiredOn(acquired);
    copy.setStatus("AVAILABLE");
    return copies.save(copy);
  }

  private String nextAccession() {
    int max =
        copies.findAll().stream()
            .map(BookCopy::getAccessionNumber)
            .filter(a -> a != null && a.matches("ESG-L-\\d+"))
            .mapToInt(a -> Integer.parseInt(a.substring(6)))
            .max()
            .orElse(0);
    return String.format("ESG-L-%05d", max + 1);
  }

  private static String condition(String value, String fallback) {
    if (value == null) {
      return fallback;
    }
    String upper = value.toUpperCase(Locale.ROOT);
    if (!CONDITIONS.contains(upper)) {
      throw bad("Condition must be one of " + CONDITIONS);
    }
    return upper;
  }

  private static int positiveInt(Map<String, Object> body, String key, int fallback, int min, int max) {
    if (body == null || body.get(key) == null || body.get(key).toString().isBlank()) {
      return fallback;
    }
    int value;
    try {
      value = (int) Double.parseDouble(body.get(key).toString());
    } catch (NumberFormatException ex) {
      throw bad(key + " must be a number");
    }
    if (value < min || value > max) {
      throw bad(key + " must be between " + min + " and " + max);
    }
    return value;
  }

  private static UUID requireUuid(Map<String, Object> body, String key) {
    UUID id = Lookup.uuid(body.get(key));
    if (id == null) {
      throw bad(key + " is required");
    }
    return id;
  }

  private Book book(UUID id) {
    return books.findById(id).orElseThrow(() -> notFound("Book not found"));
  }

  private BookCopy copy(UUID id) {
    return copies.findById(id).orElseThrow(() -> notFound("Copy not found"));
  }

  private Loan loan(UUID id) {
    return loans.findById(id).orElseThrow(() -> notFound("Loan not found"));
  }

  private static double round(double v) {
    return Math.round(v * 100.0) / 100.0;
  }

  private static ResponseStatusException bad(String message) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
  }

  private static ResponseStatusException notFound(String message) {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
  }

  private static ResponseStatusException conflict(String message) {
    return new ResponseStatusException(HttpStatus.CONFLICT, message);
  }
}
