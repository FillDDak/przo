package com.przo.company_web.controller;

import com.przo.company_web.service.AdminService;
import com.przo.company_web.service.PriceTableService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/price-table")
@RequiredArgsConstructor
public class PriceTableController {

    private final PriceTableService priceTableService;
    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> load() {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<String> data = priceTableService.load();
            if (data.isPresent()) {
                response.put("success", true);
                response.put("data", data.get());
            } else {
                response.put("success", false);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "데이터 로드 실패: " + e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> save(
            HttpServletRequest request,
            @RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        if (!adminService.validateToken(extractTokenFromRequest(request))) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }
        String dataJson = body.get("data");
        if (dataJson == null || dataJson.isBlank()) {
            response.put("success", false);
            response.put("message", "데이터가 없습니다.");
            return ResponseEntity.badRequest().body(response);
        }
        try {
            priceTableService.save(dataJson);
            Optional<String> saved = priceTableService.load();
            if (saved.isPresent()) {
                response.put("success", true);
                response.put("data", saved.get());
            } else {
                response.put("success", false);
                response.put("message", "저장 후 데이터 확인 실패");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "DB 저장 실패: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
        return ResponseEntity.ok(response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("admin_token".equals(cookie.getName())) return cookie.getValue();
            }
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) return authHeader.substring(7);
        return null;
    }
}
