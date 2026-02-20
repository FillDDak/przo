package com.przo.company_web.service;

import com.przo.company_web.dto.InquiryCreateRequest;
import com.przo.company_web.dto.InquiryDetailResponse;
import com.przo.company_web.dto.InquiryListResponse;
import com.przo.company_web.entity.Inquiry;
import com.przo.company_web.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryService {

    private final InquiryRepository inquiryRepository;

    public Page<InquiryListResponse> getInquiryList(int page, int size, String title) {
        Pageable pageable = PageRequest.of(page, size);
        if (title != null && !title.isBlank()) {
            return inquiryRepository.findByTitleContainingIgnoreCaseOrderByIdDesc(title, pageable)
                    .map(InquiryListResponse::new);
        }
        return inquiryRepository.findAllByOrderByIdDesc(pageable)
                .map(InquiryListResponse::new);
    }

    public Optional<InquiryDetailResponse> getInquiryById(Long id) {
        return inquiryRepository.findById(id)
                .map(InquiryDetailResponse::new);
    }

    public long getTotalCount() {
        return inquiryRepository.count();
    }

    @Transactional
    public Inquiry createInquiry(InquiryCreateRequest request, String attachmentPath) {
        Inquiry inquiry = new Inquiry();
        inquiry.setName(request.getName());
        inquiry.setCompanyName(request.getCompanyName());
        inquiry.setPhone(request.getPhone());
        inquiry.setEmail(request.getEmail());
        inquiry.setPassword(request.getPassword());
        inquiry.setTitle(request.getTitle());
        inquiry.setContent(request.getContent());
        inquiry.setAttachment(attachmentPath);
        inquiry.setStatus("pending");

        return inquiryRepository.save(inquiry);
    }

    public boolean verifyPassword(Long id, String password) {
        return inquiryRepository.findById(id)
                .map(inquiry -> inquiry.getPassword().equals(password))
                .orElse(false);
    }

    @Transactional
    public Optional<Inquiry> updateInquiry(Long id, InquiryCreateRequest request, String attachmentPath) {
        return inquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setName(request.getName());
                    inquiry.setCompanyName(request.getCompanyName());
                    inquiry.setPhone(request.getPhone());
                    inquiry.setEmail(request.getEmail());
                    inquiry.setTitle(request.getTitle());
                    inquiry.setContent(request.getContent());
                    if (attachmentPath != null) {
                        inquiry.setAttachment(attachmentPath);
                    }
                    return inquiryRepository.save(inquiry);
                });
    }

    @Transactional
    public Optional<Inquiry> addAdminReply(Long id, String adminNote) {
        return inquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setAdminNote(adminNote);
                    inquiry.setStatus("completed");
                    inquiry.setRespondedAt(java.time.LocalDateTime.now());
                    return inquiryRepository.save(inquiry);
                });
    }

    @Transactional
    public boolean deleteInquiry(Long id) {
        if (inquiryRepository.existsById(id)) {
            inquiryRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
