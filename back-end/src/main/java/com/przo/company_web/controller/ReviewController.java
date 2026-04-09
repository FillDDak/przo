package com.przo.company_web.controller;

import com.przo.company_web.dto.ReviewListResponse;
import com.przo.company_web.entity.Review;
import com.przo.company_web.service.AdminService;
import com.przo.company_web.service.ReviewService;
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
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final AdminService adminService;

    @Value("${file.upload-dir:uploads/reviews}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getReviewList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {

        Page<ReviewListResponse> reviewPage = reviewService.getReviewList(page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", reviewPage.getContent());
        response.put("currentPage", reviewPage.getNumber());
        response.put("totalPages", reviewPage.getTotalPages());
        response.put("totalElements", reviewPage.getTotalElements());
        response.put("size", reviewPage.getSize());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewListResponse> getReview(@PathVariable Long id) {
        ReviewListResponse review = reviewService.getReview(id);
        if (review == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(review);
    }

    // 관리자 전용: 에디터 이미지 업로드
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam MultipartFile image,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        if (!adminService.validateToken(extractTokenFromRequest(request))) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            String imageUrl = saveFile(image);
            response.put("success", true);
            response.put("url", imageUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "이미지 업로드에 실패했습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 관리자 전용: 이미지 모음 등록
    @PostMapping
    public ResponseEntity<Map<String, Object>> createReview(
            @RequestParam String title,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) String thumbnailUrl,
            @RequestParam(required = false) String createdDate,
            @RequestParam(required = false) String location,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        if (!adminService.validateToken(extractTokenFromRequest(request))) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            Review review = reviewService.createReview(title, content, thumbnailUrl, createdDate, location);

            response.put("success", true);
            response.put("message", "이미지 모음이 등록되었습니다.");
            response.put("reviewId", review.getId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "등록에 실패했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 관리자 전용: 이미지 모음 수정
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateReview(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) String thumbnailUrl,
            @RequestParam(required = false) String createdDate,
            @RequestParam(required = false) String location,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        if (!adminService.validateToken(extractTokenFromRequest(request))) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            Review review = reviewService.updateReview(id, title, content, thumbnailUrl, createdDate, location);
            if (review != null) {
                response.put("success", true);
                response.put("message", "이미지 모음이 수정되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "이미지 모음을 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "수정에 실패했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 관리자 전용: 이미지 모음 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteReview(
            @PathVariable Long id,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        if (!adminService.validateToken(extractTokenFromRequest(request))) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        if (reviewService.deleteReview(id)) {
            response.put("success", true);
            response.put("message", "시공 사진이 삭제되었습니다.");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "이미지 모음을 찾을 수 없습니다.");
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

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of("image/jpeg", "image/png", "image/gif", "image/webp");

    private String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다. (jpg, jpeg, png, gif, webp만 가능)");
        }
        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType)) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다. (jpg, jpeg, png, gif, webp만 가능)");
        }
        String newFilename = UUID.randomUUID().toString() + extension;

        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath);

        return "/" + uploadDir + "/" + newFilename;
    }
}
