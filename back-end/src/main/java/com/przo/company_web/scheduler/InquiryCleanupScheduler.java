package com.przo.company_web.scheduler;

import com.przo.company_web.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class InquiryCleanupScheduler {

    private final InquiryRepository inquiryRepository;

    // 매일 새벽 2시 실행
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void deleteOldInquiries() {
        LocalDateTime threeYearsAgo = LocalDateTime.now().minusYears(3);
        inquiryRepository.deleteByCreatedAtBefore(threeYearsAgo);
        log.info("3년 경과 문의 데이터 자동 삭제 완료 (기준: {})", threeYearsAgo);
    }
}
