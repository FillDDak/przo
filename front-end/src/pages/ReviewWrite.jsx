import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import imageCompression from "browser-image-compression";
import ConfirmModal from "../components/ConfirmModal";
import { getErrorMessage } from "../utils/errorMessage";
import { Link, useNavigate, useLocation, useBlocker } from "react-router-dom";
import ReactQuill from "react-quill-new";
import Cropper from "react-easy-crop";
import "react-quill-new/dist/quill.snow.css";
import "./ReviewWrite.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";
import getCroppedImg from "../utils/getCroppedImg";

const API_BASE_URL = "/api";

let _uidCounter = 0;
const uid = () => `block-${Date.now()}-${++_uidCounter}`;

const toRelativeUrl = (url) => {
  try { return new URL(url).pathname; } catch { return url; }
};

const parseHtmlToBlocks = (html) => {
  if (!html) return [{ id: uid(), type: "text", html: "" }];
  const parts = html.split(/(<img\s[^>]*\/?>)/i);
  const blocks = parts.reduce((acc, part) => {
    if (/^<img\s/i.test(part)) {
      const src = part.match(/src="([^"]+)"/i)?.[1];
      if (src) acc.push({ id: uid(), type: "image", url: toRelativeUrl(src) });
    } else {
      const hasContent = part.replace(/<p>(\s|<br\s*\/?>)*<\/p>/gi, "").trim() !== "";
      if (hasContent) acc.push({ id: uid(), type: "text", html: part });
    }
    return acc;
  }, []);
  return blocks.length > 0 ? blocks : [{ id: uid(), type: "text", html: "" }];
};

const blocksToHtml = (blocks) =>
  blocks.map((b) => (b.type === "text" ? b.html : `<img src="${toRelativeUrl(b.url)}">`)).join("");

const ReviewWrite = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const dateInputRef = useRef(null);
  const titleRef = useRef(null);
  const blockErrorRef = useRef(null);

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
  const [createdDate, setCreatedDate] = useState(
    editData?.createdAt ? editData.createdAt.replaceAll(".", "-") : today
  );
  const [blocks, setBlocks] = useState(() => {
    if (isEdit && editData?.content) return parseHtmlToBlocks(editData.content);
    return [{ id: uid(), type: "text", html: "" }];
  });
  const [thumbnailId, setThumbnailId] = useState(() => {
    if (isEdit && editData?.content && editData?.thumbnail) {
      const parsed = parseHtmlToBlocks(editData.content);
      const match = parsed.find(
        (b) => b.type === "image" && toRelativeUrl(b.url) === toRelativeUrl(editData.thumbnail)
      );
      return match?.id || parsed.find((b) => b.type === "image")?.id || null;
    }
    return null;
  });

  const [modal, setModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [blockError, setBlockError] = useState("");

  // Crop modal state
  const [cropQueue, setCropQueue] = useState([]);
  const [cropQueueIndex, setCropQueueIndex] = useState(0);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropUploading, setIsCropUploading] = useState(false);
  const insertAfterRef = useRef(null);
  const successCountRef = useRef(0);

  const submittedRef = useRef(false);

  const isDirty =
    title.trim() !== "" ||
    blocks.some((b) => b.type === "image") ||
    blocks.some((b) => b.type === "text" && b.html.replace(/<[^>]*>/g, "").trim() !== "");

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

  const onCropComplete = useCallback((_croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    return () => {
      cropQueue.forEach((item) => URL.revokeObjectURL(item.objectUrl));
    };
  }, [cropQueue]);

  // thumbnailId 유지: image 블록이 없어지면 초기화 또는 첫 이미지로
  useEffect(() => {
    const imageBlocks = blocks.filter((b) => b.type === "image");
    if (imageBlocks.length === 0) {
      setThumbnailId(null);
    } else if (!imageBlocks.find((b) => b.id === thumbnailId)) {
      setThumbnailId(imageBlocks[0].id);
    }
  }, [blocks, thumbnailId]);

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

  const compressImage = async (blobOrFile, filename) => {
    const isGif = filename.toLowerCase().endsWith(".gif");
    if (isGif) return blobOrFile;
    try {
      return await imageCompression(blobOrFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
      });
    } catch {
      return blobOrFile;
    }
  };

  const uploadImageBlob = async (blobOrFile, filename) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    const formData = new FormData();
    formData.append("image", blobOrFile, filename);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/upload-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
        signal: controller.signal,
      });
      const data = await res.json();
      if (data.success) return data.url;
      throw new Error("Upload failed");
    } catch (e) {
      if (e.name === "AbortError") throw new Error("이미지 업로드 시간이 초과되었습니다.");
      throw e;
    } finally {
      clearTimeout(timer);
    }
  };

  const insertImageBlock = useCallback((afterIndex, url) => {
    setBlocks((prev) => {
      const next = [...prev];
      const newBlock = { id: uid(), type: "image", url };
      next.splice(afterIndex + 1, 0, newBlock);
      return next;
    });
    setBlockError("");
  }, []);

  const processCropQueue = useCallback((queue, index) => {
    if (index >= queue.length) {
      queue.forEach((item) => URL.revokeObjectURL(item.objectUrl));
      setCropQueue([]);
      setCropQueueIndex(0);
      setShowCropModal(false);
      successCountRef.current = 0;
      return;
    }
    setCropQueueIndex(index);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setShowCropModal(true);
  }, []);

  const triggerImageUpload = (afterIndex) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.setAttribute("multiple", "");
    input.click();

    const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    input.onchange = () => {
      const files = Array.from(input.files);
      if (!files.length) return;
      const invalid = files.find((f) => {
        const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
        return !ALLOWED_EXTENSIONS.includes(ext);
      });
      if (invalid) {
        setModal({ title: `"${invalid.name}" 파일은 업로드할 수 없습니다. (jpg, jpeg, png, gif, webp만 가능)`, buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
        return;
      }
      const oversized = files.find((f) => f.size > 10 * 1024 * 1024);
      if (oversized) {
        setModal({ title: `"${oversized.name}" 파일 용량은 10MB를 초과할 수 없습니다.`, buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
        return;
      }
      insertAfterRef.current = afterIndex;
      successCountRef.current = 0;
      const queue = files.map((file) => ({
        file,
        objectUrl: URL.createObjectURL(file),
      }));
      setCropQueue(queue);
      processCropQueue(queue, 0);
    };
  };

  const handleCropApply = async () => {
    if (!croppedAreaPixels) return;
    setIsCropUploading(true);
    try {
      const currentItem = cropQueue[cropQueueIndex];
      const blob = await getCroppedImg(currentItem.objectUrl, croppedAreaPixels);
      const compressed = await compressImage(blob, currentItem.file.name);
      const url = await uploadImageBlob(compressed, currentItem.file.name);
      insertImageBlock(insertAfterRef.current + successCountRef.current, url);
      successCountRef.current++;
      processCropQueue(cropQueue, cropQueueIndex + 1);
    } catch (e) {
      setModal({ title: "이미지 처리에 실패했습니다.", subtitle: getErrorMessage(e), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    } finally {
      setIsCropUploading(false);
    }
  };

  const handleCropSkip = async () => {
    setIsCropUploading(true);
    try {
      const currentItem = cropQueue[cropQueueIndex];
      const compressed = await compressImage(currentItem.file, currentItem.file.name);
      const url = await uploadImageBlob(compressed, currentItem.file.name);
      insertImageBlock(insertAfterRef.current + successCountRef.current, url);
      successCountRef.current++;
      processCropQueue(cropQueue, cropQueueIndex + 1);
    } catch (e) {
      setModal({ title: "이미지 업로드에 실패했습니다.", subtitle: getErrorMessage(e), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    } finally {
      setIsCropUploading(false);
    }
  };

  const handleCropClose = () => {
    cropQueue.forEach((item) => URL.revokeObjectURL(item.objectUrl));
    setCropQueue([]);
    setCropQueueIndex(0);
    setShowCropModal(false);
    successCountRef.current = 0;
  };

  const addTextBlock = (afterIndex) => {
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, { id: uid(), type: "text", html: "" });
      return next;
    });
  };

  const deleteBlock = (id) => {
    setBlocks((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((b) => b.id !== id);
    });
  };

  const moveBlock = (id, direction) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  const updateTextBlock = (id, html) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, html } : b)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errMsg = !title.trim() ? "제목을 입력해주세요." : title.length > 50 ? "제목은 50자 이내로 입력해주세요." : "";
    if (errMsg) {
      setTitleError(errMsg);
      if (titleRef.current) {
        titleRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        titleRef.current.focus({ preventScroll: true });
      }
      return;
    }

    const imageBlocks = blocks.filter((b) => b.type === "image");
    if (imageBlocks.length === 0) {
      setBlockError("사진을 최소 1장 이상 추가해주세요.");
      if (blockErrorRef.current) {
        blockErrorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setBlockError("");

    try {
      setIsSubmitting(true);

      const finalContent = blocksToHtml(blocks);
      const thumbnailBlock = imageBlocks.find((b) => b.id === thumbnailId) || imageBlocks[0];
      const thumbnailUrl = toRelativeUrl(thumbnailBlock.url);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", finalContent);
      formData.append("thumbnailUrl", thumbnailUrl);
      if (createdDate) formData.append("createdDate", createdDate);

      const url = isEdit
        ? `${API_BASE_URL}/reviews/${editData.id}`
        : `${API_BASE_URL}/reviews`;

      const submitController = new AbortController();
      const submitTimer = setTimeout(() => submitController.abort(), 30000);
      let response;
      try {
        response = await fetch(url, {
          method: isEdit ? "PUT" : "POST",
          credentials: "include",
          body: formData,
          signal: submitController.signal,
        });
      } catch (e) {
        if (e.name === "AbortError") throw new Error("요청 시간이 초과되었습니다. 다시 시도해주세요.");
        throw e;
      } finally {
        clearTimeout(submitTimer);
      }

      const data = await response.json();

      if (data.success) {
        submittedRef.current = true;
        setModal({ title: isEdit ? "수정되었습니다." : "등록되었습니다.", buttons: [{ label: "확인", variant: "confirm", onClick: () => { setModal(null); navigate("/reviews"); } }] });
      } else {
        setModal({ title: data.message || (isEdit ? "이미지 모음 수정에 실패했습니다." : "이미지 모음 등록에 실패했습니다."), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
      }
    } catch (e) {
      setModal({ title: isEdit ? "수정 중 오류가 발생했습니다." : "등록 중 오류가 발생했습니다.", subtitle: getErrorMessage(e), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCropItem = cropQueue[cropQueueIndex];

  const BlockInsertBar = ({ afterIndex, alwaysVisible = false }) => (
    <div className={`review-write__insert-bar${alwaysVisible ? " review-write__insert-bar--visible" : ""}`}>
      <button type="button" className="review-write__insert-btn" onClick={() => addTextBlock(afterIndex)}>
        + 텍스트
      </button>
      <button type="button" className="review-write__insert-btn" onClick={() => triggerImageUpload(afterIndex)}>
        + 이미지
      </button>
    </div>
  );

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
            <span className="review-write__breadcrumb-text">이미지 모음</span>
            <span className="review-write__breadcrumb-separator">&gt;</span>
            <span className="review-write__breadcrumb-current">
              {isEdit ? "이미지 모음 수정" : "이미지 모음 등록"}
            </span>
          </div>
        </section>

        {/* 메인 컨텐츠 */}
        <section className="review-write__main">
          <div className="review-write__content">
            <h1 className="review-write__title">
              {isEdit ? "이미지 모음 수정" : "이미지 모음 등록"}
            </h1>

            <form className="review-write__form" onSubmit={handleSubmit}>
              {/* 제목 + 날짜 */}
              <div className="review-write__row">
                <div className="review-write__field review-write__field--title">
                  <label className="review-write__label">제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                    ref={titleRef}
                    className={`review-write__input${titleError ? " review-write__input--error" : ""}`}
                    placeholder="제목을 입력해주세요."
                    maxLength={50}
                  />
                  <div className="review-write__field-bottom">
                    {titleError && <p className="review-write__field-error">{titleError}</p>}
                    <span className="review-write__char-count">{title.length}/50</span>
                  </div>
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
                    <div className="review-write__input review-write__date-display">
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

              {/* 블록 에디터 */}
              <div className="review-write__blocks" ref={blockErrorRef}>
                <BlockInsertBar afterIndex={-1} alwaysVisible />

                {blocks.map((block, idx) => (
                  <div key={block.id} className="review-write__block-wrapper">
                    <div className="review-write__block-controls">
                      <button
                        type="button"
                        className="review-write__block-ctrl-btn"
                        onClick={() => moveBlock(block.id, "up")}
                        disabled={idx === 0}
                        title="위로"
                      >▲</button>
                      <button
                        type="button"
                        className="review-write__block-ctrl-btn"
                        onClick={() => moveBlock(block.id, "down")}
                        disabled={idx === blocks.length - 1}
                        title="아래로"
                      >▼</button>
                      <button
                        type="button"
                        className="review-write__block-ctrl-btn review-write__block-ctrl-btn--delete"
                        onClick={() => deleteBlock(block.id)}
                        disabled={blocks.length <= 1}
                        title="삭제"
                      >✕</button>
                    </div>

                    {block.type === "text" ? (
                      <div className="review-write__block--text">
                        <div className="review-write__editor-wrapper">
                          <ReactQuill
                            theme="snow"
                            value={block.html}
                            onChange={(html) => updateTextBlock(block.id, html)}
                            modules={quillModules}
                            placeholder="내용을 입력해주세요."
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`review-write__block--image${thumbnailId === block.id ? " review-write__block--image-selected" : ""}`}
                        onClick={() => setThumbnailId(block.id)}
                        title="클릭하여 대표 이미지 설정"
                      >
                        <img src={block.url} alt="" className="review-write__block-img" />
                        {thumbnailId === block.id && (
                          <span className="review-write__block-badge">대표 이미지</span>
                        )}
                      </div>
                    )}

                    <BlockInsertBar afterIndex={idx} />
                  </div>
                ))}
              </div>
              {blockError && <p className="review-write__field-error review-write__field-error--block">{blockError}</p>}

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
