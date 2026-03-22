import { Link } from "react-router-dom";
import "./PolicyPage.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";

const Terms = () => {
  return (
    <div className="policy">
      <section className="policy__banner">
        <div className="policy__breadcrumb">
          <Link to="/" className="policy__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="policy__breadcrumb-icon" />
          </Link>
          <span className="policy__breadcrumb-separator">&gt;</span>
          <span className="policy__breadcrumb-current">사이트 이용 약관</span>
        </div>
      </section>

      <section className="policy__main">
        <div className="policy__content">
          <h1 className="policy__title">사이트 이용 약관</h1>

          <div className="policy__body">
            <p className="policy__updated">시행일: 2026년 3월 18일</p>

            <div className="policy__section">
              <h2 className="policy__section-title">제1조 (목적)</h2>
              <p className="policy__text">
                이 약관은 프르조(이하 "회사")가 운영하는 웹사이트(이하 "사이트")에서 제공하는 서비스의 이용 조건 및 절차,
                회사와 이용자 간의 권리·의무 및 책임사항 등을 규정함을 목적으로 합니다.
              </p>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제2조 (용어 정의)</h2>
              <ul className="policy__list">
                <li>"사이트"란 회사가 운영하는 프르조 웹사이트를 말합니다.</li>
                <li>"이용자"란 사이트에 접속하여 서비스를 이용하는 자를 말합니다.</li>
                <li>"서비스"란 회사가 사이트를 통해 제공하는 해충방제 상담 문의, 시공 사진 열람, 정보 제공 등 일체의 서비스를 말합니다.</li>
              </ul>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제3조 (약관의 효력 및 변경)</h2>
              <ul className="policy__list">
                <li>이 약관은 사이트 내 공시함으로써 효력이 발생합니다.</li>
                <li>회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 시행 7일 전부터 사이트를 통해 공시합니다.</li>
                <li>이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하여야 합니다.</li>
              </ul>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제4조 (서비스 이용)</h2>
              <ul className="policy__list">
                <li>서비스는 연중무휴, 24시간 제공을 원칙으로 합니다. 단, 시스템 점검 등의 사유로 일시 중단될 수 있습니다.</li>
                <li>상담 문의 서비스를 통해 접수된 문의는 운영시간(평일 09:00~18:00) 내에 확인 및 답변 처리됩니다.</li>
                <li>이용자는 상담 문의 시 정확한 정보를 입력해야 하며, 허위 정보 입력으로 발생하는 불이익에 대해 회사는 책임을 지지 않습니다.</li>
              </ul>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제5조 (이용자의 의무)</h2>
              <ul className="policy__list">
                <li>이용자는 타인의 정보를 도용하거나 허위 정보를 입력해서는 안 됩니다.</li>
                <li>이용자는 사이트의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.</li>
                <li>이용자는 관계 법령 및 이 약관을 준수하여야 합니다.</li>
              </ul>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제6조 (책임 제한)</h2>
              <ul className="policy__list">
                <li>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중단 등 불가항력적인 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
                <li>회사는 이용자 귀책 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
                <li>사이트에 게시된 정보 및 자료의 신뢰성, 정확성에 대해 회사는 보증하지 않습니다.</li>
              </ul>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제7조 (지식재산권)</h2>
              <ul className="policy__list">
                <li>사이트에 게시된 모든 콘텐츠(텍스트, 이미지, 영상 등)의 저작권은 회사에 귀속됩니다.</li>
                <li>이용자는 회사의 사전 동의 없이 이를 복제, 배포, 수정하거나 상업적으로 이용할 수 없습니다.</li>
              </ul>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제8조 (준거법 및 분쟁 해결)</h2>
              <p className="policy__text">
                이 약관은 대한민국 법령에 따라 해석되며, 서비스 이용과 관련하여 분쟁이 발생한 경우
                회사의 소재지를 관할하는 법원을 관할 법원으로 합니다.
              </p>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">문의처</h2>
              <div className="policy__highlight">
                <p className="policy__text">상호: 프르조</p>
                <p className="policy__text">대표: 김선미</p>
                <p className="policy__text">주소: 인천 계양구 마장로544번길 10 디오아제상가 2층 B1-207호</p>
                <p className="policy__text">전화: 1670-2335</p>
                <p className="policy__text">이메일: pestredzone@naver.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
