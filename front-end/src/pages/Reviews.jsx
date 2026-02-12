import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Reviews.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";

const API_BASE_URL = "/api";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const pageSize = 6;

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

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
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
    }
  };

  const handleEdit = (e, item) => {
    e.stopPropagation();
    navigate("/reviews/write", { state: { review: item } });
  };

  return (
    <div className="reviews">
      {/* 배너 섹션 */}
      <section className="reviews__banner">
        <div className="reviews__breadcrumb">
          <Link to="/" className="reviews__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="reviews__breadcrumb-icon" />
          </Link>
          <span className="reviews__breadcrumb-separator">&gt;</span>
          <span className="reviews__breadcrumb-text">서비스 후기</span>
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="reviews__card-action-btn"
                        onClick={(e) => handleDelete(e, item.id)}
                        title="삭제"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
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
              <Link to="/reviews/write" className="reviews__write-btn">
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
              <button className="reviews__modal-close" onClick={closeModal}>
                &times;
              </button>

              {/* 이미지 캐러셀 */}
              {images.length > 0 && (
                <div className="reviews__carousel">
                  {images.length > 1 && (
                    <span className="reviews__carousel-counter">
                      {currentImageIndex + 1}/{images.length}
                    </span>
                  )}
                  <img
                    src={images[currentImageIndex]}
                    alt={`${selectedReview.title} ${currentImageIndex + 1}`}
                    className="reviews__carousel-img"
                  />
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
                  {/* 인디케이터 점 */}
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
                <span className="reviews__modal-title">{selectedReview.title}</span>
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
  );
};

export default Reviews;
