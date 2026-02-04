-- ============================================
-- 해충 방제 프로젝트 - Oracle Database Schema
-- ============================================

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
CREATE SEQUENCE SEQ_ADMIN_ID START WITH 1 INCREMENT BY 1;

-- 2. 공지사항 테이블
CREATE TABLE NOTICES (
    NOTICE_ID       NUMBER          PRIMARY KEY,
    ADMIN_ID        NUMBER          NOT NULL,
    TITLE           VARCHAR2(200)   NOT NULL,
    CONTENT         CLOB            NOT NULL,
    VIEW_COUNT      NUMBER          DEFAULT 0,
    CREATED_AT      DATE            DEFAULT SYSDATE,
    CONSTRAINT FK_NOTICE_ADMIN FOREIGN KEY (ADMIN_ID) REFERENCES ADMINS(ADMIN_ID)
);

-- 공지사항 ID 시퀀스
CREATE SEQUENCE SEQ_NOTICE_ID START WITH 1 INCREMENT BY 1;

-- 3. 초기 데이터
INSERT INTO ADMINS (ADMIN_ID, USERNAME, PASSWORD, ADMIN_NAME, EMAIL)
VALUES (SEQ_ADMIN_ID.NEXTVAL, 'admin', 'admin123', '관리자', 'admin@company.com');

INSERT INTO NOTICES (NOTICE_ID, ADMIN_ID, TITLE, CONTENT)
VALUES (SEQ_NOTICE_ID.NEXTVAL, 1, '홈페이지 오픈 안내', '홈페이지가 새롭게 오픈되었습니다.');

COMMIT;
