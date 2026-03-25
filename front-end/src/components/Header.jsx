import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./Header.css";
import logoWhite from "../assets/logo/przo-logo-white.webp";
import logoGreen from "../assets/logo/przo-logo-green.webp";
import logoGreenGradation from "../assets/logo/przo-logo-green-gradation.webp";
import { useAuth } from "../context/AuthContext";

const Header = ({ variant = "default" }) => {
  const location = useLocation();
  const isAdmin = variant === "admin";
  const { isAdmin: isAdminLoggedIn, adminName } = useAuth();
  const subPagePrefixes = ["/about", "/service", "/qna", "/reviews", "/faq", "/terms", "/cookie-policy", "/privacy-policy"];
  const isSubPage = subPagePrefixes.some(prefix => location.pathname.startsWith(prefix));
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQnaOpen, setIsQnaOpen] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const dropdownTimerRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsQnaOpen(false);
  };

  const handleNavClick = (to) => {
    if (location.pathname === to) navigate(0);
    closeMenu();
  };

  const handleDropdownEnter = () => {
    if (isMenuOpen) return;
    clearTimeout(dropdownTimerRef.current);
    setIsDesktopDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    if (isMenuOpen) return;
    dropdownTimerRef.current = setTimeout(() => {
      setIsDesktopDropdownOpen(false);
    }, 300);
  };

  return (
    <header className={`header ${isAdmin ? "header--admin" : ""} ${isSubPage ? "header--subpage" : ""} ${isMenuOpen && !isSubPage && !isAdmin ? "header--menu-open" : ""}`}>
      <div className="header__container">
        <div className="header__logo-wrap">
          <Link to="/" className="header__logo" onClick={() => {
            window.scrollTo(0, 0);
          }}>
            <img src={isAdmin ? logoGreenGradation : isSubPage ? logoGreen : logoWhite} alt="PRZO" />
          </Link>
          {isAdminLoggedIn && (
            <Link to="/admin" className="header__admin-badge"><strong>{adminName} 님</strong></Link>
          )}
        </div>

        <button className="header__menu-btn" onClick={toggleMenu} aria-label="메뉴">
          <span className={`header__menu-icon ${isMenuOpen ? 'header__menu-icon--open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
          <Link to="/about" className="header__nav-link" onClick={() => handleNavClick("/about")}>
            회사 소개
          </Link>
          <Link to="/service" className="header__nav-link" onClick={() => handleNavClick("/service")}>
            서비스 소개
          </Link>
          <div
            className={`header__nav-item header__nav-item--dropdown ${isQnaOpen ? "header__nav-item--open" : ""} ${isDesktopDropdownOpen ? "header__nav-item--desktop-open" : ""}`}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              className="header__nav-link header__nav-link--dropdown-trigger"
              onClick={() => {
                if (location.pathname === "/qna") navigate(0);
                else navigate("/qna");
                closeMenu();
              }}
            >
              상담 서비스
              <svg className="header__dropdown-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="header__dropdown">
              <Link to="/qna" className="header__dropdown-link" onClick={() => { clearTimeout(dropdownTimerRef.current); setIsDesktopDropdownOpen(false); setIsQnaOpen(false); handleNavClick("/qna"); }}>
                상담 문의
              </Link>
              <Link to="/faq" className="header__dropdown-link" onClick={() => { clearTimeout(dropdownTimerRef.current); setIsDesktopDropdownOpen(false); setIsQnaOpen(false); handleNavClick("/faq"); }}>
                많이 묻는 질문
              </Link>
            </div>
          </div>
          <Link to="/reviews" className="header__nav-link" onClick={() => handleNavClick("/reviews")}>
            시공 사진
          </Link>
        </nav>
      </div>
      {isMenuOpen && <div className="header__overlay" onClick={closeMenu}></div>}
    </header>
  );
};

export default Header;
