package com.przo.company_web.dto;

import com.przo.company_web.entity.Inquiry;
import lombok.Getter;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Getter
public class InquiryDetailResponse {

    private Long id;
    private String name;
    private String companyName;
    private String phone;
    private String title;
    private String content;
    private String attachment;
    private String attachmentName;
    private List<String> attachmentList;
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
        this.title = inquiry.getTitle();
        this.content = inquiry.getContent();
        this.attachment = inquiry.getAttachment();
        this.attachmentName = extractFileName(inquiry.getAttachment());
        this.attachmentList = inquiry.getAttachment() != null && !inquiry.getAttachment().isEmpty()
            ? List.of(inquiry.getAttachment().split(","))
            : List.of();
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
