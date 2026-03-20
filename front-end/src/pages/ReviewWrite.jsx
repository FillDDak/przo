import { useState, useRef, useMemo, useEffect, useCallback, Fragment } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReactQuill from "react-quill-new";
import Cropper from "react-easy-crop";
import "react-quill-new/dist/quill.snow.css";
import "./ReviewWrite.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";
import getCroppedImg from "../utils/getCroppedImg";

const API_BASE_URL = "/api";

const toRelativeUrl = (url) => {
  try { return new URL(url).pathname; } catch { return url; }
};

const extractImagesFromHtml = (html) => {
  if (!html) return [];
  const div = document.createElement("div");
  div.innerHTML = html;
  return Array.from(div.querySelectorAll("img")).map((img) =>
    toRelativeUrl(img.getAttribute("src") || img.src)
  );
};

const stripImagesFromHtml = (html) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  div.querySelectorAll("img").forEach((img) => img.remove());
  return div.innerHTML;
};

const ReviewWrite = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { token } = useAuth();

  const dateInputRef = useRef(null);
  const quillRef = useRef(null);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const editData = routerLocation.state?.review || null;
  const isEdit = !!editData;

  const today = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();
  const [title, setTitle] = useState(editData?.title || "");
  const [location, setLocation] = useState(editData?.location || "");
  const [createdDate, setCreatedDate] = useState(
    editData?.createdAt ? editData.createdAt.replaceAll(".", "-") : today
  );
  const [content, setContent] = useState(
    isEdit ? stripImagesFromHtml(editData?.content) : ""
  );
  const [modal, setModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [thumbnailIdx, setThumbnailIdx] = useState(0);
  const [dragIdx, setDragIdx] = useState(null);
  const [dropPosition, setDropPosition] = useState(null);

  // Crop modal state
  const [cropQueue, setCropQueue] = useState([]);  // { file, objectUrl }[]
  const [cropQueueIndex, setCropQueueIndex] = useState(0);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropUploading, setIsCropUploading] = useState(false);

  const onCropComplete = useCallback((_croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      cropQueue.forEach((item) => URL.revokeObjectURL(item.objectUrl));
    };
  }, [cropQueue]);

  // 수정 모드일 때 기존 이미지 추출
  useEffect(() => {
    if (editData?.content) {
      const images = extractImagesFromHtml(editData.content);
      setUploadedImages(images);
      if (editData.thumbnail) {
        const idx = images.indexOf(editData.thumbnail);
        if (idx >= 0) setThumbnailIdx(idx);
      }
    }
  }, [editData]);

  // 에디터: 텍스트 전용
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["clean"],
      ],
    },
  }), []);

  // Upload a single blob/file to server, return URL
  const uploadImageBlob = async (blobOrFile, filename) => {
    const formData = new FormData();
    formData.append("image", blobOrFile, filename);
    const res = await fetch(`${API_BASE_URL}/reviews/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenRef.current}` },
      body: formData,
    });
    const data = await res.json();
    if (data.success) return data.url;
    throw new Error("Upload failed");
  };

  // Process next item in crop queue
  const processCropQueue = useCallback((queue, index) => {
    if (index >= queue.length) {
      // Clean up object URLs
      queue.forEach((item) => URL.revokeObjectURL(item.objectUrl));
      setCropQueue([]);
      setCropQueueIndex(0);
      setShowCropModal(false);
      return;
    }
    setCropQueueIndex(index);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setShowCropModal(true);
  }, []);

  // 이미지 업로드 버튼 클릭
  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.setAttribute("multiple", "");
    input.click();

    input.onchange = () => {
      const files = Array.from(input.files);
      if (!files.length) return;
      const oversized = files.find((f) => f.size > 10 * 1024 * 1024);
      if (oversized) {
        setModal({ title: `"${oversized.name}" 파일 용량은 10MB를 초과할 수 없습니다.`, buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
        return;
      }
      const queue = files.map((file) => ({
        file,
        objectUrl: URL.createObjectURL(file),
      }));
      setCropQueue(queue);
      processCropQueue(queue, 0);
    };
  };

  // 적용: crop the current image and upload
  const handleCropApply = async () => {
    if (!croppedAreaPixels) return;
    setIsCropUploading(true);
    try {
      const currentItem = cropQueue[cropQueueIndex];
      const blob = await getCroppedImg(currentItem.objectUrl, croppedAreaPixels);
      const url = await uploadImageBlob(blob, currentItem.file.name);
      setUploadedImages((prev) => [...prev, url]);
      processCropQueue(cropQueue, cropQueueIndex + 1);
    } catch {
      setModal({ title: "이미지 처리에 실패했습니다.", buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    } finally {
      setIsCropUploading(false);
    }
  };

  // 건너뛰기: upload original file
  const handleCropSkip = async () => {
    setIsCropUploading(true);
    try {
      const currentItem = cropQueue[cropQueueIndex];
      const url = await uploadImageBlob(currentItem.file, currentItem.file.name);
      setUploadedImages((prev) => [...prev, url]);
      processCropQueue(cropQueue, cropQueueIndex + 1);
    } catch {
      setModal({ title: "이미지 업로드에 실패했습니다.", buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    } finally {
      setIsCropUploading(false);
    }
  };

  // 크롭 모달 닫기 (나머지 취소)
  const handleCropClose = () => {
    cropQueue.forEach((item) => URL.revokeObjectURL(item.objectUrl));
    setCropQueue([]);
    setCropQueueIndex(0);
    setShowCropModal(false);
  };

  // 이미지 순서 변경 (모바일 버튼용)
  const moveImage = (from, to) => {
    if (to < 0 || to >= uploadedImages.length) return;
    setUploadedImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setThumbnailIdx((prev) => {
      if (prev === from) return to;
      if (from < prev && to >= prev) return prev - 1;
      if (from > prev && to <= prev) return prev + 1;
      return prev;
    });
  };

  // 이미지 삭제
  const handleRemoveImage = (idx) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
    setThumbnailIdx((prev) => {
      if (idx === prev) return 0;
      if (idx < prev) return prev - 1;
      return prev;
    });
  };

  // 드래그 시작
  const handleDragStart = (idx) => {
    setDragIdx(idx);
  };

  // 드래그 오버 — 마우스가 이미지의 왼쪽/오른쪽 절반인지 판단해 삽입 위치 결정
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX < rect.left + rect.width / 2;
    setDropPosition(isLeftHalf ? idx : idx + 1);
  };

  // 드롭 → 순서 변경
  const handleDrop = () => {
    if (dragIdx === null || dropPosition === null) {
      setDragIdx(null);
      setDropPosition(null);
      return;
    }
    const adjustedPos = dropPosition > dragIdx ? dropPosition - 1 : dropPosition;
    if (adjustedPos === dragIdx) {
      setDragIdx(null);
      setDropPosition(null);
      return;
    }

    setUploadedImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(adjustedPos, 0, moved);
      return next;
    });

    setThumbnailIdx((prev) => {
      if (prev === dragIdx) return adjustedPos;
      if (dragIdx < prev && adjustedPos >= prev) return prev - 1;
      if (dragIdx > prev && adjustedPos <= prev) return prev + 1;
      return prev;
    });

    setDragIdx(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setDropPosition(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const alertMsg = (t) => setModal({ title: t, buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    if (!title.trim()) { alertMsg("제목을 입력해주세요."); return; }
    if (title.length > 50) { alertMsg("제목은 50자 이내로 입력해주세요."); return; }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("title", title);
      if (location) formData.append("location", location);

      const textOnly = content.replace(/<[^>]*>/g, "").trim();
      const hasText = textOnly.length > 0;
      const hasImages = uploadedImages.length > 0;

      if (hasText || hasImages) {
        let finalContent = hasText ? content : "";
        if (hasImages) {
          const imagesHtml = uploadedImages
            .map((url) => `<img src="${toRelativeUrl(url)}">`)
            .join("");
          finalContent += imagesHtml;
        }
        formData.append("content", finalContent);
      }

      if (uploadedImages.length > 0) {
        formData.append("thumbnailUrl", toRelativeUrl(uploadedImages[thumbnailIdx] || uploadedImages[0]));
      }

      if (createdDate) {
        formData.append("createdDate", createdDate);
      }

      const url = isEdit
        ? `${API_BASE_URL}/reviews/${editData.id}`
        : `${API_BASE_URL}/reviews`;

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setModal({ title: isEdit ? "수정되었습니다." : "등록되었습니다.", buttons: [{ label: "확인", variant: "confirm", onClick: () => { setModal(null); navigate("/reviews"); } }] });
      } else {
        setModal({ title: data.message || "처리에 실패했습니다.", buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
      }
    } catch {
      setModal({ title: "오류가 발생했습니다.", buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCropItem = cropQueue[cropQueueIndex];

  return (
    <>
      {modal && (
        <ConfirmModal
          title={modal.title}
          subtitle={modal.subtitle}
          onClose={() => setModal(null)}
          buttons={modal.buttons}
        />
      )}
      {/* 크롭 모달 */}
      {showCropModal && currentCropItem && (
        <div className="crop-modal__overlay">
          <div className="crop-modal">
            <div className="crop-modal__header">
              <h2 className="crop-modal__title">사진 자르기</h2>
              <span className="crop-modal__count">
                {cropQueueIndex + 1} / {cropQueue.length}
              </span>
              <button className="crop-modal__close" onClick={handleCropClose}>
                ✕
              </button>
            </div>
            <div className="crop-modal__crop-area">
              <Cropper
                image={currentCropItem.objectUrl}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                zoomSpeed={0.3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="crop-modal__zoom-wrapper">
              <span className="crop-modal__zoom-label">확대</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="crop-modal__zoom-slider"
              />
            </div>
            <div className="crop-modal__buttons">
              <button
                className="crop-modal__btn crop-modal__btn--skip"
                onClick={handleCropSkip}
                disabled={isCropUploading}
              >
                {isCropUploading ? "처리 중..." : "건너뛰기"}
              </button>
              <button
                className="crop-modal__btn crop-modal__btn--apply"
                onClick={handleCropApply}
                disabled={isCropUploading}
              >
                {isCropUploading ? "처리 중..." : "적용"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="review-write">
        {/* 배너 섹션 */}
        <section className="review-write__banner">
          <div className="review-write__breadcrumb">
            <Link to="/" className="review-write__breadcrumb-link">
              <img src={homeIcon} alt="홈" className="review-write__breadcrumb-icon" />
            </Link>
            <span className="review-write__breadcrumb-separator">&gt;</span>
            <span className="review-write__breadcrumb-text">시공 사진</span>
            <span className="review-write__breadcrumb-separator">&gt;</span>
            <span className="review-write__breadcrumb-current">
              {isEdit ? "시공 사진 수정" : "시공 사진 등록"}
            </span>
          </div>
        </section>

        {/* 메인 컨텐츠 */}
        <section className="review-write__main">
          <div className="review-write__content">
            <h1 className="review-write__title">
              {isEdit ? "시공 사진 수정" : "시공 사진 등록"}
            </h1>

            <form className="review-write__form" onSubmit={handleSubmit}>
              {/* 제목 + 날짜 */}
              <div className="review-write__row">
                <div className="review-write__field review-write__field--title">
                  <label className="review-write__label">제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="review-write__input"
                    placeholder="제목을 입력해주세요."
                    maxLength={50}
                  />
                  <span className="review-write__char-count">
                    {title.length}/50
                  </span>
                </div>
                <div className="review-write__field review-write__field--date">
                  <label className="review-write__label">날짜</label>
                  <div className="review-write__date-wrapper">
                    <input
                      type="date"
                      ref={dateInputRef}
                      value={createdDate}
                      max="9999-12-31"
                      onChange={(e) => setCreatedDate(e.target.value)}
                      onClick={() => { try { dateInputRef.current?.showPicker(); } catch { /* ignore */ } }}
                      className="review-write__date-hidden"
                    />
                    <div
                      className="review-write__input review-write__date-display"
                    >
                      <span>
                        {(() => {
                          const d = new Date(createdDate + "T00:00:00");
                          const days = ["일", "월", "화", "수", "목", "금", "토"];
                          const y = d.getFullYear();
                          const m = String(d.getMonth() + 1).padStart(2, "0");
                          const dd = String(d.getDate()).padStart(2, "0");
                          return `${y}.${m}.${dd} (${days[d.getDay()]})`;
                        })()}
                      </span>
                      <svg className="review-write__date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 시공 장소 */}
              <div className="review-write__field">
                <label className="review-write__label">시공 장소</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="review-write__input"
                  placeholder="시공 장소를 입력해주세요. (예: 인천광역시 계양구 효성동)"
                  maxLength={100}
                />
              </div>

              {/* 내용 (텍스트 전용) */}
              <div className="review-write__field">
                <label className="review-write__label">내용</label>
                <div className="review-write__editor-wrapper">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    placeholder="내용을 입력해주세요."
                  />
                </div>
              </div>

              {/* 사진 관리 */}
              <div className="review-write__field">
                <div className="review-write__images-header">
                  <label className="review-write__label">
                    사진 {uploadedImages.length > 0 && `(${uploadedImages.length})`}
                  </label>
                  <button
                    type="button"
                    className="review-write__upload-btn"
                    onClick={handleImageUpload}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    사진 추가
                  </button>
                </div>

                {uploadedImages.length > 0 ? (
                  <div className="review-write__images">
                    {uploadedImages.map((url, idx) => {
                      const showIndicator = dragIdx !== null && dropPosition === idx
                        && dropPosition !== dragIdx && dropPosition !== dragIdx + 1;
                      return (
                      <Fragment key={url + idx}>
                        {showIndicator && <div className="review-write__drop-indicator" />}
                        <div
                        className={`review-write__image-item${idx === thumbnailIdx ? " review-write__image-item--selected" : ""}${idx === dragIdx ? " review-write__image-item--dragging" : ""}`}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={() => handleDrop()}
                        onDragEnd={handleDragEnd}
                        onClick={() => setThumbnailIdx(idx)}
                        title="클릭하여 대표 사진 선택 / 드래그하여 순서 변경"
                      >
                        <img
                          src={url}
                          alt={`사진 ${idx + 1}`}
                          className="review-write__image-thumb"
                        />
                        <button
                          type="button"
                          className="review-write__image-move review-write__image-move--up"
                          onClick={(e) => { e.stopPropagation(); moveImage(idx, idx - 1); }}
                          disabled={idx === 0}
                          title="위로"
                        >▲</button>
                        <button
                          type="button"
                          className="review-write__image-move review-write__image-move--down"
                          onClick={(e) => { e.stopPropagation(); moveImage(idx, idx + 1); }}
                          disabled={idx === uploadedImages.length - 1}
                          title="아래로"
                        >▼</button>
                        <button
                          type="button"
                          className="review-write__image-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          title="삭제"
                        >
                          &times;
                        </button>
                        {idx === thumbnailIdx && (
                          <span className="review-write__image-badge">대표</span>
                        )}
                      </div>
                      </Fragment>
                      );
                    })}
                    {/* 마지막 위치 인디케이터 */}
                    {dragIdx !== null && dropPosition === uploadedImages.length
                      && dropPosition !== dragIdx && dropPosition !== dragIdx + 1 && (
                      <div className="review-write__drop-indicator" />
                    )}
                  </div>
                ) : (
                  <div
                    className="review-write__images-empty"
                    onClick={handleImageUpload}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>사진을 추가해주세요.</span>
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="review-write__button-wrapper">
                <button
                  type="button"
                  className="review-write__cancel-btn"
                  onClick={() => navigate("/reviews")}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="review-write__submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "처리 중..."
                    : isEdit
                      ? "수정 완료"
                      : "작성 완료"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </>
  );
};

export default ReviewWrite;
