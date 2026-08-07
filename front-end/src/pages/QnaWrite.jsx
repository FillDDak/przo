import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation, useBlocker } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import "./QnaWrite.css";
import ConfirmModal from "../components/ConfirmModal";
import PrivacyModal from "../components/PrivacyModal";
import PageHero from "../components/PageHero";
import Icon from "../components/Icon";
import { getErrorMessage } from "../utils/errorMessage";

const API_BASE_URL = "/api";

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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
          } catch {
            // 응답 본문이 JSON 이 아니면 위에서 정한 기본 문구를 그대로 쓴다
          }
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

  const hero = (
    <PageHero
      eyebrow={isEdit ? "Edit" : "Free Consultation"}
      title={isEdit ? "문의 수정" : "무료 상담 문의"}
      description={
        isEdit
          ? "수정한 내용은 즉시 반영됩니다. 전화번호를 바꾸면 게시글 비밀번호도 함께 변경됩니다."
          : "공간 유형과 현재 상황을 알려주시면, 전문 상담원이 맞춤 진단과 시공 방안을 안내해 드립니다."
      }
      breadcrumb={[
        { label: "상담 서비스", to: "/qna" },
        { label: "상담 문의", to: "/qna" },
        { label: isEdit ? "문의 수정" : "문의 작성" },
      ]}
      size="sm"
    />
  );

  if (loading) {
    return (
      <div className="qna-write">
        {hero}
        <section className="qna-write__main u-section u-page-tail">
          <div className="u-container">
            <div className="qna-write__form-card">
              <span className="skeleton qna-write__skeleton" />
              <span className="skeleton qna-write__skeleton" />
              <span className="skeleton qna-write__skeleton qna-write__skeleton--tall" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  const phoneDigits = formData.phone.replace(/\D/g, "");

  return (
    <>
      {privacyModalOpen && (
        <PrivacyModal onClose={() => setPrivacyModalOpen(false)} />
      )}
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
          title="작성 중인 내용이 있습니다."
          subtitle="페이지를 벗어나면 입력한 내용이 사라집니다."
          onClose={() => blocker.reset()}
          buttons={[
            {
              label: "계속 작성하기",
              variant: "confirm",
              onClick: () => blocker.reset(),
            },
            { label: "나가기", variant: "cancel", onClick: () => blocker.proceed() },
          ]}
        />
      )}

      <div className="qna-write">
        {hero}

        <section className="qna-write__main u-section u-page-tail">
          <div className="u-container">
            <div className="qna-write__layout">
              {/* ---------------------------------------------------- 폼 */}
              <form className="qna-write__form-card" onSubmit={handleSubmit} noValidate>
                <fieldset className="qna-write__group">
                  <legend className="qna-write__group-title">
                    <span className="qna-write__group-no">01</span>
                    연락처 정보
                  </legend>

                  <div className="qna-write__row">
                    <div className="field">
                      <label className="field__label" htmlFor="qw-name">
                        이름 <span className="field__required">*</span>
                      </label>
                      <input
                        id="qw-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        ref={nameRef}
                        className={`input${fieldErrors.name ? " input--error" : ""}`}
                        placeholder="홍길동"
                        maxLength={20}
                        autoComplete="name"
                      />
                      <div className="field__foot">
                        {fieldErrors.name && (
                          <p className="field__error">
                            <Icon name="alert" size={14} />
                            {fieldErrors.name}
                          </p>
                        )}
                        <span className="field__count">
                          {formData.name.length}/20
                        </span>
                      </div>
                    </div>

                    {/* 필수 입력인 전화번호를 윗줄에 두고, 선택 항목인
                        업체명 / 주소를 아래로 내렸다 */}
                    <div className="field">
                      <label className="field__label" htmlFor="qw-phone">
                        전화번호 <span className="field__required">*</span>
                      </label>
                      <input
                        id="qw-phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        ref={phoneRef}
                        className={`input${fieldErrors.phone ? " input--error" : ""}`}
                        placeholder="010-1234-5678"
                        maxLength={13}
                        autoComplete="tel"
                      />
                      <div className="field__foot">
                        {fieldErrors.phone ? (
                          <p className="field__error">
                            <Icon name="alert" size={14} />
                            {fieldErrors.phone}
                          </p>
                        ) : (
                          <p className="field__hint">
                            <Icon name="lock" size={13} className="qna-write__hint-icon" />
                            전화번호 뒤 4자리가 게시글 비밀번호로 자동 설정됩니다.
                            {phoneDigits.length >= 4 && (
                              <strong className="qna-write__hint-pw">
                                {" "}
                                현재: {phoneDigits.slice(-4)}
                              </strong>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="field qna-write__field--half">
                    <label className="field__label" htmlFor="qw-company">
                      업체명 / 주소{" "}
                      <span className="field__optional">(선택)</span>
                    </label>
                    <input
                      id="qw-company"
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="input"
                      placeholder="프르조"
                      maxLength={100}
                    />
                    <div className="field__foot">
                      <p className="field__hint">
                        방문이 필요한 경우 대략적인 위치를 알려주세요.
                      </p>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="qna-write__group">
                  <legend className="qna-write__group-title">
                    <span className="qna-write__group-no">02</span>
                    문의 내용
                  </legend>

                  <div className="field">
                    <label className="field__label" htmlFor="qw-title">
                      제목 <span className="field__required">*</span>
                    </label>
                    <input
                      id="qw-title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      ref={titleRef}
                      className={`input${fieldErrors.title ? " input--error" : ""}`}
                      placeholder="30평 가정집 견적 문의 드립니다."
                      maxLength={100}
                    />
                    <div className="field__foot">
                      {fieldErrors.title && (
                        <p className="field__error">
                          <Icon name="alert" size={14} />
                          {fieldErrors.title}
                        </p>
                      )}
                      <span className="field__count">
                        {formData.title.length}/100
                      </span>
                    </div>
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="qw-content">
                      문의 내용 <span className="field__required">*</span>
                    </label>
                    <textarea
                      id="qw-content"
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      ref={contentRef}
                      className={`textarea${
                        fieldErrors.content ? " textarea--error" : ""
                      }`}
                      placeholder="예) 30평 아파트인데 주방에서 바퀴벌레가 자주 보입니다. 반려동물이 있어 안전한 약품을 사용했으면 합니다."
                      rows={7}
                      maxLength={2000}
                    />
                    <div className="field__foot">
                      {fieldErrors.content && (
                        <p className="field__error">
                          <Icon name="alert" size={14} />
                          {fieldErrors.content}
                        </p>
                      )}
                      <span className="field__count">
                        {formData.content.length}/2000
                      </span>
                    </div>
                  </div>

                  {/* -- 첨부파일 -- */}
                  <div className="field">
                    <label className="field__label">
                      첨부파일 <span className="field__optional">(선택)</span>
                    </label>

                    <input
                      type="file"
                      id="attachment"
                      multiple
                      onChange={handleFileChange}
                      className="qna-write__file-input"
                      accept=".jpg,.jpeg,.png,.gif,.pdf"
                    />
                    <label htmlFor="attachment" className="qna-write__dropzone">
                      <span className="qna-write__dropzone-icon">
                        <Icon name="paperclip" size={20} />
                      </span>
                      <span className="qna-write__dropzone-text">
                        <strong>파일 선택</strong>
                        <span>
                          jpg, png, gif, pdf · 최대 5개 · 파일당 10MB 이하
                        </span>
                      </span>
                    </label>

                    {attachments.length > 0 ? (
                      <ul className="qna-write__file-list">
                        {attachments.map((file, i) => (
                          <li key={i} className="qna-write__file-item">
                            <Icon name="paperclip" size={15} />
                            <span className="qna-write__file-name">
                              {file.name}
                            </span>
                            <span className="qna-write__file-size">
                              {formatBytes(file.size)}
                            </span>
                            <button
                              type="button"
                              className="qna-write__file-remove"
                              onClick={() => removeAttachment(i)}
                              aria-label={`${file.name} 삭제`}
                            >
                              <Icon name="close" size={15} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : isEdit && currentAttachments.length > 0 ? (
                      <ul className="qna-write__file-list">
                        {currentAttachments.map((url, i) => (
                          <li key={i} className="qna-write__file-item">
                            <Icon name="paperclip" size={15} />
                            <span className="qna-write__file-name">
                              {url.split("/").pop()}
                            </span>
                            <button
                              type="button"
                              className="qna-write__file-remove"
                              onClick={() => removeCurrentAttachment(i)}
                              aria-label="첨부파일 삭제"
                            >
                              <Icon name="close" size={15} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {fileError && (
                      <p className="field__error qna-write__file-error">
                        <Icon name="alert" size={14} />
                        {fileError}
                      </p>
                    )}
                  </div>
                </fieldset>

                {/* -- 동의 / 보안 확인 / 제출 -- */}
                <div className="qna-write__submit-area">
                  {!isEdit && (
                    <label className="qna-write__consent">
                      <input
                        type="checkbox"
                        checked={privacyAgreed}
                        onChange={(e) => setPrivacyAgreed(e.target.checked)}
                      />
                      <span className="qna-write__consent-text">
                        <strong>개인정보 수집 및 이용</strong>에 동의합니다.
                        <span className="qna-write__consent-required">
                          (필수)
                        </span>
                        <button
                          type="button"
                          className="qna-write__consent-view"
                          onClick={() => setPrivacyModalOpen(true)}
                        >
                          내용 보기
                        </button>
                      </span>
                    </label>
                  )}

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

                  <div className="qna-write__buttons">
                    <button
                      type="button"
                      onClick={() => navigate(isEdit ? `/qna/${id}` : "/qna")}
                      className="btn btn--secondary btn--lg"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="btn btn--primary btn--lg"
                      disabled={isSubmitting}
                    >
                      <span className="btn__icon">
                        <Icon name="send" size={18} />
                      </span>
                      {isSubmitting
                        ? isEdit
                          ? "수정 중..."
                          : "등록 중..."
                        : isEdit
                          ? "수정하기"
                          : "문의 등록하기"}
                    </button>
                  </div>
                </div>
              </form>

              {/* ------------------------------------------------ 사이드 */}
              <aside className="qna-write__aside">
                <div className="qna-write__aside-card">
                  <h2 className="qna-write__aside-title">바로 상담이 필요하신가요?</h2>
                  <a href="tel:16702335" className="qna-write__aside-tel">
                    <Icon name="phone" size={20} />
                    1670-2335
                  </a>
                  <p className="qna-write__aside-hours">평일 09:00 – 18:00</p>
                  <a
                    href="https://open.kakao.com/o/sYCdK5og"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--secondary btn--block"
                  >
                    <span className="btn__icon">
                      <Icon name="chat" size={17} />
                    </span>
                    카카오톡 오픈채팅
                  </a>
                </div>

                <div className="qna-write__aside-note">
                  <h3 className="qna-write__aside-note-title">
                    <Icon name="info" size={16} />
                    이렇게 적어주시면 빠릅니다
                  </h3>
                  <ul className="qna-write__aside-list">
                    <li>공간 유형과 면적 (예: 30평 아파트, 20평 음식점)</li>
                    <li>발견한 해충의 종류와 위치</li>
                    <li>언제부터 어느 정도 빈도로 보이는지</li>
                    <li>반려동물·영유아 등 고려할 사항</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default QnaWrite;
