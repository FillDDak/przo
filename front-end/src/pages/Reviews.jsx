import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Reviews.css";
import ConfirmModal from "../components/ConfirmModal";
import { getErrorMessage } from "../utils/errorMessage";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";
import writeIcon from "../assets/other-page-icon-image/review-write-icon.svg";
import deleteIcon from "../assets/other-page-icon-image/review-delete-icon.svg";

const API_BASE_URL = "/api";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const pageSize = 6;
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [modal, setModal] = useState(null);

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
      console.error("이미지 모음을 불러오는데 실패했습니다:", error);
      setModal({ title: "이미지 모음 목록을 불러오지 못했습니다.", subtitle: getErrorMessage(error), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
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
    <div className="reviews">
      {/* 배너 섹션 */}
      <section className="reviews__banner">
        <div className="reviews__breadcrumb">
          <Link to="/" className="reviews__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="reviews__breadcrumb-icon" />
          </Link>
          <span className="reviews__breadcrumb-separator">&gt;</span>
          <span className="reviews__breadcrumb-current">이미지 모음</span>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <section className="reviews__main">
        <div className="reviews__content">
          <h1 className="reviews__title">이미지 모음</h1>

          {/* 카드 그리드 */}
          <div className="reviews__grid">
            {loading ? (
              <p className="reviews__loading">로딩 중...</p>
            ) : reviews.length === 0 ? (
              <p className="reviews__empty">등록된 이미지가 없습니다.</p>
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
                  <div className="reviews__card-body" onClick={() => navigate(`/reviews/${item.id}`)}>
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
