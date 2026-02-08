package com.przo.company_web.dto;

import com.przo.company_web.entity.Inquiry;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
public class InquiryDetailResponse {

    private Long id;
    private String name;
    private String companyName;
    private String phone;
    private String email;
    private String title;
    private String content;
    private String attachment;
    private String attachmentName;
    private String status;
    private String adminNote;
    private String createdAt;
    private String respondedAt;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");

    public InquiryDetailResponse(Inquiry inquiry) {
        this.id = inquiry.getId();
        this.name = inquiry.getName();
        this.companyName = inquiry.getCompanyName();
        this.phone = inquiry.getPhone();
        this.email = inquiry.getEmail();
        this.title = inquiry.getTitle();
        this.content = inquiry.getContent();
        this.attachment = inquiry.getAttachment();
        this.attachmentName = extractFileName(inquiry.getAttachment());
        this.status = inquiry.getStatus();
        this.adminNote = inquiry.getAdminNote();
        this.createdAt = inquiry.getCreatedAt() != null
            ? inquiry.getCreatedAt().format(formatter)
            : null;
        this.respondedAt = inquiry.getRespondedAt() != null
            ? inquiry.getRespondedAt().format(formatter)
            : null;
    }

    private String extractFileName(String path) {
        if (path == null || path.isEmpty()) {
            return null;
        }
        int lastSlash = path.lastIndexOf('/');
        return lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
    }
}
