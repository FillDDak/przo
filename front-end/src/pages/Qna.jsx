import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Qna.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";

const API_BASE_URL = "http://localhost:8080/api";

const Qna = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [inquiries, setInquiries] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/inquiries?page=${currentPage}&size=10`
        );
        const data = await response.json();
        setInquiries(data.content);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("문의 목록을 불러오는데 실패했습니다:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // 페이지네이션 번호 생성 (최대 5개)
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

  return (
    <div className="qna">
      {/* 배너 섹션 */}
      <section className="qna__banner">
        {/* 브레드크럼 */}
        <div className="qna__breadcrumb">
          <Link to="/" className="qna__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="qna__breadcrumb-icon" />
          </Link>
          <span className="qna__breadcrumb-separator">&gt;</span>
          <span className="qna__breadcrumb-text">상담문의</span>
          <span className="qna__breadcrumb-separator">&gt;</span>
          <span className="qna__breadcrumb-current">무료문의</span>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <section className="qna__main">
        <div className="qna__content">
          <h1 className="qna__title">무료문의</h1>

          {/* 문의 목록 테이블 */}
          <div className="qna__table-wrapper">
            <table className="qna__table">
              <thead>
                <tr>
                  <th className="qna__th qna__th--number">번호</th>
                  <th className="qna__th qna__th--title">제목</th>
                  <th className="qna__th qna__th--date">등록일</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="qna__td qna__td--loading">
                      로딩 중...
                    </td>
                  </tr>
                ) : inquiries.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="qna__td qna__td--empty">
                      등록된 문의가 없습니다.
                    </td>
                  </tr>
                ) : (
                  inquiries.map((item) => (
                    <tr key={item.id} className="qna__row">
                      <td className="qna__td qna__td--number">{item.id}</td>
                      <td className="qna__td qna__td--title">
                        <Link to={`/qna/${item.id}`} className="qna__link">
                          <svg className="qna__lock-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="qna__title-text">{item.title}</span>
                        </Link>
                      </td>
                      <td className="qna__td qna__td--date">{item.createdAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 문의하기 버튼 */}
          <div className="qna__button-wrapper">
            <Link to="/qna/write" className="qna__write-btn">
              문의하기
            </Link>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 0 && (
            <div className="qna__pagination">
              <button
                className="qna__page-btn qna__page-btn--prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                &lt;
              </button>
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  className={`qna__page-btn ${currentPage === pageNum ? "qna__page-btn--active" : ""}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum + 1}
                </button>
              ))}
              <button
                className="qna__page-btn qna__page-btn--next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Qna;
