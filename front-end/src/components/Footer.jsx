import "./Footer.css";

import logoGreen from "../assets/przo-logo-green.png";
import kakaotalkIcon from "../assets/icon-10-kakaotalk.svg";
import instaIcon from "../assets/icon-11-insta.svg";
import youtubeIcon from "../assets/icon-12-youtube.svg";
import naverblogIcon from "../assets/icon-13-naverblog.svg";

const socialLinks = [
  {
    href: "https://pf.kakao.com/_yourchannel",
    icon: kakaotalkIcon,
    alt: "kakaotalk",
  },
  { href: "https://instagram.com/_yourprofile", icon: instaIcon, alt: "instagram" },
  { href: "https://youtube.com/_yourchannel", icon: youtubeIcon, alt: "youtube" },
  {
    href: "https://blog.naver.com/_yourblog",
    icon: naverblogIcon,
    alt: "naver blog",
  },
];

const navLinks = [
  { href: "#", text: "회사 소개" },
  { href: "#", text: "사이트 이용 약관" },
  { href: "#", text: "쿠키 정책" },
  { href: "#", text: "개인정보처리방침" },
  { href: "#", text: "많이 묻는 질문" },
  { href: "#", text: "매장 안내" },
];

const SocialLink = ({ href, icon, alt }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    <img src={icon} alt={alt} className="footer__social-icon" />
  </a>
);

const NavLink = ({ href, text }) => (
  <a href={href} className="footer__nav-link">
    {text}
  </a>
);

const companyInfo = {
  line1: [
    "대표: 김선미",
    "인천 미추홀구 주안동 431-1",
    "사업자등록번호: 654-96-00682",
  ],
  line2: [
    "운영시간: 평일 09:00 ~ 18:00",
    "Email: asdasd@naver.com",
    "FAX: 032-511-3348",
  ],
};

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__section footer__section--left">
        <img src={logoGreen} alt="PRZO Logo Green" className="footer__logo" />
        <div className="footer__social-links">
          {socialLinks.map((link) => (
            <SocialLink key={link.alt} {...link} />
          ))}
        </div>
      </div>

      <div className="footer__section footer__section--center">
        <nav className="footer__nav">
          {navLinks.map((link) => (
            <NavLink key={link.text} {...link} />
          ))}
        </nav>
        <p className="footer__copyright">© 2025. 프르조 All Rights Reserved</p>
      </div>

      <div className="footer__section footer__section--right">
        <p className="footer__tel">프르조 상담문의 1670-2335</p>
        <div className="footer__info">
          <div>
            {companyInfo.line1.map((info) => (
              <span key={info}>{info}</span>
            ))}
          </div>
          <div>
            {companyInfo.line2.map((info) => (
              <span key={info}>{info}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;