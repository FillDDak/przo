package com.przo.company_web.config;

import com.przo.company_web.entity.Admin;
import com.przo.company_web.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String username = "przo_admin";
        String rawPassword = "przo1234";

        Optional<Admin> existingAdmin = adminRepository.findByUsername(username);

        if (existingAdmin.isEmpty()) {
            // 관리자 계정이 없으면 생성
            Admin admin = new Admin();
            admin.setUsername(username);
            admin.setPassword(passwordEncoder.encode(rawPassword));
            admin.setAdminName("프르조 관리자");
            admin.setEmail("admin@przo.co.kr");
            adminRepository.save(admin);
            log.info("관리자 계정이 생성되었습니다. (username: {}, password: {})", username, rawPassword);
        } else {
            // 기존 계정이 있으면 비밀번호 업데이트
            Admin admin = existingAdmin.get();
            admin.setPassword(passwordEncoder.encode(rawPassword));
            adminRepository.save(admin);
            log.info("관리자 계정 비밀번호가 업데이트되었습니다. (username: {}, password: {})", username, rawPassword);
        }
    }
}
