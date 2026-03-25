package com.przo.company_web.dto;

import com.przo.company_web.entity.Inquiry;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
public class InquiryListResponse {

    private Long id;
    private String title;
    private String name;
    private String createdAt;
    private boolean hasReply;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    // JPQL 쿼리용 - CLOB(content, adminNote) 제외하고 필요한 컬럼만 조회
    public InquiryListResponse(Long id, String title, String name, LocalDateTime createdAt, Boolean hasReply) {
        this.id = id;
        this.title = title;
        this.name = name;
        this.createdAt = createdAt != null ? createdAt.format(formatter) : "";
        this.hasReply = Boolean.TRUE.equals(hasReply);
    }

    // 엔티티 직접 매핑용 (하위 호환)
    public InquiryListResponse(Inquiry inquiry) {
        this.id = inquiry.getId();
        this.title = inquiry.getTitle();
        this.name = inquiry.getName();
        this.createdAt = inquiry.getCreatedAt() != null
            ? inquiry.getCreatedAt().format(formatter)
            : "";
        this.hasReply = inquiry.getAdminNote() != null && !inquiry.getAdminNote().trim().isEmpty();
    }
}
