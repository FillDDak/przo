package com.przo.company_web.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Duration;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .connectTimeout(Duration.ofSeconds(3))
                .readTimeout(Duration.ofSeconds(3))
                .build();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("http://localhost:*", "https://nonviolative-superfluous-cris.ngrok-free.dev", "https://przo.share.zrok.io", "https://przo.kr", "https://www.przo.kr")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }

    // SPA 폴백: /uploads/** 이외의 모든 경로를 index.html로 (uploads는 정적 파일 핸들러가 처리)
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/{path:(?!uploads$)[^\\.]*}").setViewName("forward:/index.html");
        registry.addViewController("/{path:(?!uploads$)[^\\.]*}/**").setViewName("forward:/index.html");
    }
}
