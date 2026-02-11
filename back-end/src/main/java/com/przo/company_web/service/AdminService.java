package com.przo.company_web.service;

import com.przo.company_web.dto.AdminLoginRequest;
import com.przo.company_web.dto.AdminLoginResponse;
import com.przo.company_web.entity.Admin;
import com.przo.company_web.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminLoginResponse login(AdminLoginRequest request) {
        Optional<Admin> adminOpt = adminRepository.findByUsername(request.getUsername());

        if (adminOpt.isEmpty()) {
            return new AdminLoginResponse(false, "아이디 또는 비밀번호가 일치하지 않습니다.", null, null);
        }

        Admin admin = adminOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            return new AdminLoginResponse(false, "아이디 또는 비밀번호가 일치하지 않습니다.", null, null);
        }

        // 간단한 토큰 생성 (실제 운영 환경에서는 JWT 사용 권장)
        String token = Base64.getEncoder().encodeToString(
            (admin.getId() + ":" + UUID.randomUUID().toString()).getBytes()
        );

        return new AdminLoginResponse(true, "로그인 성공", token, admin.getAdminName());
    }

    public boolean validateToken(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        try {
            String decoded = new String(Base64.getDecoder().decode(token));
            String[] parts = decoded.split(":");
            if (parts.length < 2) {
                return false;
            }
            Long adminId = Long.parseLong(parts[0]);
            return adminRepository.existsById(adminId);
        } catch (Exception e) {
            return false;
        }
    }
}
