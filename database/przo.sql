-- ============================================
-- 해충 방제 프로젝트 - Oracle Database Schema
-- ============================================

-- 기존 테이블 및 시퀀스 삭제
DROP TABLE REVIEWS CASCADE CONSTRAINTS;
DROP TABLE INQUIRIES CASCADE CONSTRAINTS;
DROP TABLE ADMINS CASCADE CONSTRAINTS;
DROP SEQUENCE SEQ_REVIEW_ID;
DROP SEQUENCE SEQ_INQUIRY_ID;
DROP SEQUENCE SEQ_ADMIN_ID;

-- 1. 관리자 테이블
CREATE TABLE ADMINS (
    ADMIN_ID        NUMBER          PRIMARY KEY,
    USERNAME        VARCHAR2(50)    NOT NULL UNIQUE,
    PASSWORD        VARCHAR2(255)   NOT NULL,
    ADMIN_NAME      VARCHAR2(100)   NOT NULL,
    EMAIL           VARCHAR2(100),
    CREATED_AT      DATE            DEFAULT SYSDATE
);

-- 관리자 ID 시퀀스
CREATE SEQUENCE SEQ_ADMIN_ID START WITH 1 INCREMENT BY 1 NOCACHE;

-- 2. 문의 테이블
CREATE TABLE INQUIRIES (
    INQUIRY_ID      NUMBER          PRIMARY KEY,
    NAME            VARCHAR2(50)    NOT NULL,
    COMPANY_NAME    VARCHAR2(100),
    PHONE           VARCHAR2(20)    NOT NULL,
    EMAIL           VARCHAR2(100)   NOT NULL,
    PASSWORD        VARCHAR2(100)   NOT NULL,
    TITLE           VARCHAR2(200)   NOT NULL,
    CONTENT         CLOB            NOT NULL,
    ATTACHMENT      VARCHAR2(500),
    STATUS          VARCHAR2(20)    DEFAULT 'pending' CHECK (STATUS IN ('pending', 'in_progress', 'completed')),
    ADMIN_NOTE      CLOB,
    CREATED_AT      TIMESTAMP       DEFAULT SYSTIMESTAMP,
    RESPONDED_AT    TIMESTAMP
);

-- 문의 ID 시퀀스
CREATE SEQUENCE SEQ_INQUIRY_ID START WITH 1 INCREMENT BY 1 NOCACHE;

-- 3. 서비스 후기 테이블
CREATE TABLE REVIEWS (
    REVIEW_ID       NUMBER          PRIMARY KEY,
    ADMIN_ID        NUMBER          NOT NULL REFERENCES ADMINS(ADMIN_ID),
    TITLE           VARCHAR2(200)   NOT NULL,
    SERVICE_DATE    DATE            NOT NULL,
    CONTENT         CLOB            NOT NULL,
    IMAGE           VARCHAR2(500),
    STATUS          VARCHAR2(20)    DEFAULT 'published' CHECK (STATUS IN ('draft', 'published')),
    CREATED_AT      DATE            DEFAULT SYSDATE,
    UPDATED_AT      DATE
);

-- 서비스 후기 ID 시퀀스
CREATE SEQUENCE SEQ_REVIEW_ID START WITH 1 INCREMENT BY 1 NOCACHE;

-- ============================================
-- 예시 데이터
-- ============================================

-- 관리자 예시 데이터
INSERT INTO ADMINS (ADMIN_ID, USERNAME, PASSWORD, ADMIN_NAME, EMAIL)
VALUES (SEQ_ADMIN_ID.NEXTVAL, 'admin', '$2a$10$examplehashedpassword1234', '김관리', 'admin@przo.co.kr');

INSERT INTO ADMINS (ADMIN_ID, USERNAME, PASSWORD, ADMIN_NAME, EMAIL)
VALUES (SEQ_ADMIN_ID.NEXTVAL, 'manager', '$2a$10$examplehashedpassword5678', '이매니저', 'manager@przo.co.kr');

-- 문의 예시 데이터 (비밀번호: 1234)
INSERT INTO INQUIRIES (INQUIRY_ID, NAME, COMPANY_NAME, PHONE, EMAIL, PASSWORD, TITLE, CONTENT, STATUS)
VALUES (SEQ_INQUIRY_ID.NEXTVAL, '박고객', '맛있는식당', '010-1234-5678', 'customer1@email.com', '1234',
        '해충 방제 서비스 문의드립니다', '안녕하세요. 저희 식당에 해충 방제 서비스를 받고 싶습니다. 견적 문의 부탁드립니다.', 'pending');

INSERT INTO INQUIRIES (INQUIRY_ID, NAME, COMPANY_NAME, PHONE, EMAIL, PASSWORD, TITLE, CONTENT, STATUS, ADMIN_NOTE, RESPONDED_AT)
VALUES (SEQ_INQUIRY_ID.NEXTVAL, '최사장', '카페베네', '010-9876-5432', 'customer2@email.com', '1234',
        '정기 방역 서비스 계약 문의', '매월 정기적으로 방역 서비스를 받고 싶습니다. 가격과 일정 안내 부탁드립니다.', 'completed',
        '월 1회 정기 방역 계약 완료. 매월 첫째 주 월요일 오전 방문 예정.', SYSTIMESTAMP);

-- 서비스 후기 예시 데이터
INSERT INTO REVIEWS (REVIEW_ID, ADMIN_ID, TITLE, SERVICE_DATE, CONTENT, IMAGE, STATUS)
VALUES (SEQ_REVIEW_ID.NEXTVAL, 1, '강남구 카페 해충 방제 완료', TO_DATE('2025-01-15', 'YYYY-MM-DD'),
        '강남구 소재 카페에서 UV LED 해충 퇴치기 설치 및 방역 서비스를 완료했습니다. 고객님께서 매우 만족하셨습니다.',
        '/uploads/reviews/review1.jpg', 'published');

INSERT INTO REVIEWS (REVIEW_ID, ADMIN_ID, TITLE, SERVICE_DATE, CONTENT, IMAGE, STATUS)
VALUES (SEQ_REVIEW_ID.NEXTVAL, 1, '서초구 음식점 정기 방역', TO_DATE('2025-01-20', 'YYYY-MM-DD'),
        '서초구 음식점 정기 방역 서비스를 진행했습니다. 주방과 홀 전체에 대한 종합 방역을 실시했습니다.',
        '/uploads/reviews/review2.jpg', 'published');

COMMIT;

-- ============================================
-- 테이블 전체 조회
-- ============================================

-- 관리자 테이블 전체 조회
SELECT * FROM ADMINS;

-- 문의 테이블 전체 조회
SELECT * FROM INQUIRIES;

-- 서비스 후기 테이블 전체 조회
SELECT * FROM REVIEWS;
