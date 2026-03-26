package com.przo.company_web.service;

import com.przo.company_web.dto.AdminLoginRequest;
import com.przo.company_web.dto.AdminLoginResponse;
import com.przo.company_web.dto.GeoInfo;
import com.przo.company_web.entity.Admin;
import com.przo.company_web.entity.LoginAttemptLog;
import com.przo.company_web.repository.AdminRepository;
import com.przo.company_web.repository.LoginAttemptLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoginRateLimiter rateLimiter;
    private final CaptchaService captchaService;
    private final GeoLocationService geoLocationService;
    private final LoginAttemptLogRepository loginAttemptLogRepository;

    @Value("${turnstile.site-key:}")
    private String captchaSiteKey;

    private record TokenEntry(long expiresAt, String adminName) {}
    private final ConcurrentHashMap<String, TokenEntry> tokenStore = new ConcurrentHashMap<>();
    private static final long TOKEN_EXPIRY_MS = 24L * 60 * 60 * 1000;

    public AdminLoginResponse login(AdminLoginRequest request, String ip) {
        // 1. IP 차단 확인
        if (rateLimiter.isBlocked(ip)) {
            long remaining = rateLimiter.getRemainingBlockMinutes(ip);
            saveLoginAttemptAsync(ip, request.getUsername(), false);
            return new AdminLoginResponse(false,
                    "로그인 시도가 너무 많습니다. " + remaining + "분 후에 다시 시도해주세요.",
                    null, null, false);
        }

        // 2. 캡차 확인 (실패 2회 이상 시 필요)
        if (rateLimiter.isCaptchaRequired(ip)) {
            String token = request.getCaptchaToken();
            if (token == null || token.isBlank()) {
                return new AdminLoginResponse(false,
                        "보안 확인을 완료해주세요.", null, null, true, captchaSiteKey);
            }
            if (!captchaService.verify(token)) {
                return new AdminLoginResponse(false,
                        "보안 확인에 실패했습니다. 다시 시도해주세요.", null, null, true, captchaSiteKey);
            }
        }

        // 3. 인증
        Optional<Admin> adminOpt = adminRepository.findByUsername(request.getUsername());
        boolean passwordMatch = adminOpt
                .map(a -> passwordEncoder.matches(request.getPassword(), a.getPassword()))
                .orElse(false);

        if (!passwordMatch) {
            int failCount = rateLimiter.recordFailure(ip);
            saveLoginAttemptAsync(ip, request.getUsername(), false);
            if (failCount >= 5) {
                return new AdminLoginResponse(false,
                        "로그인 시도가 너무 많습니다. 30분 후에 다시 시도해주세요.",
                        null, null, false);
            }
            boolean needCaptcha = failCount >= 2;
            return new AdminLoginResponse(false,
                    "아이디 또는 비밀번호가 일치하지 않습니다.",
                    null, null, needCaptcha, needCaptcha ? captchaSiteKey : null)
                    .withFailCount(failCount);
        }

        Admin admin = adminOpt.get();
        rateLimiter.recordSuccess(ip);

        String token = UUID.randomUUID().toString();
        tokenStore.put(token, new TokenEntry(System.currentTimeMillis() + TOKEN_EXPIRY_MS, admin.getAdminName()));
        saveLoginAttemptAsync(ip, request.getUsername(), true);
        return new AdminLoginResponse(true, "로그인 성공", token, admin.getAdminName(), false);
    }

    @Async
    public void saveLoginAttemptAsync(String ip, String username, boolean success) {
        GeoInfo geo = geoLocationService.lookup(ip);
        LoginAttemptLog log = new LoginAttemptLog();
        log.setIp(ip);
        log.setCity(geo.city());
        log.setCountry(geo.country());
        log.setUsername(username);
        log.setSuccess(success);
        log.setAttemptedAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")));
        loginAttemptLogRepository.save(log);
    }

    public boolean validateToken(String token) {
        if (token == null || token.isEmpty()) return false;
        TokenEntry entry = tokenStore.get(token);
        if (entry == null) return false;
        if (System.currentTimeMillis() > entry.expiresAt()) {
            tokenStore.remove(token);
            return false;
        }
        return true;
    }

    public String getAdminNameByToken(String token) {
        if (token == null || token.isEmpty()) return null;
        TokenEntry entry = tokenStore.get(token);
        if (entry == null || System.currentTimeMillis() > entry.expiresAt()) return null;
        return entry.adminName();
    }

    public void invalidateToken(String token) {
        if (token != null) tokenStore.remove(token);
    }
}
