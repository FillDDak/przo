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
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

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

        String token = Base64.getEncoder().encodeToString(
                (admin.getId() + ":" + UUID.randomUUID()).getBytes()
        );
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
        log.setAttemptedAt(LocalDateTime.now());
        loginAttemptLogRepository.save(log);
    }

    public boolean validateToken(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        try {
            String decoded = new String(Base64.getDecoder().decode(token));
            String[] parts = decoded.split(":");
            if (parts.length < 2) {
                return false;
            }
            Long adminId = Long.parseLong(parts[0]);
            return adminRepository.existsById(adminId);
        } catch (Exception e) {
            return false;
        }
    }
}
