import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import "./NotFound.css";

const SUGGESTIONS = [
  { to: "/", label: "홈", desc: "서비스 전체 안내" },
  { to: "/qna", label: "상담 문의", desc: "문의 접수 및 답변 확인" },
  { to: "/faq", label: "많이 묻는 질문", desc: "자주 찾는 질문 모음" },
  { to: "/reviews", label: "이미지 모음", desc: "실제 시공 기록" },
];

const NotFound = () => {
  return (
    <div className="not-found on-inverse">
      <div className="not-found__grid" aria-hidden="true" />
      <div className="not-found__glow" aria-hidden="true" />

      <div className="not-found__inner u-container u-container--narrow">
        <p className="not-found__code">404</p>
        <h1 className="not-found__title">페이지를 찾을 수 없습니다</h1>
        <p className="not-found__desc">
          요청하신 페이지가 존재하지 않거나 주소가 변경되었습니다.
          <br />
          아래에서 원하시는 정보를 찾아보세요.
        </p>

        <div className="not-found__actions">
          <Link to="/" className="btn btn--primary btn--lg">
            <span className="btn__icon">
              <Icon name="home" size={18} />
            </span>
            홈으로 돌아가기
          </Link>
          <a href="tel:16702335" className="btn btn--inverse btn--lg">
            <span className="btn__icon">
              <Icon name="phone" size={18} />
            </span>
            1670-2335
          </a>
        </div>

        <ul className="not-found__links">
          {SUGGESTIONS.map((s) => (
            <li key={s.to}>
              <Link to={s.to} className="not-found__link">
                <span className="not-found__link-label">{s.label}</span>
                <span className="not-found__link-desc">{s.desc}</span>
                <Icon
                  name="arrow-right"
                  size={16}
                  className="not-found__link-arrow"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotFound;
