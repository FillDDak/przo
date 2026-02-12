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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
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

    // 관리자 전용: 에디터 이미지 업로드
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam MultipartFile image,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Map<String, Object> response = new HashMap<>();

        String token = extractToken(authHeader);
        if (!adminService.validateToken(token)) {
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

    // 관리자 전용: 시공 사진 등록
    @PostMapping
    public ResponseEntity<Map<String, Object>> createReview(
            @RequestParam String title,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) String thumbnailUrl,
            @RequestParam(required = false) String createdDate,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Map<String, Object> response = new HashMap<>();

        String token = extractToken(authHeader);
        if (!adminService.validateToken(token)) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            Review review = reviewService.createReview(title, content, thumbnailUrl, createdDate);

            response.put("success", true);
            response.put("message", "시공 사진이 등록되었습니다.");
            response.put("reviewId", review.getId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "등록에 실패했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 관리자 전용: 시공 사진 수정
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateReview(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) String thumbnailUrl,
            @RequestParam(required = false) String createdDate,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Map<String, Object> response = new HashMap<>();

        String token = extractToken(authHeader);
        if (!adminService.validateToken(token)) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }

        try {
            Review review = reviewService.updateReview(id, title, content, thumbnailUrl, createdDate);
            if (review != null) {
                response.put("success", true);
                response.put("message", "시공 사진이 수정되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "시공 사진을 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "수정에 실패했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 관리자 전용: 시공 사진 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteReview(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Map<String, Object> response = new HashMap<>();

        String token = extractToken(authHeader);
        if (!adminService.validateToken(token)) {
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
            response.put("message", "시공 사진을 찾을 수 없습니다.");
            return ResponseEntity.notFound().build();
        }
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private String saveFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String newFilename = UUID.randomUUID().toString() + extension;

        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath);

        return "/" + uploadDir + "/" + newFilename;
    }
}
