import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Header.css";
import logoWhite from "../assets/logo/przo-logo-white.webp";
import logoGreen from "../assets/logo/przo-logo-green.webp";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";

const TEL = "1670-2335";

const NAV = [
  { label: "회사 소개", to: "/about" },
  {
    label: "상담 서비스",
    to: "/qna",
    children: [
      { label: "상담 문의", to: "/qna", desc: "1:1 문의 접수 및 답변 확인" },
      { label: "많이 묻는 질문", to: "/faq", desc: "자주 찾는 질문 모음" },
    ],
  },
  { label: "이미지 모음", to: "/reviews" },
];

const Header = ({ variant = "default" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = variant === "admin";
  const { isAdmin: isAdminLoggedIn, adminName } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  /* 상단에서는 투명, 스크롤하면 불투명 — 히어로 위에 자연스럽게 얹힌다 */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isMenuOpen]);

  /* 라우트가 바뀌면 열려 있던 메뉴를 정리한다.
     effect 대신 렌더 중 비교하는 방식을 쓴 이유는, effect 로 처리하면
     드로어가 열린 채 한 프레임 그려진 뒤 닫혀 깜빡이기 때문이다. */
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setIsMenuOpen(false);
    setOpenGroup(null);
    setHoveredGroup(null);
  }

  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenGroup(null);
  };

  const handleNavClick = (to) => {
    if (location.pathname === to) navigate(0);
    closeMenu();
  };

  const isActive = (item) => {
    const targets = item.children ? item.children.map((c) => c.to) : [item.to];
    return targets.some(
      (t) => location.pathname === t || location.pathname.startsWith(`${t}/`)
    );
  };

  const solid = isScrolled || isMenuOpen;

  return (
    <>
      <header
        className={[
          "header",
          isAdmin ? "header--admin" : "",
          solid ? "header--solid" : "",
          isMenuOpen ? "header--menu-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="header__container">
          {/* -- 로고 -- */}
          <div className="header__brand">
            <Link
              to="/"
              className="header__logo"
              onClick={() => window.scrollTo(0, 0)}
              aria-label="프르조 홈"
            >
              <img
                src={solid && !isAdmin ? logoGreen : logoWhite}
                alt="PRZO"
                width="120"
                height="30"
              />
            </Link>
            {isAdminLoggedIn ? (
              <Link to="/admin" className="header__admin-badge">
                <Icon name="lock" size={13} />
                <strong>{adminName} 님</strong>
              </Link>
            ) : (
              <Link
                to="/admin"
                className="header__admin-badge header__admin-badge--guest"
              >
                관리자
              </Link>
            )}
          </div>

          {/* -- 데스크탑 내비게이션 -- */}
          <nav className="header__nav" aria-label="주요 메뉴">
            {NAV.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className={`header__nav-item header__nav-item--has-menu ${
                    hoveredGroup === item.label
                      ? "header__nav-item--open"
                      : ""
                  }`}
                  onMouseEnter={() => setHoveredGroup(item.label)}
                  onMouseLeave={() => setHoveredGroup(null)}
                >
                  <button
                    type="button"
                    className={`header__nav-link header__nav-link--trigger ${
                      isActive(item) ? "header__nav-link--active" : ""
                    }`}
                    aria-expanded={hoveredGroup === item.label}
                    onClick={() => {
                      if (location.pathname === item.to) navigate(0);
                      else navigate(item.to);
                    }}
                  >
                    {item.label}
                    <Icon
                      name="chevron-down"
                      size={15}
                      className="header__nav-caret"
                    />
                  </button>

                  <div className="header__dropdown" role="menu">
                    <div className="header__dropdown-panel">
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          role="menuitem"
                          className={`header__dropdown-link ${
                            location.pathname === child.to
                              ? "header__dropdown-link--active"
                              : ""
                          }`}
                          onClick={() => handleNavClick(child.to)}
                        >
                          <span className="header__dropdown-label">
                            {child.label}
                          </span>
                          <span className="header__dropdown-desc">
                            {child.desc}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={item.to} className="header__nav-item">
                  <Link
                    to={item.to}
                    className={`header__nav-link ${
                      isActive(item) ? "header__nav-link--active" : ""
                    }`}
                    onClick={() => handleNavClick(item.to)}
                  >
                    {item.label}
                  </Link>
                </div>
              )
            )}
          </nav>

          {/* -- 우측 액션 -- */}
          <div className="header__actions">
            <a
              href={`tel:${TEL.replace(/-/g, "")}`}
              className="header__tel"
              aria-label={`전화 상담 ${TEL}`}
            >
              <Icon name="phone" size={17} />
              <span className="header__tel-number">{TEL}</span>
            </a>
            <Link to="/qna/write" className="header__cta">
              무료 상담 신청
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>

          {/* -- 모바일 토글 -- */}
          <button
            type="button"
            className="header__menu-btn"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMenuOpen}
          >
            <span
              className={`header__menu-icon ${
                isMenuOpen ? "header__menu-icon--open" : ""
              }`}
            >
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      {/* -- 모바일 드로어 -- */}
      <div
        className={`header-drawer ${isMenuOpen ? "header-drawer--open" : ""}`}
        aria-hidden={!isMenuOpen}
      >
        <div className="header-drawer__scroll">
          <nav className="header-drawer__nav" aria-label="모바일 메뉴">
            {NAV.map((item) =>
              item.children ? (
                <div key={item.label} className="header-drawer__group">
                  <button
                    type="button"
                    className={`header-drawer__link header-drawer__link--trigger ${
                      openGroup === item.label
                        ? "header-drawer__link--expanded"
                        : ""
                    } ${isActive(item) ? "header-drawer__link--active" : ""}`}
                    aria-expanded={openGroup === item.label}
                    onClick={() =>
                      setOpenGroup(openGroup === item.label ? null : item.label)
                    }
                  >
                    {item.label}
                    <Icon
                      name="chevron-down"
                      size={18}
                      className="header-drawer__caret"
                    />
                  </button>
                  {/* grid-template-rows 0fr→1fr 로 높이를 애니메이션하므로
                      자식은 반드시 하나여야 한다 (내부 래퍼 필수) */}
                  <div
                    className={`header-drawer__sub ${
                      openGroup === item.label ? "header-drawer__sub--open" : ""
                    }`}
                  >
                    <div className="header-drawer__sub-inner">
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={`header-drawer__sublink ${
                            location.pathname === child.to
                              ? "header-drawer__sublink--active"
                              : ""
                          }`}
                          onClick={() => handleNavClick(child.to)}
                          tabIndex={
                            isMenuOpen && openGroup === item.label ? 0 : -1
                          }
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`header-drawer__link ${
                    isActive(item) ? "header-drawer__link--active" : ""
                  }`}
                  onClick={() => handleNavClick(item.to)}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="header-drawer__contact">
            <p className="header-drawer__contact-label">상담 문의</p>
            <a
              href={`tel:${TEL.replace(/-/g, "")}`}
              className="header-drawer__tel"
              tabIndex={isMenuOpen ? 0 : -1}
            >
              <Icon name="phone" size={18} />
              {TEL}
            </a>
            <p className="header-drawer__hours">평일 09:00 – 18:00</p>
            <Link
              to="/qna/write"
              className="btn btn--primary btn--block header-drawer__cta"
              onClick={closeMenu}
              tabIndex={isMenuOpen ? 0 : -1}
            >
              무료 상담 신청
              <span className="btn__icon">
                <Icon name="arrow-right" size={18} />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div
          className="header__overlay"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Header;
