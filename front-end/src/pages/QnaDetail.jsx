import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";
import PageHero from "../components/PageHero";
import Icon from "../components/Icon";
import { getErrorMessage } from "../utils/errorMessage";
import { Turnstile } from "@marsidev/react-turnstile";
import "./QnaDetail.css";

const API_BASE_URL = "/api";
const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];

const BREADCRUMB = [
  { label: "상담 서비스", to: "/qna" },
  { label: "상담 문의", to: "/qna" },
  { label: "문의 상세" },
];

const fileNameOf = (path) => path.split("/").pop();
const isImage = (path) =>
  IMAGE_EXTS.includes(path.split(".").pop().toLowerCase());

const QnaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [verifiedPassword, setVerifiedPassword] = useState("");
  const [error, setError] = useState("");
  const [replyMode, setReplyMode] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [modal, setModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaSiteKey, setCaptchaSiteKey] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!password.trim()) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/inquiries/${id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, captchaToken }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        setVerifiedPassword(password);
        setInquiry(data.inquiry);
        setAdminNote(data.inquiry?.adminNote || "");
        setLoading(false);
      } else if (data.blocked) {
        setCaptchaRequired(false);
        setError(
          `비밀번호 입력 횟수를 초과했습니다. 약 ${data.remainingMinutes}분 후에 다시 시도해주세요.`
        );
      } else if (data.captchaRequired) {
        setCaptchaRequired(true);
        setCaptchaSiteKey(data.captchaSiteKey || "");
        setCaptchaToken(null);
        captchaRef.current?.reset();
        if (data.attemptCount && data.maxAttempts) {
          setError(
            `비밀번호가 일치하지 않습니다. (${data.attemptCount}/${data.maxAttempts}회)`
          );
        } else {
          setError(data.message || "보안 확인을 완료해주세요.");
        }
      } else {
        setCaptchaToken(null);
        captchaRef.current?.reset();
        setError(
          `비밀번호가 일치하지 않습니다. (${data.attemptCount}/${data.maxAttempts}회)`
        );
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
      setModal({
        title: "문의 내용을 불러오지 못했습니다.",
        subtitle: getErrorMessage(error),
        buttons: [
          { label: "확인", variant: "confirm", onClick: () => setModal(null) },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 관리자이거나 작성 직후 이동한 경우 비밀번호 없이 바로 조회
  useEffect(() => {
    if (isAdmin) {
      setIsVerified(true);
      fetchInquiry();
    } else if (location.state?.autoVerified && location.state?.autoPassword) {
      fetch(`${API_BASE_URL}/inquiries/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: location.state.autoPassword }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsVerified(true);
            setVerifiedPassword(location.state.autoPassword);
            setInquiry(data.inquiry);
            setAdminNote(data.inquiry?.adminNote || "");
            setLoading(false);
          } else {
            setLoading(false);
          }
        })
        .catch((error) => {
          setLoading(false);
          setModal({
            title: "비밀번호 자동 확인에 실패했습니다.",
            subtitle: getErrorMessage(error),
            buttons: [
              { label: "확인", variant: "confirm", onClick: () => setModal(null) },
            ],
          });
        });
    } else {
      setLoading(false);
    }
  }, [
    id,
    isAdmin,
    fetchInquiry,
    location.state?.autoVerified,
    location.state?.autoPassword,
  ]);

  // 답변 등록
  const handleReplySubmit = async () => {
    if (!adminNote.trim()) {
      setModal({
        title: "답변 내용을 입력해주세요.",
        buttons: [
          { label: "확인", variant: "confirm", onClick: () => setModal(null) },
        ],
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/inquiries/${id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ adminNote }),
      });

      const data = await response.json();

      if (data.success) {
        setModal({
          title: "답변이 등록되었습니다.",
          buttons: [
            {
              label: "확인",
              variant: "confirm",
              onClick: () => {
                setModal(null);
                setReplyMode(false);
                fetchInquiry();
              },
            },
          ],
        });
      } else {
        setModal({
          title: data.message || "답변 등록에 실패했습니다.",
          buttons: [
            { label: "확인", variant: "confirm", onClick: () => setModal(null) },
          ],
        });
      }
    } catch (error) {
      console.error("답변 등록 오류:", error);
      setModal({
        title: "답변 등록 중 오류가 발생했습니다.",
        subtitle: getErrorMessage(error),
        buttons: [
          { label: "확인", variant: "confirm", onClick: () => setModal(null) },
        ],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 답변 초기화
  const handleReplyReset = () => {
    setModal({
      title: "답변을 초기화하시겠습니까?",
      subtitle: "답변 내용이 삭제되고 미답변 상태로 변경됩니다.",
      buttons: [
        {
          label: "초기화",
          variant: "confirm",
          onClick: async () => {
            setModal(null);
            try {
              setIsSubmitting(true);
              const response = await fetch(
                `${API_BASE_URL}/inquiries/${id}/reply`,
                {
                  method: "DELETE",
                  credentials: "include",
                }
              );
              const data = await response.json();
              if (data.success) {
                setReplyMode(false);
                setAdminNote("");
                fetchInquiry();
              } else {
                setModal({
                  title: data.message || "초기화에 실패했습니다.",
                  buttons: [
                    {
                      label: "확인",
                      variant: "confirm",
                      onClick: () => setModal(null),
                    },
                  ],
                });
              }
            } catch (error) {
              setModal({
                title: "초기화 중 오류가 발생했습니다.",
                subtitle: getErrorMessage(error),
                buttons: [
                  {
                    label: "확인",
                    variant: "confirm",
                    onClick: () => setModal(null),
                  },
                ],
              });
            } finally {
              setIsSubmitting(false);
            }
          },
        },
        { label: "취소", variant: "cancel", onClick: () => setModal(null) },
      ],
    });
  };

  // 문의 삭제
  const handleDelete = () => {
    setModal({
      title: "정말로 이 문의를 삭제하시겠습니까?",
      subtitle: "삭제 후 복구할 수 없습니다.",
      buttons: [
        {
          label: "삭제",
          variant: "confirm",
          onClick: async () => {
            setModal(null);
            try {
              const response = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
                method: "DELETE",
                credentials: "include",
              });
              const data = await response.json();
              if (data.success) {
                navigate("/qna");
              } else {
                setModal({
                  title: data.message || "삭제에 실패했습니다.",
                  buttons: [
                    {
                      label: "확인",
                      variant: "confirm",
                      onClick: () => setModal(null),
                    },
                  ],
                });
              }
            } catch (error) {
              console.error("삭제 오류:", error);
              setModal({
                title: "삭제 중 오류가 발생했습니다.",
                subtitle: getErrorMessage(error),
                buttons: [
                  {
                    label: "확인",
                    variant: "confirm",
                    onClick: () => setModal(null),
                  },
                ],
              });
            }
          },
        },
        { label: "취소", variant: "cancel", onClick: () => setModal(null) },
      ],
    });
  };

  const modalNode = modal && (
    <ConfirmModal
      title={modal.title}
      subtitle={modal.subtitle}
      onClose={() => setModal(null)}
      buttons={modal.buttons}
    />
  );

  /* ---------------------------------------------------------------- 로딩 */
  if (loading) {
    return (
      <div className="qna-detail">
        <PageHero eyebrow="Support" title="상담 문의" breadcrumb={BREADCRUMB} size="sm" />
        <section className="qna-detail__main u-section u-page-tail">
          <div className="u-container u-container--narrow">
            <div className="qna-detail__card">
              <span className="skeleton qna-detail__skeleton-title" />
              <span className="skeleton qna-detail__skeleton-meta" />
              <span className="skeleton qna-detail__skeleton-body" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ------------------------------------------------ 비밀번호 확인 게이트 */
  if (!isVerified) {
    return (
      <>
        {modalNode}
        <div className="qna-detail">
          <PageHero
            eyebrow="Support"
            title="상담 문의"
            breadcrumb={BREADCRUMB}
            size="sm"
          />

          <section className="qna-detail__main u-section u-page-tail">
            <div className="u-container u-container--narrow">
              <div className="qna-gate">
                <span className="qna-gate__icon">
                  <Icon name="lock" size={26} />
                </span>
                <h2 className="qna-gate__title">비밀글입니다</h2>
                <p className="qna-gate__desc">
                  작성자 본인만 확인할 수 있습니다.
                  <br />
                  문의 작성 시 입력한 전화번호 뒤 4자리를 입력해 주세요.
                </p>

                <form onSubmit={handlePasswordSubmit} className="qna-gate__form">
                  <div className="field">
                    <label className="sr-only" htmlFor="qna-password">
                      비밀번호
                    </label>
                    <input
                      id="qna-password"
                      type="password"
                      inputMode="numeric"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호 (전화번호 뒤 4자리)"
                      className={`input qna-gate__input ${
                        error ? "input--error" : ""
                      }`}
                    />
                    {error && (
                      <p className="field__error qna-gate__error">
                        <Icon name="alert" size={15} />
                        {error}
                      </p>
                    )}
                  </div>

                  {captchaRequired && (
                    <p className="qna-gate__captcha-notice">
                      <Icon name="shield" size={16} />
                      보안을 위해 아래 확인 절차를 완료해 주세요.
                    </p>
                  )}
                  {captchaRequired && captchaSiteKey && (
                    <div className="qna-gate__captcha">
                      <Turnstile
                        ref={captchaRef}
                        siteKey={captchaSiteKey}
                        onSuccess={(token) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken(null)}
                        options={{ theme: "light" }}
                      />
                    </div>
                  )}

                  <div className="qna-gate__buttons">
                    <button
                      type="button"
                      onClick={() => navigate("/qna")}
                      className="btn btn--secondary"
                    >
                      목록으로
                    </button>
                    <button type="submit" className="btn btn--primary">
                      확인
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  /* ------------------------------------------------------------ 조회 실패 */
  if (!inquiry) {
    return (
      <div className="qna-detail">
        <PageHero eyebrow="Support" title="상담 문의" breadcrumb={BREADCRUMB} size="sm" />
        <section className="qna-detail__main u-section u-page-tail">
          <div className="u-container u-container--narrow">
            <div className="empty-state">
              <span className="empty-state__icon">
                <Icon name="alert" size={28} />
              </span>
              <p className="empty-state__title">문의를 찾을 수 없습니다</p>
              <p className="empty-state__desc">
                삭제되었거나 주소가 잘못되었을 수 있습니다.
              </p>
              <Link to="/qna" className="btn btn--secondary u-mt-4">
                목록으로
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const attachments = inquiry.attachmentList || [];
  const images = attachments.filter(isImage);
  const files = attachments.filter((p) => !isImage(p));
  const hasReply = Boolean(inquiry.adminNote);

  /* ---------------------------------------------------------------- 본문 */
  return (
    <>
      {modalNode}
      <div className="qna-detail">
        <PageHero
          eyebrow="Support"
          title="상담 문의"
          breadcrumb={BREADCRUMB}
          size="sm"
        />

        <section className="qna-detail__main u-section u-page-tail">
          <div className="u-container u-container--narrow">
            <article className="qna-detail__card">
              {/* -- 글 머리 -- */}
              <header className="qna-detail__head">
                <div className="qna-detail__status">
                  {hasReply ? (
                    <span className="badge badge--success">
                      <Icon name="check" size={13} />
                      답변완료
                    </span>
                  ) : (
                    <span className="badge badge--neutral">
                      <span className="badge__dot" />
                      답변 대기중
                    </span>
                  )}
                  <span className="badge badge--neutral">
                    <Icon name="lock" size={12} />
                    비밀글
                  </span>
                </div>

                <h2 className="qna-detail__subject">{inquiry.title}</h2>

                <div className="qna-detail__meta">
                  <span className="qna-detail__meta-item">
                    <Icon name="user" size={15} />
                    {inquiry.name}
                  </span>
                  <span className="qna-detail__meta-item">
                    <Icon name="calendar" size={15} />
                    {inquiry.createdAt || "-"}
                  </span>
                  <span className="qna-detail__meta-item">
                    <Icon name="phone" size={15} />
                    {inquiry.phone}
                  </span>
                  {inquiry.companyName && (
                    <span className="qna-detail__meta-item">
                      <Icon name="map-pin" size={15} />
                      {inquiry.companyName}
                    </span>
                  )}
                </div>
              </header>

              {/* -- 문의 내용 -- */}
              <div className="qna-detail__body">{inquiry.content}</div>

              {/* -- 첨부파일 -- */}
              {attachments.length > 0 && (
                <section className="qna-detail__attachments">
                  <h3 className="qna-detail__section-label">
                    <Icon name="paperclip" size={16} />
                    첨부파일 <span>{attachments.length}</span>
                  </h3>

                  {images.length > 0 && (
                    <div className="qna-detail__gallery">
                      {images.map((path, i) => (
                        <a
                          key={`img-${i}`}
                          href={path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="qna-detail__thumb"
                        >
                          <img
                            src={path}
                            alt={fileNameOf(path)}
                            loading="lazy"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  <ul className="qna-detail__file-list">
                    {[...images, ...files].map((path, i) => (
                      <li key={`file-${i}`}>
                        <a href={path} className="qna-detail__file" download>
                          <Icon name="paperclip" size={15} />
                          <span className="qna-detail__file-name">
                            {fileNameOf(path)}
                          </span>
                          <Icon
                            name="arrow-down"
                            size={15}
                            className="qna-detail__file-dl"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* -- 답변 -- */}
              <section
                className={`qna-detail__answer ${
                  hasReply ? "qna-detail__answer--filled" : ""
                }`}
              >
                <h3 className="qna-detail__answer-label">
                  <span className="qna-detail__answer-marker">A</span>
                  프르조 답변
                </h3>
                {hasReply ? (
                  <div className="qna-detail__answer-body">
                    {inquiry.adminNote}
                  </div>
                ) : (
                  <p className="qna-detail__answer-empty">
                    아직 답변이 등록되지 않았습니다. 확인 후 순차적으로
                    답변드리겠습니다.
                  </p>
                )}
              </section>

              {/* -- 관리자 답변 작성 -- */}
              {isAdmin && replyMode && (
                <section className="qna-detail__reply-form">
                  <label className="field__label" htmlFor="qna-reply">
                    {hasReply ? "답변 재작성" : "답변 작성"}
                  </label>
                  <textarea
                    id="qna-reply"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="textarea"
                    placeholder="답변 내용을 입력해주세요."
                  />
                  <button
                    onClick={handleReplySubmit}
                    className="btn btn--primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "등록 중..." : "답변 등록"}
                  </button>
                </section>
              )}
            </article>

            {/* -- 하단 조작 -- */}
            <div className="qna-detail__actions">
              <Link to="/qna" className="btn btn--secondary">
                <span className="btn__icon">
                  <Icon name="arrow-left" size={17} />
                </span>
                목록으로
              </Link>

              <div className="qna-detail__actions-right">
                {!isAdmin ? (
                  <button
                    onClick={() =>
                      navigate(`/qna/${id}/edit`, {
                        state: { password: verifiedPassword, inquiry },
                      })
                    }
                    className="btn btn--primary"
                  >
                    <span className="btn__icon">
                      <Icon name="pencil" size={17} />
                    </span>
                    수정하기
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setReplyMode(!replyMode)}
                      className="btn btn--primary"
                    >
                      {replyMode ? "작성 취소" : hasReply ? "답변 수정" : "답변하기"}
                    </button>
                    {hasReply && (
                      <button
                        onClick={handleReplyReset}
                        className="btn btn--secondary"
                        disabled={isSubmitting}
                      >
                        답변 초기화
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      className="btn btn--danger-ghost"
                    >
                      <span className="btn__icon">
                        <Icon name="trash" size={17} />
                      </span>
                      삭제
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default QnaDetail;
