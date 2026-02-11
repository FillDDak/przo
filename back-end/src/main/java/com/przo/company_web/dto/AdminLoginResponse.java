package com.przo.company_web.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AdminLoginResponse {
    private boolean success;
    private String message;
    private String token;
    private String adminName;
}
