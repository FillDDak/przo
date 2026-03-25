package com.przo.company_web.repository;

import com.przo.company_web.dto.ReviewListResponse;
import com.przo.company_web.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // content(CLOB) 제외하고 목록에 필요한 컬럼만 조회
    @Query("SELECT new com.przo.company_web.dto.ReviewListResponse(r.id, r.title, r.thumbnail, r.createdAt, r.location) FROM Review r ORDER BY r.createdAt DESC, r.id DESC")
    Page<ReviewListResponse> findAllForList(Pageable pageable);
}
