import { useEffect, useRef } from "react";
import Icon from "./Icon";
import "./ConfirmModal.css";

/**
 * 프로젝트 전용 알림·확인 모달.
 * 고객·관리자에게 보이는 모든 alert / confirm 은 항상 이 컴포넌트를 쓴다.
 * window.alert, window.confirm 사용 금지.
 *
 * 예외: 새로고침·탭 닫기 시 뜨는 다이얼로그는 브라우저의 beforeunload 가
 * 자체적으로 띄우는 것이라 커스텀 UI 로 대체할 수 없다. 반면 React Router
 * useBlocker() 로 막는 페이지 내 이동(링크 클릭·뒤로가기)은 이 모달로 처리한다.
 *
 * ESC 닫기 · 배경 스크롤 잠금 · 첫 버튼 포커스 · 버튼 정렬을 모두 이 컴포넌트가
 * 처리한다. 호출부에서 다시 넣지 말 것.
 *
 * 페이지에서 쓰는 패턴:
 *   const [modal, setModal] = useState(null);
 *   {modal && <ConfirmModal {...modal} />}
 *
 * @param {string} title    본문 제목
 * @param {string} subtitle 보조 설명 (선택)
 * @param {func}   onClose  오버레이 클릭 · ESC · 닫기 버튼
 * @param {Array}  buttons  [{ label, variant: "confirm"|"cancel"|"danger", onClick }]
 *                          배열 순서는 화면 배치와 무관하다 (아래 정렬 참고)
 * @param {"info"|"danger"|"success"} tone 아이콘 색상 톤
 */
const ConfirmModal = ({ title, subtitle, onClose, buttons = [], tone = "info" }) => {
  const dialogRef = useRef(null);

  /* ESC 로 닫기 + 배경 스크롤 잠금 */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    // 모달이 열리면 첫 번째 버튼에 포커스를 둬 키보드로 바로 조작할 수 있게 한다
    dialogRef.current?.querySelector("button")?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const iconName =
    tone === "danger" ? "alert" : tone === "success" ? "check-circle" : "info";

  /* 호출부마다 buttons 배열 순서가 제각각이라(취소가 먼저인 곳도, 나중인 곳도 있다)
     여기서 정렬해 취소 계열은 항상 왼쪽, 확인 계열은 항상 오른쪽에 오게 한다. */
  const orderedButtons = [
    ...buttons.filter((b) => b.variant === "cancel"),
    ...buttons.filter((b) => b.variant !== "cancel"),
  ];

  return (
    <div className="confirm-modal__overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          type="button"
          className="confirm-modal__close"
          onClick={onClose}
          aria-label="닫기"
        >
          <Icon name="close" size={18} />
        </button>

        <div className={`confirm-modal__icon confirm-modal__icon--${tone}`}>
          <Icon name={iconName} size={26} />
        </div>

        <div className="confirm-modal__text">
          <h2 className="confirm-modal__title">{title}</h2>
          {subtitle && <p className="confirm-modal__subtitle">{subtitle}</p>}
        </div>

        <div className="confirm-modal__buttons">
          {orderedButtons.map(({ label, variant = "confirm", onClick }, i) => (
            <button
              key={i}
              type="button"
              className={`confirm-modal__btn confirm-modal__btn--${variant}`}
              onClick={onClick}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
