package com.przo.company_web.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "LOGIN_ATTEMPT_LOGS")
public class LoginAttemptLog {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "login_log_seq")
    @SequenceGenerator(name = "login_log_seq", sequenceName = "LOGIN_ATTEMPT_LOG_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "IP", length = 45)
    private String ip;

    @Column(name = "CITY", length = 100)
    private String city;

    @Column(name = "COUNTRY", length = 100)
    private String country;

    @Column(name = "USERNAME", length = 100)
    private String username;

    @Column(name = "SUCCESS")
    private boolean success;

    @Column(name = "ATTEMPTED_AT")
    private LocalDateTime attemptedAt;
}
