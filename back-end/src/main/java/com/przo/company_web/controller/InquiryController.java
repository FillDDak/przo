package com.przo.company_web.controller;

import com.przo.company_web.dto.InquiryCreateRequest;
import com.przo.company_web.dto.InquiryDetailResponse;
import com.przo.company_web.dto.InquiryListResponse;
import com.przo.company_web.entity.Inquiry;
import com.przo.company_web.service.InquiryService;
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
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    @Value("${file.upload-dir:uploads/inquiries}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getInquiryList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<InquiryListResponse> inquiryPage = inquiryService.getInquiryList(page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", inquiryPage.getContent());
        response.put("currentPage", inquiryPage.getNumber());
        response.put("totalPages", inquiryPage.getTotalPages());
        response.put("totalElements", inquiryPage.getTotalElements());
        response.put("size", inquiryPage.getSize());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InquiryDetailResponse> getInquiryById(@PathVariable Long id) {
        return inquiryService.getInquiryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<Map<String, Object>> verifyPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        String password = request.get("password");
        Map<String, Object> response = new HashMap<>();

        boolean verified = inquiryService.verifyPassword(id, password);

        if (verified) {
            response.put("success", true);
            response.put("message", "비밀번호가 확인되었습니다.");
        } else {
            response.put("success", false);
            response.put("message", "비밀번호가 일치하지 않습니다.");
        }

        return ResponseEntity.ok(response);
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
            @RequestParam(required = false) MultipartFile attachment) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 파일 저장 처리
            String attachmentPath = null;
            if (attachment != null && !attachment.isEmpty()) {
                attachmentPath = saveFile(attachment);
            }

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

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateInquiry(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam(required = false) String companyName,
            @RequestParam String phone,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) MultipartFile attachment) {

        Map<String, Object> response = new HashMap<>();

        // 비밀번호 확인
        if (!inquiryService.verifyPassword(id, password)) {
            response.put("success", false);
            response.put("message", "비밀번호가 일치하지 않습니다.");
            return ResponseEntity.status(401).body(response);
        }

        try {
            // 파일 저장 처리
            String attachmentPath = null;
            if (attachment != null && !attachment.isEmpty()) {
                attachmentPath = saveFile(attachment);
            }

            // DTO 생성
            InquiryCreateRequest request = new InquiryCreateRequest();
            request.setName(name);
            request.setCompanyName(companyName);
            request.setPhone(phone);
            request.setEmail(email);
            request.setPassword(password);
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

    private String saveFile(MultipartFile file) throws IOException {
        // 업로드 디렉토리 생성
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 파일명 생성 (UUID + 원본 파일명)
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String newFilename = UUID.randomUUID().toString() + extension;

        // 파일 저장
        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath);

        return "/" + uploadDir + "/" + newFilename;
    }
}
