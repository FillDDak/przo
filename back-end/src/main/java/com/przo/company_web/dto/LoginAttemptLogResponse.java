package com.przo.company_web.dto;

import com.przo.company_web.entity.LoginAttemptLog;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
public class LoginAttemptLogResponse {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final Long id;
    private final String ip;
    private final String location;
    private final String username;
    private final boolean success;
    private final String attemptedAt;

    public LoginAttemptLogResponse(LoginAttemptLog log) {
        this.id = log.getId();
        this.ip = log.getIp();
        this.location = buildLocation(log.getCity(), log.getCountry());
        this.username = log.getUsername();
        this.success = log.isSuccess();
        this.attemptedAt = log.getAttemptedAt() != null
                ? log.getAttemptedAt().format(FORMATTER)
                : "";
    }

    private String buildLocation(String city, String country) {
        if (city == null && country == null) return "Unknown";
        if ("Local".equals(city)) return "Local";
        if (city != null && country != null) return city + ", " + country;
        return city != null ? city : country;
    }
}
