
-- 계정등록 권한
ALTER SESSION SET "_ORACLE_SCRIPT"=true;

-- przo 계정 생성
create user przo IDENTIFIED BY 12345;

-- 등록할 수 있는 권한
grant connect, resource to przo;

-- 추가 권한
grant create view, create sequence, create procedure to przo;

-- 물리적 저장 공간
alter user przo DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS;

-- 계정 삭제
-- drop user przo;

