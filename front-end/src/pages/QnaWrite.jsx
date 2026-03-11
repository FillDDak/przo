import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useBlocker } from "react-router-dom";
import "./QnaWrite.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";
import fileIcon from "../assets/section7-icon/section7-icon-file.svg";
import closeIcon from "../assets/other-page-icon-image/close-icon.svg";

const API_BASE_URL = "/api";


const QnaWrite = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    title: "",
    content: "",
  });
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const isDirty =
    formData.name.trim() !== "" ||
    formData.companyName.trim() !== "" ||
    formData.phone.trim() !== "" ||
    formData.email.trim() !== "" ||
    formData.title.trim() !== "" ||
    formData.content.trim() !== "" ||
    attachment !== null;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && !submittedRef.current && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 전화번호 포맷팅 함수 (10자리, 11자리 지원)
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '');

    // 서울 지역번호 (02)
    if (numbers.startsWith('02')) {
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 6) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
      } else {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
      }
    }

    // 휴대폰 및 기타 지역번호 (3자리)
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length === 10) {
      // 10자리: XXX-XXX-XXXX
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    } else {
      // 11자리: XXX-XXXX-XXXX
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      setFormData((prev) => ({
        ...prev,
        [name]: formatPhoneNumber(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAttachment(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!formData.phone.trim()) {
      alert("전화번호를 입력해주세요.");
      return;
    }
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length < 4) {
      alert("올바른 전화번호를 입력해주세요.");
      return;
    }
    if (!formData.email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim()) {
      alert("문의 내용을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 전화번호 뒷자리 4자리를 비밀번호로 자동 설정
      const autoPassword = formData.phone.replace(/\D/g, "").slice(-4);

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("companyName", formData.companyName);
      submitData.append("phone", formData.phone);
      submitData.append("email", formData.email);
      submitData.append("password", autoPassword);
      submitData.append("title", formData.title);
      submitData.append("content", formData.content);
      if (attachment) {
        submitData.append("attachment", attachment);
      }

      const response = await fetch(`${API_BASE_URL}/inquiries`, {
        method: "POST",
        body: submitData,
      });

      if (response.ok) {
        const data = await response.json();
        submittedRef.current = true;
        setFormData({ name: "", companyName: "", phone: "", email: "", title: "", content: "" });
        setAttachment(null);
        navigate(`/qna/${data.inquiryId}`, { state: { autoVerified: true, autoPassword } });
      } else {
        alert("문의 등록에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("문의 등록 오류:", error);
      alert("문의 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    {blocker.state === "blocked" && (
      <div className="qna-write__modal-overlay" onClick={() => blocker.reset()}>
        <div className="qna-write__modal" onClick={(e) => e.stopPropagation()}>
          <button className="qna-write__modal-close" onClick={() => blocker.reset()}>
            <img src={closeIcon} alt="닫기" width="16" height="16" />
          </button>
          <div className="qna-write__modal-header">
            <div className="qna-write__modal-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#51c488" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="#51c488" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="#51c488"/>
              </svg>
            </div>
            <div className="qna-write__modal-text">
              <h2 className="qna-write__modal-title">변경되지 않은 내용이 있습니다.</h2>
              <p className="qna-write__modal-subtitle">변경사항을 잃어버릴 수 있습니다.</p>
            </div>
          </div>
          <div className="qna-write__modal-buttons">
            <button className="qna-write__modal-btn qna-write__modal-btn--cancel" onClick={() => blocker.proceed()}>
              나가기
            </button>
            <button className="qna-write__modal-btn qna-write__modal-btn--save" onClick={() => blocker.reset()}>
              계속 작성하기
            </button>
          </div>
        </div>
      </div>
    )}
    <div className="qna-write">
      {/* 배너 섹션 */}
      <section className="qna-write__banner">
        {/* 브레드크럼 */}
        <div className="qna-write__breadcrumb">
          <Link to="/" className="qna-write__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="qna-write__breadcrumb-icon" />
          </Link>
          <span className="qna-write__breadcrumb-separator">&gt;</span>
          <span className="qna-write__breadcrumb-text">문의</span>
          <span className="qna-write__breadcrumb-separator">&gt;</span>
          <span className="qna-write__breadcrumb-current">상담 문의</span>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <section className="qna-write__main">
        <div className="qna-write__content">
          <h1 className="qna-write__title">상담 문의</h1>

          <form className="qna-write__form" onSubmit={handleSubmit}>
            {/* 이름 & 업체명/주소 */}
            <div className="qna-write__row">
              <div className="qna-write__field">
                <label className="qna-write__label">이름</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="qna-write__input"
                  placeholder="홍길동"
                />
              </div>
              <div className="qna-write__field">
                <label className="qna-write__label">업체명/주소</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="qna-write__input"
                  placeholder="프르조"
                />
              </div>
            </div>

            {/* 전화번호 & 이메일 */}
            <div className="qna-write__row">
              <div className="qna-write__field">
                <label className="qna-write__label">전화번호</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="qna-write__input"
                  placeholder="010-1234-5678"
                />
                <p className="qna-write__hint">전화번호 뒷자리 4자리가 게시글 비밀번호로 자동 설정됩니다.</p>
              </div>
              <div className="qna-write__field">
                <label className="qna-write__label">이메일</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="qna-write__input"
                  placeholder="przo@naver.com"
                />
              </div>
            </div>

            {/* 제목 */}
            <div className="qna-write__field qna-write__field--full">
              <label className="qna-write__label">제목</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="qna-write__input"
                placeholder="30평 가정집 견적 문의 드립니다."
              />
            </div>

            {/* 문의 내용 */}
            <div className="qna-write__field qna-write__field--full">
              <label className="qna-write__label">문의 내용</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="qna-write__textarea"
                placeholder="해충방제 정기 관리를 신청하면 매월 얼마의 비용이 드나요?"
                rows={6}
              />
            </div>

            {/* 첨부파일 */}
            <div className="qna-write__field qna-write__field--full">
              <label className="qna-write__label">첨부파일</label>
              <div className="qna-write__file-wrapper">
                <input
                  type="file"
                  id="attachment"
                  onChange={handleFileChange}
                  className="qna-write__file-input"
                />
                <label htmlFor="attachment" className="qna-write__file-label">
                  <img src={fileIcon} alt="첨부파일" className="qna-write__file-icon" />
                  <span className={attachment ? "qna-write__file-name--selected" : ""}>{attachment ? attachment.name : "파일을 선택해주세요"}</span>
                </label>
              </div>
            </div>

            {/* 작성하기 버튼 */}
            <div className="qna-write__button-wrapper">
              <button
                type="submit"
                className="qna-write__submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "등록 중..." : "작성하기"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
    </>
  );
};

export default QnaWrite;
