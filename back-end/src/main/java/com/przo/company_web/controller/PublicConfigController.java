package com.przo.company_web.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class PublicConfigController {

    @Value("${turnstile.site-key:}")
    private String turnstileSiteKey;

    @GetMapping("/turnstile-site-key")
    public ResponseEntity<Map<String, String>> getTurnstileSiteKey() {
        return ResponseEntity.ok(Map.of("siteKey", turnstileSiteKey));
    }
}
