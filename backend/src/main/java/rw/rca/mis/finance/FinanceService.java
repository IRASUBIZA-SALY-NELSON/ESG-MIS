package rw.rca.mis.finance;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
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
import rw.rca.mis.domain.SchoolClass;
import rw.rca.mis.domain.Term;
import rw.rca.mis.finance.FinanceViews.BillItemView;
import rw.rca.mis.finance.FinanceViews.BillView;
import rw.rca.mis.finance.FinanceViews.BulkResult;
import rw.rca.mis.finance.FinanceViews.PaymentView;
import rw.rca.mis.finance.FinanceViews.StudentAccount;
import rw.rca.mis.finance.FinanceViews.StudentBalance;
import rw.rca.mis.finance.FinanceViews.Totals;
import rw.rca.mis.library.Loan;
import rw.rca.mis.library.LoanRepository;
import rw.rca.mis.repo.ParentLinkRepository;
import rw.rca.mis.repo.PersonRepository;
import rw.rca.mis.service.Lookup;

@Service
public class FinanceService {
  public static final List<String> FINANCE_CATEGORIES =
      List.of("SCHOOL_FEES", "REGISTRATION", "EXAM_FEES", "UNIFORM", "TRANSPORT", "MEALS", "TRIP", "OTHER");
  public static final List<String> LIBRARY_CATEGORIES = List.of("LOST_BOOK", "DAMAGED_BOOK");
  public static final List<String> METHODS = List.of("CASH", "BANK", "MOBILE_MONEY");

  private static final long MAX_AMOUNT = 100_000_000L;

  private final BillRepository bills;
  private final PaymentRepository payments;
  private final PersonRepository people;
  private final ParentLinkRepository links;
  private final LoanRepository loans;
  private final Lookup lookup;
  private final PaymentProofStorage proofs;

  public FinanceService(
      BillRepository bills,
      PaymentRepository payments,
      PersonRepository people,
      ParentLinkRepository links,
      LoanRepository loans,
      Lookup lookup,
      PaymentProofStorage proofs) {
    this.bills = bills;
    this.payments = payments;
    this.people = people;
    this.links = links;
    this.loans = loans;
    this.lookup = lookup;
    this.proofs = proofs;
  }

  // ---------------------------------------------------------------- queries

  @Transactional(readOnly = true)
  public List<BillView> bills(Map<String, String> q, String onlyDepartment) {
    String status = upper(q.get("status"));
    String paymentStatus = upper(q.get("paymentStatus"));
    String department = onlyDepartment != null ? onlyDepartment : upper(q.get("department"));
    String category = upper(q.get("category"));
    UUID classId = Lookup.uuid(q.get("classId"));
    UUID termId = Lookup.uuid(q.get("termId"));
    UUID studentId = Lookup.uuid(q.get("studentId"));
    String batchId = q.get("batchId");
    String search = q.get("q") == null ? null : q.get("q").trim().toLowerCase(Locale.ROOT);
    boolean overdueOnly = "true".equalsIgnoreCase(q.get("overdue"));
    List<Bill> source =
        department == null ? bills.findAllByOrderByCreatedAtDesc() : bills.findByDepartmentOrderByCreatedAtDesc(department);
    return source.stream()
        .filter(b -> status == null || status.equals(b.getStatus()))
        .filter(b -> paymentStatus == null || paymentStatus.equals(b.paymentStatus()))
        .filter(b -> category == null || category.equals(b.getCategory()))
        .filter(b -> classId == null || (classOf(b.getStudent()) != null && classId.equals(classOf(b.getStudent()).getId())))
        .filter(b -> termId == null || (b.getTerm() != null && termId.equals(b.getTerm().getId())))
        .filter(b -> studentId == null || studentId.equals(b.getStudent().getId()))
        .filter(b -> batchId == null || batchId.equals(b.getBatchId()))
        .filter(b -> !overdueOnly || isOverdue(b))
        .filter(b -> search == null || matches(b, search))
        .map(b -> view(b, false))
        .toList();
  }

  @Transactional(readOnly = true)
  public BillView bill(UUID id, String onlyDepartment) {
    Bill bill = find(id);
    checkDepartment(bill, onlyDepartment);
    return view(bill, true);
  }

  @Transactional(readOnly = true)
  public List<PaymentView> payments(Map<String, String> q) {
    LocalDate from = Lookup.date(q.get("from"));
    LocalDate to = Lookup.date(q.get("to"));
    String method = upper(q.get("method"));
    String status = upper(q.get("status"));
    String department = upper(q.get("department"));
    String search = q.get("q") == null ? null : q.get("q").trim().toLowerCase(Locale.ROOT);
    return payments.findAllByOrderByCreatedAtDesc().stream()
        .filter(p -> from == null || (p.getPaidOn() != null && !p.getPaidOn().isBefore(from)))
        .filter(p -> to == null || (p.getPaidOn() != null && !p.getPaidOn().isAfter(to)))
        .filter(p -> method == null || method.equals(p.getMethod()))
        .filter(p -> status == null || status.equals(p.getStatus()))
        .filter(p -> department == null || department.equals(p.getBill().getDepartment()))
        .filter(
            p ->
                search == null
                    || contains(p.getReceiptNumber(), search)
                    || contains(p.getReference(), search)
                    || matches(p.getBill(), search))
        .map(this::paymentView)
        .toList();
  }

  @Transactional(readOnly = true)
  public PaymentView payment(UUID id) {
    return paymentView(findPayment(id));
  }

  @Transactional(readOnly = true)
  public List<StudentBalance> studentBalances(Map<String, String> q) {
    UUID classId = Lookup.uuid(q.get("classId"));
    String search = q.get("q") == null ? null : q.get("q").trim().toLowerCase(Locale.ROOT);
    boolean owingOnly = "true".equalsIgnoreCase(q.get("owing"));
    Map<UUID, List<Bill>> byStudent =
        bills.findAllByOrderByCreatedAtDesc().stream()
            .filter(b -> Bill.PUBLISHED.equals(b.getStatus()))
            .collect(Collectors.groupingBy(b -> b.getStudent().getId()));
    return people.findByRoleNameOrderByFirstNameAsc("STUDENT").stream()
        .filter(s -> classId == null || (s.getCurrentClass() != null && classId.equals(s.getCurrentClass().getId())))
        .filter(
            s ->
                search == null
                    || contains(s.fullName(), search)
                    || contains(s.getEmail(), search)
                    || (s.getCurrentClass() != null && contains(s.getCurrentClass().getClassName(), search)))
        .map(s -> balance(s, byStudent.getOrDefault(s.getId(), List.of())))
        .filter(b -> !owingOnly || b.balance() > 0)
        .sorted(Comparator.comparing(StudentBalance::balance).reversed().thenComparing(StudentBalance::studentName))
        .toList();
  }

  @Transactional(readOnly = true)
  public StudentAccount studentAccount(UUID studentId, boolean publishedOnly, String onlyDepartment) {
    Person student = lookup.person(studentId);
    if (!"STUDENT".equals(student.getRoleName())) {
      throw bad("This person is not a student");
    }
    return account(student, publishedOnly, onlyDepartment);
  }

  @Transactional(readOnly = true)
  public StudentAccount myAccount() {
    Person me = lookup.currentUser();
    return account(me, true, null);
  }

  @Transactional(readOnly = true)
  public StudentAccount childAccount(UUID studentId) {
    Person parent = lookup.currentUser();
    links
        .findByParentIdAndStudentId(parent.getId(), studentId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "This student is not linked to your account"));
    return account(lookup.person(studentId), true, null);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> summary(String onlyDepartment) {
    List<Bill> all =
        onlyDepartment == null ? bills.findAllByOrderByCreatedAtDesc() : bills.findByDepartmentOrderByCreatedAtDesc(onlyDepartment);
    List<Bill> published = all.stream().filter(b -> Bill.PUBLISHED.equals(b.getStatus())).toList();
    Set<UUID> billIds = all.stream().map(Bill::getId).collect(Collectors.toSet());
    List<Payment> valid =
        payments.findAllByOrderByCreatedAtDesc().stream()
            .filter(p -> Payment.VALID.equals(p.getStatus()))
            .filter(p -> billIds.contains(p.getBill().getId()))
            .toList();

    long billed = published.stream().mapToLong(Bill::getAmount).sum();
    long collected = published.stream().mapToLong(Bill::getPaidAmount).sum();
    LocalDate today = LocalDate.now();
    YearMonth thisMonth = YearMonth.from(today);

    Map<String, Object> totals = new LinkedHashMap<>();
    totals.put("billed", billed);
    totals.put("collected", collected);
    totals.put("outstanding", billed - collected);
    totals.put("collectionRate", billed == 0 ? 0 : Math.round(collected * 1000.0 / billed) / 10.0);
    totals.put("publishedBills", published.size());
    totals.put("draftBills", all.stream().filter(b -> Bill.DRAFT.equals(b.getStatus())).count());
    totals.put("paidBills", published.stream().filter(b -> "PAID".equals(b.paymentStatus())).count());
    totals.put("overdueBills", published.stream().filter(this::isOverdue).count());
    totals.put(
        "studentsOwing",
        published.stream().filter(b -> b.balance() > 0).map(b -> b.getStudent().getId()).distinct().count());
    totals.put(
        "collectedToday", valid.stream().filter(p -> today.equals(p.getPaidOn())).mapToLong(Payment::getAmount).sum());
    totals.put(
        "collectedThisMonth",
        valid.stream()
            .filter(p -> p.getPaidOn() != null && YearMonth.from(p.getPaidOn()).equals(thisMonth))
            .mapToLong(Payment::getAmount)
            .sum());
    totals.put("paymentsThisMonth",
        valid.stream().filter(p -> p.getPaidOn() != null && YearMonth.from(p.getPaidOn()).equals(thisMonth)).count());
    totals.put(
        "pendingReviews",
        payments.findAllByOrderByCreatedAtDesc().stream()
            .filter(p -> Payment.PENDING_REVIEW.equals(p.getStatus()))
            .filter(p -> billIds.contains(p.getBill().getId()))
            .count());
    List<PaymentView> awaiting =
        payments.findAllByOrderByCreatedAtDesc().stream()
            .filter(p -> Payment.PENDING_REVIEW.equals(p.getStatus()))
            .filter(p -> billIds.contains(p.getBill().getId()))
            .limit(8)
            .map(this::paymentView)
            .toList();

    List<Map<String, Object>> byCategory = new ArrayList<>();
    published.stream()
        .collect(Collectors.groupingBy(Bill::getCategory, LinkedHashMap::new, Collectors.toList()))
        .forEach((category, list) -> byCategory.add(group("category", category, list)));
    byCategory.sort(Comparator.comparing((Map<String, Object> m) -> (Long) m.get("billed")).reversed());

    List<Map<String, Object>> byClass = new ArrayList<>();
    published.stream()
        .collect(
            Collectors.groupingBy(
                b -> classOf(b.getStudent()) == null ? "No class" : classOf(b.getStudent()).getClassName(),
                LinkedHashMap::new,
                Collectors.toList()))
        .forEach((className, list) -> byClass.add(group("className", className, list)));
    byClass.sort(Comparator.comparing(m -> m.get("className").toString()));

    List<Map<String, Object>> monthly = new ArrayList<>();
    for (int i = 11; i >= 0; i--) {
      YearMonth month = thisMonth.minusMonths(i);
      long amount =
          valid.stream()
              .filter(p -> p.getPaidOn() != null && YearMonth.from(p.getPaidOn()).equals(month))
              .mapToLong(Payment::getAmount)
              .sum();
      Map<String, Object> row = new LinkedHashMap<>();
      row.put("month", month.toString());
      row.put("collected", amount);
      monthly.add(row);
    }

    Map<String, Long> byMethod = new LinkedHashMap<>();
    METHODS.forEach(m -> byMethod.put(m, 0L));
    valid.forEach(p -> byMethod.merge(p.getMethod(), p.getAmount(), Long::sum));

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("totals", totals);
    body.put("byCategory", byCategory);
    body.put("byClass", byClass);
    body.put("monthly", monthly);
    body.put("byMethod", byMethod);
    body.put("recentPayments", valid.stream().limit(8).map(this::paymentView).toList());
    body.put("awaitingReview", awaiting);
    body.put(
        "topDebtors",
        published.stream()
            .filter(b -> b.balance() > 0)
            .collect(Collectors.groupingBy(b -> b.getStudent().getId()))
            .values()
            .stream()
            .map(list -> balance(list.get(0).getStudent(), list))
            .sorted(Comparator.comparing(StudentBalance::balance).reversed())
            .limit(8)
            .toList());
    return body;
  }

  public Map<String, Object> options() {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("financeCategories", FINANCE_CATEGORIES);
    body.put("libraryCategories", LIBRARY_CATEGORIES);
    body.put("methods", METHODS);
    body.put("currency", "RWF");
    return body;
  }

  // ---------------------------------------------------------------- bills

  @Transactional
  public BillView createBill(Map<String, Object> body, String department) {
    Person actor = lookup.currentUser();
    Person student = student(Lookup.uuid(body.get("studentId")));
    String category = category(Lookup.text(body, "category"), department);
    List<BillItem> items = items(body, student, department);
    Bill bill = new Bill();
    bill.setBillNumber(nextBillNumbers(1).get(0));
    bill.setStudent(student);
    bill.setDepartment(department);
    bill.setCategory(category);
    applyDetails(bill, body, defaultTitle(category, items));
    bill.setCreatedBy(actor);
    setItems(bill, items);
    if (truthy(body.get("publish"))) {
      publish(bill, actor);
    }
    return view(bills.save(bill), true);
  }

  @Transactional
  public BulkResult createBulk(Map<String, Object> body) {
    Person actor = lookup.currentUser();
    String category = category(Lookup.text(body, "category"), Bill.FINANCE);
    boolean everyone = truthy(body.get("allStudents"));
    Set<UUID> classIds = uuids(body.get("classIds"));
    if (!everyone && classIds.isEmpty()) {
      throw bad("Choose at least one class, or the whole school");
    }
    List<Person> students =
        people.findByRoleNameOrderByFirstNameAsc("STUDENT").stream()
            .filter(s -> !"INACTIVE".equalsIgnoreCase(s.getStudentStatus()))
            .filter(s -> everyone || (s.getCurrentClass() != null && classIds.contains(s.getCurrentClass().getId())))
            .toList();
    if (students.isEmpty()) {
      throw bad("No students found in the selected classes");
    }
    List<BillItem> template = items(body, null, Bill.FINANCE);
    String title = Objects.requireNonNullElse(Lookup.text(body, "title"), defaultTitle(category, template));
    Term term = body.get("termId") == null ? null : lookup.term(Lookup.uuid(body.get("termId")));
    boolean publishNow = truthy(body.get("publish"));

    Set<UUID> alreadyBilled = new HashSet<>();
    for (Bill existing : bills.findAllByOrderByCreatedAtDesc()) {
      if (!Bill.CANCELLED.equals(existing.getStatus())
          && existing.getTitle().equalsIgnoreCase(title)
          && Objects.equals(existing.getCategory(), category)) {
        alreadyBilled.add(existing.getStudent().getId());
      }
    }
    List<Person> targets = students.stream().filter(s -> !alreadyBilled.contains(s.getId())).toList();
    List<String> skipped = students.stream().filter(s -> alreadyBilled.contains(s.getId())).map(Person::fullName).toList();
    List<String> numbers = nextBillNumbers(targets.size());
    String batchId = UUID.randomUUID().toString();
    long total = 0;
    List<Bill> created = new ArrayList<>();
    for (int i = 0; i < targets.size(); i++) {
      Bill bill = new Bill();
      bill.setBillNumber(numbers.get(i));
      bill.setStudent(targets.get(i));
      bill.setDepartment(Bill.FINANCE);
      bill.setCategory(category);
      bill.setBatchId(batchId);
      applyDetails(bill, body, title);
      bill.setTitle(title);
      bill.setTerm(term);
      bill.setCreatedBy(actor);
      setItems(bill, copyItems(template));
      if (publishNow) {
        publish(bill, actor);
      }
      total += bill.getAmount();
      created.add(bill);
    }
    bills.saveAll(created);
    return new BulkResult(batchId, created.size(), skipped.size(), total, skipped);
  }

  @Transactional
  public BillView updateBill(UUID id, Map<String, Object> body, String onlyDepartment) {
    Bill bill = find(id);
    checkDepartment(bill, onlyDepartment);
    if (!Bill.DRAFT.equals(bill.getStatus())) {
      throw bad("Only draft bills can be edited. Cancel a published bill and create a new one instead.");
    }
    if (body.containsKey("category")) {
      bill.setCategory(category(Lookup.text(body, "category"), bill.getDepartment()));
    }
    if (body.containsKey("items") || body.containsKey("amount")) {
      setItems(bill, items(body, bill.getStudent(), bill.getDepartment()));
    }
    applyDetails(bill, body, bill.getTitle());
    return view(bills.save(bill), true);
  }

  @Transactional
  public List<BillView> publishBills(Collection<UUID> ids, String onlyDepartment) {
    if (ids == null || ids.isEmpty()) {
      throw bad("Choose the bills to publish");
    }
    Person actor = lookup.currentUser();
    List<Bill> list = bills.findAllById(ids);
    for (Bill bill : list) {
      checkDepartment(bill, onlyDepartment);
      if (Bill.DRAFT.equals(bill.getStatus())) {
        publish(bill, actor);
      }
    }
    return bills.saveAll(list).stream().map(b -> view(b, false)).toList();
  }

  @Transactional
  public BillView cancelBill(UUID id, String reason, String onlyDepartment) {
    Bill bill = find(id);
    checkDepartment(bill, onlyDepartment);
    if (Bill.CANCELLED.equals(bill.getStatus())) {
      throw bad("This bill is already cancelled");
    }
    if (bill.getPaidAmount() > 0) {
      throw bad("This bill has payments. Void its payments first, then cancel it.");
    }
    long pending =
        payments.findByBillIdOrderByCreatedAtAsc(bill.getId()).stream()
            .filter(p -> Payment.PENDING_REVIEW.equals(p.getStatus()))
            .count();
    if (pending > 0) {
      throw bad("This bill has payment proofs waiting for review. Approve or reject them first.");
    }
    if (reason == null || reason.isBlank()) {
      throw bad("Give a reason for cancelling the bill");
    }
    bill.setStatus(Bill.CANCELLED);
    bill.setCancelReason(reason.trim());
    bill.setCancelledBy(lookup.currentUser());
    bill.setCancelledAt(Instant.now());
    return view(bills.save(bill), true);
  }

  @Transactional
  public void deleteDraft(UUID id, String onlyDepartment) {
    Bill bill = find(id);
    checkDepartment(bill, onlyDepartment);
    if (!Bill.DRAFT.equals(bill.getStatus())) {
      throw bad("Only draft bills can be deleted. Cancel published bills instead.");
    }
    bills.delete(bill);
  }

  // ---------------------------------------------------------------- payments

  /** Accountant records a payment at the office — counts immediately. */
  @Transactional
  public PaymentView recordPayment(UUID billId, Map<String, Object> body) {
    Bill bill = find(billId);
    Payment payment = buildPayment(bill, body, Payment.SOURCE_OFFICE, Payment.VALID, null);
    bill.setPaidAmount(bill.getPaidAmount() + payment.getAmount());
    bills.save(bill);
    return paymentView(payments.save(payment));
  }

  /**
   * Student claims they already paid and uploads proof. The bill balance does not change until the
   * librarian (library bills) or accountant (school bills) approves it.
   */
  @Transactional
  public PaymentView submitStudentPayment(UUID billId, Map<String, Object> body, org.springframework.web.multipart.MultipartFile proof) {
    Person me = lookup.currentUser();
    Bill bill = find(billId);
    if (!bill.getStudent().getId().equals(me.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only pay your own bills");
    }
    PaymentProofStorage.StoredProof stored = proofs.store(proof);
    try {
      Payment payment = buildPayment(bill, body, Payment.SOURCE_STUDENT, Payment.PENDING_REVIEW, stored);
      return paymentView(payments.save(payment));
    } catch (RuntimeException e) {
      proofs.delete(stored.storedName());
      throw e;
    }
  }

  @Transactional
  public PaymentView approvePayment(UUID paymentId, String onlyDepartment) {
    Payment payment = findPayment(paymentId);
    Bill bill = payment.getBill();
    checkDepartment(bill, onlyDepartment);
    if (!Payment.PENDING_REVIEW.equals(payment.getStatus())) {
      throw bad("Only payments waiting for review can be approved");
    }
    if (!Bill.PUBLISHED.equals(bill.getStatus())) {
      throw bad("This bill is no longer open");
    }
    if (payment.getAmount() > bill.balance()) {
      throw bad(
          "Approving this would exceed the remaining balance of "
              + formatRwf(bill.balance())
              + ". Reject it, or adjust other pending payments first.");
    }
    Person actor = lookup.currentUser();
    payment.setStatus(Payment.VALID);
    payment.setReviewedBy(actor);
    payment.setReviewedAt(Instant.now());
    payment.setReviewNote(null);
    bill.setPaidAmount(bill.getPaidAmount() + payment.getAmount());
    bills.save(bill);
    return paymentView(payments.save(payment));
  }

  @Transactional
  public PaymentView rejectPayment(UUID paymentId, String reason, String onlyDepartment) {
    Payment payment = findPayment(paymentId);
    checkDepartment(payment.getBill(), onlyDepartment);
    if (!Payment.PENDING_REVIEW.equals(payment.getStatus())) {
      throw bad("Only payments waiting for review can be rejected");
    }
    if (reason == null || reason.isBlank()) {
      throw bad("Give a reason so the student knows what to fix");
    }
    payment.setStatus(Payment.REJECTED);
    payment.setReviewedBy(lookup.currentUser());
    payment.setReviewedAt(Instant.now());
    payment.setReviewNote(reason.trim());
    return paymentView(payments.save(payment));
  }

  @Transactional
  public PaymentView voidPayment(UUID paymentId, String reason) {
    Payment payment = findPayment(paymentId);
    if (Payment.VOIDED.equals(payment.getStatus())) {
      throw bad("This payment is already voided");
    }
    if (reason == null || reason.isBlank()) {
      throw bad("Give a reason for voiding the payment");
    }
    Bill bill = payment.getBill();
    if (Payment.VALID.equals(payment.getStatus())) {
      bill.setPaidAmount(Math.max(bill.getPaidAmount() - payment.getAmount(), 0));
      bills.save(bill);
    }
    payment.setStatus(Payment.VOIDED);
    payment.setVoidReason(reason.trim());
    payment.setVoidedBy(lookup.currentUser());
    payment.setVoidedAt(Instant.now());
    return paymentView(payments.save(payment));
  }

  public Payment requireProofAccess(UUID paymentId, String onlyDepartment) {
    Payment payment = findPayment(paymentId);
    Person me = lookup.currentUser();
    String role = me.getRoleName();
    if ("STUDENT".equals(role)) {
      if (!payment.getBill().getStudent().getId().equals(me.getId())) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your payment");
      }
    } else if ("LIBRARIAN".equals(role)) {
      if (!Bill.LIBRARY.equals(payment.getBill().getDepartment())) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This payment is not a library bill");
      }
    } else if (!Set.of("ACCOUNTANT", "PM", "ADMIN").contains(role)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to open this proof");
    }
    checkDepartment(payment.getBill(), onlyDepartment);
    if (payment.getProofStoredName() == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "This payment has no proof file");
    }
    return payment;
  }

  private Payment buildPayment(
      Bill bill,
      Map<String, Object> body,
      String source,
      String status,
      PaymentProofStorage.StoredProof proof) {
    if (!Bill.PUBLISHED.equals(bill.getStatus())) {
      throw bad(Bill.DRAFT.equals(bill.getStatus()) ? "Publish the bill before recording payments" : "This bill is cancelled");
    }
    long amount = money(body.get("amount"), "Payment amount");
    if (amount <= 0) {
      throw bad("Payment amount must be more than 0");
    }
    long available = availableBalance(bill);
    if (amount > available) {
      throw bad("Payment is more than the remaining balance of " + formatRwf(available));
    }
    String method = upper(Lookup.text(body, "method"));
    if (method == null || !METHODS.contains(method)) {
      throw bad("Choose how the money was paid: cash, bank or Mobile Money");
    }
    String reference = Lookup.text(body, "reference");
    if (!"CASH".equals(method) && reference == null) {
      throw bad("Enter the bank slip or Mobile Money transaction number");
    }
    if (Payment.SOURCE_STUDENT.equals(source) && proof == null) {
      throw bad("Upload a photo or PDF of the payment as proof");
    }
    LocalDate paidOn = Lookup.date(body.get("paidOn"));
    if (paidOn == null) {
      paidOn = LocalDate.now();
    }
    if (paidOn.isAfter(LocalDate.now())) {
      throw bad("The payment date cannot be in the future");
    }
    Payment payment = new Payment();
    payment.setBill(bill);
    payment.setReceiptNumber(nextReceiptNumber());
    payment.setAmount(amount);
    payment.setMethod(method);
    payment.setReference(reference);
    payment.setPaidOn(paidOn);
    payment.setNote(Lookup.text(body, "note"));
    payment.setSource(source);
    payment.setStatus(status);
    payment.setRecordedBy(lookup.currentUser());
    if (proof != null) {
      payment.setProofStoredName(proof.storedName());
      payment.setProofFileName(proof.fileName());
      payment.setProofContentType(proof.contentType());
      payment.setProofSizeBytes(proof.sizeBytes());
    }
    return payment;
  }

  /** Balance still free after counting approved payments and claims waiting for review. */
  private long availableBalance(Bill bill) {
    long pending =
        payments.findByBillIdOrderByCreatedAtAsc(bill.getId()).stream()
            .filter(p -> Payment.PENDING_REVIEW.equals(p.getStatus()))
            .mapToLong(Payment::getAmount)
            .sum();
    return Math.max(bill.balance() - pending, 0);
  }

  // ---------------------------------------------------------------- helpers: building bills

  private void applyDetails(Bill bill, Map<String, Object> body, String fallbackTitle) {
    String title = Lookup.text(body, "title");
    bill.setTitle(title != null ? title : fallbackTitle);
    if (bill.getTitle() == null || bill.getTitle().isBlank()) {
      throw bad("Give the bill a title");
    }
    if (bill.getTitle().length() > 200) {
      throw bad("The title must be at most 200 characters");
    }
    if (body.containsKey("description")) {
      String description = Lookup.text(body, "description");
      if (description != null && description.length() > 4000) {
        throw bad("The description must be at most 4000 characters");
      }
      bill.setDescription(description);
    }
    if (body.containsKey("termId")) {
      UUID termId = Lookup.uuid(body.get("termId"));
      bill.setTerm(termId == null ? null : lookup.term(termId));
    }
    if (body.containsKey("dueDate")) {
      bill.setDueDate(Lookup.date(body.get("dueDate")));
    }
  }

  @SuppressWarnings("unchecked")
  private List<BillItem> items(Map<String, Object> body, Person student, String department) {
    List<BillItem> result = new ArrayList<>();
    Object raw = body.get("items");
    if (raw instanceof List<?> list && !list.isEmpty()) {
      Set<UUID> seenLoans = new HashSet<>();
      for (Object entry : list) {
        if (!(entry instanceof Map<?, ?> map)) {
          continue;
        }
        Map<String, Object> row = (Map<String, Object>) map;
        String description = Lookup.text(row, "description", "title");
        if (description == null) {
          throw bad("Every line needs a description");
        }
        if (description.length() > 255) {
          throw bad("A line description must be at most 255 characters");
        }
        int quantity = (int) money(row.getOrDefault("quantity", 1), "Quantity");
        if (quantity < 1 || quantity > 1000) {
          throw bad("Quantity must be between 1 and 1000");
        }
        long unitPrice = money(row.get("unitPrice"), "Price");
        if (unitPrice <= 0) {
          throw bad("The price of \"" + description + "\" must be more than 0");
        }
        BillItem item = new BillItem();
        item.setDescription(description);
        item.setQuantity(quantity);
        item.setUnitPrice(unitPrice);
        item.setAmount(unitPrice * quantity);
        UUID loanId = Lookup.uuid(row.get("loanId"));
        if (loanId != null) {
          checkLoan(loanId, student, department, seenLoans);
          item.setLoanId(loanId);
        }
        result.add(item);
      }
    } else if (body.get("amount") != null) {
      long amount = money(body.get("amount"), "Amount");
      if (amount <= 0) {
        throw bad("The amount must be more than 0");
      }
      BillItem item = new BillItem();
      String title = Lookup.text(body, "title");
      item.setDescription(title == null ? "Amount due" : title);
      item.setQuantity(1);
      item.setUnitPrice(amount);
      item.setAmount(amount);
      result.add(item);
    }
    if (result.isEmpty()) {
      throw bad("Add at least one line with an amount");
    }
    long total = result.stream().mapToLong(BillItem::getAmount).sum();
    if (total > MAX_AMOUNT) {
      throw bad("The bill total is too large");
    }
    return result;
  }

  private void checkLoan(UUID loanId, Person student, String department, Set<UUID> seen) {
    if (!Bill.LIBRARY.equals(department)) {
      throw bad("Only library bills can be linked to a book loan");
    }
    Loan loan = loans.findById(loanId).orElseThrow(() -> bad("That library loan does not exist"));
    if (student == null || !loan.getBorrower().getId().equals(student.getId())) {
      throw bad("That lost book was not borrowed by this student");
    }
    if (!"LOST".equals(loan.getStatus())) {
      throw bad("\"" + loan.getCopy().getBook().getTitle() + "\" is not marked as lost");
    }
    if (!seen.add(loanId) || bills.loanAlreadyBilled(loanId)) {
      throw bad("\"" + loan.getCopy().getBook().getTitle() + "\" is already on another bill");
    }
  }

  private List<BillItem> copyItems(List<BillItem> template) {
    return template.stream()
        .map(
            t -> {
              BillItem item = new BillItem();
              item.setDescription(t.getDescription());
              item.setQuantity(t.getQuantity());
              item.setUnitPrice(t.getUnitPrice());
              item.setAmount(t.getAmount());
              return item;
            })
        .toList();
  }

  private void setItems(Bill bill, List<BillItem> items) {
    bill.getItems().clear();
    int position = 0;
    for (BillItem item : items) {
      item.setBill(bill);
      item.setPosition(position++);
      bill.getItems().add(item);
    }
    bill.recalculate();
  }

  private void publish(Bill bill, Person actor) {
    bill.setStatus(Bill.PUBLISHED);
    bill.setPublishedBy(actor);
    bill.setPublishedAt(Instant.now());
  }

  private String defaultTitle(String category, List<BillItem> items) {
    if ("LOST_BOOK".equals(category)) {
      int books = items.stream().mapToInt(BillItem::getQuantity).sum();
      return books == 1 ? "Lost book: " + items.get(0).getDescription() : "Lost books (" + books + ")";
    }
    if ("DAMAGED_BOOK".equals(category)) {
      return "Damaged book" + (items.size() == 1 ? ": " + items.get(0).getDescription() : "s");
    }
    return null;
  }

  private String category(String value, String department) {
    String category = upper(value);
    List<String> allowed = Bill.LIBRARY.equals(department) ? LIBRARY_CATEGORIES : FINANCE_CATEGORIES;
    if (category == null) {
      return allowed.get(0);
    }
    if (!allowed.contains(category)) {
      throw bad("Unknown bill category: " + value);
    }
    return category;
  }

  private Person student(UUID id) {
    if (id == null) {
      throw bad("Choose the student");
    }
    Person student = lookup.person(id);
    if (!"STUDENT".equals(student.getRoleName())) {
      throw bad("Bills can only be raised for students");
    }
    return student;
  }

  private synchronized List<String> nextBillNumbers(int count) {
    String prefix = "BIL-" + LocalDate.now().getYear() + "-";
    long next = bills.countByBillNumberStartingWith(prefix) + 1;
    List<String> numbers = new ArrayList<>();
    while (numbers.size() < count) {
      String candidate = prefix + String.format("%05d", next++);
      if (!bills.existsByBillNumber(candidate)) {
        numbers.add(candidate);
      }
    }
    return numbers;
  }

  private synchronized String nextReceiptNumber() {
    String prefix = "RCT-" + LocalDate.now().getYear() + "-";
    long next = payments.countByReceiptNumberStartingWith(prefix) + 1;
    String candidate;
    do {
      candidate = prefix + String.format("%05d", next++);
    } while (payments.existsByReceiptNumber(candidate));
    return candidate;
  }

  // ---------------------------------------------------------------- helpers: views

  private StudentAccount account(Person student, boolean publishedOnly, String onlyDepartment) {
    List<Bill> list =
        bills.findByStudentIdOrderByCreatedAtDesc(student.getId()).stream()
            .filter(b -> !publishedOnly || !Bill.DRAFT.equals(b.getStatus()))
            .filter(b -> onlyDepartment == null || onlyDepartment.equals(b.getDepartment()))
            .toList();
    Set<UUID> ids = list.stream().map(Bill::getId).collect(Collectors.toSet());
    List<PaymentView> history =
        payments.findByBillStudentIdOrderByCreatedAtDesc(student.getId()).stream()
            .filter(p -> ids.contains(p.getBill().getId()))
            .filter(
                p ->
                    !publishedOnly
                        || Payment.VALID.equals(p.getStatus())
                        || Payment.PENDING_REVIEW.equals(p.getStatus())
                        || Payment.REJECTED.equals(p.getStatus()))
            .map(this::paymentView)
            .toList();
    List<Bill> open = list.stream().filter(b -> Bill.PUBLISHED.equals(b.getStatus())).toList();
    Totals totals =
        new Totals(
            open.stream().mapToLong(Bill::getAmount).sum(),
            open.stream().mapToLong(Bill::getPaidAmount).sum(),
            open.stream().mapToLong(Bill::balance).sum(),
            open.size(),
            open.stream().filter(b -> b.balance() > 0).count(),
            open.stream().filter(this::isOverdue).count());
    return new StudentAccount(
        student.getId(),
        student.fullName(),
        student.getEmail(),
        student.getCurrentClass() == null ? null : student.getCurrentClass().getClassName(),
        totals,
        list.stream().map(b -> view(b, true, !publishedOnly)).toList(),
        history);
  }

  private StudentBalance balance(Person student, List<Bill> published) {
    long billed = published.stream().mapToLong(Bill::getAmount).sum();
    long paid = published.stream().mapToLong(Bill::getPaidAmount).sum();
    return new StudentBalance(
        student.getId(),
        student.fullName(),
        student.getEmail(),
        student.getCurrentClass() == null ? null : student.getCurrentClass().getClassName(),
        billed,
        paid,
        billed - paid,
        published.stream().filter(b -> b.balance() > 0).count(),
        published.stream().anyMatch(this::isOverdue));
  }

  private Map<String, Object> group(String key, String label, List<Bill> list) {
    long billed = list.stream().mapToLong(Bill::getAmount).sum();
    long collected = list.stream().mapToLong(Bill::getPaidAmount).sum();
    Map<String, Object> row = new LinkedHashMap<>();
    row.put(key, label);
    row.put("bills", list.size());
    row.put("billed", billed);
    row.put("collected", collected);
    row.put("outstanding", billed - collected);
    row.put("studentsOwing", list.stream().filter(b -> b.balance() > 0).map(b -> b.getStudent().getId()).distinct().count());
    return row;
  }

  private BillView view(Bill b, boolean withPayments) {
    return view(b, withPayments, true);
  }

  private BillView view(Bill b, boolean withPayments, boolean includeVoided) {
    Person s = b.getStudent();
    SchoolClass c = classOf(s);
    List<PaymentView> history =
        withPayments
            ? payments.findByBillIdOrderByCreatedAtAsc(b.getId()).stream()
                .filter(
                    p ->
                        includeVoided
                            || Payment.VALID.equals(p.getStatus())
                            || Payment.PENDING_REVIEW.equals(p.getStatus())
                            || Payment.REJECTED.equals(p.getStatus()))
                .map(this::paymentView)
                .toList()
            : List.of();
    return new BillView(
        b.getId(),
        b.getBillNumber(),
        s.getId(),
        s.fullName(),
        s.getEmail(),
        c == null ? null : c.getClassName(),
        b.getDepartment(),
        b.getCategory(),
        b.getTitle(),
        b.getDescription(),
        b.getTerm() == null ? null : b.getTerm().getId(),
        b.getTerm() == null ? null : termLabel(b.getTerm()),
        b.getDueDate(),
        b.getStatus(),
        b.paymentStatus(),
        b.getAmount(),
        b.getPaidAmount(),
        b.balance(),
        isOverdue(b),
        b.getCreatedBy() == null ? null : b.getCreatedBy().fullName(),
        b.getCreatedAt(),
        b.getPublishedAt(),
        b.getCancelReason(),
        b.getItems().stream()
            .map(i -> new BillItemView(i.getId(), i.getDescription(), i.getQuantity(), i.getUnitPrice(), i.getAmount(), i.getLoanId()))
            .toList(),
        history);
  }

  private PaymentView paymentView(Payment p) {
    Bill b = p.getBill();
    SchoolClass c = classOf(b.getStudent());
    return new PaymentView(
        p.getId(),
        p.getReceiptNumber(),
        b.getId(),
        b.getBillNumber(),
        b.getTitle(),
        b.getCategory(),
        b.getDepartment(),
        b.getStudent().getId(),
        b.getStudent().fullName(),
        c == null ? null : c.getClassName(),
        p.getAmount(),
        p.getMethod(),
        p.getReference(),
        p.getPaidOn(),
        p.getNote(),
        p.getSource(),
        p.getRecordedBy() == null ? null : p.getRecordedBy().fullName(),
        p.getCreatedAt(),
        p.getStatus(),
        p.getProofStoredName() != null,
        p.getProofFileName(),
        p.getProofContentType(),
        p.getReviewedBy() == null ? null : p.getReviewedBy().fullName(),
        p.getReviewedAt(),
        p.getReviewNote(),
        p.getVoidReason(),
        b.balance());
  }

  private static String termLabel(Term term) {
    String name = term.getName() == null ? "" : term.getName().replace('_', ' ').toLowerCase(Locale.ROOT);
    String pretty = name.isEmpty() ? name : Character.toUpperCase(name.charAt(0)) + name.substring(1);
    return term.getAcademicYear() == null ? pretty : pretty + " " + term.getAcademicYear().getName();
  }

  // ---------------------------------------------------------------- helpers: misc

  private boolean isOverdue(Bill b) {
    return Bill.PUBLISHED.equals(b.getStatus())
        && b.balance() > 0
        && b.getDueDate() != null
        && b.getDueDate().isBefore(LocalDate.now());
  }

  private static SchoolClass classOf(Person p) {
    return p == null ? null : p.getCurrentClass();
  }

  private boolean matches(Bill b, String search) {
    SchoolClass c = classOf(b.getStudent());
    return contains(b.getBillNumber(), search)
        || contains(b.getTitle(), search)
        || contains(b.getStudent().fullName(), search)
        || contains(b.getStudent().getEmail(), search)
        || (c != null && contains(c.getClassName(), search))
        || b.getItems().stream().anyMatch(i -> contains(i.getDescription(), search));
  }

  private static boolean contains(String value, String search) {
    return value != null && value.toLowerCase(Locale.ROOT).contains(search);
  }

  private void checkDepartment(Bill bill, String onlyDepartment) {
    if (onlyDepartment != null && !onlyDepartment.equals(bill.getDepartment())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This bill belongs to another office");
    }
  }

  private Bill find(UUID id) {
    return bills.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bill not found"));
  }

  private Payment findPayment(UUID id) {
    return payments.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
  }

  private static long money(Object value, String label) {
    if (value == null || value.toString().isBlank()) {
      throw bad(label + " is required");
    }
    try {
      double parsed = Double.parseDouble(value.toString().replace(",", "").trim());
      if (parsed != Math.floor(parsed) || Double.isInfinite(parsed)) {
        throw bad(label + " must be a whole number of francs");
      }
      if (parsed > MAX_AMOUNT) {
        throw bad(label + " is too large");
      }
      return (long) parsed;
    } catch (NumberFormatException e) {
      throw bad(label + " must be a number");
    }
  }

  private static Set<UUID> uuids(Object value) {
    Set<UUID> result = new HashSet<>();
    if (value instanceof Collection<?> list) {
      for (Object o : list) {
        UUID id = Lookup.uuid(o);
        if (id != null) {
          result.add(id);
        }
      }
    }
    return result;
  }

  public static Set<UUID> idList(Object value) {
    return uuids(value);
  }

  private static boolean truthy(Object value) {
    return value != null && Boolean.parseBoolean(value.toString());
  }

  private static String upper(String value) {
    return value == null || value.isBlank() || "ALL".equalsIgnoreCase(value) ? null : value.trim().toUpperCase(Locale.ROOT);
  }

  static String formatRwf(long amount) {
    return String.format(Locale.US, "%,d RWF", amount);
  }

  private static ResponseStatusException bad(String message) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
  }
}
