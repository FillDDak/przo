import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./QnaDetail.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";
import fileIcon from "../assets/section7-icon/section7-icon-file.svg";

const API_BASE_URL = "http://localhost:8080/api";

const QnaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/inquiries/${id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        fetchInquiry();
      } else {
        setError("비밀번호가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error("비밀번호 확인 오류:", error);
      setError("비밀번호 확인 중 오류가 발생했습니다.");
    }
  };

  const fetchInquiry = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/inquiries/${id}`);
      if (response.ok) {
        const data = await response.json();
        setInquiry(data);
      }
    } catch (error) {
      console.error("문의를 불러오는데 실패했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="qna-detail">
        <div className="qna-detail__loading">로딩 중...</div>
      </div>
    );
  }

  // 비밀번호 확인 전 화면
  if (!isVerified) {
    return (
      <div className="qna-detail">
        {/* 배너 섹션 */}
        <section className="qna-detail__banner">
          <div className="qna-detail__breadcrumb">
            <Link to="/" className="qna-detail__breadcrumb-link">
              <img src={homeIcon} alt="홈" className="qna-detail__breadcrumb-icon" />
            </Link>
            <span className="qna-detail__breadcrumb-separator">&gt;</span>
            <span className="qna-detail__breadcrumb-text">상담 문의</span>
            <span className="qna-detail__breadcrumb-separator">&gt;</span>
            <span className="qna-detail__breadcrumb-current">무료 문의</span>
          </div>
        </section>

        {/* 비밀번호 입력 섹션 */}
        <section className="qna-detail__main">
          <div className="qna-detail__content">
            <h1 className="qna-detail__title">무료 문의</h1>

            <div className="qna-detail__password-form">
              <div className="qna-detail__password-box">
                <svg className="qna-detail__lock-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2 className="qna-detail__password-title">비밀글입니다</h2>
                <p className="qna-detail__password-desc">
                  이 글을 보려면 비밀번호를 입력해주세요.
                </p>
                <form onSubmit={handlePasswordSubmit} className="qna-detail__password-input-form">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호 입력"
                    className="qna-detail__password-input"
                  />
                  {error && <p className="qna-detail__password-error">{error}</p>}
                  <div className="qna-detail__password-buttons">
                    <button type="button" onClick={() => navigate("/qna")} className="qna-detail__password-cancel">
                      목록으로
                    </button>
                    <button type="submit" className="qna-detail__password-submit">
                      확인
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="qna-detail">
        <div className="qna-detail__not-found">문의를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="qna-detail">
      {/* 배너 섹션 */}
      <section className="qna-detail__banner">
        {/* 브레드크럼 */}
        <div className="qna-detail__breadcrumb">
          <Link to="/" className="qna-detail__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="qna-detail__breadcrumb-icon" />
          </Link>
          <span className="qna-detail__breadcrumb-separator">&gt;</span>
          <span className="qna-detail__breadcrumb-text">상담 문의</span>
          <span className="qna-detail__breadcrumb-separator">&gt;</span>
          <span className="qna-detail__breadcrumb-current">무료 문의</span>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <section className="qna-detail__main">
        <div className="qna-detail__content">
          <h1 className="qna-detail__title">무료 문의</h1>

          <div className="qna-detail__form">
            {/* 이름 & 업체명/주소 */}
            <div className="qna-detail__row">
              <div className="qna-detail__field">
                <label className="qna-detail__label">이름</label>
                <div className="qna-detail__value">{inquiry.name}</div>
              </div>
              <div className="qna-detail__field">
                <label className="qna-detail__label">업체명/주소</label>
                <div className="qna-detail__value">{inquiry.companyName || "-"}</div>
              </div>
            </div>

            {/* 전화번호 & 이메일 */}
            <div className="qna-detail__row">
              <div className="qna-detail__field">
                <label className="qna-detail__label">전화번호</label>
                <div className="qna-detail__value">{inquiry.phone}</div>
              </div>
              <div className="qna-detail__field">
                <label className="qna-detail__label">이메일</label>
                <div className="qna-detail__value">{inquiry.email}</div>
              </div>
            </div>

            {/* 제목 */}
            <div className="qna-detail__field qna-detail__field--full">
              <label className="qna-detail__label">제목</label>
              <div className="qna-detail__value">{inquiry.title}</div>
            </div>

            {/* 문의 내용 */}
            <div className="qna-detail__field qna-detail__field--full">
              <label className="qna-detail__label">문의 내용</label>
              <div className="qna-detail__value qna-detail__value--content">
                {inquiry.content}
              </div>
            </div>

            {/* 첨부파일 */}
            <div className="qna-detail__field qna-detail__field--full">
              <label className="qna-detail__label">첨부파일</label>
              <div className="qna-detail__file">
                {inquiry.attachment ? (
                  <a href={inquiry.attachment} className="qna-detail__file-link" download>
                    <img src={fileIcon} alt="첨부파일" className="qna-detail__file-icon" />
                    {inquiry.attachmentName || inquiry.attachment.split('/').pop()}
                  </a>
                ) : (
                  <>
                    <img src={fileIcon} alt="첨부파일" className="qna-detail__file-icon" />
                    <span className="qna-detail__file-empty">첨부파일 없음</span>
                  </>
                )}
              </div>
            </div>

            {/* 버튼 */}
            <div className="qna-detail__button-wrapper">
              <Link to="/qna" className="qna-detail__list-btn">
                목록으로
              </Link>
              <Link to={`/qna/${id}/edit`} className="qna-detail__list-btn">
                수정하기
              </Link>
            </div>

            {/* 답변 내용 */}
            <div className="qna-detail__answer">
              <label className="qna-detail__label">답변 내용</label>
              <div className="qna-detail__answer-content">
                {inquiry.adminNote || "아직 답변이 등록되지 않았습니다."}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QnaDetail;
