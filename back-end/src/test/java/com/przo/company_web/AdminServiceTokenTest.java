package com.przo.company_web;

import com.przo.company_web.dto.GeoInfo;
import com.przo.company_web.dto.AdminLoginRequest;
import com.przo.company_web.dto.AdminLoginResponse;
import com.przo.company_web.entity.Admin;
import com.przo.company_web.repository.AdminRepository;
import com.przo.company_web.repository.LoginAttemptLogRepository;
import com.przo.company_web.service.AdminService;
import com.przo.company_web.service.CaptchaService;
import com.przo.company_web.service.GeoLocationService;
import com.przo.company_web.service.LoginRateLimiter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTokenTest {

    @Mock private AdminRepository adminRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private LoginRateLimiter rateLimiter;
    @Mock private CaptchaService captchaService;
    @Mock private GeoLocationService geoLocationService;
    @Mock private LoginAttemptLogRepository loginAttemptLogRepository;

    @InjectMocks
    private AdminService adminService;

    private String validToken;

    @BeforeEach
    void setUp() {
        Admin admin = new Admin();
        admin.setAdminName("관리자");
        admin.setPassword("hashedPw");

        when(rateLimiter.isBlocked(any())).thenReturn(false);
        when(rateLimiter.isCaptchaRequired(any())).thenReturn(false);
        when(adminRepository.findByUsername("admin")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("pw", "hashedPw")).thenReturn(true);
        when(geoLocationService.lookup(any())).thenReturn(new GeoInfo("Seoul", "Korea"));
        when(loginAttemptLogRepository.save(any())).thenReturn(null);

        AdminLoginRequest request = new AdminLoginRequest();
        request.setUsername("admin");
        request.setPassword("pw");

        AdminLoginResponse response = adminService.login(request, "1.2.3.4");
        validToken = response.getToken();
    }

    @Test
    void 유효한_토큰_검증_성공() {
        assertTrue(adminService.validateToken(validToken));
    }

    @Test
    void null_토큰_검증_실패() {
        assertFalse(adminService.validateToken(null));
    }

    @Test
    void 없는_토큰_검증_실패() {
        assertFalse(adminService.validateToken("nonexistent-token"));
    }

    @Test
    void 토큰_무효화_후_검증_실패() {
        adminService.invalidateToken(validToken);
        assertFalse(adminService.validateToken(validToken));
    }

    @Test
    void 토큰으로_관리자명_조회() {
        assertEquals("관리자", adminService.getAdminNameByToken(validToken));
    }

    @Test
    void 무효화된_토큰으로_관리자명_조회_시_null_반환() {
        adminService.invalidateToken(validToken);
        assertNull(adminService.getAdminNameByToken(validToken));
    }
}
