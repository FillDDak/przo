import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Reviews.css";
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
  const { isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const pageSize = 6;
  const [deleteTargetId, setDeleteTargetId] = useState(null);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

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

  const openModal = (review) => {
    setSelectedReview(review);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedReview(null);
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        fetchReviews();
      } else {
        alert(data.message);
      }
    } catch {
      alert("삭제에 실패했습니다.");
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleEdit = (e, item) => {
    e.stopPropagation();
    navigate("/reviews/write", { state: { review: item } });
  };

  return (
    <>
    {deleteTargetId && (
      <div className="reviews__delete-overlay" onClick={() => setDeleteTargetId(null)}>
        <div className="reviews__delete-modal" onClick={(e) => e.stopPropagation()}>
          <button className="reviews__delete-modal-close" onClick={() => setDeleteTargetId(null)}>
            <img src={closeIcon} alt="닫기" width="16" height="16" />
          </button>
          <div className="reviews__delete-modal-header">
            <div className="reviews__delete-modal-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#51c488" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="#51c488" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="#51c488"/>
              </svg>
            </div>
            <div className="reviews__delete-modal-text">
              <h2 className="reviews__delete-modal-title">정말 삭제하시겠습니까?</h2>
              <p className="reviews__delete-modal-subtitle">삭제 후 복구할 수 없습니다.</p>
            </div>
          </div>
          <div className="reviews__delete-modal-buttons">
            <button className="reviews__delete-modal-btn reviews__delete-modal-btn--cancel" onClick={() => setDeleteTargetId(null)}>
              닫기
            </button>
            <button className="reviews__delete-modal-btn reviews__delete-modal-btn--confirm" onClick={handleDeleteConfirm}>
              확인
            </button>
          </div>
        </div>
      </div>
    )}
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

      {/* 모달 */}
      {selectedReview && (() => {
        const images = getReviewImages(selectedReview);
        const textContent = getContentWithoutImages(selectedReview.content);
        const hasText = textContent.replace(/<[^>]*>/g, "").trim().length > 0;

        return (
          <div className="reviews__modal-overlay" onClick={handleOverlayClick}>
            <div className="reviews__modal">
              {/* 제목 + 닫기 버튼 */}
              <div className="reviews__modal-header">
                <span className="reviews__modal-title">{selectedReview.title}</span>
                <button className="reviews__modal-close" onClick={closeModal}>
                  <img src={closeIcon} alt="닫기" width="16" height="16" />
                </button>
              </div>

              {/* 이미지 캐러셀 */}
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
                  {/* 슬라이드 트랙 */}
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
                    <button
                      className="reviews__carousel-btn reviews__carousel-btn--prev"
                      onClick={() => setCurrentImageIndex((i) => i - 1)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                  )}
                  {currentImageIndex < images.length - 1 && (
                    <button
                      className="reviews__carousel-btn reviews__carousel-btn--next"
                      onClick={() => setCurrentImageIndex((i) => i + 1)}
                    >
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

              {/* 이미지 없을 때 플레이스홀더 */}
              {images.length === 0 && (
                <div className="reviews__modal-thumbnail">
                  <div className="reviews__modal-placeholder" />
                </div>
              )}

              <div className="reviews__modal-info">
                <span className="reviews__modal-location">{selectedReview.location || ""}</span>
                <span className="reviews__modal-date">{selectedReview.createdAt}</span>
              </div>
              {hasText && (
                <div
                  className="reviews__modal-content"
                  dangerouslySetInnerHTML={{ __html: textContent }}
                />
              )}
            </div>
          </div>
        );
      })()}
    </div>
    </>
  );
};

export default Reviews;
