package com.przo.company_web;

import com.przo.company_web.config.RateLimitFilter;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class RateLimitFilterTest {

    private RateLimitFilter filter;
    private FilterChain chain;

    @BeforeEach
    void setUp() {
        filter = new RateLimitFilter();
        chain = mock(FilterChain.class);
    }

    @Test
    void verify_제한_미만_요청_허용() throws Exception {
        for (int i = 0; i < 10; i++) {
            MockHttpServletRequest request = buildRequest("POST", "/api/inquiries/1/verify", "1.2.3.4");
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, chain);
            assertEquals(200, response.getStatus());
        }
        verify(chain, times(10)).doFilter(any(), any());
    }

    @Test
    void verify_제한_초과_시_429_반환() throws Exception {
        for (int i = 0; i < 10; i++) {
            filter.doFilter(buildRequest("POST", "/api/inquiries/1/verify", "2.2.2.2"), new MockHttpServletResponse(), chain);
        }
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(buildRequest("POST", "/api/inquiries/1/verify", "2.2.2.2"), response, chain);

        assertEquals(429, response.getStatus());
    }

    @Test
    void 문의_등록_제한_미만_요청_허용() throws Exception {
        for (int i = 0; i < 5; i++) {
            MockHttpServletRequest request = buildRequest("POST", "/api/inquiries", "3.3.3.3");
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, chain);
            assertEquals(200, response.getStatus());
        }
        verify(chain, times(5)).doFilter(any(), any());
    }

    @Test
    void 문의_등록_제한_초과_시_429_반환() throws Exception {
        for (int i = 0; i < 5; i++) {
            filter.doFilter(buildRequest("POST", "/api/inquiries", "4.4.4.4"), new MockHttpServletResponse(), chain);
        }
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(buildRequest("POST", "/api/inquiries", "4.4.4.4"), response, chain);

        assertEquals(429, response.getStatus());
    }

    @Test
    void GET_요청은_제한_없음() throws Exception {
        for (int i = 0; i < 20; i++) {
            MockHttpServletRequest request = buildRequest("GET", "/api/inquiries/1", "5.5.5.5");
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, chain);
            assertEquals(200, response.getStatus());
        }
    }

    @Test
    void 다른_IP는_독립적으로_추적() throws Exception {
        for (int i = 0; i < 10; i++) {
            filter.doFilter(buildRequest("POST", "/api/inquiries/1/verify", "6.6.6.6"), new MockHttpServletResponse(), chain);
        }
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(buildRequest("POST", "/api/inquiries/1/verify", "7.7.7.7"), response, chain);

        assertEquals(200, response.getStatus());
    }

    private MockHttpServletRequest buildRequest(String method, String path, String ip) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod(method);
        request.setRequestURI(path);
        request.setRemoteAddr(ip);
        return request;
    }
}
