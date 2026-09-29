package rw.rca.mis.common;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class Pages {
  private Pages() {}

  public static <T> Map<String, Object> of(List<T> all, int page, int limit) {
    int safeLimit = limit <= 0 ? 10 : limit;
    int safePage = Math.max(page, 0);
    int from = Math.min(safePage * safeLimit, all.size());
    int to = Math.min(from + safeLimit, all.size());
    List<T> content = all.subList(from, to);
    int totalPages = all.isEmpty() ? 0 : (int) Math.ceil(all.size() / (double) safeLimit);
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("content", content);
    body.put("totalElements", all.size());
    body.put("totalPages", totalPages);
    body.put("number", safePage);
    body.put("size", safeLimit);
    body.put("numberOfElements", content.size());
    body.put("first", safePage == 0);
    body.put("last", totalPages == 0 || safePage >= totalPages - 1);
    body.put("empty", content.isEmpty());
    return body;
  }
}
