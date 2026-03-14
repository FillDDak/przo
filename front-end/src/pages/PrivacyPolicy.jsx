import { Link } from "react-router-dom";
import "./PolicyPage.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";

const PrivacyPolicy = () => {
  return (
    <div className="policy">
      <section className="policy__banner">
        <div className="policy__breadcrumb">
          <Link to="/" className="policy__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="policy__breadcrumb-icon" />
          </Link>
          <span className="policy__breadcrumb-separator">&gt;</span>
          <span className="policy__breadcrumb-current">개인정보처리방침</span>
        </div>
      </section>

      <section className="policy__main">
        <div className="policy__content">
          <h1 className="policy__title">개인정보처리방침</h1>

          <div className="policy__body">
            <p className="policy__updated">시행일: 2025년 1월 1일</p>

            <p className="policy__text">
              프르조(이하 "회사")는 개인정보보호법 제30조에 따라 정보주체의 개인정보를 보호하고
              이와 관련한 고충을 신속하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
            </p>

            <div className="policy__section">
              <h2 className="policy__section-title">제1조 (수집하는 개인정보 항목 및 수집 방법)</h2>
              <p className="policy__text">회사는 상담 문의 서비스 제공을 위해 아래와 같이 개인정보를 수집합니다.</p>
              <table className="policy__table">
                <thead>
                  <tr>
                    <th>수집 항목</th>
                    <th>필수/선택</th>
                    <th>수집 목적</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>이름</td>
                    <td>필수</td>
                    <td>문의자 식별 및 답변 제공</td>
                  </tr>
                  <tr>
                    <td>전화번호</td>
                    <td>필수</td>
                    <td>문의 확인 및 연락, 게시글 비밀번호 자동 설정</td>
                  </tr>
                  <tr>
                    <td>이메일 주소</td>
                    <td>필수</td>
                    <td>문의 답변 전달</td>
                  </tr>
                  <tr>
                    <td>업체명/주소</td>
                    <td>선택</td>
                    <td>방문 시공 견적 산정</td>
                  </tr>
                  <tr>
                    <td>문의 제목 및 내용</td>
                    <td>필수</td>
                    <td>상담 내용 확인 및 답변 제공</td>
                  </tr>
                  <tr>
                    <td>첨부파일</td>
                    <td>선택</td>
                    <td>현장 사진 등 참고 자료 확인</td>
                  </tr>
                </tbody>
              </table>
              <p className="policy__text">수집 방법: 상담 문의 페이지 내 양식을 통한 직접 입력</p>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제2조 (개인정보의 처리 목적)</h2>
              <p className="policy__text">회사는 수집한 개인정보를 다음의 목적으로만 이용합니다.</p>
              <ul className="policy__list">
                <li>상담 문의 접수 및 답변 제공</li>
                <li>해충방제 서비스 견적 안내</li>
                <li>문의 게시글 본인 확인(비밀번호 기능)</li>
              </ul>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제3조 (개인정보의 보유 및 이용 기간)</h2>
              <p className="policy__text">
                개인정보는 수집·이용 목적이 달성된 후 지체 없이 파기합니다.
                단, 관련 법령에 따라 보존할 필요가 있는 경우에는 해당 기간 동안 보관합니다.
              </p>
              <table className="policy__table">
                <thead>
                  <tr>
                    <th>보유 항목</th>
                    <th>보유 기간</th>
                    <th>근거</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>상담 문의 기록</td>
                    <td>문의 처리 완료 후 1년</td>
                    <td>서비스 운영 목적</td>
                  </tr>
                  <tr>
                    <td>전자상거래 관련 기록</td>
                    <td>5년</td>
                    <td>전자상거래법 제6조</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제4조 (개인정보의 제3자 제공)</h2>
              <p className="policy__text">
                회사는 정보주체의 개인정보를 제1조에서 명시한 목적 범위 내에서만 처리하며,
                정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조에 해당하는 경우를 제외하고는
                개인정보를 제3자에게 제공하지 않습니다.
              </p>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제5조 (개인정보의 파기)</h2>
              <p className="policy__text">
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 된 경우에는
                지체 없이 해당 개인정보를 파기합니다.
              </p>
              <ul className="policy__list">
                <li>전자적 파일: 복원이 불가능한 방법으로 영구 삭제</li>
                <li>종이 문서: 분쇄기로 분쇄 또는 소각</li>
              </ul>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제6조 (정보주체의 권리·의무 및 행사 방법)</h2>
              <p className="policy__text">정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
              <ul className="policy__list">
                <li>개인정보 열람 요구</li>
                <li>개인정보 오류 등에 대한 정정 요구</li>
                <li>개인정보 삭제 요구</li>
                <li>개인정보 처리 정지 요구</li>
              </ul>
              <p className="policy__text">
                권리 행사는 아래 개인정보 보호책임자에게 이메일 또는 전화로 요청하시면 처리해 드립니다.
              </p>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제7조 (개인정보의 안전성 확보 조치)</h2>
              <p className="policy__text">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
              <ul className="policy__list">
                <li>개인정보 접근 권한 최소화</li>
                <li>비밀번호의 암호화 저장</li>
                <li>해킹 등에 대비한 기술적 대책 수립</li>
                <li>개인정보 접근 기록 보관</li>
              </ul>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제8조 (개인정보 보호책임자)</h2>
              <p className="policy__text">
                회사는 개인정보 처리에 관한 업무를 총괄하여 책임지고, 정보주체의 개인정보 관련 문의, 불만 처리 및
                피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="policy__highlight">
                <p className="policy__text"><strong>개인정보 보호책임자</strong></p>
                <p className="policy__text">성명: 김선미</p>
                <p className="policy__text">전화: 1670-2335</p>
                <p className="policy__text">이메일: pestredzone@naver.com</p>
              </div>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제9조 (개인정보 처리방침 변경)</h2>
              <p className="policy__text">
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가,
                삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 사이트를 통해 고지합니다.
              </p>
            </div>

            <div className="policy__section">
              <h2 className="policy__section-title">제10조 (권익침해 구제 방법)</h2>
              <p className="policy__text">
                개인정보 침해에 대한 신고나 상담이 필요하신 경우 아래 기관에 문의하실 수 있습니다.
              </p>
              <ul className="policy__list">
                <li>개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
                <li>개인정보침해신고센터: 118 (privacy.kisa.or.kr)</li>
                <li>대검찰청: 1301 (www.spo.go.kr)</li>
                <li>경찰청: 182 (ecrm.cyber.go.kr)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
