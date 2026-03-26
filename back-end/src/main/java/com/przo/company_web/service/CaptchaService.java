package com.przo.company_web.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CaptchaService {

    private static final String VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    @Value("${turnstile.secret:}")
    private String secret;

    private final RestTemplate restTemplate;

    /**
     * Cloudflare Turnstile 토큰 검증.
     * secret이 비어 있으면(로컬 개발 환경) 항상 true를 반환한다.
     */
    public boolean verify(String token) {
        if (secret == null || secret.isBlank()) {
            return true; // 로컬 환경 — 스킵
        }
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("secret", secret);
            body.add("response", token);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(VERIFY_URL, body, Map.class);
            return response != null && Boolean.TRUE.equals(response.get("success"));
        } catch (Exception e) {
            log.warn("Turnstile 검증 요청 실패: {}", e.getMessage());
            return false;
        }
    }
}
