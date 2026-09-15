import "./PestLabLoading.css";

/**
 * /pest 진입 시 three.js 청크(gzip 137KB)를 받는 동안 보여 줄 화면.
 *
 * 이 컴포넌트는 lazy 로 만들 수 없다 — fallback 자체가 먼저 떠 있어야 하므로
 * 메인 번들에 들어간다. 그래서 의존성 없이 CSS 만으로 그린다.
 * (PageHero 를 가져다 쓰면 그쪽 청크까지 메인 번들로 딸려 온다)
 *
 * 배경은 PestLab.css 의 .pest-lab__scene 과 같은 그라데이션이라,
 * 로딩이 끝나고 실제 무대가 뜰 때 색이 튀지 않는다.
 */
const PestLabLoading = () => (
  <div className="pest-loading" role="status" aria-live="polite" aria-busy="true">
    <div className="pest-loading__badge" aria-hidden="true">
      {/* 금지 표시(링 + 사선)와 그 안의 해충 — 곧 나타날 캐릭터를 미리 알린다 */}
      <span className="pest-loading__ring">
        <span className="pest-loading__slash" />
      </span>
      <span className="pest-loading__bug" />
    </div>

    <p className="pest-loading__text">해충을 조립하는 중…</p>

    <span className="pest-loading__bar" aria-hidden="true">
      <i />
    </span>

    <span className="sr-only">3D 화면을 불러오고 있습니다. 잠시만 기다려 주세요.</span>
  </div>
);

export default PestLabLoading;
