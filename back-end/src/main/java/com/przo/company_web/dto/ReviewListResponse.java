package com.przo.company_web.dto;

import com.przo.company_web.entity.Review;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
public class ReviewListResponse {

    private Long id;
    private String title;
    private String content;
    private String thumbnail;
    private String createdAt;
    private String location;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    // 목록 조회용 - content(CLOB) 제외
    public ReviewListResponse(Long id, String title, String thumbnail, LocalDateTime createdAt, String location) {
        this.id = id;
        this.title = title;
        this.thumbnail = thumbnail;
        this.createdAt = createdAt != null ? createdAt.format(formatter) : "";
        this.location = location;
    }

    // 상세 조회용 - content 포함
    public ReviewListResponse(Review review) {
        this.id = review.getId();
        this.title = review.getTitle();
        this.content = review.getContent();
        this.thumbnail = review.getThumbnail();
        this.createdAt = review.getCreatedAt() != null
                ? review.getCreatedAt().format(formatter)
                : "";
        this.location = review.getLocation();
    }
}
