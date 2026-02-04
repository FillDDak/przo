import { Link } from "react-router-dom";
import "./Service.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";
import zapperCenter from "../assets/other-page-icon-image/service-zapper-center.png";
import zapper1 from "../assets/other-page-icon-image/service-zapper-1.png";
import zapper2 from "../assets/other-page-icon-image/service-zapper-2.png";
import zapper3 from "../assets/other-page-icon-image/service-zapper-3.png";
import zapper4 from "../assets/other-page-icon-image/service-zapper-4.png";

const Service = () => {
  return (
    <div className="service">
      {/* 배너 섹션 */}
      <section className="service__banner">
        {/* 브레드크럼 */}
        <div className="service__breadcrumb">
          <Link to="/" className="service__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="service__breadcrumb-icon" />
          </Link>
          <span className="service__breadcrumb-separator">&gt;</span>
          <span className="service__breadcrumb-text">서비스 소개</span>
          <span className="service__breadcrumb-separator">&gt;</span>
          <span className="service__breadcrumb-current">포충기 서비스</span>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <section className="service__main">
        <div className="service__content">
          <h1 className="service__title">루미오 UV LED 해충 퇴치기</h1>

          {/* 원형 다이어그램 */}
          <div className="service__diagram">
            {/* 중앙 이미지 */}
            <div className="service__center">
              <img src={zapperCenter} alt="루미오 UV LED 해충 퇴치기" className="service__center-img" />
            </div>

            {/* 전면 직접 유인 - 좌상단 */}
            <div className="service__feature service__feature--top-left">
              <span className="service__feature-title">전면 직접 유인</span>
              <div className="service__feature-img-wrapper">
                <img src={zapper1} alt="전면 직접 유인" className="service__feature-img" />
              </div>
            </div>

            {/* 상좌우 · 간접 유인 - 우상단 */}
            <div className="service__feature service__feature--top-right">
              <span className="service__feature-title">상좌우 · 간접 유인</span>
              <div className="service__feature-img-wrapper">
                <img src={zapper2} alt="상좌우 간접 유인" className="service__feature-img" />
              </div>
            </div>

            {/* 듀얼 파장 LED 램프 - 좌하단 */}
            <div className="service__feature service__feature--bottom-left">
              <div className="service__feature-img-wrapper">
                <img src={zapper3} alt="듀얼 파장 LED 램프" className="service__feature-img" />
              </div>
              <span className="service__feature-title">듀얼 파장 LED 램프</span>
            </div>

            {/* 초강력 글루페이퍼 - 우하단 */}
            <div className="service__feature service__feature--bottom-right">
              <div className="service__feature-img-wrapper">
                <img src={zapper4} alt="초강력 글루페이퍼" className="service__feature-img" />
              </div>
              <span className="service__feature-title">초강력 글루페이퍼</span>
            </div>
          </div>

          {/* 설명 텍스트 */}
          <div className="service__description">
            <p>프르조에서는 최신 UV-LED 해충 퇴치 시스템을 도입하여, 기존의 화학 스프레이 방식이 아닌</p>
            <p>“빛 + 물리 포집 / 전격살충” 방식으로 안전하고 쾌적한 방역 환경을 만들어 드립니다.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Service;
