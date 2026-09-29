package rw.rca.mis.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
}
