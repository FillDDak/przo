import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Header.css";
import logoWhite from "../assets/logo/przo-logo-white.png";
import logoGreen from "../assets/logo/przo-logo-green.png";
import logoGreenGradation from "../assets/logo/przo-logo-green-gradation.png";

const Header = ({ variant = "default" }) => {
  const location = useLocation();
  const isAdmin = variant === "admin";
  const isSubPage = ["/about", "/service", "/qna", "/reviews"].includes(location.pathname);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? "header--scrolled" : ""} ${isAdmin ? "header--admin" : ""}`}>
      <div className="header__container">
        <Link to="/" className="header__logo">
          <img src={isAdmin ? logoGreenGradation : isSubPage ? logoGreen : logoWhite} alt="PRZO" />
        </Link>

        <button className="header__menu-btn" onClick={toggleMenu} aria-label="메뉴">
          <span className={`header__menu-icon ${isMenuOpen ? 'header__menu-icon--open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
          <Link to="/about" className="header__nav-link" onClick={closeMenu}>
            회사 소개
          </Link>
          <Link to="/service" className="header__nav-link" onClick={closeMenu}>
            서비스 소개
          </Link>
          <Link to="/qna" className="header__nav-link" onClick={closeMenu}>
            상담 문의
          </Link>
          <Link to="/reviews" className="header__nav-link" onClick={closeMenu}>
            서비스 후기
          </Link>
        </nav>
      </div>
      {isMenuOpen && <div className="header__overlay" onClick={closeMenu}></div>}
    </header>
  );
};

export default Header;
