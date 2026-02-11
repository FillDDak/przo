package com.przo.company_web.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminLoginRequest {
    private String username;
    private String password;
}
