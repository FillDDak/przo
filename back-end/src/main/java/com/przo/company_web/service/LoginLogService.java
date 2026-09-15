package com.przo.company_web.service;

import com.przo.company_web.dto.GeoInfo;
import com.przo.company_web.entity.LoginAttemptLog;
import com.przo.company_web.repository.LoginAttemptLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class LoginLogService {

    private final GeoLocationService geoLocationService;
    private final LoginAttemptLogRepository loginAttemptLogRepository;

    @Async
    public void saveLoginAttempt(String ip, String username, boolean success) {
        GeoInfo geo = geoLocationService.lookup(ip);
        LoginAttemptLog log = new LoginAttemptLog();
        log.setIp(ip);
        log.setCity(geo.city());
        log.setCountry(geo.country());
        log.setUsername(username);
        log.setSuccess(success);
        log.setAttemptedAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")));
        loginAttemptLogRepository.save(log);
    }
}
