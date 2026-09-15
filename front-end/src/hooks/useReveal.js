import { useEffect } from "react";

/**
 * `.reveal` 클래스가 붙은 요소를 뷰포트 진입 시 등장시킨다.
 *
 * 실제 등장 스타일은 styles/ui.css 의 `:root.reveal-ready .reveal` 에 있다.
 * 숨김 상태를 root 클래스로 감싼 이유는, JS 가 로드되지 않거나 실패했을 때
 * 콘텐츠가 계속 투명한 채로 남는 상황을 막기 위해서다(fail-open).
 *
 * 클래스 대신 data 속성을 토글하는 이유는 React 리렌더 시에도
 * 값이 유지되어 애니메이션이 되감기지 않기 때문이다.
 *
 * @param {any[]} deps 관찰 대상을 다시 수집해야 할 때 넘기는 의존성
 */
export default function useReveal(deps = []) {
  useEffect(() => {
    const root = document.documentElement;

    const revealAll = (els) => els.forEach((el) => el.setAttribute("data-visible", ""));

    const targets = Array.from(
      document.querySelectorAll(".reveal:not([data-visible])")
    );
    if (!targets.length) return;

    // 모션 최소화 설정이거나 IntersectionObserver 미지원이면 즉시 표시
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      revealAll(targets);
      return;
    }

    root.classList.add("reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-visible", "");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
