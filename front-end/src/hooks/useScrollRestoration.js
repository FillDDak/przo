import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * 뒤로/앞으로 이동 시 이전 스크롤 위치를 되살린다.
 *
 * react-router 의 <ScrollRestoration /> 을 쓰지 않은 이유:
 * 그건 라우터 loader 로 데이터를 받아오는 구조를 전제한다. 이 프로젝트는
 * 목록·상세를 컴포넌트 안에서 fetch 하므로, 복원 시점에는 아직 화면이 비어
 * 문서 높이가 0에 가깝다. 그 상태로 scrollTo 를 부르면 브라우저가 잘라내
 * 결국 맨 위로 간다. 그래서 목표 위치에 닿을 때까지 몇 프레임 재시도한다.
 *
 * 위치는 location.key 기준으로 sessionStorage 에 저장한다.
 * 같은 주소라도 방문할 때마다 key 가 달라서, 뒤로가기 이력마다 각자의 위치를
 * 갖는다(목록 → 상세 → 목록 → 다른 상세 → 뒤로 … 가 전부 따로 복원된다).
 */

const STORE_KEY = "przo:scroll-positions";

/* 복원을 포기하기까지의 시간. 이 안에 콘텐츠가 안 그려지면 그대로 둔다. */
const RESTORE_TIMEOUT_MS = 1500;

const readPositions = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) || "{}");
  } catch {
    // 시크릿 모드 등에서 sessionStorage 접근이 막히면 복원을 포기한다.
    return {};
  }
};

const writePositions = (positions) => {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(positions));
  } catch {
    // 저장 실패(용량 초과·접근 차단)는 무시한다. 복원만 안 될 뿐 동작에는 지장이 없다.
  }
};

export default function useScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();

  /* 현재 화면을 떠나기 직전의 위치를 기록한다. */
  useEffect(() => {
    const save = () => {
      const positions = readPositions();
      positions[location.key] = window.scrollY;
      writePositions(positions);
    };

    // 탭을 닫거나 새로고침할 때도 남겨야 뒤로가기로 돌아왔을 때 살아 있다
    window.addEventListener("pagehide", save);
    return () => {
      save();
      window.removeEventListener("pagehide", save);
    };
  }, [location.key]);

  /* 새 화면에서 위치를 잡는다 — 뒤로가기면 복원, 아니면 맨 위. */
  useEffect(() => {
    if (navigationType !== "POP") {
      window.scrollTo(0, 0);
      return;
    }

    const target = readPositions()[location.key];
    if (typeof target !== "number" || target <= 0) {
      window.scrollTo(0, 0);
      return;
    }

    let frame = 0;
    const deadline = performance.now() + RESTORE_TIMEOUT_MS;

    const attempt = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      window.scrollTo(0, Math.min(target, Math.max(0, maxScroll)));

      // 아직 콘텐츠가 덜 그려져 목표에 못 미치면 다음 프레임에 다시 시도한다
      if (window.scrollY < target - 2 && performance.now() < deadline) {
        frame = requestAnimationFrame(attempt);
      }
    };

    attempt();
    return () => cancelAnimationFrame(frame);
  }, [location.key, navigationType]);
}
