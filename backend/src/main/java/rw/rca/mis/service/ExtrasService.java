package rw.rca.mis.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import rw.rca.mis.domain.Candidate;
import rw.rca.mis.domain.NewsItem;
import rw.rca.mis.domain.PastPaper;
import rw.rca.mis.domain.Position;
import rw.rca.mis.domain.Vote;
import rw.rca.mis.domain.VotingSession;
import rw.rca.mis.repo.CandidateRepository;
import rw.rca.mis.repo.NewsRepository;
import rw.rca.mis.repo.PastPaperRepository;
import rw.rca.mis.repo.PositionRepository;
import rw.rca.mis.repo.VoteRepository;
import rw.rca.mis.repo.VotingSessionRepository;

@Service
public class ExtrasService {
  private final PositionRepository positions;
  private final CandidateRepository candidates;
  private final VotingSessionRepository sessions;
  private final VoteRepository votes;
  private final NewsRepository news;
  private final PastPaperRepository papers;
  private final Lookup lookup;

  public ExtrasService(
      PositionRepository positions,
      CandidateRepository candidates,
      VotingSessionRepository sessions,
      VoteRepository votes,
      NewsRepository news,
      PastPaperRepository papers,
      Lookup lookup) {
    this.positions = positions;
    this.candidates = candidates;
    this.sessions = sessions;
    this.votes = votes;
    this.news = news;
    this.papers = papers;
    this.lookup = lookup;
  }

  public List<Position> positions() {
    return positions.findAll();
  }

  @Transactional
  public Position createPosition(String name) {
    Position position = new Position();
    position.setName(name);
    return positions.save(position);
  }

  @Transactional
  public Position updatePosition(UUID id, Map<String, Object> body) {
    Position position = positions.findById(id).orElseThrow();
    String name = Lookup.text(body, "name");
    if (name != null) {
      position.setName(name);
    }
    if (body.get("academicYearId") != null) {
      position.setAcademicYear(lookup.year(Lookup.uuid(body.get("academicYearId"))));
    }
    return positions.save(position);
  }

  public List<Candidate> candidates() {
    return candidates.findAll();
  }

  public List<Candidate> candidatesForStudent(UUID studentId) {
    return candidates.findByStudentId(studentId);
  }

  @Transactional
  public Candidate createCandidate(Map<String, Object> body) {
    Candidate candidate = new Candidate();
    if (body.get("studentId") != null) {
      candidate.setStudent(lookup.person(Lookup.uuid(body.get("studentId"))));
    }
    if (body.get("positionId") != null) {
      candidate.setPosition(positions.findById(Lookup.uuid(body.get("positionId"))).orElse(null));
    }
    return candidates.save(candidate);
  }

  public List<VotingSession> sessions() {
    return sessions.findAll();
  }

  @Transactional
  public VotingSession createSession(Map<String, Object> body) {
    VotingSession session = new VotingSession();
    session.setTitle(Lookup.text(body, "title", "name"));
    if (body.get("startDate") != null) {
      session.setStartDate(Lookup.date(body.get("startDate")));
    }
    if (body.get("endDate") != null) {
      session.setEndDate(Lookup.date(body.get("endDate")));
    }
    return sessions.save(session);
  }

  @Transactional
  public VotingSession updateSession(UUID id, Map<String, Object> body) {
    VotingSession session = sessions.findById(id).orElseThrow();
    String title = Lookup.text(body, "title", "name");
    if (title != null) {
      session.setTitle(title);
    }
    return sessions.save(session);
  }

  @Transactional
  public VotingSession release(UUID id, String action) {
    VotingSession session = sessions.findById(id).orElseThrow();
    session.setResultStatus("release".equalsIgnoreCase(action) ? "RELEASED" : "HOLD");
    return sessions.save(session);
  }

  @Transactional
  public List<Vote> vote(Map<String, Object> body) {
    Object items = body.get("votes");
    if (items instanceof List<?> list) {
      return list.stream().map(item -> saveVote(cast(item))).toList();
    }
    return List.of(saveVote(body));
  }

  public List<NewsItem> news() {
    return news.findAll();
  }

  public List<PastPaper> papersForCourse(UUID courseId) {
    return papers.findByCourseId(courseId);
  }

  public PastPaper paper(UUID id) {
    return papers.findById(id).orElseThrow();
  }

  @Transactional
  public PastPaper updatePaper(UUID id, Map<String, Object> body) {
    PastPaper paper = paper(id);
    String title = Lookup.text(body, "title", "name");
    if (title != null) {
      paper.setTitle(title);
    }
    return papers.save(paper);
  }

  @Transactional
  public void deletePaper(UUID id) {
    papers.deleteById(id);
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> cast(Object item) {
    return (Map<String, Object>) item;
  }

  private Vote saveVote(Map<String, Object> body) {
    Vote vote = new Vote();
    vote.setVoter(lookup.currentUser());
    if (body.get("candidateId") != null) {
      vote.setCandidate(candidates.findById(Lookup.uuid(body.get("candidateId"))).orElse(null));
    }
    if (body.get("positionId") != null) {
      vote.setPosition(positions.findById(Lookup.uuid(body.get("positionId"))).orElse(null));
    }
    if (body.get("sessionId") != null) {
      vote.setSession(sessions.findById(Lookup.uuid(body.get("sessionId"))).orElse(null));
    }
    return votes.save(vote);
  }

  public Map<String, Object> electionResults(UUID sessionId) {
    VotingSession session =
        sessions
            .findById(sessionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voting session not found"));
    List<Vote> ballots = votes.findBySessionId(sessionId);
    Set<Position> positionSet = new LinkedHashSet<>(session.getPositions());
    ballots.stream().map(Vote::getPosition).filter(Objects::nonNull).forEach(positionSet::add);

    List<Map<String, Object>> positionRows = new ArrayList<>();
    Map<UUID, List<Vote>> byPosition =
        ballots.stream()
            .filter(vote -> vote.getPosition() != null)
            .collect(Collectors.groupingBy(vote -> vote.getPosition().getId()));

    for (Position position : positionSet) {
      List<Vote> forPosition = byPosition.getOrDefault(position.getId(), List.of());
      Map<UUID, Long> tally =
          forPosition.stream()
              .filter(vote -> vote.getCandidate() != null)
              .collect(Collectors.groupingBy(vote -> vote.getCandidate().getId(), Collectors.counting()));
      List<Map<String, Object>> candidates = new ArrayList<>();
      for (Map.Entry<UUID, Long> entry : tally.entrySet()) {
        Candidate candidate =
            forPosition.stream()
                .map(Vote::getCandidate)
                .filter(item -> item != null && entry.getKey().equals(item.getId()))
                .findFirst()
                .orElse(null);
        Map<String, Object> row = new LinkedHashMap<>();
        String name =
            candidate == null || candidate.getStudent() == null ? "" : candidate.getStudent().fullName();
        row.put("name", name);
        row.put("votes", entry.getValue());
        candidates.add(row);
      }
      candidates.sort(Comparator.comparingLong((Map<String, Object> row) -> (Long) row.get("votes")).reversed());
      Long previous = null;
      int rank = 1;
      for (int i = 0; i < candidates.size(); i++) {
        Long current = (Long) candidates.get(i).get("votes");
        if (previous != null && !previous.equals(current)) {
          rank = i + 1;
        }
        candidates.get(i).put("rank", rank);
        previous = current;
      }
      Map<String, Object> positionRow = new LinkedHashMap<>();
      positionRow.put("name", position.getName());
      positionRow.put("candidates", candidates);
      positionRows.add(positionRow);
    }

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("title", session.getTitle());
    body.put("startDate", session.getStartDate());
    body.put("endDate", session.getEndDate());
    body.put("positions", positionRows);
    return body;
  }
}
