import { Link } from "react-router-dom";
import "./PolicyPage.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";

const CookiePolicy = () => {
  return (
    <div className="policy">
      <section className="policy__banner">
        <div className="policy__breadcrumb">
          <Link to="/" className="policy__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="policy__breadcrumb-icon" />
          </Link>
          <span className="policy__breadcrumb-separator">&gt;</span>
          <span className="policy__breadcrumb-current">쿠키 정책</span>
        </div>
      </section>

      <section className="policy__main">
        <div className="policy__content">
          <h1 className="policy__title">쿠키 정책</h1>

          <div className="policy__body">
            <p className="policy__updated">시행일: 2025년 1월 1일</p>

            <div className="policy__section">
              <h2 className="policy__section-title">쿠키란?</h2>
              <p className="policy__text">
                쿠키(Cookie)란 웹사이트가 이용자의 브라우저에 저장하는 소량의 데이터 파일입니다.
                쿠키를 통해 사이트는 이용자의 방문 정보를 기억하고, 더 나은 이용 환경을 제공할 수 있습니다.
              </p>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">사이트의 저장 데이터</h2>
              <p className="policy__text">
                프르조 사이트는 외부 추적 쿠키나 광고 쿠키를 사용하지 않습니다.
                사이트 운영에 필요한 최소한의 데이터만을 브라우저에 저장합니다.
              </p>
              <table className="policy__table">
                <thead>
                  <tr>
                    <th>저장 항목</th>
                    <th>저장 방식</th>
                    <th>목적</th>
                    <th>보관 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>adminToken</td>
                    <td>localStorage</td>
                    <td>관리자 로그인 인증 유지</td>
                    <td>로그아웃 시 즉시 삭제</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제3자 쿠키</h2>
              <p className="policy__text">
                본 사이트는 Google Analytics, Facebook Pixel 등 제3자 추적 쿠키를 사용하지 않습니다.
              </p>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">저장 데이터 삭제 방법</h2>
              <p className="policy__text">브라우저 설정을 통해 저장된 데이터를 삭제할 수 있습니다.</p>
              <ul className="policy__list">
                <li>Chrome: 설정 &gt; 개인정보 보호 및 보안 &gt; 인터넷 사용 기록 삭제</li>
                <li>Safari: 환경설정 &gt; 개인정보 보호 &gt; 웹 사이트 데이터 관리</li>
                <li>Firefox: 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 사이트 데이터</li>
                <li>Edge: 설정 &gt; 개인정보, 검색 및 서비스 &gt; 검색 데이터 지우기</li>
              </ul>
              <p className="policy__text">
                단, localStorage 데이터를 삭제하면 관리자 로그인 상태가 해제됩니다.
              </p>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">문의</h2>
              <div className="policy__highlight">
                <p className="policy__text">쿠키 정책에 대한 문의사항은 아래로 연락해 주세요.</p>
                <p className="policy__text">이메일: pestredzone@naver.com</p>
                <p className="policy__text">전화: 1670-2335</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CookiePolicy;
