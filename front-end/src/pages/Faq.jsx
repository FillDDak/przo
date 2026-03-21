import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import { getErrorMessage } from "../utils/errorMessage";
import "./Faq.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "/api";
const PAGE_SIZE = 10;

const Faq = () => {
  const { isAdmin, token } = useAuth();
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [modal, setModal] = useState({ open: false, mode: "create", faq: null });
  const [form, setForm] = useState({ question: "", answer: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);

  const [errorModal, setErrorModal] = useState(null);
  const showError = (title, subtitle) => setErrorModal({ title, subtitle, buttons: [{ label: "확인", variant: "confirm", onClick: () => setErrorModal(null) }] });

  const dragGlobalIndex = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const fetchFaqs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/faqs`);
      const data = await res.json();
      setFaqs(data);
    } catch (e) {
      console.error(e);
      showError("FAQ 목록을 불러오지 못했습니다.", getErrorMessage(e));
    }
  };

  useEffect(() => {
    const load = async () => { await fetchFaqs(); };
    load();
  }, []);

  const totalPages = Math.ceil(faqs.length / PAGE_SIZE);
  const pagedFaqs = reorderMode
    ? faqs
    : faqs.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      setOpenIndex(null);
    }
  };

  const getPageNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
    const pages = [];
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  };

  const toggle = (index) => {
    if (reorderMode) return;
    setOpenIndex(openIndex === index ? null : index);
  };

  const enterReorderMode = () => {
    setReorderMode(true);
    setOpenIndex(null);
  };

  const exitReorderMode = () => {
    setReorderMode(false);
    setDragOverIndex(null);
    dragGlobalIndex.current = null;
  };

  const handleDragStart = (index) => {
    dragGlobalIndex.current = index;
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (index) => {
    const from = dragGlobalIndex.current;
    const to = index;
    if (from === null || from === to) {
      setDragOverIndex(null);
      return;
    }
    const newFaqs = [...faqs];
    const [moved] = newFaqs.splice(from, 1);
    newFaqs.splice(to, 0, moved);
    setFaqs(newFaqs);
    setDragOverIndex(null);
    dragGlobalIndex.current = null;

    try {
      await fetch(`${API_BASE_URL}/faqs/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newFaqs.map((f) => f.id)),
      });
    } catch (e) {
      console.error(e);
      showError("순서 변경에 실패했습니다.", getErrorMessage(e));
      fetchFaqs();
    }
  };

  const handleDragEnd = () => {
    dragGlobalIndex.current = null;
    setDragOverIndex(null);
  };

  const moveItem = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= faqs.length) return;
    const newFaqs = [...faqs];
    const [moved] = newFaqs.splice(index, 1);
    newFaqs.splice(newIndex, 0, moved);
    setFaqs(newFaqs);
    try {
      await fetch(`${API_BASE_URL}/faqs/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newFaqs.map((f) => f.id)),
      });
    } catch (e) {
      console.error(e);
      showError("순서 변경에 실패했습니다.", getErrorMessage(e));
      fetchFaqs();
    }
  };

  const openCreateModal = () => {
    setForm({ question: "", answer: "" });
    setModal({ open: true, mode: "create", faq: null });
  };

  const openEditModal = (faq) => {
    setForm({ question: faq.question, answer: faq.answer });
    setModal({ open: true, mode: "edit", faq });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "create", faq: null });
  };

  const handleSubmit = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    const isEdit = modal.mode === "edit";
    const url = isEdit
      ? `${API_BASE_URL}/faqs/${modal.faq.id}`
      : `${API_BASE_URL}/faqs`;
    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        closeModal();
        fetchFaqs();
      } else {
        showError(isEdit ? "FAQ 수정에 실패했습니다." : "FAQ 추가에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      showError(isEdit ? "FAQ 수정 중 오류가 발생했습니다." : "FAQ 추가 중 오류가 발생했습니다.", getErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE_URL}/faqs/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        fetchFaqs();
      } else {
        showError("FAQ 삭제에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      showError("FAQ 삭제 중 오류가 발생했습니다.", getErrorMessage(e));
    }
  };

  return (
    <>
    {errorModal && (
      <ConfirmModal
        title={errorModal.title}
        onClose={() => setErrorModal(null)}
        buttons={errorModal.buttons}
      />
    )}
    <div className="faq">
      {/* 배너 섹션 */}
      <section className="faq__banner">
        <div className="faq__breadcrumb">
          <Link to="/" className="faq__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="faq__breadcrumb-icon" />
          </Link>
          <span className="faq__breadcrumb-separator">&gt;</span>
          <span className="faq__breadcrumb-text">문의</span>
          <span className="faq__breadcrumb-separator">&gt;</span>
          <span className="faq__breadcrumb-current">많이 묻는 질문</span>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <section className="faq__main">
        <div className="faq__content">
          <h1 className="faq__title">많이 묻는 질문</h1>

          {isAdmin && (
            <div className="faq__admin-bar">
              {reorderMode ? (
                <button className="faq__reorder-done-btn" onClick={exitReorderMode}>
                  완료
                </button>
              ) : (
                <>
                  <button className="faq__reorder-btn" onClick={enterReorderMode}>
                    순서 변경
                  </button>
                  <button className="faq__add-btn" onClick={openCreateModal}>
                    질문 추가
                  </button>
                </>
              )}
            </div>
          )}

          {reorderMode && (
            <p className="faq__reorder-hint">항목을 드래그하여 순서를 변경하세요.</p>
          )}

          <ul className="faq__list">
            {pagedFaqs.map((item, index) => (
              <li
                key={item.id}
                className={`faq__item ${!reorderMode && openIndex === index ? "faq__item--open" : ""} ${reorderMode && dragOverIndex === index ? "faq__item--drag-over" : ""} ${reorderMode ? "faq__item--reorder" : ""}`}
                draggable={reorderMode}
                onDragStart={reorderMode ? () => handleDragStart(index) : undefined}
                onDragOver={reorderMode ? (e) => handleDragOver(e, index) : undefined}
                onDrop={reorderMode ? () => handleDrop(index) : undefined}
                onDragEnd={reorderMode ? handleDragEnd : undefined}
              >
                <button
                  className="faq__question"
                  onClick={() => toggle(index)}
                >
                  {reorderMode && (
                    <span className="faq__drag-handle" title="드래그하여 순서 변경">
                      ⠿
                    </span>
                  )}
                  {reorderMode && (
                    <span className="faq__order-btns">
                      <button
                        className="faq__order-btn"
                        onClick={(e) => { e.stopPropagation(); moveItem(index, -1); }}
                        disabled={index === 0}
                      >▲</button>
                      <button
                        className="faq__order-btn"
                        onClick={(e) => { e.stopPropagation(); moveItem(index, 1); }}
                        disabled={index === faqs.length - 1}
                      >▼</button>
                    </span>
                  )}
                  <span className="faq__question-text">
                    <span className="faq__question-prefix">Q.</span>
                    {item.question}
                  </span>
                  <div className="faq__question-right">
                    {isAdmin && !reorderMode && (
                      <span className="faq__admin-actions">
                        <button
                          className="faq__edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(item);
                          }}
                        >
                          수정
                        </button>
                        <button
                          className="faq__delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(item);
                          }}
                        >
                          삭제
                        </button>
                      </span>
                    )}
                    {!reorderMode && (
                      <svg
                        className="faq__icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </button>
                {!reorderMode && (
                  <div className="faq__answer-wrapper">
                    <div className="faq__answer">
                      <p>
                        <span className="faq__answer-prefix">A.</span>
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {!reorderMode && totalPages > 1 && (
            <div className="faq__pagination">
              <button
                className="faq__page-btn faq__page-btn--prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                &lt;
              </button>
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  className={`faq__page-btn ${currentPage === pageNum ? "faq__page-btn--active" : ""}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum + 1}
                </button>
              ))}
              <button
                className="faq__page-btn faq__page-btn--next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 작성/수정 모달 */}
      {modal.open && (
        <div className="faq-modal__overlay" onClick={closeModal}>
          <div className="faq-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="faq-modal__title">
              {modal.mode === "create" ? "질문 추가" : "질문 수정"}
            </h2>
            <div className="faq-modal__field">
              <label className="faq-modal__label">질문</label>
              <input
                className="faq-modal__input"
                type="text"
                placeholder="질문을 입력하세요"
                value={form.question}
                onChange={(e) =>
                  setForm((f) => ({ ...f, question: e.target.value }))
                }
              />
            </div>
            <div className="faq-modal__field">
              <label className="faq-modal__label">답변</label>
              <textarea
                className="faq-modal__textarea"
                placeholder="답변을 입력하세요"
                value={form.answer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, answer: e.target.value }))
                }
              />
            </div>
            <div className="faq-modal__buttons">
              <button className="faq-modal__cancel" onClick={closeModal}>
                취소
              </button>
              <button className="faq-modal__submit" onClick={handleSubmit}>
                {modal.mode === "create" ? "추가" : "수정"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="faq-modal__overlay" onClick={() => setDeleteTarget(null)}>
          <div className="faq-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="faq-modal__title">질문 삭제</h2>
            <p className="faq-modal__confirm-text">
              해당 질문을 삭제하시겠습니까?
            </p>
            <div className="faq-modal__buttons">
              <button
                className="faq-modal__cancel"
                onClick={() => setDeleteTarget(null)}
              >
                취소
              </button>
              <button className="faq-modal__delete" onClick={handleDelete}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Faq;
