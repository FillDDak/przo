import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useParams, useLocation, useBlocker } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import "./QnaWrite.css";
import ConfirmModal from "../components/ConfirmModal";
import PrivacyModal from "../components/PrivacyModal";
import { getErrorMessage } from "../utils/errorMessage";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";
import fileIcon from "../assets/section7-icon/section7-icon-file.svg";

const API_BASE_URL = "/api";

const QnaWrite = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const location = useLocation();
  const passedPassword = location.state?.password || "";
  const passedInquiry = location.state?.inquiry || null;

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    phone: "",
    title: "",
    content: "",
  });
  const [attachments, setAttachments] = useState([]);
  const [currentAttachments, setCurrentAttachments] = useState([]);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [modal, setModal] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ name: "", phone: "", title: "", content: "" });
  const [captchaSiteKey, setCaptchaSiteKey] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const submittedRef = useRef(false);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  const isDirty =
    formData.name.trim() !== "" ||
    formData.companyName.trim() !== "" ||
    formData.phone.trim() !== "" ||
    formData.title.trim() !== "" ||
    formData.content.trim() !== "" ||
    attachments.length > 0;

  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }) =>
      isDirty && !submittedRef.current && currentLocation.pathname !== nextLocation.pathname,
    [isDirty]
  );

  const blocker = useBlocker(shouldBlock);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    fetch("/api/config/turnstile-site-key")
      .then((r) => r.json())
      .then((d) => setCaptchaSiteKey(d.siteKey || ""))
      .catch(() => {});
  }, []);

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

  // 수정 모드: 기존 데이터 불러오기
  useEffect(() => {
    if (!isEdit) return;
    if (passedInquiry) {
      setFormData({
        name: passedInquiry.name || "",
        companyName: passedInquiry.companyName || "",
        phone: passedInquiry.phone || "",
        title: passedInquiry.title || "",
        content: passedInquiry.content || "",
      });
      if (passedInquiry.attachmentList?.length) {
        setCurrentAttachments(passedInquiry.attachmentList);
      }
      setLoading(false);
    } else {
      setModal({ title: "문의를 불러올 수 없습니다.", subtitle: "문의 상세 페이지에서 다시 접근해주세요.", buttons: [{ label: "확인", variant: "confirm", onClick: () => { setModal(null); navigate("/qna"); } }] });
      setLoading(false);
    }
  }, [id, isEdit, navigate, passedInquiry]);

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
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const MAX_FILES = 5;
  const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".pdf"];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const invalid = files.find((f) => {
      const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
      return !ALLOWED_EXTENSIONS.includes(ext);
    });
    if (invalid) {
      setFileError(`"${invalid.name}" 파일은 첨부할 수 없습니다. (jpg, jpeg, png, gif, pdf만 가능)`);
      e.target.value = "";
      return;
    }
    const oversized = files.find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) {
      setFileError(`"${oversized.name}" 파일 용량은 10MB를 초과할 수 없습니다.`);
      e.target.value = "";
      return;
    }
    setAttachments((prev) => {
      const existing = prev.map((f) => f.name);
      const newFiles = files.filter((f) => !existing.includes(f.name));
      const merged = [...prev, ...newFiles];
      if (merged.length > MAX_FILES) {
        setFileError(`파일은 최대 ${MAX_FILES}개까지 첨부할 수 있습니다.`);
        return prev;
      }
      setFileError("");
      return merged;
    });
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeCurrentAttachment = (index) => {
    setCurrentAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.name.trim()) errors.name = "이름을 입력해주세요.";
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!formData.phone.trim()) errors.phone = "전화번호를 입력해주세요.";
    else if (!isEdit && phoneDigits.length < 4) errors.phone = "올바른 전화번호를 입력해주세요.";
    if (!formData.title.trim()) errors.title = "제목을 입력해주세요.";
    if (!formData.content.trim()) errors.content = "문의 내용을 입력해주세요.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = ["name", "phone", "title", "content"].find((k) => errors[k]);
      const refMap = { name: nameRef, phone: phoneRef, title: titleRef, content: contentRef };
      const firstRef = refMap[firstKey];
      if (firstRef?.current) {
        firstRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        firstRef.current.focus({ preventScroll: true });
      }
      return;
    }
    if (!isEdit && !privacyAgreed) {
      setModal({ title: "개인정보 수집 및 이용에 동의해주세요.", buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
      return;
    }

    try {
      setIsSubmitting(true);
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("companyName", formData.companyName);
      submitData.append("phone", formData.phone);
      submitData.append("title", formData.title);
      submitData.append("content", formData.content);
      attachments.forEach((file) => submitData.append("attachments", file));

      if (isEdit) {
        submitData.append("password", passedPassword);
        const newPassword = phoneDigits.slice(-4);
        submitData.append("newPassword", newPassword);
        const response = await fetch(`${API_BASE_URL}/inquiries/${id}/update`, {
          method: "POST",
          body: submitData,
        });
        if (response.ok) {
          submittedRef.current = true;
          setModal({ title: "문의가 성공적으로 수정되었습니다.", buttons: [{ label: "확인", variant: "confirm", onClick: () => { setModal(null); navigate(`/qna/${id}`, { state: { password: phoneDigits.slice(-4) } }); } }] });
        } else if (response.status === 429) {
          let msg = "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
          try {
            const data = await response.json();
            if (data.blocked && data.remainingMinutes) {
              msg = `비밀번호 입력 횟수를 초과했습니다. 약 ${data.remainingMinutes}분 후에 다시 시도해주세요.`;
            } else if (data.message) {
              msg = data.message;
            }
          } catch {}
          setModal({ title: msg, buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
        } else if (response.status === 401) {
          setModal({ title: "비밀번호가 일치하지 않습니다.", subtitle: "문의 목록에서 비밀번호를 다시 확인해주세요.", buttons: [{ label: "확인", variant: "confirm", onClick: () => { setModal(null); navigate("/qna"); } }] });
        } else {
          setModal({ title: "문의 수정에 실패했습니다. 다시 시도해주세요.", buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
        }
      } else {
        const autoPassword = phoneDigits.slice(-4);
        submitData.append("password", autoPassword);
        if (captchaToken) submitData.append("captchaToken", captchaToken);
        const response = await fetch(`${API_BASE_URL}/inquiries`, {
          method: "POST",
          body: submitData,
        });
        if (response.ok) {
          const data = await response.json();
          submittedRef.current = true;
          setFormData({ name: "", companyName: "", phone: "", title: "", content: "" });
          setAttachments([]);
          navigate(`/qna/${data.inquiryId}`, { state: { autoVerified: true, autoPassword } });
        } else if (response.status === 429) {
          setCaptchaToken(null);
          captchaRef.current?.reset();
          setModal({ title: "요청이 너무 많습니다.", subtitle: "1시간 내 등록 가능한 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.", buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
        } else {
          setCaptchaToken(null);
          captchaRef.current?.reset();
          setModal({ title: "문의 등록에 실패했습니다. 다시 시도해주세요.", buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
        }
      }
    } catch (error) {
      console.error(isEdit ? "문의 수정 오류:" : "문의 등록 오류:", error);
      setModal({ title: isEdit ? "문의 수정 중 오류가 발생했습니다." : "문의 등록 중 오류가 발생했습니다.", subtitle: getErrorMessage(error), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="qna-write">
        <div className="qna-write__content" style={{ textAlign: "center", padding: "100px 0" }}>
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <>
    {privacyModalOpen && <PrivacyModal onClose={() => setPrivacyModalOpen(false)} />}
    {modal && (
      <ConfirmModal
        title={modal.title}
        subtitle={modal.subtitle}
        onClose={() => setModal(null)}
        buttons={modal.buttons}
      />
    )}
    {blocker.state === "blocked" && (
      <ConfirmModal
        title="변경되지 않은 내용이 있습니다."
        subtitle="변경사항을 잃어버릴 수 있습니다."
        onClose={() => blocker.reset()}
        buttons={[
          { label: "나가기", variant: "cancel", onClick: () => blocker.proceed() },
          { label: "계속 작성하기", variant: "confirm", onClick: () => blocker.reset() },
        ]}
      />
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
          <h1 className="qna-write__title">{isEdit ? "상담 수정" : "상담 문의"}</h1>

          <form className="qna-write__form" onSubmit={handleSubmit}>
            <div className="qna-write__row">
              <div className="qna-write__field">
                <label className="qna-write__label">이름</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  ref={nameRef} className={`qna-write__input${fieldErrors.name ? " qna-write__input--error" : ""}`}
                  placeholder="홍길동" maxLength={20} />
                <div className="qna-write__field-bottom">
                  {fieldErrors.name && <p className="qna-write__field-error">{fieldErrors.name}</p>}
                  <span className="qna-write__char-count">{formData.name.length}/20</span>
                </div>
              </div>
              <div className="qna-write__field">
                <label className="qna-write__label">업체명/주소 (선택)</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                  className="qna-write__input" placeholder="프르조" maxLength={100} />
              </div>
            </div>

            <div className="qna-write__row">
              <div className="qna-write__field">
                <label className="qna-write__label">전화번호</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  ref={phoneRef} className={`qna-write__input${fieldErrors.phone ? " qna-write__input--error" : ""}`}
                  placeholder="010-1234-5678" maxLength={13} />
                <p className="qna-write__hint">
                  {isEdit
                    ? `전화번호 뒷자리 4자리가 게시글 비밀번호로 자동 설정됩니다.${formData.phone.replace(/\D/g, "").length >= 4 ? ` (현재: ${formData.phone.replace(/\D/g, "").slice(-4)})` : ""}`
                    : "전화번호 뒷자리 4자리가 게시글 비밀번호로 자동 설정됩니다."}
                </p>
                {fieldErrors.phone && <p className="qna-write__field-error">{fieldErrors.phone}</p>}
              </div>
            </div>

            {!isEdit && (
              <div className="qna-write__privacy-agree">
                <label className="qna-write__privacy-agree__label">
                  <input
                    type="checkbox"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  />
                  <span className="qna-write__privacy-agree__text">
                    <strong>개인정보 수집 및 이용</strong>에 동의합니다. <span className="qna-write__privacy-agree__required">(필수)</span>
                    <button type="button" className="qna-write__privacy-view" onClick={() => setPrivacyModalOpen(true)}>내용 보기</button>
                  </span>
                </label>
              </div>
            )}

            <div className="qna-write__field qna-write__field--full">
              <label className="qna-write__label">제목</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                ref={titleRef} className={`qna-write__input${fieldErrors.title ? " qna-write__input--error" : ""}`}
                placeholder="30평 가정집 견적 문의 드립니다." maxLength={100} />
              <div className="qna-write__field-bottom">
                {fieldErrors.title && <p className="qna-write__field-error">{fieldErrors.title}</p>}
                <span className="qna-write__char-count">{formData.title.length}/100</span>
              </div>
            </div>

            <div className="qna-write__field qna-write__field--full">
              <label className="qna-write__label">문의 내용</label>
              <textarea name="content" value={formData.content} onChange={handleChange}
                ref={contentRef} className={`qna-write__textarea${fieldErrors.content ? " qna-write__textarea--error" : ""}`}
                placeholder="해충방제 정기 관리를 신청하면 매월 얼마의 비용이 드나요?"
                rows={6} maxLength={2000} />
              <div className="qna-write__field-bottom">
                {fieldErrors.content && <p className="qna-write__field-error">{fieldErrors.content}</p>}
                <span className="qna-write__char-count">{formData.content.length}/2000</span>
              </div>
            </div>

            {/* 첨부파일 */}
            <div className="qna-write__field qna-write__field--full">
              <label className="qna-write__label">첨부파일</label>
              <div className="qna-write__file-wrapper">
                <input type="file" id="attachment" multiple onChange={handleFileChange}
                  className="qna-write__file-input" />
                <label htmlFor="attachment" className="qna-write__file-label">
                  <img src={fileIcon} alt="첨부파일" className="qna-write__file-icon" />
                  <span>파일 선택 (최대 5개, 파일당 최대 10MB)</span>
                </label>
              </div>
              {attachments.length > 0 ? (
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
              ) : isEdit && currentAttachments.length > 0 ? (
                <ul className="qna-write__file-list">
                  {currentAttachments.map((url, i) => (
                    <li key={i} className="qna-write__file-item">
                      <img src={fileIcon} alt="" className="qna-write__file-icon" />
                      <span className="qna-write__file-name--selected">{url.split('/').pop()}</span>
                      <button type="button" className="qna-write__file-remove"
                        onClick={() => removeCurrentAttachment(i)}>×</button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {fileError && <p className="qna-write__file-error">{fileError}</p>}
            </div>

            {!isEdit && captchaSiteKey && (
              <div className="qna-write__captcha">
                <Turnstile
                  ref={captchaRef}
                  siteKey={captchaSiteKey}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  options={{ theme: "light" }}
                />
              </div>
            )}

            <div className="qna-write__button-wrapper">
              {isEdit && (
                <button type="button" onClick={() => navigate(`/qna/${id}`)}
                  className="qna-write__submit-btn" style={{ marginRight: "12px" }}>
                  취소
                </button>
              )}
              <button type="submit" className="qna-write__submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (isEdit ? "수정 중..." : "등록 중...") : (isEdit ? "수정하기" : "작성하기")}
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
