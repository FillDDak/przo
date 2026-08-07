import { Link } from "react-router-dom";
import "./Footer.css";
import Icon from "./Icon";

import logoWhite from "../assets/logo/przo-logo-white.webp";
import kakaotalkIcon from "../assets/footer-icon/kakao-icon.svg";
import instaIcon from "../assets/footer-icon/insta-icon.svg";
import youtubeIcon from "../assets/footer-icon/youtube-icon.svg";
import naverblogIcon from "../assets/footer-icon/naverblog-icon.svg";

const TEL = "1670-2335";

const SOCIALS = [
  { href: "https://open.kakao.com/o/sYCdK5og", icon: kakaotalkIcon, label: "카카오톡 오픈채팅" },
  { href: "https://instagram.com/_yourprofile", icon: instaIcon, label: "인스타그램" },
  { href: "https://youtube.com/_yourchannel", icon: youtubeIcon, label: "유튜브" },
  { href: "https://blog.naver.com/legnalove", icon: naverblogIcon, label: "네이버 블로그" },
];

const BUSINESS = [
  { label: "대표", value: "김선미" },
  { label: "사업자등록번호", value: "653-98-00887" },
  { label: "FAX", value: "032-511-3348" },
];

const Footer = ({ variant = "default" }) => {
  const isAdmin = variant === "admin";

  return (
    <footer
      className={`footer on-inverse ${isAdmin ? "footer--admin" : ""}`}
    >
      {/* -- 상단 CTA 띠 : 문의로 유도하는 마지막 접점 -- */}
      {!isAdmin && (
        <div className="footer__cta">
          <div className="footer__cta-inner u-container">
            <div className="footer__cta-text">
              <p className="footer__cta-eyebrow">지금 바로 상담하세요</p>
              <h2 className="footer__cta-title">
                해충 문제, 방치할수록 비용이 커집니다
              </h2>
            </div>
            <div className="footer__cta-actions">
              <a href={`tel:${TEL.replace(/-/g, "")}`} className="btn btn--inverse btn--lg">
                <span className="btn__icon">
                  <Icon name="phone" size={18} />
                </span>
                {TEL}
              </a>
              <Link to="/qna/write" className="btn btn--primary btn--lg btn--arrow">
                무료 상담 신청
                <span className="btn__icon">
                  <Icon name="arrow-right" size={18} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="footer__main u-container">
        {/* -- 브랜드 -- */}
        <div className="footer__brand">
          <Link
            to="/"
            className="footer__logo-link"
            onClick={() => window.scrollTo(0, 0)}
          >
            <img src={logoWhite} alt="PRZO" className="footer__logo" />
          </Link>
          <p className="footer__tagline">
            인천·경기 지역 방역 및 해충 방제 전문 기업.
            <br />
            정밀 진단부터 사후 관리까지 책임집니다.
          </p>
          <ul className="footer__social">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                >
                  <img src={s.icon} alt="" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* -- 링크 그룹 -- */}
        <nav className="footer__col" aria-label="서비스 안내">
          <h3 className="footer__col-title">서비스 안내</h3>
          <ul className="footer__links">
            <li>
              <Link to="/about" onClick={() => window.scrollTo(0, 0)}>
                회사 소개
              </Link>
            </li>
            <li>
              <Link to="/reviews" onClick={() => window.scrollTo(0, 0)}>
                시공 이미지 모음
              </Link>
            </li>
            <li>
              <Link to="/about" state={{ scrollTo: "location" }}>
                찾아오시는 길
              </Link>
            </li>
          </ul>
        </nav>

        <nav className="footer__col" aria-label="고객 지원">
          <h3 className="footer__col-title">고객 지원</h3>
          <ul className="footer__links">
            <li>
              <Link to="/qna" onClick={() => window.scrollTo(0, 0)}>
                상담 문의
              </Link>
            </li>
            <li>
              <Link to="/faq" onClick={() => window.scrollTo(0, 0)}>
                많이 묻는 질문
              </Link>
            </li>
            <li>
              <Link to="/qna/write" onClick={() => window.scrollTo(0, 0)}>
                문의 작성하기
              </Link>
            </li>
          </ul>
        </nav>

        {/* -- 연락처 -- */}
        <div className="footer__col footer__col--contact">
          <h3 className="footer__col-title">상담 문의</h3>
          <a href={`tel:${TEL.replace(/-/g, "")}`} className="footer__tel">
            {TEL}
          </a>
          <ul className="footer__contact-list">
            <li>
              <Icon name="clock" size={15} />
              <span>평일 09:00 – 18:00 (주말·공휴일 휴무)</span>
            </li>
            <li>
              <Icon name="mail" size={15} />
              <a href="mailto:pestredzone@naver.com">pestredzone@naver.com</a>
            </li>
            <li>
              <Icon name="map-pin" size={15} />
              <span>인천 계양구 마장로544번길 10 디오아제상가 2층 B1-207호</span>
            </li>
          </ul>
        </div>
      </div>

      {/* -- 사업자 정보 / 법적 고지 -- */}
      <div className="footer__bottom">
        <div className="footer__bottom-inner u-container">
          <ul className="footer__business">
            {BUSINESS.map((b) => (
              <li key={b.label}>
                <span className="footer__business-label">{b.label}</span>
                <span className="footer__business-value">{b.value}</span>
              </li>
            ))}
          </ul>

          <div className="footer__legal">
            <nav className="footer__legal-links" aria-label="약관 및 정책">
              <Link to="/terms" onClick={() => window.scrollTo(0, 0)}>
                이용약관
              </Link>
              <Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)}>
                개인정보처리방침
              </Link>
              <Link to="/cookie-policy" onClick={() => window.scrollTo(0, 0)}>
                쿠키 정책
              </Link>
            </nav>
            <p className="footer__copyright">
              © {new Date().getFullYear()} 프르조(PRZO). All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
