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
├── back-end/                  # Spring Boot
│   └── src/main/java/.../
│       ├── controller/        # REST API
│       ├── service/           # 비즈니스 로직
│       ├── entity/            # JPA 엔티티
│       ├── repository/        # DB 접근
│       ├── config/            # Security, CORS 등 설정
│       └── scheduler/         # 자동 삭제 스케줄러
├── front-end/                 # React
│   ├── src/
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── components/        # 공통 컴포넌트
│   │   └── layouts/           # 레이아웃
│   └── public/                # 정적 파일 (sitemap, robots.txt 등)
└── .guide/                    # 배포 가이드 문서
```
