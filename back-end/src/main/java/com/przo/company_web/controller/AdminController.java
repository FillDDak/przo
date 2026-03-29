package com.przo.company_web.controller;

import com.przo.company_web.dto.AdminLoginRequest;
import com.przo.company_web.dto.AdminLoginResponse;
import com.przo.company_web.dto.LoginAttemptLogResponse;
import com.przo.company_web.repository.LoginAttemptLogRepository;
import com.przo.company_web.service.AdminService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final LoginAttemptLogRepository loginAttemptLogRepository;

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(
            @RequestBody AdminLoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        String ip = extractIp(httpRequest);
        AdminLoginResponse response = adminService.login(request, ip);
        if (response.isSuccess()) {
            ResponseCookie cookie = ResponseCookie.from("admin_token", response.getToken())
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(24 * 60 * 60)
                    .sameSite("Strict")
                    .build();
            httpResponse.addHeader("Set-Cookie", cookie.toString());
            response.setToken(null);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> getMe(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        String adminName = adminService.getAdminNameByToken(token);
        if (adminName == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(Map.of("adminName", adminName));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        adminService.invalidateToken(extractTokenFromRequest(request));
        ResponseCookie cookie = ResponseCookie.from("admin_token", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Boolean>> validateToken(HttpServletRequest request) {
        boolean valid = adminService.validateToken(extractTokenFromRequest(request));
        return ResponseEntity.ok(Map.of("valid", valid));
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        if (!adminService.validateToken(extractTokenFromRequest(request))) {
            return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
        }
        Page<LoginAttemptLogResponse> logs = loginAttemptLogRepository
                .findAllByOrderByAttemptedAtDesc(PageRequest.of(page, size))
                .map(LoginAttemptLogResponse::new);
        return ResponseEntity.ok(logs);
    }

    private String extractIp(HttpServletRequest request) {
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

    private String extractTokenFromRequest(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("admin_token".equals(cookie.getName())) return cookie.getValue();
            }
        }
        return extractToken(request.getHeader("Authorization"));
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
