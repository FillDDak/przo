package com.przo.company_web.dto;

import com.przo.company_web.entity.Inquiry;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
public class InquiryPublicResponse {

    private Long id;
    private String title;
    private String status;
    private String createdAt;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");

    public InquiryPublicResponse(Inquiry inquiry) {
        this.id = inquiry.getId();
        this.title = inquiry.getTitle();
        this.status = inquiry.getStatus();
        this.createdAt = inquiry.getCreatedAt() != null
                ? inquiry.getCreatedAt().format(formatter)
                : null;
    }
}
