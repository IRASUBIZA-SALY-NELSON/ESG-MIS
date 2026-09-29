package rw.rca.mis.finance;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import rw.rca.mis.config.DataSeeder;
import rw.rca.mis.domain.Person;
import rw.rca.mis.domain.Term;
import rw.rca.mis.library.LibraryDataSeeder;
import rw.rca.mis.library.Loan;
import rw.rca.mis.library.LoanRepository;
import rw.rca.mis.repo.PersonRepository;
import rw.rca.mis.repo.TermRepository;

/**
 * Seeds a year of school-fee bills with realistic payment behaviour, plus library bills for books already marked
 * lost. Runs only while there are no bills, so it also fills databases created before the finance module existed.
 */
@Component
@Profile("!test")
@Order(50)
public class FinanceDataSeeder implements CommandLineRunner {
  private static final Logger log = LoggerFactory.getLogger(FinanceDataSeeder.class);

  private final BillRepository bills;
  private final PaymentRepository payments;
  private final PersonRepository people;
  private final TermRepository terms;
  private final LoanRepository loans;
  private final Random random = new Random(2026);

  private int billSeq = 1;
  private int receiptSeq = 1;

  public FinanceDataSeeder(
      BillRepository bills, PaymentRepository payments, PersonRepository people, TermRepository terms, LoanRepository loans) {
    this.bills = bills;
    this.payments = payments;
    this.people = people;
    this.terms = terms;
    this.loans = loans;
  }

  @Override
  @Transactional
  public void run(String... args) {
    if (bills.count() > 0) {
      return;
    }
    List<Person> students = people.findByRoleNameOrderByFirstNameAsc("STUDENT");
    List<Term> allTerms = terms.findAllByOrderByStartDateAsc();
    Person accountant = people.findByEmailIgnoreCase("accountant" + DataSeeder.DOMAIN).orElse(null);
    Person librarian = people.findByEmailIgnoreCase(LibraryDataSeeder.LIBRARIAN_EMAIL).orElse(null);
    if (students.isEmpty() || allTerms.isEmpty() || accountant == null) {
      return;
    }
    LocalDate today = LocalDate.now();
    List<Bill> created = new ArrayList<>();
    List<Payment> received = new ArrayList<>();

    // Share of students who paid in full / in part, per term (the rest have not paid).
    double[][] behaviour = {{0.90, 0.08}, {0.76, 0.15}, {0.45, 0.30}};
    for (int t = 0; t < allTerms.size(); t++) {
      Term term = allTerms.get(t);
      double[] odds = behaviour[Math.min(t, behaviour.length - 1)];
      String batchId = UUID.randomUUID().toString();
      String termName = pretty(term.getName()) + " " + (term.getAcademicYear() == null ? "" : term.getAcademicYear().getName());
      for (Person student : students) {
        boolean upper = isUpperLevel(student);
        Map<String, Long> lines = new LinkedHashMap<>();
        lines.put("Tuition", upper ? 150_000L : 120_000L);
        lines.put("Boarding and meals", upper ? 30_000L : 25_000L);
        if (t == 0) {
          lines.put("Development fund", 5_000L);
        }
        Bill bill = bill(student, Bill.FINANCE, "SCHOOL_FEES", "School fees: " + termName.trim(), term, accountant, lines);
        bill.setBatchId(batchId);
        bill.setDueDate(term.getStartDate() == null ? null : term.getStartDate().plusDays(30));
        publish(bill, accountant, term.getStartDate() == null ? today : term.getStartDate().minusDays(10));

        String email = student.getEmail();
        double roll = random.nextDouble();
        boolean full = roll < odds[0];
        boolean partial = !full && roll < odds[0] + odds[1];
        if (t == allTerms.size() - 1 && ("student" + DataSeeder.DOMAIN).equals(email)) {
          full = false;
          partial = true;
        }
        if (t == allTerms.size() - 1 && email != null && email.startsWith("tresor.uwase")) {
          full = false;
          partial = false;
        }
        if (full) {
          if (random.nextDouble() < 0.3) {
            long first = roundTo(bill.getAmount() * (0.4 + random.nextDouble() * 0.3), 5_000);
            received.add(pay(bill, first, term, today, accountant));
            received.add(pay(bill, bill.getAmount() - first, term, today, accountant));
          } else {
            received.add(pay(bill, bill.getAmount(), term, today, accountant));
          }
        } else if (partial) {
          long part = roundTo(bill.getAmount() * (0.3 + random.nextDouble() * 0.4), 5_000);
          received.add(pay(bill, part, term, today, accountant));
        }
        created.add(bill);
      }
    }

    // Families still settling last term's balance over the past two weeks.
    int recent = 0;
    for (Bill bill : created) {
      if (recent >= 14 || bill.getTerm() != allTerms.get(allTerms.size() - 1) || bill.balance() == 0) {
        continue;
      }
      String email = bill.getStudent().getEmail() == null ? "" : bill.getStudent().getEmail();
      if (email.equals("student" + DataSeeder.DOMAIN) || email.startsWith("tresor.uwase") || random.nextDouble() > 0.35) {
        continue;
      }
      long amount = Math.min(bill.balance(), roundTo(bill.balance() * (0.4 + random.nextDouble() * 0.6), 5_000));
      boolean momo = random.nextDouble() < 0.7;
      received.add(
          payOn(
              bill,
              amount,
              momo ? "MOBILE_MONEY" : "BANK",
              momo ? "MP" + (1_000_000_000L + (long) (random.nextDouble() * 8_999_999_999L)) : "BK-" + (10_000_000 + random.nextInt(89_999_999)),
              today.minusDays(random.nextInt(14)),
              accountant));
      recent++;
    }

    // A trip bill still being prepared.
    Term last = allTerms.get(allTerms.size() - 1);
    for (Person student : students) {
      if (student.getCurrentClass() != null && "S4 PCM".equals(student.getCurrentClass().getClassName())) {
        Bill trip = bill(student, Bill.FINANCE, "TRIP", "Study trip to Akagera National Park", last, accountant, Map.of("Transport, entry and meals", 35_000L));
        trip.setDescription("Biology and geography field trip. Students who do not pay will not travel.");
        trip.setDueDate(today.plusDays(21));
        created.add(trip);
      }
    }

    // Library bills for books already marked lost.
    int libraryBills = 0;
    if (librarian != null) {
      Map<UUID, List<Loan>> lostByStudent = new LinkedHashMap<>();
      for (Loan loan : loans.findByStatusOrderByDueDateAsc("LOST")) {
        if ("STUDENT".equals(loan.getBorrower().getRoleName())) {
          lostByStudent.computeIfAbsent(loan.getBorrower().getId(), k -> new ArrayList<>()).add(loan);
        }
      }
      boolean first = true;
      for (List<Loan> lost : lostByStudent.values()) {
        Person student = lost.get(0).getBorrower();
        Bill bill = new Bill();
        bill.setBillNumber(nextBill());
        bill.setStudent(student);
        bill.setDepartment(Bill.LIBRARY);
        bill.setCategory("LOST_BOOK");
        bill.setCreatedBy(librarian);
        bill.setTerm(last);
        int position = 0;
        for (Loan loan : lost) {
          BillItem item = new BillItem();
          item.setBill(bill);
          item.setPosition(position++);
          item.setDescription(loan.getCopy().getBook().getTitle());
          item.setQuantity(1);
          item.setUnitPrice(bookPrice(loan.getCopy().getBook().getCategory()));
          item.setAmount(item.getUnitPrice());
          item.setLoanId(loan.getId());
          bill.getItems().add(item);
        }
        bill.recalculate();
        bill.setTitle(lost.size() == 1 ? "Lost book: " + lost.get(0).getCopy().getBook().getTitle() : "Lost books (" + lost.size() + ")");
        bill.setDescription("Replacement cost of library books that were not returned.");
        LocalDate lostOn = lost.get(0).getReturnedAt() == null ? today.minusDays(14) : lost.get(0).getReturnedAt().toLocalDate();
        bill.setDueDate(lostOn.plusDays(30));
        publish(bill, librarian, lostOn.plusDays(1));
        if (first) {
          received.add(payOn(bill, bill.getAmount(), "CASH", null, lostOn.plusDays(5).isAfter(today) ? today : lostOn.plusDays(5), accountant));
          first = false;
        }
        created.add(bill);
        libraryBills++;
      }
    }

    bills.saveAll(created);
    payments.saveAll(received);
    log.info(
        "Seeded {} bills ({} library) and {} payments", created.size(), libraryBills, received.size());
  }

  private Bill bill(Person student, String department, String category, String title, Term term, Person creator, Map<String, Long> lines) {
    Bill bill = new Bill();
    bill.setBillNumber(nextBill());
    bill.setStudent(student);
    bill.setDepartment(department);
    bill.setCategory(category);
    bill.setTitle(title);
    bill.setTerm(term);
    bill.setCreatedBy(creator);
    int position = 0;
    for (Map.Entry<String, Long> line : lines.entrySet()) {
      BillItem item = new BillItem();
      item.setBill(bill);
      item.setPosition(position++);
      item.setDescription(line.getKey());
      item.setQuantity(1);
      item.setUnitPrice(line.getValue());
      item.setAmount(line.getValue());
      bill.getItems().add(item);
    }
    bill.recalculate();
    return bill;
  }

  private void publish(Bill bill, Person by, LocalDate on) {
    bill.setStatus(Bill.PUBLISHED);
    bill.setPublishedBy(by);
    bill.setPublishedAt(on.atStartOfDay(ZoneId.systemDefault()).toInstant());
  }

  private Payment pay(Bill bill, long amount, Term term, LocalDate today, Person accountant) {
    LocalDate start = term.getStartDate() == null ? today.minusDays(60) : term.getStartDate().minusDays(7);
    LocalDate end = start.plusDays(60).isAfter(today) ? today : start.plusDays(60);
    long span = Math.max(end.toEpochDay() - start.toEpochDay(), 0);
    LocalDate paidOn = start.plusDays(span == 0 ? 0 : random.nextInt((int) span + 1));
    double m = random.nextDouble();
    String method = m < 0.5 ? "MOBILE_MONEY" : m < 0.85 ? "BANK" : "CASH";
    String reference =
        switch (method) {
          case "MOBILE_MONEY" -> "MP" + (1_000_000_000L + (long) (random.nextDouble() * 8_999_999_999L));
          case "BANK" -> "BK-" + (10_000_000 + random.nextInt(89_999_999));
          default -> null;
        };
    return payOn(bill, amount, method, reference, paidOn, accountant);
  }

  private Payment payOn(Bill bill, long amount, String method, String reference, LocalDate paidOn, Person accountant) {
    Payment payment = new Payment();
    payment.setBill(bill);
    payment.setReceiptNumber("RCT-" + LocalDate.now().getYear() + "-" + String.format("%05d", receiptSeq++));
    payment.setAmount(amount);
    payment.setMethod(method);
    payment.setReference(reference);
    payment.setPaidOn(paidOn);
    payment.setRecordedBy(accountant);
    bill.setPaidAmount(bill.getPaidAmount() + amount);
    return payment;
  }

  private String nextBill() {
    return "BIL-" + LocalDate.now().getYear() + "-" + String.format("%05d", billSeq++);
  }

  private static boolean isUpperLevel(Person student) {
    String name = student.getCurrentClass() == null ? "" : student.getCurrentClass().getClassName();
    return name.startsWith("S4") || name.startsWith("S5") || name.startsWith("S6");
  }

  private static long bookPrice(String category) {
    if (category == null) {
      return 10_000;
    }
    return switch (category) {
      case "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science" -> 18_000;
      case "Reference" -> 25_000;
      case "Literature", "Biography", "History" -> 9_000;
      default -> 12_000;
    };
  }

  private static long roundTo(double value, long step) {
    return Math.max(step, Math.round(value / step) * step);
  }

  private static String pretty(String termName) {
    if (termName == null) {
      return "";
    }
    String lower = termName.replace('_', ' ').toLowerCase();
    return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
  }
}
