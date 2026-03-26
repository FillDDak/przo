package com.przo.company_web.service;

import com.przo.company_web.repository.LoginAttemptLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogCleanupService {

    private final LoginAttemptLogRepository loginAttemptLogRepository;

    // 매일 새벽 3시에 180일 지난 로그 자동 삭제
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void deleteOldLoginAttemptLogs() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(180);
        int deleted = loginAttemptLogRepository.deleteByAttemptedAtBefore(cutoff);
        if (deleted > 0) {
            log.info("로그인 시도 기록 자동 삭제: {}건 (180일 이전)", deleted);
        }
    }
}
