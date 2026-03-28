package com.przo.company_web;

import com.przo.company_web.service.LoginRateLimiter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LoginRateLimiterTest {

    private LoginRateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new LoginRateLimiter();
    }

    @Test
    void 초기_상태_차단_안됨() {
        assertFalse(rateLimiter.isBlocked("1.2.3.4"));
    }

    @Test
    void 초기_상태_캡차_불필요() {
        assertFalse(rateLimiter.isCaptchaRequired("1.2.3.4"));
    }

    @Test
    void 실패_두번_후_캡차_필요() {
        rateLimiter.recordFailure("1.2.3.4");
        rateLimiter.recordFailure("1.2.3.4");
        assertTrue(rateLimiter.isCaptchaRequired("1.2.3.4"));
    }

    @Test
    void 실패_다섯번_후_차단됨() {
        for (int i = 0; i < 5; i++) {
            rateLimiter.recordFailure("1.2.3.4");
        }
        assertTrue(rateLimiter.isBlocked("1.2.3.4"));
    }

    @Test
    void 실패_네번_후_아직_차단_안됨() {
        for (int i = 0; i < 4; i++) {
            rateLimiter.recordFailure("1.2.3.4");
        }
        assertFalse(rateLimiter.isBlocked("1.2.3.4"));
    }

    @Test
    void 성공_후_실패_기록_초기화() {
        rateLimiter.recordFailure("1.2.3.4");
        rateLimiter.recordFailure("1.2.3.4");
        rateLimiter.recordSuccess("1.2.3.4");
        assertFalse(rateLimiter.isCaptchaRequired("1.2.3.4"));
        assertFalse(rateLimiter.isBlocked("1.2.3.4"));
    }

    @Test
    void 다른_IP는_독립적으로_추적() {
        for (int i = 0; i < 5; i++) {
            rateLimiter.recordFailure("1.2.3.4");
        }
        assertTrue(rateLimiter.isBlocked("1.2.3.4"));
        assertFalse(rateLimiter.isBlocked("5.6.7.8"));
    }

    @Test
    void 차단_후_남은_시간_반환() {
        for (int i = 0; i < 5; i++) {
            rateLimiter.recordFailure("1.2.3.4");
        }
        assertTrue(rateLimiter.getRemainingBlockMinutes("1.2.3.4") > 0);
    }
}
