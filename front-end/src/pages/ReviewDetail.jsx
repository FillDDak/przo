import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";
import PageHero from "../components/PageHero";
import Icon from "../components/Icon";
import { getErrorMessage } from "../utils/errorMessage";
import "./ReviewDetail.css";

const API_BASE_URL = "/api";

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

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
        setModal({
          title: "이미지를 불러오지 못했습니다.",
          subtitle: getErrorMessage(error),
          buttons: [
            { label: "확인", variant: "confirm", onClick: () => setModal(null) },
          ],
        });
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
        {
          label: "삭제",
          variant: "confirm",
          onClick: async () => {
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

  const handleEdit = () => {
    navigate("/reviews/write", { state: { review } });
  };

  if (loading) {
    return (
      <div className="review-detail">
        <PageHero
          eyebrow="Our Work"
          title="시공 이미지"
          breadcrumb={[{ label: "이미지 모음", to: "/reviews" }, { label: "상세" }]}
          size="sm"
        />
        <section className="review-detail__main u-section u-page-tail">
          <div className="u-container u-container--narrow">
            <span className="skeleton review-detail__skeleton" />
          </div>
        </section>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="review-detail">
        <PageHero
          eyebrow="Our Work"
          title="시공 이미지"
          breadcrumb={[{ label: "이미지 모음", to: "/reviews" }, { label: "상세" }]}
          size="sm"
        />
        <section className="review-detail__main u-section u-page-tail">
          <div className="u-container u-container--narrow">
            <div className="empty-state">
              <span className="empty-state__icon">
                <Icon name="image" size={28} />
              </span>
              <p className="empty-state__title">이미지를 찾을 수 없습니다</p>
              <p className="empty-state__desc">
                삭제되었거나 주소가 잘못되었을 수 있습니다.
              </p>
              <Link to="/reviews" className="btn btn--secondary u-mt-4">
                목록으로
              </Link>
            </div>
          </div>
        </section>
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
        <PageHero
          eyebrow="Our Work"
          title={review.title}
          breadcrumb={[
            { label: "이미지 모음", to: "/reviews" },
            { label: review.title },
          ]}
          size="sm"
        />

        <section className="review-detail__main u-section u-page-tail">
          <div className="u-container u-container--narrow">
            <article className="review-detail__article">
              <header className="review-detail__head">
                <p className="review-detail__date">
                  <Icon name="calendar" size={15} />
                  {review.createdAt}
                </p>

                {isAdmin && (
                  <div className="review-detail__admin-actions">
                    <button
                      className="btn btn--secondary btn--sm"
                      onClick={handleEdit}
                    >
                      <span className="btn__icon">
                        <Icon name="pencil" size={15} />
                      </span>
                      수정
                    </button>
                    <button
                      className="btn btn--danger-ghost btn--sm"
                      onClick={handleDelete}
                    >
                      <span className="btn__icon">
                        <Icon name="trash" size={15} />
                      </span>
                      삭제
                    </button>
                  </div>
                )}
              </header>

              {/* 에디터(Quill)에서 저장한 HTML 을 그대로 렌더한다 */}
              <div
                className="review-detail__body"
                dangerouslySetInnerHTML={{ __html: review.content || "" }}
              />
            </article>

            <div className="review-detail__footer">
              <Link to="/reviews" className="btn btn--secondary">
                <span className="btn__icon">
                  <Icon name="arrow-left" size={17} />
                </span>
                목록으로
              </Link>
              <Link to="/qna/write" className="btn btn--primary btn--arrow">
                무료 상담 신청
                <span className="btn__icon">
                  <Icon name="arrow-right" size={17} />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ReviewDetail;
