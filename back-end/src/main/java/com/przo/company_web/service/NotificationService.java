package com.przo.company_web.service;

import com.przo.company_web.entity.Inquiry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;
    private final RestTemplate restTemplate;

    @Value("${notification.admin-email}")
    private String adminEmail;

    @Value("${notification.mail-from}")
    private String mailFrom;

    @Value("${kakao.rest-api-key:}")
    private String kakaoApiKey;

    @Value("${kakao.client-secret:}")
    private String kakaoClientSecret;

    @Value("${kakao.refresh-token:}")
    private String kakaoRefreshToken;

    @Value("${kakao.refresh-token-2:}")
    private String kakaoRefreshToken2;

    @Async
    public void sendNewInquiryNotification(Inquiry inquiry) {
        sendEmail(inquiry);
        sendKakaoMessage(inquiry);
        if (!kakaoRefreshToken2.isBlank()) {
            sendKakaoMessageWithToken(inquiry, kakaoRefreshToken2);
        }
    }

    private static final Set<String> IMAGE_EXTS = Set.of("jpg", "jpeg", "png", "gif", "webp", "bmp");

    private void sendEmail(Inquiry inquiry) {
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom, "프르조");
            helper.setTo(adminEmail);
            helper.setSubject("[프르조] 새 문의가 접수되었습니다: " + inquiry.getTitle());

            // 첨부파일 파싱: 이미지는 inline, 나머지는 첨부파일
            List<String[]> inlineImages = new ArrayList<>(); // [cid, filePath]
            List<File> attachments = new ArrayList<>();

            if (inquiry.getAttachment() != null && !inquiry.getAttachment().isEmpty()) {
                int idx = 0;
                for (String path : inquiry.getAttachment().split(",")) {
                    File file = new File(path.trim().replaceFirst("^/", ""));
                    if (!file.exists()) continue;
                    String ext = file.getName().contains(".")
                            ? file.getName().substring(file.getName().lastIndexOf('.') + 1).toLowerCase()
                            : "";
                    if (IMAGE_EXTS.contains(ext)) {
                        inlineImages.add(new String[]{"img" + idx++, file.getPath()});
                    } else {
                        attachments.add(file);
                    }
                }
            }

            helper.setText(buildEmailHtml(inquiry, inlineImages), true);
            for (String[] img : inlineImages) {
                helper.addInline(img[0], new File(img[1]));
            }
            for (File f : attachments) {
                helper.addAttachment(f.getName(), f);
            }

            mailSender.send(message);
            log.info("문의 접수 이메일 발송 완료 - inquiryId: {}", inquiry.getId());
        } catch (Exception e) {
            log.error("이메일 발송 실패 - inquiryId: {}", inquiry.getId(), e);
        }
    }

    private String buildEmailHtml(Inquiry inquiry, List<String[]> inlineImages) {
        String companyName = inquiry.getCompanyName() != null ? inquiry.getCompanyName() : "-";
        String content = inquiry.getContent() != null
                ? inquiry.getContent().replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br>")
                : "";

        StringBuilder imagesHtml = new StringBuilder();
        if (!inlineImages.isEmpty()) {
            imagesHtml.append("<div style=\"margin-top:20px;\"><p style=\"font-size:13px;color:#999;margin:0 0 8px;\">첨부 이미지</p>");
            for (String[] img : inlineImages) {
                imagesHtml.append("<img src=\"cid:").append(img[0])
                        .append("\" style=\"max-width:100%;border-radius:4px;margin-bottom:8px;display:block;\">");
            }
            imagesHtml.append("</div>");
        }

        return """
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f9f9f9;">
                  <div style="background:#fff;border-radius:8px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <h2 style="color:#51c488;margin:0 0 8px;">새 문의가 접수되었습니다.</h2>
                    <p style="color:#888;font-size:14px;margin:0 0 24px;">답변을 작성해주세요.</p>
                    <table style="width:100%%;border-collapse:collapse;font-size:15px;">
                      <tr style="border-bottom:1px solid #f0f0f0;">
                        <td style="padding:10px 0;color:#999;width:80px;">작성자</td>
                        <td style="padding:10px 0;font-weight:600;">%s</td>
                      </tr>
                      <tr style="border-bottom:1px solid #f0f0f0;">
                        <td style="padding:10px 0;color:#999;">업체명</td>
                        <td style="padding:10px 0;">%s</td>
                      </tr>
                      <tr style="border-bottom:1px solid #f0f0f0;">
                        <td style="padding:10px 0;color:#999;">연락처</td>
                        <td style="padding:10px 0;">%s</td>
                      </tr>
                      <tr style="border-bottom:1px solid #f0f0f0;">
                        <td style="padding:10px 0;color:#999;">이메일</td>
                        <td style="padding:10px 0;">%s</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;color:#999;">제목</td>
                        <td style="padding:10px 0;font-weight:600;">%s</td>
                      </tr>
                    </table>
                    <div style="margin-top:20px;padding:16px;background:#f8f8f8;border-radius:4px;font-size:14px;color:#555;line-height:1.7;">
                      %s
                    </div>
                    %s
                    <a href="https://przo.kr/admin/inquiry/%s" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#51c488;color:#fff;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">문의 바로가기</a>
                    <p style="margin-top:24px;font-size:13px;color:#bbb;">
                      이 메일은 프르조 홈페이지 문의 접수 시 자동으로 발송됩니다.
                    </p>
                  </div>
                </div>
                """.formatted(
                inquiry.getName(), companyName,
                inquiry.getPhone(), inquiry.getEmail(),
                inquiry.getTitle(), content, imagesHtml, inquiry.getId()
        );
    }

    private void sendKakaoMessage(Inquiry inquiry) {
        sendKakaoMessageWithToken(inquiry, kakaoRefreshToken);
    }

    private void sendKakaoMessageWithToken(Inquiry inquiry, String refreshToken) {
        if (kakaoApiKey.isBlank() || refreshToken.isBlank()) {
            log.debug("카카오 설정이 없어 카카오톡 알림을 건너뜁니다.");
            return;
        }
        try {
            String accessToken = refreshAccessToken(refreshToken);
            if (accessToken == null) return;

            String inquiryUrl = "https://przo.kr/admin/inquiry/" + inquiry.getId();
            String text = String.format(
                    "[프르조] 새 문의가 접수되었습니다.\\n\\n" +
                    "작성자: %s\\n" +
                    "연락처: %s\\n" +
                    "제목: %s\\n\\n" +
                    "%s",
                    inquiry.getName(), inquiry.getPhone(), inquiry.getTitle(), inquiryUrl
            );

            String templateObject = "{\"object_type\":\"text\",\"text\":\"" + text +
                    "\",\"link\":{\"web_url\":\"" + inquiryUrl + "\",\"mobile_web_url\":\"" + inquiryUrl + "\"}}";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBearerAuth(accessToken);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("template_object", templateObject);

            restTemplate.postForEntity(
                    "https://kapi.kakao.com/v2/api/talk/memo/default/send",
                    new HttpEntity<>(body, headers),
                    Map.class
            );
            log.info("카카오톡 알림 발송 완료 - inquiryId: {}", inquiry.getId());
        } catch (Exception e) {
            log.error("카카오톡 알림 발송 실패 - inquiryId: {}", inquiry.getId(), e);
        }
    }

    private String refreshAccessToken(String refreshToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "refresh_token");
            body.add("client_id", kakaoApiKey);
            body.add("client_secret", kakaoClientSecret);
            body.add("refresh_token", refreshToken);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://kauth.kakao.com/oauth/token",
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            if (response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
        } catch (Exception e) {
            log.error("카카오 액세스 토큰 갱신 실패", e);
        }
        return null;
    }
}
