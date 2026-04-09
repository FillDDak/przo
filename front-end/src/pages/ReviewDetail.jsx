import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";
import { getErrorMessage } from "../utils/errorMessage";
import "./ReviewDetail.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";

const API_BASE_URL = "/api";

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/reviews/${id}`);
        if (!response.ok) {
          setLoading(false);
          return;
        }
        const data = await response.json();
        setReview(data);
      } catch (error) {
        console.error("이미지 모음을 불러오는데 실패했습니다:", error);
        setModal({ title: "이미지를 불러오지 못했습니다.", subtitle: getErrorMessage(error), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id]);

  const handleDelete = () => {
    setModal({
      title: "정말 삭제하시겠습니까?",
      subtitle: "삭제 후 복구할 수 없습니다.",
      buttons: [
        { label: "취소", variant: "cancel", onClick: () => setModal(null) },
        { label: "삭제", variant: "confirm", onClick: async () => {
          setModal(null);
          try {
            const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
              method: "DELETE",
              credentials: "include",
            });
            const data = await response.json();
            if (data.success) {
              navigate("/reviews");
            } else {
              setModal({ title: data.message || "삭제에 실패했습니다.", buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
            }
          } catch (error) {
            setModal({ title: "삭제 중 오류가 발생했습니다.", subtitle: getErrorMessage(error), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
          }
        }},
      ],
    });
  };

  const handleEdit = () => {
    navigate("/reviews/write", { state: { review } });
  };

  if (loading) {
    return (
      <div className="review-detail">
        <div className="review-detail__loading">로딩 중...</div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="review-detail">
        <div className="review-detail__not-found">이미지를 찾을 수 없습니다.</div>
      </div>
    );
  }

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
      <div className="review-detail">
        <section className="review-detail__banner">
          <div className="review-detail__breadcrumb">
            <Link to="/" className="review-detail__breadcrumb-link">
              <img src={homeIcon} alt="홈" className="review-detail__breadcrumb-icon" />
            </Link>
            <span className="review-detail__breadcrumb-separator">&gt;</span>
            <span className="review-detail__breadcrumb-text">이미지 모음</span>
            <span className="review-detail__breadcrumb-separator">&gt;</span>
            <span className="review-detail__breadcrumb-current">{review.title}</span>
          </div>
        </section>

        <section className="review-detail__main">
          <div className="review-detail__content">
            <div className="review-detail__meta">
              <span className="review-detail__date">{review.createdAt}</span>
              <div className="review-detail__title-row">
                <h1 className="review-detail__title">{review.title}</h1>
                {isAdmin && (
                  <div className="review-detail__admin-actions">
                    <button className="review-detail__admin-btn review-detail__admin-btn--edit" onClick={handleEdit}>
                      수정
                    </button>
                    <button className="review-detail__admin-btn review-detail__admin-btn--delete" onClick={handleDelete}>
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div
              className="review-detail__body"
              dangerouslySetInnerHTML={{ __html: review.content || "" }}
            />

            <div className="review-detail__footer">
              <Link to="/reviews" className="review-detail__list-btn">
                목록으로
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ReviewDetail;
