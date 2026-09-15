import { Link } from "react-router-dom";
import Icon from "./Icon";
import "./PageHero.css";

/**
 * 모든 하위 페이지 상단에 공통으로 쓰는 히어로 배너.
 *
 * 페이지마다 제각각이던 배너/브레드크럼을 하나로 통일해
 * 사이트 전체가 같은 리듬으로 시작하게 한다.
 *
 * @param {string}   eyebrow     제목 위 영문 라벨 (예: "ABOUT US")
 * @param {node}     title       페이지 제목
 * @param {node}     description 제목 아래 보조 설명
 * @param {Array}    breadcrumb  [{ label, to }] — to 가 없으면 현재 위치로 렌더
 * @param {string}   image       배경 이미지 (선택)
 * @param {node}     children    제목 아래 액션 영역 (선택)
 * @param {"md"|"lg"|"sm"} size  높이 변형
 */
const PageHero = ({
  eyebrow,
  title,
  description,
  breadcrumb = [],
  image,
  children,
  size = "md",
}) => {
  return (
    <section className={`page-hero page-hero--${size} on-inverse`}>
      {image && (
        <div
          className="page-hero__image"
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden="true"
        />
      )}
      <div className="page-hero__grid" aria-hidden="true" />
      <div className="page-hero__glow" aria-hidden="true" />

      <div className="page-hero__inner u-container">
        {breadcrumb.length > 0 && (
          <nav className="page-hero__breadcrumb" aria-label="현재 위치">
            <Link to="/" className="page-hero__crumb page-hero__crumb--home">
              <Icon name="home" size={14} />
              <span className="sr-only">홈</span>
            </Link>
            {breadcrumb.map((crumb, i) => {
              const isLast = i === breadcrumb.length - 1;
              return (
                <span key={crumb.label} className="page-hero__crumb-group">
                  <Icon
                    name="chevron-right"
                    size={13}
                    className="page-hero__crumb-sep"
                  />
                  {crumb.to && !isLast ? (
                    <Link to={crumb.to} className="page-hero__crumb">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className="page-hero__crumb page-hero__crumb--current"
                      aria-current={isLast ? "page" : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        )}

        <div className="page-hero__body">
          {eyebrow && <p className="page-hero__eyebrow">{eyebrow}</p>}
          <h1 className="page-hero__title">{title}</h1>
          {description && <p className="page-hero__desc">{description}</p>}
          {children && <div className="page-hero__actions">{children}</div>}
        </div>
      </div>
    </section>
  );
};

export default PageHero;
