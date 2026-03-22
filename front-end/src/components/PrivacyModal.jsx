import "./PrivacyModal.css";

const PrivacyModal = ({ onClose }) => {
  return (
    <div className="privacy-modal__overlay" onClick={onClose}>
      <div className="privacy-modal__box" onClick={(e) => e.stopPropagation()}>
        <h2 className="privacy-modal__title">개인정보 수집 및 이용 동의</h2>
        <p className="privacy-modal__desc">
          회사는 상담 문의 접수 및 답변 제공을 위해 아래와 같이 개인정보를 수집·이용합니다.
        </p>
        <table className="privacy-modal__table">
          <thead>
            <tr>
              <th>수집 항목</th>
              <th>수집 목적</th>
              <th>보유 기간</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>이름, 전화번호, 이메일,<br />업체명/주소(선택),<br />문의 내용, 첨부파일</td>
              <td>상담 문의 접수 및<br />답변 제공</td>
              <td>문의 처리 완료 후<br />3년</td>
            </tr>
          </tbody>
        </table>
        <p className="privacy-modal__notice">
          위 동의를 거부할 권리가 있으나, 거부 시 상담 문의 접수가 제한될 수 있습니다.
        </p>
        <button className="privacy-modal__close" onClick={onClose}>확인</button>
      </div>
    </div>
  );
};

export default PrivacyModal;
