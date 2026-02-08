package com.przo.company_web.dto;

import com.przo.company_web.entity.Inquiry;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
public class InquiryListResponse {

    private Long id;
    private String title;
    private String name;
    private String createdAt;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm:ss");

    public InquiryListResponse(Inquiry inquiry) {
        this.id = inquiry.getId();
        this.title = inquiry.getTitle();
        this.name = inquiry.getName();
        this.createdAt = inquiry.getCreatedAt() != null
            ? inquiry.getCreatedAt().format(formatter)
            : "";
    }
}
