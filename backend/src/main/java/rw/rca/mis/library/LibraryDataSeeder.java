package rw.rca.mis.library;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import rw.rca.mis.config.DataSeeder;
import rw.rca.mis.domain.Person;
import rw.rca.mis.repo.PersonRepository;

/**
 * Creates the librarian account and, only when the catalog is empty, a realistic library: titles, copies
 * and twelve months of loan history (returned, late, lost, active, overdue and due-soon loans).
 */
@Component
@Order(30)
public class LibraryDataSeeder implements CommandLineRunner {
  public static final String LIBRARIAN_EMAIL = "librarian" + DataSeeder.DOMAIN;
  private static final Logger log = LoggerFactory.getLogger(LibraryDataSeeder.class);

  private static final String[][] BOOKS = {
    // title, author, isbn, category, publisher, year, shelf, copies
    {"Advanced Level Mathematics: Pure Mathematics 1", "Hugh Neill, Douglas Quadling", "9781316600207", "Mathematics", "Cambridge University Press", "2016", "M1", "6"},
    {"Calculus: Early Transcendentals", "James Stewart", "9781285741550", "Mathematics", "Cengage", "2015", "M1", "3"},
    {"Discrete Mathematics and Its Applications", "Kenneth Rosen", "9781259676512", "Mathematics", "McGraw-Hill", "2018", "M2", "2"},
    {"Mathematics for Rwanda Secondary Schools S3", "Rwanda Education Board", "9789997780301", "Mathematics", "REB", "2019", "M2", "8"},
    {"Statistics and Probability", "Sheldon Ross", "9780128243466", "Mathematics", "Academic Press", "2020", "M3", "2"},
    {"Physics for Scientists and Engineers", "Raymond Serway, John Jewett", "9781337553278", "Physics", "Cengage", "2018", "P1", "3"},
    {"Advanced Physics", "Steve Adams, Jonathan Allday", "9780199146802", "Physics", "Oxford University Press", "2013", "P1", "5"},
    {"Physics for Rwanda Secondary Schools S4", "Rwanda Education Board", "9789997780455", "Physics", "REB", "2019", "P2", "8"},
    {"Fundamentals of Physics", "David Halliday, Robert Resnick", "9781119801146", "Physics", "Wiley", "2021", "P2", "2"},
    {"Chemistry: The Central Science", "Theodore Brown et al.", "9780134414232", "Chemistry", "Pearson", "2017", "C1", "3"},
    {"Organic Chemistry", "Paula Bruice", "9780134042282", "Chemistry", "Pearson", "2016", "C1", "2"},
    {"Chemistry for Rwanda Secondary Schools S5", "Rwanda Education Board", "9789997780578", "Chemistry", "REB", "2019", "C2", "8"},
    {"A-Level Chemistry", "E. N. Ramsden", "9780748752997", "Chemistry", "Nelson Thornes", "2000", "C2", "4"},
    {"Campbell Biology", "Lisa Urry et al.", "9780135188743", "Biology", "Pearson", "2020", "B1", "3"},
    {"Biology for Rwanda Secondary Schools S6", "Rwanda Education Board", "9789997780691", "Biology", "REB", "2019", "B1", "8"},
    {"Human Anatomy and Physiology", "Elaine Marieb", "9780134580999", "Biology", "Pearson", "2018", "B2", "2"},
    {"Genetics: A Conceptual Approach", "Benjamin Pierce", "9781319050962", "Biology", "W. H. Freeman", "2016", "B2", "1"},
    {"Computer Science: An Overview", "Glenn Brookshear", "9780134875460", "Computer Science", "Pearson", "2018", "T1", "3"},
    {"Python Crash Course", "Eric Matthes", "9781718502703", "Computer Science", "No Starch Press", "2023", "T1", "4"},
    {"Things Fall Apart", "Chinua Achebe", "9780385474542", "Literature", "Anchor", "1994", "L1", "5"},
    {"A Man of the People", "Chinua Achebe", "9780385086165", "Literature", "Anchor", "1989", "L1", "3"},
    {"Weep Not, Child", "Ngugi wa Thiong'o", "9780143106692", "Literature", "Penguin", "2012", "L1", "3"},
    {"Our Lady of the Nile", "Scholastique Mukasonga", "9781940625065", "Literature", "Archipelago", "2014", "L2", "3"},
    {"Animal Farm", "George Orwell", "9780451526342", "Literature", "Signet", "1996", "L2", "4"},
    {"Oxford Advanced Learner's Dictionary", "A. S. Hornby", "9780194798488", "Reference", "Oxford University Press", "2020", "R1", "4"},
    {"Inkoranyamagambo y'Ikinyarwanda", "Inteko y'Umuco", "9789997790102", "Reference", "RALC", "2018", "R1", "3"},
    {"Long Walk to Freedom", "Nelson Mandela", "9780316548182", "Biography", "Little, Brown", "1995", "H1", "2"},
    {"A History of Rwanda", "Alison Des Forges", "9781564322210", "History", "Human Rights Watch", "1999", "H1", "2"},
    {"Entrepreneurship for Rwanda Secondary Schools", "Rwanda Education Board", "9789997780813", "Entrepreneurship", "REB", "2019", "E1", "6"},
    {"The Lean Startup", "Eric Ries", "9780307887894", "Entrepreneurship", "Crown Business", "2011", "E1", "2"},
    {"Rich Dad Poor Dad", "Robert Kiyosaki", "9781612680194", "Entrepreneurship", "Plata", "2017", "E1", "3"},
    {"Atomic Habits", "James Clear", "9780735211292", "Personal Development", "Avery", "2018", "D1", "3"},
    {"The 7 Habits of Highly Effective Teens", "Sean Covey", "9781476764665", "Personal Development", "Touchstone", "2014", "D1", "3"},
    {"A Brief History of Time", "Stephen Hawking", "9780553380163", "Physics", "Bantam", "1998", "P3", "2"},
  };

  private final PersonRepository people;
  private final PasswordEncoder encoder;
  private final BookRepository books;
  private final BookCopyRepository copies;
  private final LoanRepository loans;
  private final LoanReminderRepository reminders;
  private final LibrarySettingsRepository settings;

  public LibraryDataSeeder(
      PersonRepository people,
      PasswordEncoder encoder,
      BookRepository books,
      BookCopyRepository copies,
      LoanRepository loans,
      LoanReminderRepository reminders,
      LibrarySettingsRepository settings) {
    this.people = people;
    this.encoder = encoder;
    this.books = books;
    this.copies = copies;
    this.loans = loans;
    this.reminders = reminders;
    this.settings = settings;
  }

  @Override
  @Transactional
  public void run(String... args) {
    Person librarian =
        people
            .findByEmailIgnoreCase(LIBRARIAN_EMAIL)
            .orElseGet(
                () -> {
                  Person p = new Person();
                  p.setFirstName("Louise");
                  p.setLastName("Nyirahabimana");
                  p.setEmail(LIBRARIAN_EMAIL);
                  p.setUsername(LIBRARIAN_EMAIL);
                  p.setPassword(encoder.encode(DataSeeder.PASSWORD));
                  p.setRoleName("LIBRARIAN");
                  p.setStaffKind("LIBRARIAN");
                  p.setGender("FEMALE");
                  p.setStatus("ACTIVE");
                  p.setStudentStatus(null);
                  p.setPhoneNumber("0788555111");
                  log.info("Created librarian account {} (password {})", LIBRARIAN_EMAIL, DataSeeder.PASSWORD);
                  return people.save(p);
                });
    if (settings.count() == 0) {
      settings.save(new LibrarySettings());
    }
    if (books.count() > 0) {
      return;
    }

    List<BookCopy> allCopies = new ArrayList<>();
    int accession = 1;
    for (String[] row : BOOKS) {
      Book book = new Book();
      book.setTitle(row[0]);
      book.setAuthor(row[1]);
      book.setIsbn(row[2]);
      book.setCategory(row[3]);
      book.setPublisher(row[4]);
      book.setPublishedYear(Integer.parseInt(row[5]));
      book.setShelfLocation(row[6]);
      book.setLanguage("English");
      book = books.save(book);
      for (int i = 0; i < Integer.parseInt(row[7]); i++) {
        BookCopy copy = new BookCopy();
        copy.setBook(book);
        copy.setAccessionNumber(String.format("ESG-L-%05d", accession++));
        copy.setBookCondition(i == 0 ? "GOOD" : "NEW");
        copy.setAcquiredOn(LocalDate.now().minusMonths(14));
        copy.setStatus("AVAILABLE");
        allCopies.add(copies.save(copy));
      }
    }

    List<Person> students = people.findByRoleNameOrderByFirstNameAsc("STUDENT");
    List<Person> teachers = people.findByRoleNameOrderByFirstNameAsc("TEACHER");
    if (students.isEmpty()) {
      return;
    }
    Person keza = people.findByEmailIgnoreCase(DataSeeder.STUDENT_EMAIL).orElse(null);
    Person jean = people.findByEmailIgnoreCase("jean" + DataSeeder.DOMAIN).orElse(null);

    Random random = new Random(42);
    // A third of the students are keen readers; they borrow far more often.
    List<Person> pool = new ArrayList<>();
    for (Person s : students) {
      int weight = random.nextInt(3) == 0 ? 6 : random.nextInt(4) == 0 ? 0 : 2;
      for (int i = 0; i < weight; i++) pool.add(s);
    }
    for (Person t : teachers) pool.add(t);
    if (keza != null) pool.add(keza);

    LocalDate today = LocalDate.now();
    java.util.Map<Person, Integer> activeCount = new java.util.HashMap<>();
    List<Loan> history = new ArrayList<>();
    int activeTarget = 48;
    int activeMade = 0;
    java.util.Collections.shuffle(allCopies, random);
    for (BookCopy copy : allCopies) {
      String category = copy.getBook().getCategory();
      boolean popular = copy.getBook().getPublisher().equals("REB") || category.equals("Literature");
      Person activeBorrower = null;
      LocalDate activeIssued = null;
      if (activeMade < activeTarget && random.nextInt(copy.getBook().getPublisher().equals("REB") ? 2 : 3) == 0) {
        Person candidate = pool.get(random.nextInt(pool.size()));
        if (activeMade == 0 && keza != null) candidate = keza;
        if (activeMade == 1 && keza != null) candidate = keza;
        if (activeMade == 2 && jean != null) candidate = jean;
        if (activeCount.getOrDefault(candidate, 0) < 3) {
          activeBorrower = candidate;
          int ago = activeMade == 0 ? 12 : activeMade == 1 ? 3 : activeMade == 2 ? 26 : random.nextInt(8) == 0 ? 15 + random.nextInt(14) : 1 + random.nextInt(14);
          activeIssued = today.minusDays(ago);
          activeCount.merge(candidate, 1, Integer::sum);
          activeMade++;
        }
      }
      LocalDate stopDay = activeIssued != null ? activeIssued.minusDays(1) : today.minusDays(1);
      LocalDate cursor = today.minusDays(360 - random.nextInt(20));
      while (true) {
        cursor = cursor.plusDays(popular ? random.nextInt(12) : 5 + random.nextInt(45));
        int keep = 3 + random.nextInt(popular ? 18 : 22);
        LocalDate returnDay = cursor.plusDays(keep);
        if (!returnDay.isBefore(stopDay)) break;
        Person borrower = pool.get(random.nextInt(pool.size()));
        LocalDateTime issued = cursor.atTime(8 + random.nextInt(9), random.nextInt(60));
        Loan loan = loan(copy, borrower, librarian, issued, cursor.plusDays(14));
        if (keep > 14 && random.nextInt(3) == 0) {
          loan.setRenewals(1);
          loan.setDueDate(loan.getDueDate().plusDays(7));
        }
        loan.setReturnedAt(returnDay.atTime(9 + random.nextInt(8), random.nextInt(60)));
        loan.setReceivedBy(librarian);
        loan.setStatus("RETURNED");
        loan.setConditionOnReturn(copy.getBookCondition());
        history.add(loan);
        cursor = returnDay;
      }
      if (activeIssued != null) {
        loans.save(loan(copy, activeBorrower, librarian, activeIssued.atTime(8 + random.nextInt(9), random.nextInt(60)), activeIssued.plusDays(14)));
        copy.setStatus("BORROWED");
        copies.save(copy);
      }
    }
    loans.saveAll(history);

    List<BookCopy> shelf = allCopies.stream().filter(c -> "AVAILABLE".equals(c.getStatus())).toList();
    String[] lostNotes = {"Reported lost by the student", "Lost during the school trip", "Left in a matatu, not recovered"};
    for (int i = 0; i < 3 && i < shelf.size(); i++) {
      BookCopy lostCopy = shelf.get(i);
      Person borrower = i == 0 && jean != null ? jean : students.get(random.nextInt(students.size()));
      Loan lost = loan(lostCopy, borrower, librarian, today.minusDays(70 + i * 20).atTime(10, 0), today.minusDays(56 + i * 20));
      lost.setStatus("LOST");
      lost.setReturnedAt(today.minusDays(40 + i * 15).atTime(11, 0));
      lost.setReceivedBy(librarian);
      lost.setNotes(lostNotes[i]);
      loans.save(lost);
      lostCopy.setStatus("LOST");
      copies.save(lostCopy);
    }
    String[] damage = {"Water damage on cover, pages 40-60 torn", "Spine broken, several pages loose"};
    for (int i = 0; i < 2 && 3 + i < shelf.size(); i++) {
      BookCopy damaged = shelf.get(3 + i);
      damaged.setStatus("DAMAGED");
      damaged.setBookCondition("POOR");
      damaged.setNotes(damage[i]);
      copies.save(damaged);
    }

    for (Loan loan : loans.findByStatusOrderByDueDateAsc("ACTIVE")) {
      long overdue = LibraryService.daysOverdue(loan);
      long dueIn = java.time.temporal.ChronoUnit.DAYS.between(today, loan.getDueDate());
      if (overdue > 0 || (dueIn >= 0 && dueIn <= 2 && random.nextBoolean())) {
        LoanReminder reminder = new LoanReminder();
        reminder.setLoan(loan);
        reminder.setSentBy(librarian);
        reminder.setKind(overdue > 0 ? "OVERDUE" : "DUE_SOON");
        reminder.setMessage(
            overdue > 0
                ? String.format(
                    "\"%s\" (%s) was due on %s. Please return it to the library.",
                    loan.getCopy().getBook().getTitle(), loan.getCopy().getAccessionNumber(), loan.getDueDate())
                : String.format(
                    "\"%s\" is due on %s. Please return or renew it.",
                    loan.getCopy().getBook().getTitle(), loan.getDueDate()));
        reminder.setSentAt(LocalDateTime.now().minusDays(overdue > 3 ? 2 : 0).minusHours(random.nextInt(6)));
        reminder.setSeen(random.nextBoolean());
        reminders.save(reminder);
      }
    }
    log.info("Seeded library with {} titles, {} copies and {} loans", BOOKS.length, allCopies.size(), loans.count());
  }

  private Loan loan(BookCopy copy, Person borrower, Person librarian, LocalDateTime issued, LocalDate due) {
    Loan loan = new Loan();
    loan.setCopy(copy);
    loan.setBorrower(borrower);
    loan.setIssuedBy(librarian);
    loan.setIssuedAt(issued);
    loan.setDueDate(due);
    loan.setStatus("ACTIVE");
    loan.setConditionOnIssue(copy.getBookCondition());
    return loan;
  }

}
