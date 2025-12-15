import "./Footer.css";

import logoGreen from "../assets/przo-logo-green.png";
import kakaotalkIcon from "../assets/footer-icon/kakao-icon.svg";
import instaIcon from "../assets/footer-icon/insta-icon.svg";
import youtubeIcon from "../assets/footer-icon/youtube-icon.svg";
import naverblogIcon from "../assets/footer-icon/naverblog-icon.svg";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__top">
          <div className="footer__left">
            <img src={logoGreen} alt="PRZO Logo" className="footer__logo" />
            <div className="footer__social">
              <a href="https://pf.kakao.com/_yourchannel" target="_blank" rel="noopener noreferrer">
                <img src={kakaotalkIcon} alt="kakaotalk" />
              </a>
              <a href="https://instagram.com/_yourprofile" target="_blank" rel="noopener noreferrer">
                <img src={instaIcon} alt="instagram" />
              </a>
              <a href="https://youtube.com/_yourchannel" target="_blank" rel="noopener noreferrer">
                <img src={youtubeIcon} alt="youtube" />
              </a>
              <a href="https://blog.naver.com/_yourblog" target="_blank" rel="noopener noreferrer">
                <img src={naverblogIcon} alt="naver blog" />
              </a>
            </div>
          </div>

          <nav className="footer__nav">
            <a href="#">사이트 이용 약관</a>
            <a href="#">쿠키 정책</a>
            <a href="#">개인정보처리방침</a>
            <a href="#">많이 묻는 질문</a>
            <a href="#">매장 안내</a>
          </nav>

          <div className="footer__contact">
            <div className="footer__tel">프르조 상담문의 1670-2335</div>
            <div className="footer__tel-sub">TEL:032-433-3348</div>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__copyright">© 2025. 프르조 All Rights Reserved</div>
          <div className="footer__info">
            <span>대표: 김선미</span>
            <span>인천 미추홀구 주안동 431-1</span>
            <span>사업자등록번호: 653-98-00887</span>
            <span>운영시간: 평일 09:00 ~ 18:00</span>
            <span>E_mail:pestredzone@naver.com</span>
            <span>FAX:032 511 3348</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
