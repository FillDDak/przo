package com.przo.company_web.controller;

import com.przo.company_web.entity.Faq;
import com.przo.company_web.service.AdminService;
import com.przo.company_web.service.FaqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;
    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        List<Map<String, Object>> result = faqService.getAll().stream().map(faq -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", faq.getId());
            map.put("question", faq.getQuestion());
            map.put("answer", faq.getAnswer());
            map.put("orderIndex", faq.getOrderIndex());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        if (!adminService.validateToken(extractToken(authHeader))) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }
        String question = body.get("question");
        String answer = body.get("answer");
        if (question == null || question.isBlank() || answer == null || answer.isBlank()) {
            response.put("success", false);
            response.put("message", "질문과 답변을 입력해주세요.");
            return ResponseEntity.badRequest().body(response);
        }
        Faq faq = faqService.create(question.trim(), answer.trim());
        response.put("success", true);
        response.put("id", faq.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        if (!adminService.validateToken(extractToken(authHeader))) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }
        String question = body.get("question");
        String answer = body.get("answer");
        if (question == null || question.isBlank() || answer == null || answer.isBlank()) {
            response.put("success", false);
            response.put("message", "질문과 답변을 입력해주세요.");
            return ResponseEntity.badRequest().body(response);
        }
        Faq faq = faqService.update(id, question.trim(), answer.trim());
        if (faq == null) {
            response.put("success", false);
            response.put("message", "존재하지 않는 FAQ입니다.");
            return ResponseEntity.status(404).body(response);
        }
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/reorder")
    public ResponseEntity<Map<String, Object>> reorder(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody List<Long> ids) {
        Map<String, Object> response = new HashMap<>();
        if (!adminService.validateToken(extractToken(authHeader))) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }
        faqService.reorder(ids);
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        if (!adminService.validateToken(extractToken(authHeader))) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return ResponseEntity.status(403).body(response);
        }
        boolean deleted = faqService.delete(id);
        if (!deleted) {
            response.put("success", false);
            response.put("message", "존재하지 않는 FAQ입니다.");
            return ResponseEntity.status(404).body(response);
        }
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
