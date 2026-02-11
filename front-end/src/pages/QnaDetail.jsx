import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./QnaDetail.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";
import fileIcon from "../assets/section7-icon/section7-icon-file.svg";

const API_BASE_URL = "/api";

const QnaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, token } = useAuth();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [verifiedPassword, setVerifiedPassword] = useState("");
  const [error, setError] = useState("");
  const [replyMode, setReplyMode] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setVerifiedPassword(password);
        fetchInquiry();
      } else {
        setError("비밀번호가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error("비밀번호 확인 오류:", error);
      setError("비밀번호 확인 중 오류가 발생했습니다.");
    }
  };

  const fetchInquiry = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/inquiries/${id}`);
      if (response.ok) {
        const data = await response.json();
        setInquiry(data);
        setAdminNote(data.adminNote || "");
      }
    } catch (error) {
      console.error("문의를 불러오는데 실패했습니다:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 관리자인 경우 비밀번호 없이 바로 조회
  useEffect(() => {
    if (isAdmin) {
      setIsVerified(true);
      fetchInquiry();
    } else {
      setLoading(false);
    }
  }, [id, isAdmin, fetchInquiry]);

  // 답변 등록
  const handleReplySubmit = async () => {
    if (!adminNote.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/inquiries/${id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ adminNote }),
      });

      const data = await response.json();

      if (data.success) {
        alert("답변이 등록되었습니다.");
        setReplyMode(false);
        fetchInquiry();
      } else {
        alert(data.message || "답변 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("답변 등록 오류:", error);
      alert("답변 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 문의 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말로 이 문의를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert("문의가 삭제되었습니다.");
        navigate("/qna");
      } else {
        alert(data.message || "삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="qna-detail">
        <div className="qna-detail__loading">로딩 중...</div>
      </div>
    );
  }

  // 비밀번호 확인 전 화면 (관리자가 아닌 경우에만)
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

            {/* 제목 & 작성일 */}
            <div className="qna-detail__row">
              <div className="qna-detail__field">
                <label className="qna-detail__label">제목</label>
                <div className="qna-detail__value">{inquiry.title}</div>
              </div>
              <div className="qna-detail__field">
                <label className="qna-detail__label">작성일</label>
                <div className="qna-detail__value">{inquiry.createdAt || "-"}</div>
              </div>
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

            {/* 유저 버튼 - 첨부파일 아래 */}
            {!isAdmin && (
              <div className="qna-detail__button-wrapper">
                <Link to="/qna" className="qna-detail__list-btn">
                  목록으로
                </Link>
                <button
                  onClick={() => navigate(`/qna/${id}/edit`, { state: { password: verifiedPassword } })}
                  className="qna-detail__list-btn"
                >
                  수정하기
                </button>
              </div>
            )}

            {/* 답변 내용 */}
            <div className={`qna-detail__answer ${!isAdmin ? 'qna-detail__answer--no-border' : ''}`}>
              <label className="qna-detail__label">답변 내용</label>
              <div className="qna-detail__answer-content">
                {inquiry.adminNote || "아직 답변이 등록되지 않았습니다."}
              </div>
            </div>

            {/* 관리자 답변 작성 폼 */}
            {isAdmin && replyMode && (
              <div className="qna-detail__reply-form">
                <label className="qna-detail__label">{inquiry.adminNote ? "답변 재작성" : "답변 작성"}</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="qna-detail__reply-textarea"
                  placeholder="답변 내용을 입력해주세요."
                />
                <button
                  onClick={handleReplySubmit}
                  className="qna-detail__reply-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "등록 중..." : "답변 등록"}
                </button>
              </div>
            )}

            {/* 관리자 버튼 - 답변 아래 */}
            {isAdmin && (
              <div className="qna-detail__button-wrapper qna-detail__button-wrapper--no-border">
                <Link to="/qna" className="qna-detail__list-btn">
                  목록으로
                </Link>
                <button
                  onClick={() => setReplyMode(!replyMode)}
                  className="qna-detail__list-btn qna-detail__list-btn--admin"
                >
                  {replyMode ? "취소" : (inquiry.adminNote ? "수정하기" : "답변하기")}
                </button>
                <button
                  onClick={handleDelete}
                  className="qna-detail__list-btn qna-detail__list-btn--delete"
                >
                  삭제하기
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default QnaDetail;
