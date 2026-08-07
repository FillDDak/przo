import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import PageHero from "../components/PageHero";
import Icon from "../components/Icon";
import { getErrorMessage } from "../utils/errorMessage";
import "./Faq.css";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "/api";
const PAGE_SIZE = 10;

const Faq = () => {
  const { isAdmin } = useAuth();
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, mode: "create", faq: null });
  const [form, setForm] = useState({ question: "", answer: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);

  const [errorModal, setErrorModal] = useState(null);
  const showError = (title, subtitle) =>
    setErrorModal({
      title,
      subtitle,
      buttons: [
        { label: "확인", variant: "confirm", onClick: () => setErrorModal(null) },
      ],
    });

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
    fetchFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 검색은 클라이언트에서 처리한다 — FAQ 는 건수가 적어 서버 왕복이 불필요하다.
     순서 변경 모드에서는 원본 순서를 그대로 봐야 하므로 필터를 적용하지 않는다. */
  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || reorderMode) return faqs;
    return faqs.filter(
      (f) =>
        f.question?.toLowerCase().includes(q) ||
        f.answer?.toLowerCase().includes(q)
    );
  }, [faqs, query, reorderMode]);

  const totalPages = Math.ceil(filteredFaqs.length / PAGE_SIZE);
  const pagedFaqs = reorderMode
    ? filteredFaqs
    : filteredFaqs.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      setOpenIndex(null);
      document
        .querySelector(".faq__list")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSearchChange = (value) => {
    setQuery(value);
    setCurrentPage(0);
    setOpenIndex(null);
  };

  const getPageNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible);
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
    setQuery("");
    setCurrentPage(0);
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

  const persistOrder = async (ordered) => {
    try {
      await fetch(`${API_BASE_URL}/faqs/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(ordered.map((f) => f.id)),
      });
    } catch (e) {
      console.error(e);
      showError("순서 변경에 실패했습니다.", getErrorMessage(e));
      fetchFaqs();
    }
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
    await persistOrder(newFaqs);
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
    await persistOrder(newFaqs);
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        closeModal();
        fetchFaqs();
      } else {
        showError(
          isEdit ? "FAQ 수정에 실패했습니다." : "FAQ 추가에 실패했습니다."
        );
      }
    } catch (e) {
      console.error(e);
      showError(
        isEdit
          ? "FAQ 수정 중 오류가 발생했습니다."
          : "FAQ 추가 중 오류가 발생했습니다.",
        getErrorMessage(e)
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE_URL}/faqs/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
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
          subtitle={errorModal.subtitle}
          onClose={() => setErrorModal(null)}
          buttons={errorModal.buttons}
        />
      )}

      {/* 삭제 확인 — 프로젝트 규칙에 따라 ConfirmModal 사용 */}
      {deleteTarget && (
        <ConfirmModal
          title="해당 질문을 삭제하시겠습니까?"
          subtitle={deleteTarget.question}
          onClose={() => setDeleteTarget(null)}
          buttons={[
            { label: "삭제", variant: "confirm", onClick: handleDelete },
            {
              label: "취소",
              variant: "cancel",
              onClick: () => setDeleteTarget(null),
            },
          ]}
        />
      )}

      <div className="faq">
        <PageHero
          eyebrow="FAQ"
          title="많이 묻는 질문"
          description="상담 전에 자주 확인하시는 내용을 모았습니다. 원하는 답변이 없다면 언제든 문의해 주세요."
          breadcrumb={[
            { label: "상담 서비스", to: "/qna" },
            { label: "많이 묻는 질문" },
          ]}
        />

        <section className="faq__main u-section u-page-tail">
          <div className="u-container u-container--narrow">
            {/* -- 검색 + 관리자 도구 -- */}
            <div className="faq__toolbar">
              <div className="faq__search">
                <Icon name="search" size={18} className="faq__search-icon" />
                <input
                  type="search"
                  className="faq__search-input"
                  placeholder="궁금한 내용을 검색해 보세요"
                  value={query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  disabled={reorderMode}
                  aria-label="질문 검색"
                />
                {query && (
                  <button
                    type="button"
                    className="faq__search-clear"
                    onClick={() => handleSearchChange("")}
                    aria-label="검색어 지우기"
                  >
                    <Icon name="close" size={16} />
                  </button>
                )}
              </div>

              {isAdmin && (
                <div className="faq__admin-bar">
                  {reorderMode ? (
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={exitReorderMode}
                    >
                      순서 변경 완료
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn--secondary btn--sm"
                        onClick={enterReorderMode}
                      >
                        <span className="btn__icon">
                          <Icon name="grip-vertical" size={16} />
                        </span>
                        순서 변경
                      </button>
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={openCreateModal}
                      >
                        질문 추가
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {reorderMode && (
              <p className="faq__reorder-hint">
                <Icon name="info" size={16} />
                항목을 드래그하거나 화살표 버튼으로 순서를 변경하세요.
              </p>
            )}

            {!reorderMode && query && (
              <p className="faq__result-count">
                <strong>{filteredFaqs.length}</strong>건의 질문을 찾았습니다.
              </p>
            )}

            {/* -- 아코디언 -- */}
            {pagedFaqs.length > 0 ? (
              <ul className="faq__list">
                {pagedFaqs.map((item, index) => {
                  const isOpen = !reorderMode && openIndex === index;
                  return (
                    <li
                      key={item.id}
                      className={[
                        "faq__item",
                        isOpen ? "faq__item--open" : "",
                        reorderMode ? "faq__item--reorder" : "",
                        reorderMode && dragOverIndex === index
                          ? "faq__item--drag-over"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      draggable={reorderMode}
                      onDragStart={
                        reorderMode ? () => handleDragStart(index) : undefined
                      }
                      onDragOver={
                        reorderMode ? (e) => handleDragOver(e, index) : undefined
                      }
                      onDrop={reorderMode ? () => handleDrop(index) : undefined}
                      onDragEnd={reorderMode ? handleDragEnd : undefined}
                    >
                      <div className="faq__row">
                        {reorderMode && (
                          <span
                            className="faq__drag-handle"
                            title="드래그하여 순서 변경"
                          >
                            <Icon name="grip-vertical" size={18} />
                          </span>
                        )}

                        <button
                          type="button"
                          className="faq__question"
                          onClick={() => toggle(index)}
                          aria-expanded={isOpen}
                          disabled={reorderMode}
                        >
                          <span className="faq__marker" aria-hidden="true">
                            Q
                          </span>
                          <span className="faq__question-text">
                            {item.question}
                          </span>
                          {!reorderMode && (
                            <span className="faq__chevron" aria-hidden="true">
                              <Icon name="chevron-down" size={20} />
                            </span>
                          )}
                        </button>

                        {reorderMode && (
                          <span className="faq__order-btns">
                            <button
                              type="button"
                              className="faq__order-btn"
                              onClick={() => moveItem(index, -1)}
                              disabled={index === 0}
                              aria-label="위로 이동"
                            >
                              <Icon name="chevron-up" size={15} />
                            </button>
                            <button
                              type="button"
                              className="faq__order-btn"
                              onClick={() => moveItem(index, 1)}
                              disabled={index === faqs.length - 1}
                              aria-label="아래로 이동"
                            >
                              <Icon name="chevron-down" size={15} />
                            </button>
                          </span>
                        )}

                        {isAdmin && !reorderMode && (
                          <span className="faq__admin-actions">
                            <button
                              type="button"
                              className="faq__icon-btn"
                              onClick={() => openEditModal(item)}
                              aria-label="질문 수정"
                              title="수정"
                            >
                              <Icon name="pencil" size={16} />
                            </button>
                            <button
                              type="button"
                              className="faq__icon-btn faq__icon-btn--danger"
                              onClick={() => setDeleteTarget(item)}
                              aria-label="질문 삭제"
                              title="삭제"
                            >
                              <Icon name="trash" size={16} />
                            </button>
                          </span>
                        )}
                      </div>

                      {!reorderMode && (
                        <div className="faq__answer-wrapper">
                          <div className="faq__answer-inner">
                            <div className="faq__answer">
                              <span className="faq__marker faq__marker--answer" aria-hidden="true">
                                A
                              </span>
                              <p className="faq__answer-text">{item.answer}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty-state">
                <span className="empty-state__icon">
                  <Icon name="search" size={28} />
                </span>
                <p className="empty-state__title">
                  {query ? "검색 결과가 없습니다" : "등록된 질문이 없습니다"}
                </p>
                <p className="empty-state__desc">
                  {query
                    ? "다른 검색어로 찾아보시거나, 아래에서 직접 문의해 주세요."
                    : "궁금한 점이 있으시면 상담 문의를 남겨주세요."}
                </p>
              </div>
            )}

            {/* -- 페이지네이션 -- */}
            {!reorderMode && totalPages > 1 && (
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
            <div className="faq__cta">
              <div className="faq__cta-text">
                <h2 className="faq__cta-title">찾으시는 답변이 없나요?</h2>
                <p className="faq__cta-desc">
                  공간 유형과 상황을 알려주시면 전문 상담원이 직접 안내해
                  드립니다. 상담은 무료입니다.
                </p>
              </div>
              <div className="faq__cta-actions">
                <Link to="/qna/write" className="btn btn--primary btn--arrow">
                  1:1 문의하기
                  <span className="btn__icon">
                    <Icon name="arrow-right" size={18} />
                  </span>
                </Link>
                <a href="tel:16702335" className="btn btn--secondary">
                  <span className="btn__icon">
                    <Icon name="phone" size={17} />
                  </span>
                  1670-2335
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* -- 작성/수정 모달 (관리자) -- */}
        {modal.open && (
          <div className="faq-modal__overlay" onClick={closeModal}>
            <div
              className="faq-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={modal.mode === "create" ? "질문 추가" : "질문 수정"}
            >
              <div className="faq-modal__head">
                <h2 className="faq-modal__title">
                  {modal.mode === "create" ? "질문 추가" : "질문 수정"}
                </h2>
                <button
                  type="button"
                  className="faq-modal__close"
                  onClick={closeModal}
                  aria-label="닫기"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <div className="faq-modal__body">
                <div className="field">
                  <label className="field__label" htmlFor="faq-question">
                    질문
                  </label>
                  <input
                    id="faq-question"
                    className="input"
                    type="text"
                    placeholder="질문을 입력하세요"
                    value={form.question}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, question: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="faq-answer">
                    답변
                  </label>
                  <textarea
                    id="faq-answer"
                    className="textarea"
                    placeholder="답변을 입력하세요"
                    value={form.answer}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, answer: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="faq-modal__foot">
                <button className="btn btn--ghost" onClick={closeModal}>
                  취소
                </button>
                <button
                  className="btn btn--primary"
                  onClick={handleSubmit}
                  disabled={!form.question.trim() || !form.answer.trim()}
                >
                  {modal.mode === "create" ? "추가" : "수정"}
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
