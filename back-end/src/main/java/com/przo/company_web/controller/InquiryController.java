package com.przo.company_web.controller;

import com.przo.company_web.dto.InquiryCreateRequest;
import com.przo.company_web.dto.InquiryListResponse;
import com.przo.company_web.entity.Inquiry;
import com.przo.company_web.service.AdminService;
import com.przo.company_web.service.CaptchaService;
import com.przo.company_web.service.InquiryService;
import com.przo.company_web.service.InquiryVerifyRateLimiter;
import com.przo.company_web.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;
    private final AdminService adminService;
    private final NotificationService notificationService;
    private final CaptchaService captchaService;
    private final InquiryVerifyRateLimiter verifyRateLimiter;

    @Value("${file.upload-dir:uploads/inquiries}")
    private String uploadDir;

    @Value("${turnstile.site-key:}")
    private String captchaSiteKey;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getInquiryList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String title) {

        Page<InquiryListResponse> inquiryPage = inquiryService.getInquiryList(page, size, title);

        Map<String, Object> response = new HashMap<>();
        response.put("content", inquiryPage.getContent());
        response.put("currentPage", inquiryPage.getNumber());
        response.put("totalPages", inquiryPage.getTotalPages());
        response.put("totalElements", inquiryPage.getTotalElements());
        response.put("size", inquiryPage.getSize());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInquiryById(@PathVariable Long id, HttpServletRequest httpRequest) {
        boolean isAdmin = adminService.validateToken(extractTokenFromRequest(httpRequest));
        if (isAdmin) {
            return inquiryService.getInquiryById(id)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
        return inquiryService.getInquiryPublicById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<Map<String, Object>> verifyPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {

        String ip = extractClientIp(httpRequest);
        Map<String, Object> response = new HashMap<>();

        if (verifyRateLimiter.isBlocked(ip)) {
            long remaining = verifyRateLimiter.getRemainingBlockMinutes(ip);
            response.put("success", false);
            response.put("blocked", true);
            response.put("remainingMinutes", remaining);
            response.put("message", "비밀번호 입력 횟수를 초과했습니다. 약 " + remaining + "분 후에 다시 시도해주세요.");
            return ResponseEntity.status(429).body(response);
        }

        // CAPTCHA 검증 (5회 이상 실패 시 필요)
        if (verifyRateLimiter.isCaptchaRequired(ip)) {
            String captchaToken = request.get("captchaToken");
            if (captchaToken == null || captchaToken.isBlank()) {
                response.put("success", false);
                response.put("captchaRequired", true);
                response.put("captchaSiteKey", captchaSiteKey);
                response.put("attemptCount", verifyRateLimiter.getAttemptCount(ip));
                response.put("maxAttempts", InquiryVerifyRateLimiter.MAX_ATTEMPTS);
                response.put("message", "보안 확인을 완료해주세요.");
                return ResponseEntity.ok(response);
            }
            if (!captchaService.verify(captchaToken)) {
                response.put("success", false);
                response.put("captchaRequired", true);
                response.put("captchaSiteKey", captchaSiteKey);
                response.put("attemptCount", verifyRateLimiter.getAttemptCount(ip));
                response.put("maxAttempts", InquiryVerifyRateLimiter.MAX_ATTEMPTS);
                response.put("message", "보안 확인에 실패했습니다. 다시 시도해주세요.");
                return ResponseEntity.ok(response);
            }
        }

        String password = request.get("password");
        boolean verified = inquiryService.verifyPassword(id, password);

        if (verified) {
            verifyRateLimiter.clearAttempts(ip);
            response.put("success", true);
            response.put("message", "비밀번호가 확인되었습니다.");
            inquiryService.getInquiryById(id).ifPresent(inquiry -> response.put("inquiry", inquiry));
        } else {
            int count = verifyRateLimiter.recordAttempt(ip);
            response.put("success", false);
            response.put("attemptCount", count);
            response.put("maxAttempts", InquiryVerifyRateLimiter.MAX_ATTEMPTS);
            if (count >= InquiryVerifyRateLimiter.MAX_ATTEMPTS) {
                long remaining = verifyRateLimiter.getRemainingBlockMinutes(ip);
                response.put("blocked", true);
                response.put("remainingMinutes", remaining);
                response.put("message", "비밀번호 입력 횟수를 초과했습니다. 약 " + remaining + "분 후에 다시 시도해주세요.");
                return ResponseEntity.status(429).body(response);
            }
            if (count >= InquiryVerifyRateLimiter.CAPTCHA_THRESHOLD) {
                response.put("captchaRequired", true);
                response.put("captchaSiteKey", captchaSiteKey);
            }
            response.put("message", "비밀번호가 일치하지 않습니다.");
        }

        return ResponseEntity.ok(response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) return realIp.trim();
        return request.getRemoteAddr();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createInquiry(
            @RequestParam String name,
            @RequestParam(required = false) String companyName,
            @RequestParam String phone,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) List<MultipartFile> attachments,
            @RequestParam(required = false) String captchaToken) {

        Map<String, Object> response = new HashMap<>();

        // 서버사이드 입력 검증
        String validationError = validateInquiryFields(name, phone, email, title, content);
        if (validationError != null) {
            response.put("success", false);
            response.put("message", validationError);
            return ResponseEntity.status(400).body(response);
        }

        if (!captchaService.verify(captchaToken)) {
            response.put("success", false);
            response.put("message", "보안 확인에 실패했습니다. 다시 시도해주세요.");
            return ResponseEntity.status(400).body(response);
        }

        try {
            // 파일 저장 처리
            String attachmentPath = saveFiles(attachments);

            // DTO 생성
            InquiryCreateRequest request = new InquiryCreateRequest();
            request.setName(name);
            request.setCompanyName(companyName);
            request.setPhone(phone);
            request.setEmail(email);
            request.setPassword(password);
            request.setTitle(title);
            request.setContent(content);

            // 문의 저장
            Inquiry inquiry = inquiryService.createInquiry(request, attachmentPath);

            // 관리자 알림 (이메일 + 카카오톡)
            notificationService.sendNewInquiryNotification(inquiry);

            response.put("success", true);
            response.put("message", "문의가 성공적으로 등록되었습니다.");
            response.put("inquiryId", inquiry.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "문의 등록에 실패했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/{id}/update")
    public ResponseEntity<Map<String, Object>> updateInquiry(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam(required = false) String companyName,
            @RequestParam String phone,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam(required = false) String newPassword,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) List<MultipartFile> attachments,
            HttpServletRequest httpRequest) {

        Map<String, Object> response = new HashMap<>();

        // 서버사이드 입력 검증
        String validationError = validateInquiryFields(name, phone, email, title, content);
        if (validationError != null) {
            response.put("success", false);
            response.put("message", validationError);
            return ResponseEntity.status(400).body(response);
        }

        // Rate Limiting 확인
        String ip = extractClientIp(httpRequest);
        if (verifyRateLimiter.isBlocked(ip)) {
            long remaining = verifyRateLimiter.getRemainingBlockMinutes(ip);
            response.put("success", false);
            response.put("blocked", true);
            response.put("remainingMinutes", remaining);
            response.put("message", "비밀번호 입력 횟수를 초과했습니다. 약 " + remaining + "분 후에 다시 시도해주세요.");
            return ResponseEntity.status(429).body(response);
        }

        // 비밀번호 확인
        if (!inquiryService.verifyPassword(id, password)) {
            int count = verifyRateLimiter.recordAttempt(ip);
            response.put("success", false);
            response.put("attemptCount", count);
            response.put("maxAttempts", InquiryVerifyRateLimiter.MAX_ATTEMPTS);
            if (count >= InquiryVerifyRateLimiter.MAX_ATTEMPTS) {
                long remaining = verifyRateLimiter.getRemainingBlockMinutes(ip);
                response.put("blocked", true);
                response.put("remainingMinutes", remaining);
                response.put("message", "비밀번호 입력 횟수를 초과했습니다. 약 " + remaining + "분 후에 다시 시도해주세요.");
                return ResponseEntity.status(429).body(response);
            }
            response.put("message", "비밀번호가 일치하지 않습니다.");
            return ResponseEntity.status(401).body(response);
        }

        verifyRateLimiter.clearAttempts(ip);

        try {
            // 파일 저장 처리
            String attachmentPath = saveFiles(attachments);

            // DTO 생성
            InquiryCreateRequest request = new InquiryCreateRequest();
            request.setName(name);
            request.setCompanyName(companyName);
            request.setPhone(phone);
            request.setEmail(email);
            request.setPassword(newPassword != null && !newPassword.isEmpty() ? newPassword : password);
            request.setTitle(title);
            request.setContent(content);

            // 문의 수정
            return inquiryService.updateInquiry(id, request, attachmentPath)
                    .map(inquiry -> {
                        response.put("success", true);
                        response.put("message", "문의가 성공적으로 수정되었습니다.");
                        return ResponseEntity.ok(response);
                    })
                    .orElseGet(() -> {
                        response.put("success", false);
                        response.put("message", "문의를 찾을 수 없습니다.");
                        return ResponseEntity.notFound().build();
                    });

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "문의 수정에 실패했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 관리자 전용: 답변 등록
    @PostMapping("/{id}/reply")
    public ResponseEntity<Map<String, Object>> addAdminReply(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {

        Map<String, Object> response = new HashMap<>();

        // 관리자 인증 확인
        if (!adminService.validateToken(extractTokenFromRequest(httpRequest))) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        String adminNote = request.get("adminNote");
        return inquiryService.addAdminReply(id, adminNote)
                .map(inquiry -> {
                    response.put("success", true);
                    response.put("message", "답변이 등록되었습니다.");
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    response.put("success", false);
                    response.put("message", "문의를 찾을 수 없습니다.");
                    return ResponseEntity.notFound().build();
                });
    }

    // 관리자 전용: 답변 초기화
    @DeleteMapping("/{id}/reply")
    public ResponseEntity<Map<String, Object>> clearAdminReply(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        Map<String, Object> response = new HashMap<>();

        if (!adminService.validateToken(extractTokenFromRequest(httpRequest))) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        return inquiryService.clearAdminReply(id)
                .map(inquiry -> {
                    response.put("success", true);
                    response.put("message", "답변이 초기화되었습니다.");
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    response.put("success", false);
                    response.put("message", "문의를 찾을 수 없습니다.");
                    return ResponseEntity.notFound().build();
                });
    }

    // 관리자 전용: 문의 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteInquiry(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        Map<String, Object> response = new HashMap<>();

        // 관리자 인증 확인
        if (!adminService.validateToken(extractTokenFromRequest(httpRequest))) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        if (inquiryService.deleteInquiry(id)) {
            response.put("success", true);
            response.put("message", "문의가 삭제되었습니다.");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "문의를 찾을 수 없습니다.");
            return ResponseEntity.notFound().build();
        }
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

    private String validateInquiryFields(String name, String phone, String email, String title, String content) {
        if (name == null || name.isBlank()) return "이름을 입력해주세요.";
        if (name.length() > 20) return "이름은 20자 이내로 입력해주세요.";
        if (phone == null || phone.isBlank()) return "전화번호를 입력해주세요.";
        if (email == null || email.isBlank()) return "이메일을 입력해주세요.";
        if (email.length() > 100) return "이메일은 100자 이내로 입력해주세요.";
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) return "올바른 이메일 형식을 입력해주세요.";
        if (title == null || title.isBlank()) return "제목을 입력해주세요.";
        if (title.length() > 100) return "제목은 100자 이내로 입력해주세요.";
        if (content == null || content.isBlank()) return "문의 내용을 입력해주세요.";
        if (content.length() > 2000) return "문의 내용은 2000자 이내로 입력해주세요.";
        return null;
    }

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".pdf");
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of("image/jpeg", "image/png", "image/gif", "application/pdf");

    private String saveFiles(List<MultipartFile> files) throws IOException {
        if (files == null || files.isEmpty()) return null;
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        List<String> paths = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            }
            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                throw new IllegalArgumentException("허용되지 않는 파일 형식입니다. (jpg, jpeg, png, gif, pdf만 가능)");
            }
            String mimeType = file.getContentType();
            if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType)) {
                throw new IllegalArgumentException("허용되지 않는 파일 형식입니다. (jpg, jpeg, png, gif, pdf만 가능)");
            }
            String newFilename = UUID.randomUUID().toString() + extension;
            Files.copy(file.getInputStream(), uploadPath.resolve(newFilename));
            paths.add("/" + uploadDir + "/" + newFilename);
        }
        return paths.isEmpty() ? null : String.join(",", paths);
    }
}
