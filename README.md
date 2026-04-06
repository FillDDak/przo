<img width="1695" height="422" alt="깃허브_README용" src="https://github.com/user-attachments/assets/832dd53b-b415-4be9-acec-5d80bd3d5b5b" />

# 프르조 (PRZO) — 해충방제 전문 기업 웹사이트

> 실제 클라이언트 수주 프로젝트입니다. 요구사항 수집부터 설계, 개발, 배포까지 1인 풀스택으로 진행했습니다.

**🔗 배포 주소:** https://przo.kr

---

## 프로젝트 개요

해충방제 전문 기업 프르조의 기업 소개 및 상담 문의 웹사이트입니다.
Figma 디자인 시안을 기반으로 프론트엔드를 구현하고, 백엔드 및 서버 인프라를 직접 설계·구축했습니다.

| 항목 | 내용 |
|---|---|
| 개발 기간 | 2026.02 ~ 2026.03 |
| 개발 인원 | 1인 (풀스택) |
| 역할 | 백엔드 개발, 프론트엔드 개발, 서버 인프라 구축, 배포 |

---

## 기술 스택

### Backend
- **Java 17** / **Spring Boot 3.5**
- Spring Security, Spring Data JPA, Spring Mail
- **Oracle Autonomous Database** (Oracle Cloud Always Free)
- Gradle

### Frontend
- **React 18** / **Vite**
- React Router DOM v7
- CSS Modules

### Infrastructure
- **Oracle Cloud** — VM.Standard.E2.1.Micro (Ubuntu 22.04)
- **Nginx** — 리버스 프록시, HTTP → HTTPS 리다이렉트
- **Let's Encrypt** — SSL 인증서 자동 갱신
- **Cloudflare Turnstile** — CAPTCHA

---

## 주요 기능

### 사용자
- 회사 소개 / 서비스 소개 / 시공 사진 / FAQ 페이지
- 상담 문의 등록 · 조회 · 수정 · 삭제
- 문의 비밀번호 기반 본인 확인 (BCrypt 해싱)
- 파일 첨부 (이미지, PDF / 최대 10MB)
- 이메일 답변 알림

### 관리자
- HttpOnly 쿠키 기반 토큰 인증 (XSS 방어)
- 문의 답변 등록 / 상태 관리
- FAQ 등록 · 수정 · 삭제 · 순서 변경
- 시공 사진 등록 · 삭제
- 견적서 작성 (공유 링크 발급)
- 로그인 시도 기록 조회 (IP, 위치, 성공 여부)

### 보안
- IP 기반 Rate Limiting (로그인 5회 실패 시 30분 차단)
- 단계별 CAPTCHA (Cloudflare Turnstile)
- 서버사이드 입력 검증
- 파일 확장자 + MIME 타입 이중 검증
- CORS 허용 출처 명시
- 개인정보 자동 삭제 스케줄러 (문의 3년, 로그인 기록 180일)

---

## 아키텍처

```
[Client]
    │
    ▼
[Nginx]  ── HTTPS (Let's Encrypt)
    │
    ├── / ──────────────── React SPA (정적 파일 서빙)
    └── /api ────────────→ Spring Boot (8080)
                                │
                                ├── Oracle Autonomous DB
                                └── /uploads (파일 저장)
```

---

## 로컬 실행 방법

### 사전 요구사항
- Java 17+
- Node.js 18+
- Oracle Database XE (로컬 DB)

### Backend
```bash
cd back-end
./gradlew bootRun
```
> `src/main/resources/application-local.properties` 파일에 로컬 DB 정보 설정 필요

### Frontend
```bash
cd front-end
npm install
npm run dev
```

---

## 디렉토리 구조

```
przo/
├── back-end/                              # Spring Boot 백엔드
│   ├── gradle/wrapper/                    # Gradle Wrapper 설정
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/.../company_web/
│   │   │   │   ├── config/               # Security, CORS, RateLimit 설정
│   │   │   │   │   ├── DataInitializer.java       # 초기 관리자 계정 생성
│   │   │   │   │   ├── RateLimitFilter.java       # 전역 요청 속도 제한 필터
│   │   │   │   │   ├── SecurityConfig.java        # Spring Security 설정
│   │   │   │   │   └── WebConfig.java             # CORS 등 Web MVC 설정
│   │   │   │   ├── controller/           # REST API 컨트롤러
│   │   │   │   │   ├── AdminController.java
│   │   │   │   │   ├── EstimateSheetController.java
│   │   │   │   │   ├── FaqController.java
│   │   │   │   │   ├── InquiryController.java
│   │   │   │   │   ├── PriceTableController.java
│   │   │   │   │   ├── PublicConfigController.java
│   │   │   │   │   └── ReviewController.java
│   │   │   │   ├── dto/                  # 요청/응답 DTO
│   │   │   │   │   ├── AdminLoginRequest/Response.java
│   │   │   │   │   ├── GeoInfo.java               # IP 기반 위치 정보
│   │   │   │   │   ├── InquiryCreateRequest.java
│   │   │   │   │   ├── InquiryDetailResponse.java
│   │   │   │   │   ├── InquiryListResponse.java
│   │   │   │   │   ├── InquiryPublicResponse.java
│   │   │   │   │   ├── LoginAttemptLogResponse.java
│   │   │   │   │   └── ReviewListResponse.java
│   │   │   │   ├── entity/               # JPA 엔티티
│   │   │   │   │   ├── Admin.java
│   │   │   │   │   ├── EstimateSheet.java
│   │   │   │   │   ├── Faq.java
│   │   │   │   │   ├── Inquiry.java
│   │   │   │   │   ├── LoginAttemptLog.java
│   │   │   │   │   └── Review.java
│   │   │   │   ├── repository/           # Spring Data JPA Repository
│   │   │   │   ├── scheduler/
│   │   │   │   │   └── InquiryCleanupScheduler.java  # 오래된 문의 자동 삭제
│   │   │   │   ├── service/              # 비즈니스 로직
│   │   │   │   │   ├── AdminService.java
│   │   │   │   │   ├── CaptchaService.java           # reCAPTCHA 검증
│   │   │   │   │   ├── EstimateSheetService.java
│   │   │   │   │   ├── FaqService.java
│   │   │   │   │   ├── GeoLocationService.java       # IP → 위치 변환
│   │   │   │   │   ├── InquiryService.java
│   │   │   │   │   ├── InquiryVerifyRateLimiter.java # 문의 인증 속도 제한
│   │   │   │   │   ├── LogCleanupService.java        # 로그 자동 정리
│   │   │   │   │   ├── LoginRateLimiter.java         # 로그인 시도 속도 제한
│   │   │   │   │   ├── NotificationService.java      # 알림 발송 (이메일 등)
│   │   │   │   │   ├── PriceTableService.java
│   │   │   │   │   └── ReviewService.java
│   │   │   │   ├── util/
│   │   │   │   │   └── PasswordGenerator.java        # 임시 비밀번호 생성
│   │   │   │   └── CompanyWebApplication.java        # Spring Boot 진입점
│   │   │   └── resources/META-INF/
│   │   │       └── additional-spring-configuration-metadata.json
│   │   └── test/                         # 단위/통합 테스트
│   │       ├── AdminServiceTokenTest.java
│   │       ├── CompanyWebApplicationTests.java
│   │       ├── InquiryServiceTest.java
│   │       ├── LoginRateLimiterTest.java
│   │       └── RateLimitFilterTest.java
│   ├── uploads/                          # 업로드 파일 저장소 (내용은 gitignore)
│   │   ├── inquiries/.gitkeep
│   │   └── reviews/.gitkeep
│   ├── build.gradle
│   ├── gradlew / gradlew.bat
│   └── settings.gradle
│
├── database/
│   ├── PRZO_ERD.png                      # ERD 다이어그램
│   └── przo.sql                          # DB 스키마 및 초기 데이터
│
├── front-end/                             # React + Vite 프론트엔드
│   ├── patches/
│   │   └── @fortune-sheet+core+1.0.4.patch  # FortuneSheet 라이브러리 패치
│   ├── public/                            # 빌드 시 그대로 복사되는 정적 파일
│   │   ├── favicon/                       # 파비콘 (png, svg)
│   │   ├── fonts/                         # Pretendard 폰트 (woff, woff2)
│   │   ├── home_banner.webp
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── scripts/
│   │   └── convert-to-webp.mjs           # 이미지 → WebP 변환 스크립트
│   ├── src/
│   │   ├── assets/                        # 컴포넌트에서 import하는 정적 자산
│   │   │   ├── floating-button/           # 플로팅 버튼 아이콘
│   │   │   ├── footer-icon/               # 푸터 SNS 아이콘
│   │   │   ├── image/                     # 배너 이미지
│   │   │   ├── logo/                      # PRZO 로고 (색상별)
│   │   │   ├── other-page-icon-image/     # 각 페이지 아이콘/이미지
│   │   │   ├── section2-gallery/          # 홈 섹션2 갤러리 이미지
│   │   │   ├── section3-icon/             # 홈 섹션3 업종별 아이콘
│   │   │   ├── section4-gallery/          # 홈 섹션4 갤러리 이미지
│   │   │   ├── section5-bugs/             # 홈 섹션5 해충 이미지
│   │   │   ├── section6-banner/           # 홈 섹션6 배너 이미지
│   │   │   └── section7-icon/             # 홈 섹션7 아이콘
│   │   ├── components/                    # 공통 컴포넌트
│   │   │   ├── ConfirmModal               # 확인/취소 모달
│   │   │   ├── FloatingButtons            # 플로팅 버튼 (카카오, 전화, 상단이동)
│   │   │   ├── Footer
│   │   │   ├── Header
│   │   │   └── PrivacyModal               # 개인정보처리방침 모달
│   │   ├── context/
│   │   │   └── AuthContext.jsx            # 관리자 인증 상태 관리
│   │   ├── layouts/
│   │   │   ├── AdminLayout                # 관리자 전용 레이아웃
│   │   │   └── MainLayout                 # 일반 사용자 레이아웃
│   │   ├── pages/                         # 페이지 컴포넌트
│   │   │   ├── About                      # 회사 소개
│   │   │   ├── AdminInquiryRedirect       # 관리자 문의 상세 리다이렉트
│   │   │   ├── AdminLogin                 # 관리자 로그인
│   │   │   ├── AdminLogs                  # 관리자 로그인 시도 로그
│   │   │   ├── CookiePolicy               # 쿠키 정책
│   │   │   ├── EstimateSheet              # 가격 견적 시트 (FortuneSheet)
│   │   │   ├── Faq                        # 자주 묻는 질문
│   │   │   ├── Home                       # 메인 홈 (섹션 구성)
│   │   │   ├── NotFound                   # 404 페이지
│   │   │   ├── PriceTable                 # 가격표 관리 (관리자)
│   │   │   ├── PrivacyPolicy              # 개인정보처리방침
│   │   │   ├── Qna / QnaDetail / QnaWrite # 문의 목록 / 상세 / 작성
│   │   │   ├── ReviewWrite / Reviews      # 후기 작성 / 목록
│   │   │   ├── Service                    # 서비스 소개
│   │   │   └── Terms                      # 이용약관
│   │   ├── utils/
│   │   │   ├── errorMessage.js            # API 에러 메시지 매핑
│   │   │   ├── fortuneSheetKo.js          # FortuneSheet 한국어 로케일
│   │   │   └── getCroppedImg.js           # 이미지 크롭 유틸 (후기 작성)
│   │   ├── index.css                      # 전역 스타일
│   │   └── main.jsx                       # React 진입점 + 라우터 설정
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vercel.json                        # Vercel SPA 배포 설정
│   └── vite.config.js
│
├── .gitattributes
├── .gitignore
└── README.md

```
