package com.przo.company_web.service;

import com.przo.company_web.dto.ReviewListResponse;
import com.przo.company_web.entity.Review;
import com.przo.company_web.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public Page<ReviewListResponse> getReviewList(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reviewRepository.findAllByOrderByIdDesc(pageable)
                .map(ReviewListResponse::new);
    }

    @Transactional
    public Review createReview(String title, String content, String thumbnailPath, String createdDate) {
        Review review = new Review();
        review.setTitle(title);
        review.setContent(content);
        review.setThumbnail(thumbnailPath);
        if (createdDate != null && !createdDate.isEmpty()) {
            review.setCreatedAt(LocalDate.parse(createdDate).atStartOfDay());
        }
        return reviewRepository.save(review);
    }

    @Transactional
    public Review updateReview(Long id, String title, String content, String thumbnailPath, String createdDate) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review == null)
            return null;
        review.setTitle(title);
        review.setContent(content);
        review.setThumbnail(thumbnailPath);
        if (createdDate != null && !createdDate.isEmpty()) {
            review.setCreatedAt(LocalDate.parse(createdDate).atStartOfDay());
        }
        return reviewRepository.save(review);
    }

    @Transactional
    public boolean deleteReview(Long id) {
        if (reviewRepository.existsById(id)) {
            reviewRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
