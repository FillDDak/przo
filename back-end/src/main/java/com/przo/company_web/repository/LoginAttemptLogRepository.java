package com.przo.company_web.repository;

import com.przo.company_web.entity.LoginAttemptLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface LoginAttemptLogRepository extends JpaRepository<LoginAttemptLog, Long> {
    Page<LoginAttemptLog> findAllByOrderByAttemptedAtDesc(Pageable pageable);

    @Modifying
    @Query("DELETE FROM LoginAttemptLog l WHERE l.attemptedAt < :cutoff")
    int deleteByAttemptedAtBefore(@Param("cutoff") LocalDateTime cutoff);
}
