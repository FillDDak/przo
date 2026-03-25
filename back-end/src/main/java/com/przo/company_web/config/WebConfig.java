package com.przo.company_web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("http://localhost:*", "https://*.ngrok-free.dev", "https://*.zrok.io", "https://przo.kr", "https://www.przo.kr")
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
