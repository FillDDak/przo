package com.przo.company_web.config;

import com.przo.company_web.entity.Admin;
import com.przo.company_web.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (adminRepository.findByUsername(adminUsername).isPresent()) return;

        Admin admin = new Admin();
        admin.setUsername(adminUsername);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setAdminName("프르조 관리자");
        admin.setEmail("admin@przo.co.kr");
        adminRepository.save(admin);
        log.info("관리자 계정이 생성되었습니다. (username: {})", adminUsername);
    }
}
