package com.przo.company_web.service;

import com.przo.company_web.dto.InquiryCreateRequest;
import com.przo.company_web.dto.InquiryDetailResponse;
import com.przo.company_web.dto.InquiryListResponse;
import com.przo.company_web.dto.InquiryPublicResponse;
import com.przo.company_web.entity.Inquiry;
import com.przo.company_web.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<InquiryListResponse> getInquiryList(int page, int size, String title) {
        if (page < 0) page = 0;
        if (size < 1) size = 1;
        if (size > 100) size = 100;
        Pageable pageable = PageRequest.of(page, size);
        if (title != null && !title.isBlank()) {
            return inquiryRepository.findByTitleForList(title, pageable);
        }
        return inquiryRepository.findAllForList(pageable);
    }

    public Optional<InquiryDetailResponse> getInquiryById(Long id) {
        return inquiryRepository.findById(id)
                .map(InquiryDetailResponse::new);
    }

    public Optional<InquiryPublicResponse> getInquiryPublicById(Long id) {
        return inquiryRepository.findById(id)
                .map(InquiryPublicResponse::new);
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
        inquiry.setPassword(passwordEncoder.encode(request.getPassword()));
        inquiry.setTitle(request.getTitle());
        inquiry.setContent(request.getContent());
        inquiry.setAttachment(attachmentPath);
        inquiry.setStatus("pending");

        return inquiryRepository.save(inquiry);
    }

    public boolean verifyPassword(Long id, String password) {
        return inquiryRepository.findById(id)
                .map(inquiry -> passwordEncoder.matches(password, inquiry.getPassword()))
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
                    inquiry.setPassword(passwordEncoder.encode(request.getPassword()));
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
                    inquiry.setRespondedAt(java.time.LocalDateTime.now(ZoneId.of("Asia/Seoul")));
                    return inquiryRepository.save(inquiry);
                });
    }

    @Transactional
    public Optional<Inquiry> clearAdminReply(Long id) {
        return inquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setAdminNote(null);
                    inquiry.setStatus("pending");
                    inquiry.setRespondedAt(null);
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
