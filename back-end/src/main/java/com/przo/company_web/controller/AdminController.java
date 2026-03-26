package com.przo.company_web.controller;

import com.przo.company_web.dto.AdminLoginRequest;
import com.przo.company_web.dto.AdminLoginResponse;
import com.przo.company_web.dto.LoginAttemptLogResponse;
import com.przo.company_web.repository.LoginAttemptLogRepository;
import com.przo.company_web.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
            HttpServletRequest httpRequest) {
        String ip = extractIp(httpRequest);
        AdminLoginResponse response = adminService.login(request, ip);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body(response);
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Boolean>> validateToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extractToken(authHeader);
        boolean valid = adminService.validateToken(token);
        return ResponseEntity.ok(Map.of("valid", valid));
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        if (!adminService.validateToken(extractToken(authHeader))) {
            return ResponseEntity.status(401).body(Map.of("error", "인증이 필요합니다."));
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

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
