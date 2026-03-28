package com.przo.company_web.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // POST /api/inquiries : 1시간 내 5회 (스팸 방지)
    private static final int CREATE_MAX = 5;
    private static final long CREATE_WINDOW_MS = 60 * 60 * 1000L;

    private record WindowEntry(int count, long windowStart) {}

    private final ConcurrentHashMap<String, WindowEntry> createAttempts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String method = request.getMethod();
        String path = request.getRequestURI();
        String ip = getClientIp(request);

        boolean limited = false;

        if ("POST".equals(method) && "/api/inquiries".equals(path)) {
            limited = isRateLimited(createAttempts, ip, CREATE_MAX, CREATE_WINDOW_MS);
        }

        if (limited) {
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"message\":\"요청이 너무 많습니다. 잠시 후 다시 시도해주세요.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(ConcurrentHashMap<String, WindowEntry> map, String ip, int max, long windowMs) {
        long now = System.currentTimeMillis();
        WindowEntry entry = map.get(ip);

        if (entry == null || now - entry.windowStart() >= windowMs) {
            map.put(ip, new WindowEntry(1, now));
            return false;
        }

        if (entry.count() >= max) {
            return true;
        }

        map.put(ip, new WindowEntry(entry.count() + 1, entry.windowStart()));
        return false;
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
