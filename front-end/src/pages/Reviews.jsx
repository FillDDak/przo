import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Reviews.css";
import ConfirmModal from "../components/ConfirmModal";
import PageHero from "../components/PageHero";
import Icon from "../components/Icon";
import { getErrorMessage } from "../utils/errorMessage";

const API_BASE_URL = "/api";
const PAGE_SIZE = 6;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [modal, setModal] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/reviews?page=${currentPage}&size=${PAGE_SIZE}`
      );
      const data = await response.json();
      setReviews(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("이미지 모음을 불러오는데 실패했습니다:", error);
      setModal({
        title: "이미지 모음 목록을 불러오지 못했습니다.",
        subtitle: getErrorMessage(error),
        buttons: [
          { label: "확인", variant: "confirm", onClick: () => setModal(null) },
        ],
      });
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
      document
        .querySelector(".reviews__grid")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    e.preventDefault();
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
        setModal({
          title: data.message || "삭제에 실패했습니다.",
          buttons: [
            { label: "확인", variant: "confirm", onClick: () => setModal(null) },
          ],
        });
      }
    } catch (error) {
      setModal({
        title: "삭제에 실패했습니다.",
        subtitle: getErrorMessage(error),
        buttons: [
          { label: "확인", variant: "confirm", onClick: () => setModal(null) },
        ],
      });
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleEdit = async (e, item) => {
    e.stopPropagation();
    e.preventDefault();
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
            { label: "확인", variant: "confirm", onClick: handleDeleteConfirm },
            {
              label: "닫기",
              variant: "cancel",
              onClick: () => setDeleteTargetId(null),
            },
          ]}
        />
      )}

      <div className="reviews">
        <PageHero
          eyebrow="Our Work"
          title="시공 이미지 모음"
          description="실제 현장에서 진행한 방역·방제 작업 기록입니다. 공간 유형별로 어떤 방식으로 작업하는지 확인해 보세요."
          breadcrumb={[{ label: "이미지 모음" }]}
        />

        <section className="reviews__main u-section u-page-tail">
          <div className="u-container">
            {isAdmin && (
              <div className="reviews__admin-bar">
                <span className="badge badge--brand">
                  <span className="badge__dot" />
                  관리자 모드
                </span>
                <Link
                  to="/reviews/write"
                  className="btn btn--primary btn--sm"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <span className="btn__icon">
                    <Icon name="pencil" size={16} />
                  </span>
                  새 글 작성
                </Link>
              </div>
            )}

            {/* -- 카드 그리드 -- */}
            {loading ? (
              <ul className="reviews__grid">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <li key={i} className="reviews__card reviews__card--skeleton">
                    <span className="skeleton reviews__skeleton-thumb" />
                    <span className="skeleton reviews__skeleton-title" />
                    <span className="skeleton reviews__skeleton-date" />
                  </li>
                ))}
              </ul>
            ) : reviews.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state__icon">
                  <Icon name="image" size={28} />
                </span>
                <p className="empty-state__title">등록된 이미지가 없습니다</p>
                <p className="empty-state__desc">
                  시공 기록이 등록되면 이곳에서 확인하실 수 있습니다.
                </p>
              </div>
            ) : (
              <ul className="reviews__grid">
                {reviews.map((item) => (
                  <li key={item.id} className="reviews__card">
                    <Link
                      to={`/reviews/${item.id}`}
                      className="reviews__card-link"
                    >
                      <div className="reviews__card-thumbnail">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="reviews__card-img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="reviews__card-placeholder">
                            <Icon name="image" size={32} />
                          </div>
                        )}
                        <span className="reviews__card-overlay">
                          <span className="reviews__card-view">
                            자세히 보기
                            <Icon name="arrow-right" size={16} />
                          </span>
                        </span>
                      </div>

                      <div className="reviews__card-info">
                        <h2 className="reviews__card-title">{item.title}</h2>
                        <p className="reviews__card-date">
                          <Icon name="calendar" size={14} />
                          {item.createdAt}
                        </p>
                      </div>
                    </Link>

                    {isAdmin && (
                      <div className="reviews__card-actions">
                        <button
                          type="button"
                          className="reviews__card-action-btn"
                          onClick={(e) => handleEdit(e, item)}
                          title="수정"
                          aria-label="수정"
                        >
                          <Icon name="pencil" size={16} />
                        </button>
                        <button
                          type="button"
                          className="reviews__card-action-btn reviews__card-action-btn--danger"
                          onClick={(e) => handleDelete(e, item.id)}
                          title="삭제"
                          aria-label="삭제"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* -- 페이지네이션 -- */}
            {totalPages > 1 && (
              <nav className="pagination" aria-label="페이지 이동">
                <button
                  className="pagination__btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  aria-label="이전 페이지"
                >
                  <Icon name="chevron-left" size={16} />
                </button>
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`pagination__btn ${
                      currentPage === pageNum ? "pagination__btn--active" : ""
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                  >
                    {pageNum + 1}
                  </button>
                ))}
                <button
                  className="pagination__btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  aria-label="다음 페이지"
                >
                  <Icon name="chevron-right" size={16} />
                </button>
              </nav>
            )}

            {/* -- 하단 CTA -- */}
            <div className="reviews__cta">
              <div>
                <h2 className="reviews__cta-title">
                  우리 공간은 어떻게 관리해야 할까요?
                </h2>
                <p className="reviews__cta-desc">
                  공간 유형과 현재 상황을 알려주시면 맞춤 진단과 시공 방안을
                  안내해 드립니다.
                </p>
              </div>
              <Link to="/qna/write" className="btn btn--primary btn--lg btn--arrow">
                무료 상담 신청
                <span className="btn__icon">
                  <Icon name="arrow-right" size={18} />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Reviews;
