package com.przo.company_web.dto;

import com.przo.company_web.entity.Review;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
public class ReviewListResponse {

    private Long id;
    private String title;
    private String content;
    private String thumbnail;
    private String createdAt;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    public ReviewListResponse(Review review) {
        this.id = review.getId();
        this.title = review.getTitle();
        this.content = review.getContent();
        this.thumbnail = review.getThumbnail();
        this.createdAt = review.getCreatedAt() != null
                ? review.getCreatedAt().format(formatter)
                : "";
    }
}
