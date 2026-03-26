package com.przo.company_web.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminLoginResponse {
    private boolean success;
    private String message;
    private String token;
    private String adminName;
    private boolean captchaRequired;
    private String captchaSiteKey;
    private Integer failCount;

    public AdminLoginResponse(boolean success, String message, String token, String adminName, boolean captchaRequired) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.adminName = adminName;
        this.captchaRequired = captchaRequired;
    }

    public AdminLoginResponse(boolean success, String message, String token, String adminName,
                              boolean captchaRequired, String captchaSiteKey) {
        this(success, message, token, adminName, captchaRequired);
        this.captchaSiteKey = captchaSiteKey;
    }

    public AdminLoginResponse withFailCount(int count) {
        this.failCount = count;
        return this;
    }
}
