package com.przo.company_web.repository;

import com.przo.company_web.dto.InquiryListResponse;
import com.przo.company_web.entity.Inquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    // content(CLOB), adminNote(CLOB) 제외하고 목록에 필요한 컬럼만 조회
    @Query("SELECT new com.przo.company_web.dto.InquiryListResponse(i.id, i.title, i.name, i.createdAt, CASE WHEN i.adminNote IS NOT NULL THEN true ELSE false END) FROM Inquiry i ORDER BY i.id DESC")
    Page<InquiryListResponse> findAllForList(Pageable pageable);

    @Query("SELECT new com.przo.company_web.dto.InquiryListResponse(i.id, i.title, i.name, i.createdAt, CASE WHEN i.adminNote IS NOT NULL THEN true ELSE false END) FROM Inquiry i WHERE LOWER(i.title) LIKE LOWER(CONCAT('%', :title, '%')) ORDER BY i.id DESC")
    Page<InquiryListResponse> findByTitleForList(@Param("title") String title, Pageable pageable);

    void deleteByCreatedAtBefore(LocalDateTime dateTime);
}
