package com.przo.company_web.service;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final int CAPTCHA_THRESHOLD = 2;
    private static final long BLOCK_DURATION_MS = 30L * 60 * 1000; // 30분

    private record AttemptInfo(int count, long blockedUntil) {}

    private final ConcurrentHashMap<String, AttemptInfo> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String ip) {
        AttemptInfo info = attempts.get(ip);
        if (info == null || info.blockedUntil() == 0) return false;
        if (System.currentTimeMillis() < info.blockedUntil()) return true;
        attempts.remove(ip); // 차단 만료
        return false;
    }

    public boolean isCaptchaRequired(String ip) {
        if (isBlocked(ip)) return false;
        AttemptInfo info = attempts.get(ip);
        return info != null && info.count() >= CAPTCHA_THRESHOLD;
    }

    /**
     * 실패 기록. 반환값: 누적 실패 횟수
     */
    public int recordFailure(String ip) {
        AttemptInfo current = attempts.getOrDefault(ip, new AttemptInfo(0, 0));
        int newCount = current.count() + 1;
        long blockedUntil = newCount >= MAX_ATTEMPTS
                ? System.currentTimeMillis() + BLOCK_DURATION_MS
                : 0;
        attempts.put(ip, new AttemptInfo(newCount, blockedUntil));
        return newCount;
    }

    public void recordSuccess(String ip) {
        attempts.remove(ip);
    }

    /** 차단 해제까지 남은 분 (올림) */
    public long getRemainingBlockMinutes(String ip) {
        AttemptInfo info = attempts.get(ip);
        if (info == null || info.blockedUntil() == 0) return 0;
        long remaining = info.blockedUntil() - System.currentTimeMillis();
        return remaining <= 0 ? 0 : (remaining / 60000) + 1;
    }
}
