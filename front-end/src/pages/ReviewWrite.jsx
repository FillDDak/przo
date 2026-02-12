import { useState, useRef, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./ReviewWrite.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";

const API_BASE_URL = "/api";

const extractImagesFromHtml = (html) => {
  if (!html) return [];
  const div = document.createElement("div");
  div.innerHTML = html;
  return Array.from(div.querySelectorAll("img")).map((img) => img.src);
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
  const location = useLocation();
  const { token } = useAuth();

  const dateInputRef = useRef(null);
  const quillRef = useRef(null);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const editData = location.state?.review || null;
  const isEdit = !!editData;

  const today = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState(editData?.title || "");
  const [createdDate, setCreatedDate] = useState(
    editData?.createdAt ? editData.createdAt.replaceAll(".", "-") : today
  );
  // 수정 모드: 기존 content에서 이미지 제거한 텍스트만 에디터에 표시
  const [content, setContent] = useState(
    isEdit ? stripImagesFromHtml(editData?.content) : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [thumbnailIdx, setThumbnailIdx] = useState(0);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  // 수정 모드일 때 기존 이미지 추출
  useEffect(() => {
    if (editData?.content) {
      const images = extractImagesFromHtml(editData.content);
      setUploadedImages(images);
      // 기존 대표 이미지 찾기
      if (editData.thumbnail) {
        const idx = images.indexOf(editData.thumbnail);
        if (idx >= 0) setThumbnailIdx(idx);
      }
    }
  }, [editData]);

  // 에디터: 텍스트 전용 (이미지 버튼 제거)
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

  // 이미지 업로드 (별도 버튼)
  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.setAttribute("multiple", "");
    input.click();

    input.onchange = async () => {
      for (const file of input.files) {
        const formData = new FormData();
        formData.append("image", file);

        try {
          const res = await fetch(`${API_BASE_URL}/reviews/upload-image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${tokenRef.current}` },
            body: formData,
          });
          const data = await res.json();

          if (data.success) {
            setUploadedImages((prev) => [...prev, data.url]);
          }
        } catch {
          alert("이미지 업로드에 실패했습니다.");
        }
      }
    };
  };

  // 이미지 삭제
  const handleRemoveImage = (idx) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
    // 대표 이미지 인덱스 보정
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

  // 드래그 오버
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  // 드롭 → 순서 변경
  const handleDrop = (idx) => {
    if (dragIdx === null || dragIdx === idx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }

    setUploadedImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });

    // 대표 이미지 인덱스도 함께 이동
    setThumbnailIdx((prev) => {
      if (prev === dragIdx) return idx;
      if (dragIdx < prev && idx >= prev) return prev - 1;
      if (dragIdx > prev && idx <= prev) return prev + 1;
      return prev;
    });

    setDragIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("title", title);

      // 텍스트 내용 + 이미지를 합쳐서 content 구성
      const textOnly = content.replace(/<[^>]*>/g, "").trim();
      const hasText = textOnly.length > 0;
      const hasImages = uploadedImages.length > 0;

      if (hasText || hasImages) {
        let finalContent = hasText ? content : "";
        if (hasImages) {
          const imagesHtml = uploadedImages
            .map((url) => `<img src="${url}">`)
            .join("");
          finalContent += imagesHtml;
        }
        formData.append("content", finalContent);
      }

      // 대표 이미지를 썸네일로 설정
      if (uploadedImages.length > 0) {
        formData.append("thumbnailUrl", uploadedImages[thumbnailIdx] || uploadedImages[0]);
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
        alert(isEdit ? "수정되었습니다." : "등록되었습니다.");
        navigate("/reviews");
      } else {
        alert(data.message || "처리에 실패했습니다.");
      }
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-write">
      {/* 배너 섹션 */}
      <section className="review-write__banner">
        <div className="review-write__breadcrumb">
          <Link to="/" className="review-write__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="review-write__breadcrumb-icon" />
          </Link>
          <span className="review-write__breadcrumb-separator">&gt;</span>
          <span className="review-write__breadcrumb-text">서비스 후기</span>
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
                  placeholder="시공 사진 제목을 입력해주세요"
                />
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
                    className="review-write__date-hidden"
                  />
                  <div
                    className="review-write__input review-write__date-display"
                    onClick={() => dateInputRef.current?.showPicker()}
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
                  placeholder="내용을 입력해주세요"
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
                  {uploadedImages.map((url, idx) => (
                    <div
                      key={url + idx}
                      className={`review-write__image-item${idx === thumbnailIdx ? " review-write__image-item--selected" : ""}${idx === dragOverIdx && dragIdx !== idx ? " review-write__image-item--drag-over" : ""}${idx === dragIdx ? " review-write__image-item--dragging" : ""}`}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={() => handleDrop(idx)}
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
                  ))}
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
                  <span>사진을 추가해주세요</span>
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
  );
};

export default ReviewWrite;
