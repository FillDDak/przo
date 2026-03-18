import { useState, useEffect, useRef, useCallback } from "react";
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
  const [attachments, setAttachments] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const isDirty =
    formData.name.trim() !== "" ||
    formData.companyName.trim() !== "" ||
    formData.phone.trim() !== "" ||
    formData.email.trim() !== "" ||
    formData.title.trim() !== "" ||
    formData.content.trim() !== "" ||
    attachments.length > 0;

  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }) =>
      isDirty && !submittedRef.current && currentLocation.pathname !== nextLocation.pathname,
    [isDirty]
  );

  const blocker = useBlocker(shouldBlock);

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

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.startsWith('02')) {
      if (numbers.length <= 2) return numbers;
      else if (numbers.length <= 5) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
      else if (numbers.length <= 9) return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
      else return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
    }
    if (numbers.length <= 3) return numbers;
    else if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    else if (numbers.length === 10) return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    else return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phone" ? formatPhoneNumber(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const oversized = files.find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) {
      setFileError(`"${oversized.name}" 파일 용량은 10MB를 초과할 수 없습니다.`);
      e.target.value = "";
      return;
    }
    setFileError("");
    setAttachments((prev) => {
      const existing = prev.map((f) => f.name);
      const newFiles = files.filter((f) => !existing.includes(f.name));
      return [...prev, ...newFiles];
    });
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { alert("이름을 입력해주세요."); return; }
    if (!formData.phone.trim()) { alert("전화번호를 입력해주세요."); return; }
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length < 4) { alert("올바른 전화번호를 입력해주세요."); return; }
    if (!formData.email.trim()) { alert("이메일을 입력해주세요."); return; }
    if (!formData.title.trim()) { alert("제목을 입력해주세요."); return; }
    if (!formData.content.trim()) { alert("문의 내용을 입력해주세요."); return; }

    try {
      setIsSubmitting(true);
      const autoPassword = formData.phone.replace(/\D/g, "").slice(-4);
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("companyName", formData.companyName);
      submitData.append("phone", formData.phone);
      submitData.append("email", formData.email);
      submitData.append("password", autoPassword);
      submitData.append("title", formData.title);
      submitData.append("content", formData.content);
      attachments.forEach((file) => submitData.append("attachments", file));

      const response = await fetch(`${API_BASE_URL}/inquiries`, {
        method: "POST",
        body: submitData,
      });

      if (response.ok) {
        const data = await response.json();
        submittedRef.current = true;
        setFormData({ name: "", companyName: "", phone: "", email: "", title: "", content: "" });
        setAttachments([]);
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
      <section className="qna-write__banner">
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

      <section className="qna-write__main">
        <div className="qna-write__content">
          <h1 className="qna-write__title">상담 문의</h1>

          <form className="qna-write__form" onSubmit={handleSubmit}>
            <div className="qna-write__row">
              <div className="qna-write__field">
                <label className="qna-write__label">이름</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  className="qna-write__input" placeholder="홍길동" maxLength={20} />
                <span className="qna-write__char-count">{formData.name.length}/20</span>
              </div>
              <div className="qna-write__field">
                <label className="qna-write__label">업체명/주소</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                  className="qna-write__input" placeholder="프르조" maxLength={100} />
              </div>
            </div>

            <div className="qna-write__row">
              <div className="qna-write__field">
                <label className="qna-write__label">전화번호</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  className="qna-write__input" placeholder="010-1234-5678" maxLength={13} />
                <p className="qna-write__hint">전화번호 뒷자리 4자리가 게시글 비밀번호로 자동 설정됩니다.</p>
              </div>
              <div className="qna-write__field">
                <label className="qna-write__label">이메일</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="qna-write__input" placeholder="przo@naver.com" maxLength={100} />
              </div>
            </div>

            <div className="qna-write__field qna-write__field--full">
              <label className="qna-write__label">제목</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                className="qna-write__input" placeholder="30평 가정집 견적 문의 드립니다." maxLength={100} />
              <span className="qna-write__char-count">{formData.title.length}/100</span>
            </div>

            <div className="qna-write__field qna-write__field--full">
              <label className="qna-write__label">문의 내용</label>
              <textarea name="content" value={formData.content} onChange={handleChange}
                className="qna-write__textarea" placeholder="해충방제 정기 관리를 신청하면 매월 얼마의 비용이 드나요?"
                rows={6} maxLength={2000} />
              <span className="qna-write__char-count">{formData.content.length}/2000</span>
            </div>

            {/* 첨부파일 */}
            <div className="qna-write__field qna-write__field--full">
              <label className="qna-write__label">첨부파일</label>
              <div className="qna-write__file-wrapper">
                <input type="file" id="attachment" multiple onChange={handleFileChange}
                  className="qna-write__file-input" />
                <label htmlFor="attachment" className="qna-write__file-label">
                  <img src={fileIcon} alt="첨부파일" className="qna-write__file-icon" />
                  <span>파일 선택 (여러 개 가능, 파일당 최대 10MB)</span>
                </label>
              </div>
              {attachments.length > 0 && (
                <ul className="qna-write__file-list">
                  {attachments.map((file, i) => (
                    <li key={i} className="qna-write__file-item">
                      <img src={fileIcon} alt="" className="qna-write__file-icon" />
                      <span className="qna-write__file-name--selected">{file.name}</span>
                      <button type="button" className="qna-write__file-remove"
                        onClick={() => removeAttachment(i)}>×</button>
                    </li>
                  ))}
                </ul>
              )}
              {fileError && <p className="qna-write__file-error">{fileError}</p>}
            </div>

            <div className="qna-write__button-wrapper">
              <button type="submit" className="qna-write__submit-btn" disabled={isSubmitting}>
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
