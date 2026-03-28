package com.przo.company_web;

import com.przo.company_web.dto.InquiryCreateRequest;
import com.przo.company_web.entity.Inquiry;
import com.przo.company_web.repository.InquiryRepository;
import com.przo.company_web.service.InquiryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InquiryServiceTest {

    @Mock
    private InquiryRepository inquiryRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private InquiryService inquiryService;

    @Test
    void 비밀번호_일치_시_true_반환() {
        Inquiry inquiry = new Inquiry();
        inquiry.setPassword("hashed1234");
        when(inquiryRepository.findById(1L)).thenReturn(Optional.of(inquiry));
        when(passwordEncoder.matches("1234", "hashed1234")).thenReturn(true);

        assertTrue(inquiryService.verifyPassword(1L, "1234"));
    }

    @Test
    void 비밀번호_불일치_시_false_반환() {
        Inquiry inquiry = new Inquiry();
        inquiry.setPassword("hashed1234");
        when(inquiryRepository.findById(1L)).thenReturn(Optional.of(inquiry));
        when(passwordEncoder.matches("wrong", "hashed1234")).thenReturn(false);

        assertFalse(inquiryService.verifyPassword(1L, "wrong"));
    }

    @Test
    void 존재하지_않는_문의_비밀번호_확인_시_false_반환() {
        when(inquiryRepository.findById(999L)).thenReturn(Optional.empty());

        assertFalse(inquiryService.verifyPassword(999L, "1234"));
    }

    @Test
    void 문의_생성_시_비밀번호_해싱() {
        InquiryCreateRequest request = new InquiryCreateRequest();
        request.setName("홍길동");
        request.setPhone("010-1234-5678");
        request.setEmail("test@test.com");
        request.setPassword("5678");
        request.setTitle("테스트 문의");
        request.setContent("문의 내용입니다.");

        when(passwordEncoder.encode("5678")).thenReturn("hashed5678");
        when(inquiryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Inquiry result = inquiryService.createInquiry(request, null);

        assertEquals("hashed5678", result.getPassword());
        assertEquals("pending", result.getStatus());
        verify(passwordEncoder).encode("5678");
    }

    @Test
    void 문의_공개_조회_시_민감정보_없음() {
        Inquiry inquiry = new Inquiry();
        inquiry.setName("홍길동");
        inquiry.setPhone("010-1234-5678");
        inquiry.setEmail("test@test.com");
        inquiry.setTitle("테스트 제목");
        inquiry.setStatus("pending");
        when(inquiryRepository.findById(1L)).thenReturn(Optional.of(inquiry));

        var result = inquiryService.getInquiryPublicById(1L);

        assertTrue(result.isPresent());
        assertEquals("테스트 제목", result.get().getTitle());
        assertEquals("pending", result.get().getStatus());
    }

    @Test
    void 문의_삭제_성공() {
        when(inquiryRepository.existsById(1L)).thenReturn(true);

        assertTrue(inquiryService.deleteInquiry(1L));
        verify(inquiryRepository).deleteById(1L);
    }

    @Test
    void 존재하지_않는_문의_삭제_시_false_반환() {
        when(inquiryRepository.existsById(999L)).thenReturn(false);

        assertFalse(inquiryService.deleteInquiry(999L));
        verify(inquiryRepository, never()).deleteById(any());
    }
}
