-- 관리자 설정
ALTER SESSION SET "_ORACLE_SCRIPT"=true;

-- przo 계정 생성
create user przo IDENTIFIED BY 12345;

-- 접속 및 리소스 권한
grant connect, resource to przo;

-- 추가 권한
grant create view, create sequence, create procedure to przo;

-- 테이블스페이스 용량 설정
alter user przo DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS;

-- 계정 삭제
-- drop user przo;
