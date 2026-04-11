-- ============================================
-- 해충 방제 프로젝트 - Oracle Database Schema
-- ============================================

-- 기존 테이블 삭제
DROP TABLE ADMINS CASCADE CONSTRAINTS;
DROP TABLE INQUIRIES CASCADE CONSTRAINTS;
DROP TABLE REVIEWS CASCADE CONSTRAINTS;
DROP TABLE FAQS CASCADE CONSTRAINTS;
DROP TABLE ESTIMATE_SHEETS CASCADE CONSTRAINTS;
DROP TABLE LOGIN_ATTEMPT_LOGS CASCADE CONSTRAINTS;

-- 기존 시퀀스 삭제
DROP SEQUENCE SEQ_ADMIN_ID;
DROP SEQUENCE SEQ_INQUIRY_ID;
DROP SEQUENCE SEQ_REVIEW_ID;
DROP SEQUENCE SEQ_FAQ_ID;
DROP SEQUENCE SEQ_ESTIMATE_SHEET_ID;
DROP SEQUENCE LOGIN_ATTEMPT_LOG_SEQ;

-- ============================================
-- 테이블 생성
-- ============================================

-- 1. 관리자 테이블
CREATE TABLE ADMINS (
    ADMIN_ID        NUMBER          PRIMARY KEY,
    USERNAME        VARCHAR2(50)    NOT NULL UNIQUE,
    PASSWORD        VARCHAR2(255)   NOT NULL,
    ADMIN_NAME      VARCHAR2(100)   NOT NULL,
    EMAIL           VARCHAR2(100),
    CREATED_AT      TIMESTAMP       DEFAULT SYSTIMESTAMP
);

-- 관리자 ID 시퀀스
CREATE SEQUENCE SEQ_ADMIN_ID START WITH 1 INCREMENT BY 1 NOCACHE;

-- 2. 문의 테이블
CREATE TABLE INQUIRIES (
    INQUIRY_ID      NUMBER          PRIMARY KEY,
    NAME            VARCHAR2(20)    NOT NULL,
    COMPANY_NAME    VARCHAR2(100),
    PHONE           VARCHAR2(20)    NOT NULL,
    PASSWORD        VARCHAR2(100)   NOT NULL,
    TITLE           VARCHAR2(100)   NOT NULL,
    CONTENT         CLOB            NOT NULL,
    ATTACHMENT      VARCHAR2(500),
    STATUS          VARCHAR2(20)    DEFAULT 'pending',
    ADMIN_NOTE      CLOB,
    CREATED_AT      TIMESTAMP       DEFAULT SYSTIMESTAMP,
    RESPONDED_AT    TIMESTAMP
);

-- 문의 ID 시퀀스
CREATE SEQUENCE SEQ_INQUIRY_ID START WITH 1 INCREMENT BY 1 NOCACHE;

-- 문의 인덱스
CREATE INDEX IDX_INQUIRIES_CREATED_AT ON INQUIRIES (CREATED_AT);

-- 3. 이미지 모음 테이블
CREATE TABLE REVIEWS (
    REVIEW_ID       NUMBER          PRIMARY KEY,
    TITLE           VARCHAR2(200)   NOT NULL,
    CONTENT         CLOB,
    THUMBNAIL       VARCHAR2(500),
    LOCATION        VARCHAR2(200),
    CREATED_AT      TIMESTAMP       DEFAULT SYSTIMESTAMP
);

-- 이미지 모음 ID 시퀀스
CREATE SEQUENCE SEQ_REVIEW_ID START WITH 1 INCREMENT BY 1 NOCACHE;

-- 이미지 모음 인덱스
CREATE INDEX IDX_REVIEWS_CREATED_AT ON REVIEWS (CREATED_AT);

-- 4. FAQ 테이블
CREATE TABLE FAQS (
    FAQ_ID          NUMBER          PRIMARY KEY,
    QUESTION        VARCHAR2(500)   NOT NULL,
    ANSWER          CLOB            NOT NULL,
    ORDER_INDEX     NUMBER          DEFAULT 0 NOT NULL
);

-- FAQ ID 시퀀스
CREATE SEQUENCE SEQ_FAQ_ID START WITH 1 INCREMENT BY 1 NOCACHE;

-- 5. 견적 시트 테이블
CREATE TABLE ESTIMATE_SHEETS (
    SHEET_ID    NUMBER          PRIMARY KEY,
    SHEET_KEY   VARCHAR2(50)    NOT NULL UNIQUE,
    DATA_JSON   CLOB            NOT NULL,
    UPDATED_AT  TIMESTAMP       DEFAULT SYSTIMESTAMP
);

-- 견적 시트 ID 시퀀스
CREATE SEQUENCE SEQ_ESTIMATE_SHEET_ID START WITH 1 INCREMENT BY 1 NOCACHE;

-- 6. 관리자 로그인 시도 기록 테이블
CREATE TABLE LOGIN_ATTEMPT_LOGS (
    ID              NUMBER          PRIMARY KEY,
    IP              VARCHAR2(45),
    CITY            VARCHAR2(100),
    COUNTRY         VARCHAR2(100),
    USERNAME        VARCHAR2(100),
    SUCCESS         NUMBER(1)       NOT NULL,
    ATTEMPTED_AT    TIMESTAMP
);

-- 로그인 시도 기록 시퀀스
CREATE SEQUENCE LOGIN_ATTEMPT_LOG_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

-- ============================================
-- 예시 데이터
-- ============================================

-- 관리자 계정 생성 (로컬호스트 테스트용)
-- 아이디: przo_admin
-- 비밀번호: przo1234 (BCrypt 해시)
INSERT INTO ADMINS (ADMIN_ID, USERNAME, PASSWORD, ADMIN_NAME, EMAIL)
VALUES (
        SEQ_ADMIN_ID.NEXTVAL,
        'przo_admin',
        '$2a$10$ltgLdpNwWG2N7w2ljyeF8OetO.PqahBWbCB4o7CNEzhgWRhzE1026',
        '프르조 관리자',
        'admin@przo.co.kr'
    );

-- 문의 예시 데이터 (비밀번호: 1234)
INSERT INTO INQUIRIES (INQUIRY_ID, NAME, COMPANY_NAME, PHONE, PASSWORD, TITLE, CONTENT, ATTACHMENT, STATUS)
VALUES (SEQ_INQUIRY_ID.NEXTVAL, '박고객', '맛있는식당', '010-1234-1234', '$2a$10$c0Jgs.5wURsF6Y0JBhPq6eQJ35o66RB6okZOp5P4eH3KdIo9cQHoq',
        '해충 방제 서비스 문의드립니다 (비밀번호: 1234)', '안녕하세요. 저희 식당에 해충 방제 서비스를 받고 싶습니다. 견적 문의 부탁드립니다.', '/uploads/inquiries/parasite1.jpg', 'pending');

INSERT INTO INQUIRIES (INQUIRY_ID, NAME, COMPANY_NAME, PHONE, PASSWORD, TITLE, CONTENT, ATTACHMENT, STATUS, ADMIN_NOTE, RESPONDED_AT)
VALUES (SEQ_INQUIRY_ID.NEXTVAL, '최사장', '카페베네', '010-5678-1234', '$2a$10$c0Jgs.5wURsF6Y0JBhPq6eQJ35o66RB6okZOp5P4eH3KdIo9cQHoq',
        '정기 방역 서비스 계약 문의 (비밀번호: 1234)', '매월 정기적으로 방역 서비스를 받고 싶습니다. 가격과 일정 안내 부탁드립니다.', '/uploads/inquiries/parasite2.jpg', 'completed',
        '월 1회 정기 방역 계약 완료. 매월 첫째 주 월요일 오전 방문 예정.', SYSTIMESTAMP);

-- 이미지 모음 예시 데이터
INSERT INTO REVIEWS (REVIEW_ID, TITLE, CONTENT, THUMBNAIL, LOCATION)
VALUES (SEQ_REVIEW_ID.NEXTVAL, '강남구 카페 해충 방제 완료',
        '<p>강남구 소재 카페에서 UV LED 해충 퇴치기 설치 및 방역 서비스를 완료했습니다. 고객님께서 매우 만족하셨습니다.</p><img src="/uploads/reviews/후레쉬.jpg">', '/uploads/reviews/후레쉬.jpg', '서울 강남구');

INSERT INTO REVIEWS (REVIEW_ID, TITLE, CONTENT, THUMBNAIL, LOCATION)
VALUES (SEQ_REVIEW_ID.NEXTVAL, '서초구 음식점 정기 방역',
        '<p>서초구 음식점 정기 방역 서비스를 진행했습니다. 주방과 홀 전체에 대한 종합 방역을 실시했습니다.</p><img src="/uploads/reviews/바퀴작업.jpg">', '/uploads/reviews/바퀴작업.jpg', '서울 서초구');

INSERT INTO REVIEWS (REVIEW_ID, TITLE, CONTENT, THUMBNAIL, LOCATION)
VALUES (SEQ_REVIEW_ID.NEXTVAL, '인천시 xx가게 방역',
        '<p>인천시 xx가게 방역을 실시하였습니다. 인천시 xx가게 방역을 실시하였습니다.</p><img src="/uploads/reviews/약국소독.jpg">', '/uploads/reviews/약국소독.jpg', '인천시');

INSERT INTO REVIEWS (REVIEW_ID, TITLE, CONTENT, THUMBNAIL, LOCATION)
VALUES (SEQ_REVIEW_ID.NEXTVAL, '부산시 yy식당 방역',
        '<p>부산시 yy식당 해충 방제 서비스를 완료했습니다.</p><img src="/uploads/reviews/일신소독.jpg">', '/uploads/reviews/일신소독.jpg', '부산시');

INSERT INTO REVIEWS (REVIEW_ID, TITLE, CONTENT, THUMBNAIL, LOCATION)
VALUES (SEQ_REVIEW_ID.NEXTVAL, '대구시 zz카페 방역',
        '<p>대구시 zz카페 정기 방역을 진행했습니다.</p><img src="/uploads/reviews/내시경.jpg">', '/uploads/reviews/내시경.jpg', '대구시');

-- FAQ 예시 데이터
INSERT INTO FAQS (FAQ_ID, QUESTION, ANSWER, ORDER_INDEX)
VALUES (SEQ_FAQ_ID.NEXTVAL, '상담 문의는 어떻게 하나요?',
        '상담 문의 페이지에서 문의하기 버튼을 통해 내용을 작성해 주시면 담당자가 확인 후 빠르게 답변 드립니다. 카카오톡 오픈채팅(프르조) 또는 전화(1670-2335)로도 문의하실 수 있습니다.', 0);

INSERT INTO FAQS (FAQ_ID, QUESTION, ANSWER, ORDER_INDEX)
VALUES (SEQ_FAQ_ID.NEXTVAL, '견적은 무료로 받을 수 있나요?',
        '네, 상담 및 방문 견적은 모두 무료입니다. 상담 문의 페이지에서 원하시는 내용을 작성해 주시면 담당자가 연락 드려 무료 방문 진단 일정을 안내해 드립니다.', 1);

INSERT INTO FAQS (FAQ_ID, QUESTION, ANSWER, ORDER_INDEX)
VALUES (SEQ_FAQ_ID.NEXTVAL, '방제 서비스는 어떤 시설에서 가능한가요?',
        '가정집, 음식점, 카페, 사무실, 학교, 호텔, 병원, 공장, 문화시설 등 다양한 시설에서 서비스가 가능합니다. 시설 유형에 따라 최적의 방제 공법을 제안해 드립니다.', 2);

INSERT INTO FAQS (FAQ_ID, QUESTION, ANSWER, ORDER_INDEX)
VALUES (SEQ_FAQ_ID.NEXTVAL, '어떤 해충을 방제할 수 있나요?',
        '바퀴벌레, 집파리, 모기, 나방, 지네, 꼽등이, 깔따구, 애집개미, 시궁쥐 등 다양한 해충 및 설치류를 방제합니다. 정확한 해충 진단 후 맞춤형 공법으로 처리해 드립니다.', 3);

INSERT INTO FAQS (FAQ_ID, QUESTION, ANSWER, ORDER_INDEX)
VALUES (SEQ_FAQ_ID.NEXTVAL, '방제 약품이 사람과 반려동물에게 안전한가요?',
        '네, 안전 인증을 받은 약품만을 사용하며 사람과 반려동물에게 무해합니다. 또한 루미오 UV LED 해충 퇴치기와 같은 빛·물리 포집 방식도 함께 활용하여 화학 약품 사용을 최소화하고 있습니다.', 4);

INSERT INTO FAQS (FAQ_ID, QUESTION, ANSWER, ORDER_INDEX)
VALUES (SEQ_FAQ_ID.NEXTVAL, '방제 효과는 얼마나 지속되나요?',
        '초기 집중 방제 후 2~3개월의 정기 관리 기간을 통해 재발을 방지합니다. 1차 방제로 성충·유충의 약 50%를, 2차로 추가 40%를 제거하며, 이후 정기 점검으로 외부 유입을 차단하여 장기적인 효과를 유지합니다.', 5);

INSERT INTO FAQS (FAQ_ID, QUESTION, ANSWER, ORDER_INDEX)
VALUES (SEQ_FAQ_ID.NEXTVAL, '시공 후 AS는 어떻게 되나요?',
        '시공 완료 후 불편하신 사항이 생기면 상담 문의로 접수해 주시면 신속하게 처리해 드립니다. 무상 보증 서비스를 제공하고 있으며, 정기 관리 계약 고객의 경우 지속적인 사후 관리가 포함됩니다.', 6);

INSERT INTO FAQS (FAQ_ID, QUESTION, ANSWER, ORDER_INDEX)
VALUES (SEQ_FAQ_ID.NEXTVAL, '서비스 가능 지역이 어디인가요?',
        '현재 서비스 가능 지역은 상담을 통해 확인하실 수 있습니다. 상담 문의 시 지역을 남겨 주시면 방문 가능 여부를 안내해 드리겠습니다.', 7);

COMMIT;

-- ============================================
-- 테이블 전체 조회
-- ============================================

-- 관리자 테이블 전체 조회
SELECT * FROM ADMINS;

-- 문의 테이블 전체 조회
SELECT * FROM INQUIRIES ORDER BY INQUIRY_ID DESC;

-- 이미지 모음 테이블 전체 조회
SELECT * FROM REVIEWS ORDER BY REVIEW_ID DESC;

-- FAQ 조회
SELECT * FROM FAQS ORDER BY ORDER_INDEX, FAQ_ID;

-- 견적 시트 테이블 전체 조회
SELECT SHEET_ID, SHEET_KEY, UPDATED_AT, LENGTH(DATA_JSON) AS DATA_SIZE FROM ESTIMATE_SHEETS;

-- 견적 시트 조회 (SHEET_KEY = 'main')
SELECT SHEET_ID, SHEET_KEY, UPDATED_AT, LENGTH(DATA_JSON) AS DATA_SIZE
FROM ESTIMATE_SHEETS
WHERE SHEET_KEY = 'main';

-- 가격표 조회 (SHEET_KEY = 'price-table')
SELECT SHEET_ID, SHEET_KEY, UPDATED_AT, LENGTH(DATA_JSON) AS DATA_SIZE
FROM ESTIMATE_SHEETS
WHERE SHEET_KEY = 'price-table';

-- 로그인 시도 기록 전체 조회 (최신순)
SELECT * FROM LOGIN_ATTEMPT_LOGS ORDER BY ATTEMPTED_AT DESC;
