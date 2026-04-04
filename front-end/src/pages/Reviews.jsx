import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Reviews.css";
import ConfirmModal from "../components/ConfirmModal";
import { getErrorMessage } from "../utils/errorMessage";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";
import writeIcon from "../assets/other-page-icon-image/review-write-icon.svg";
import deleteIcon from "../assets/other-page-icon-image/review-delete-icon.svg";
import closeIcon from "../assets/other-page-icon-image/close-icon.svg";

const API_BASE_URL = "/api";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(null);
  const dragStartY = useRef(null);
  const carouselRef = useRef(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const pageSize = 6;
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [modal, setModal] = useState(null);
  const [modalContentLoading, setModalContentLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/reviews?page=${currentPage}&size=${pageSize}`
      );
      const data = await response.json();
      setReviews(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("시공 사진을 불러오는데 실패했습니다:", error);
      setModal({ title: "시공 사진 목록을 불러오지 못했습니다.", subtitle: getErrorMessage(error), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    return () => { document.body.style.overflow = ""; };
  }, []);

  // 캐러셀 터치 이동 시 수직 스크롤 방지 (passive: false 필요)
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onTouchMove = (e) => {
      if (!isDragging.current || dragStartX.current === null) return;
      const diffX = Math.abs(e.touches[0].clientX - dragStartX.current);
      const diffY = Math.abs(e.touches[0].clientY - dragStartY.current);
      if (diffX > diffY) {
        e.preventDefault();
        setDragOffset(e.touches[0].clientX - dragStartX.current);
      }
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [selectedReview]);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const getReviewImages = (review) => {
    const images = [];
    if (review.content) {
      const div = document.createElement("div");
      div.innerHTML = review.content;
      div.querySelectorAll("img").forEach((img) => images.push(img.src));
    }
    if (images.length === 0 && review.thumbnail) {
      images.push(review.thumbnail);
    }
    return images;
  };

  const getContentWithoutImages = (html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    div.querySelectorAll("img").forEach((img) => img.remove());
    return div.innerHTML;
  };

  const openModal = async (review) => {
    setSelectedReview(review);
    setCurrentImageIndex(0);
    document.body.style.overflow = "hidden";
    setModalContentLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${review.id}`);
      const full = await response.json();
      setSelectedReview(full);
    } catch {
      // content 없이 모달 표시
    } finally {
      setModalContentLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedReview(null);
    document.body.style.overflow = "";
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setDeleteTargetId(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${deleteTargetId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        fetchReviews();
      } else {
        setModal({ title: data.message || "삭제에 실패했습니다.", buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
      }
    } catch (error) {
      setModal({ title: "삭제에 실패했습니다.", subtitle: getErrorMessage(error), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleEdit = async (e, item) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${item.id}`);
      const full = await response.json();
      navigate("/reviews/write", { state: { review: full } });
    } catch {
      navigate("/reviews/write", { state: { review: item } });
    }
  };

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
    {deleteTargetId && (
      <ConfirmModal
        title="정말 삭제하시겠습니까?"
        subtitle="삭제 후 복구할 수 없습니다."
        onClose={() => setDeleteTargetId(null)}
        buttons={[
          { label: "닫기", variant: "cancel", onClick: () => setDeleteTargetId(null) },
          { label: "확인", variant: "confirm", onClick: handleDeleteConfirm },
        ]}
      />
    )}
    {/* 모달 - .reviews 밖에 렌더링하여 position:fixed containment 문제 방지 */}
    {selectedReview && (() => {
      const images = modalContentLoading ? (selectedReview.thumbnail ? [selectedReview.thumbnail] : []) : getReviewImages(selectedReview);
      const textContent = getContentWithoutImages(selectedReview.content);
      const hasText = textContent.replace(/<[^>]*>/g, "").trim().length > 0;

      return (
        <div className="reviews__modal-overlay" onClick={handleOverlayClick}>
          <div className="reviews__modal">
            <div className="reviews__modal-header">
              <span className="reviews__modal-title">{selectedReview.title}</span>
              <button className="reviews__modal-close" onClick={closeModal}>
                <img src={closeIcon} alt="닫기" width="16" height="16" />
              </button>
            </div>

            {images.length > 0 && (
              <div
                className="reviews__carousel"
                ref={carouselRef}
                onMouseDown={(e) => {
                  e.preventDefault();
                  isDragging.current = true;
                  dragStartX.current = e.clientX;
                  const onMove = (me) => {
                    setDragOffset(me.clientX - dragStartX.current);
                  };
                  const onUp = (me) => {
                    isDragging.current = false;
                    const diff = dragStartX.current - me.clientX;
                    dragStartX.current = null;
                    setDragOffset(0);
                    if (Math.abs(diff) > 50) {
                      if (diff > 0) setCurrentImageIndex((i) => Math.min(i + 1, images.length - 1));
                      else setCurrentImageIndex((i) => Math.max(i - 1, 0));
                    }
                    document.removeEventListener("mousemove", onMove);
                    document.removeEventListener("mouseup", onUp);
                  };
                  document.addEventListener("mousemove", onMove);
                  document.addEventListener("mouseup", onUp);
                }}
                onTouchStart={(e) => {
                  isDragging.current = true;
                  dragStartX.current = e.touches[0].clientX;
                  dragStartY.current = e.touches[0].clientY;
                }}
                onTouchEnd={(e) => {
                  if (!isDragging.current) return;
                  isDragging.current = false;
                  const diff = dragStartX.current - e.changedTouches[0].clientX;
                  dragStartX.current = null;
                  setDragOffset(0);
                  if (Math.abs(diff) > 50) {
                    if (diff > 0) setCurrentImageIndex((i) => Math.min(i + 1, images.length - 1));
                    else setCurrentImageIndex((i) => Math.max(i - 1, 0));
                  }
                }}
              >
                <div
                  className="reviews__carousel-track"
                  style={{
                    transform: `translateX(calc(${-currentImageIndex * 100}% + ${dragOffset}px))`,
                    transition: isDragging.current ? "none" : "transform 0.35s ease",
                  }}
                >
                  {images.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`${selectedReview.title} ${idx + 1}`}
                      className="reviews__carousel-img"
                      draggable={false}
                    />
                  ))}
                </div>
                {images.length > 1 && (
                  <span className="reviews__carousel-counter">
                    {currentImageIndex + 1}/{images.length}
                  </span>
                )}
                {currentImageIndex > 0 && (
                  <button className="reviews__carousel-btn reviews__carousel-btn--prev" onClick={() => setCurrentImageIndex((i) => i - 1)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                )}
                {currentImageIndex < images.length - 1 && (
                  <button className="reviews__carousel-btn reviews__carousel-btn--next" onClick={() => setCurrentImageIndex((i) => i + 1)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                )}
                {images.length > 1 && (
                  <div className="reviews__carousel-dots">
                    {images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`reviews__carousel-dot ${idx === currentImageIndex ? "reviews__carousel-dot--active" : ""}`}
                        onClick={() => setCurrentImageIndex(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {images.length === 0 && (
              <div className="reviews__modal-thumbnail">
                <div className="reviews__modal-placeholder" />
              </div>
            )}

            <div className="reviews__modal-info">
              {/* <span className="reviews__modal-location">{selectedReview.location || ""}</span> */}
              <span className="reviews__modal-date">{selectedReview.createdAt}</span>
            </div>
            {modalContentLoading && (
              <div className="reviews__modal-content" style={{ color: "#aaa", fontSize: "14px", textAlign: "center", padding: "12px 0" }}>
                불러오는 중...
              </div>
            )}
            {!modalContentLoading && hasText && (
              <div
                className="reviews__modal-content"
                dangerouslySetInnerHTML={{ __html: textContent }}
              />
            )}
          </div>
        </div>
      );
    })()}
    <div className="reviews">
      {/* 배너 섹션 */}
      <section className="reviews__banner">
        <div className="reviews__breadcrumb">
          <Link to="/" className="reviews__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="reviews__breadcrumb-icon" />
          </Link>
          <span className="reviews__breadcrumb-separator">&gt;</span>
          <span className="reviews__breadcrumb-current">시공 사진</span>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <section className="reviews__main">
        <div className="reviews__content">
          <h1 className="reviews__title">시공 사진</h1>

          {/* 카드 그리드 */}
          <div className="reviews__grid">
            {loading ? (
              <p className="reviews__loading">로딩 중...</p>
            ) : reviews.length === 0 ? (
              <p className="reviews__empty">등록된 시공 사진이 없습니다.</p>
            ) : (
              reviews.map((item) => (
                <div key={item.id} className="reviews__card">
                  {/* 관리자 수정/삭제 버튼 */}
                  {isAdmin && (
                    <div className="reviews__card-actions">
                      <button
                        className="reviews__card-action-btn"
                        onClick={(e) => handleEdit(e, item)}
                        title="수정"
                      >
                        <img src={writeIcon} alt="수정" />
                      </button>
                      <button
                        className="reviews__card-action-btn"
                        onClick={(e) => handleDelete(e, item.id)}
                        title="삭제"
                      >
                        <img src={deleteIcon} alt="삭제" />
                      </button>
                    </div>
                  )}
                  <div className="reviews__card-body" onClick={() => openModal(item)}>
                    <div className="reviews__card-thumbnail">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} className="reviews__card-img" />
                      ) : (
                        <div className="reviews__card-placeholder" />
                      )}
                    </div>
                    <div className="reviews__card-info">
                      <span className="reviews__card-title">{item.title}</span>
                      <span className="reviews__card-date">{item.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 페이지네이션 + 작성하기 버튼 */}
          <div className="reviews__bottom">
            {totalPages > 0 && (
              <div className="reviews__pagination">
                <button
                  className="reviews__page-btn reviews__page-btn--prev"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  &lt;
                </button>
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`reviews__page-btn ${currentPage === pageNum ? "reviews__page-btn--active" : ""}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                ))}
                <button
                  className="reviews__page-btn reviews__page-btn--next"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  &gt;
                </button>
              </div>
            )}
            {isAdmin && (
              <Link to="/reviews/write" className="reviews__write-btn" onClick={() => window.scrollTo(0, 0)}>
                작성하기
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
    </>
  );
};

export default Reviews;
