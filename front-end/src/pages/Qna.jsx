import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import PageHero from "../components/PageHero";
import Icon from "../components/Icon";
import { getErrorMessage } from "../utils/errorMessage";
import "./Qna.css";

const API_BASE_URL = "/api";
const PAGE_SIZE = 10;

const Qna = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [inquiries, setInquiries] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page: currentPage, size: PAGE_SIZE });
        if (searchQuery) params.append("title", searchQuery);
        const response = await fetch(`${API_BASE_URL}/inquiries?${params}`);
        const data = await response.json();
        setInquiries(data.content || []);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (error) {
        console.error("문의 목록을 불러오는데 실패했습니다:", error);
        setModal({
          title: "문의 목록을 불러오지 못했습니다.",
          subtitle: getErrorMessage(error),
          buttons: [
            { label: "확인", variant: "confirm", onClick: () => setModal(null) },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [currentPage, searchQuery]);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      document
        .querySelector(".qna__board")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    setSearchQuery(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(0);
  };

  /* 게시판은 공개되므로 작성자 이름은 첫 글자만 남긴다 */
  const maskName = (name) => {
    if (!name || name.length === 0) return "";
    if (name.length === 1) return name;
    return name[0] + "○".repeat(name.length - 1);
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

      <div className="qna">
        <PageHero
          eyebrow="Support"
          title="상담 문의"
          description="남겨주신 문의는 담당자가 확인 후 순차적으로 답변드립니다. 작성한 글은 전화번호 뒤 4자리로 확인할 수 있습니다."
          breadcrumb={[
            { label: "상담 서비스", to: "/qna" },
            { label: "상담 문의" },
          ]}
        >
          <Link to="/qna/write" className="btn btn--primary btn--arrow">
            문의 작성하기
            <span className="btn__icon">
              <Icon name="arrow-right" size={18} />
            </span>
          </Link>
          <a href="tel:16702335" className="btn btn--inverse">
            <span className="btn__icon">
              <Icon name="phone" size={17} />
            </span>
            전화 상담
          </a>
        </PageHero>

        <section className="qna__main u-section u-page-tail">
          <div className="u-container">
            {/* -- 목록 상단 : 건수 + 검색 -- */}
            <div className="qna__toolbar">
              <p className="qna__count">
                전체 <strong>{totalElements.toLocaleString()}</strong>건
                {searchQuery && (
                  <span className="qna__count-filter">
                    · &lsquo;{searchQuery}&rsquo; 검색 결과
                    <button
                      type="button"
                      className="qna__count-reset"
                      onClick={clearSearch}
                    >
                      전체 보기
                    </button>
                  </span>
                )}
              </p>

              <form className="qna__search" onSubmit={handleSearch} role="search">
                <Icon name="search" size={18} className="qna__search-icon" />
                <input
                  type="text"
                  className="qna__search-input"
                  placeholder="제목으로 검색"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  aria-label="문의 제목 검색"
                />
                {searchInput && (
                  <button
                    type="button"
                    className="qna__search-clear"
                    onClick={clearSearch}
                    aria-label="검색어 지우기"
                  >
                    <Icon name="close" size={16} />
                  </button>
                )}
                <button type="submit" className="qna__search-submit">
                  검색
                </button>
              </form>
            </div>

            {/* -- 게시판 -- */}
            <div className="qna__board">
              <div className="qna__board-head" aria-hidden="true">
                <span className="qna__col qna__col--no">번호</span>
                <span className="qna__col qna__col--title">제목</span>
                <span className="qna__col qna__col--author">작성자</span>
                <span className="qna__col qna__col--date">등록일</span>
              </div>

              {loading ? (
                <ul className="qna__list">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <li key={i} className="qna__item qna__item--skeleton">
                      <span className="skeleton qna__skeleton-no" />
                      <span className="skeleton qna__skeleton-title" />
                      <span className="skeleton qna__skeleton-author" />
                      <span className="skeleton qna__skeleton-date" />
                    </li>
                  ))}
                </ul>
              ) : inquiries.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state__icon">
                    <Icon name="chat" size={28} />
                  </span>
                  <p className="empty-state__title">
                    {searchQuery
                      ? "검색 결과가 없습니다"
                      : "등록된 문의가 없습니다"}
                  </p>
                  <p className="empty-state__desc">
                    {searchQuery
                      ? "다른 검색어로 다시 시도해 보세요."
                      : "첫 문의를 남겨주시면 담당자가 빠르게 확인하겠습니다."}
                  </p>
                  <Link
                    to="/qna/write"
                    className="btn btn--primary u-mt-4"
                  >
                    문의 작성하기
                  </Link>
                </div>
              ) : (
                <ul className="qna__list">
                  {inquiries.map((item, index) => (
                    <li key={item.id} className="qna__item">
                      <Link to={`/qna/${item.id}`} className="qna__item-link">
                        <span className="qna__col qna__col--no">
                          {totalElements - currentPage * PAGE_SIZE - index}
                        </span>

                        <span className="qna__col qna__col--title">
                          <Icon
                            name="lock"
                            size={15}
                            className="qna__lock"
                            aria-label="비밀글"
                          />
                          <span className="qna__item-title">{item.title}</span>
                          {item.hasReply ? (
                            <span className="badge badge--success qna__status">
                              답변완료
                            </span>
                          ) : (
                            <span className="badge badge--neutral qna__status">
                              접수됨
                            </span>
                          )}
                        </span>

                        <span className="qna__col qna__col--author">
                          {maskName(item.name)}
                        </span>
                        <span className="qna__col qna__col--date">
                          {item.createdAt}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* -- 하단 : 페이지네이션 + 작성 버튼 -- */}
            <div className="qna__foot">
              {totalPages > 1 ? (
                <nav className="pagination qna__pagination" aria-label="페이지 이동">
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
              ) : (
                <span />
              )}

              <Link
                to="/qna/write"
                className="btn btn--primary qna__write-btn"
              >
                <span className="btn__icon">
                  <Icon name="pencil" size={17} />
                </span>
                문의하기
              </Link>
            </div>

            {/* -- 안내 -- */}
            <aside className="qna__notice">
              <Icon name="info" size={18} />
              <div>
                <p className="qna__notice-title">문의 전 확인해 주세요</p>
                <ul className="qna__notice-list">
                  <li>
                    작성한 문의의 비밀번호는 <strong>전화번호 뒤 4자리</strong>로
                    자동 설정됩니다.
                  </li>
                  <li>
                    답변은 영업일 기준 순차적으로 등록되며, 급한 건은 전화(
                    <a href="tel:16702335">1670-2335</a>)로 문의해 주세요.
                  </li>
                  <li>
                    자주 묻는 내용은 <Link to="/faq">많이 묻는 질문</Link>에서
                    먼저 확인하실 수 있습니다.
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
};

export default Qna;
