import { useState, useEffect, useRef } from "react";
import Icon from "./Icon";
import "./FloatingButtons.css";

const PHONE_NUMBER = "1670-2335";

const FloatingButtons = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const tooltipRef = useRef(null);
  const phoneButtonRef = useRef(null);

  // 맨 위로 버튼은 실제로 스크롤을 내렸을 때만 노출한다
  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 400);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleKakaoClick = () => {
    window.open("https://open.kakao.com/o/sYCdK5og", "_blank");
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  };

  const handlePhoneClick = () => {
    if (isMobile()) {
      window.location.href = `tel:${PHONE_NUMBER}`;
    } else {
      setIsModalOpen((prev) => !prev);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // 외부 클릭 시 툴팁 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isModalOpen &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        phoneButtonRef.current &&
        !phoneButtonRef.current.contains(event.target)
      ) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(PHONE_NUMBER.replace(/-/g, ""));
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="floating-buttons">
      <button
        className="floating-btn floating-btn--kakao"
        onClick={handleKakaoClick}
        aria-label="카카오톡 상담"
      >
        <Icon name="kakao" />
        <span className="floating-btn__label">카카오톡 상담</span>
      </button>

      <div className="floating-btn-wrapper">
        <button
          ref={phoneButtonRef}
          className="floating-btn floating-btn--phone"
          onClick={handlePhoneClick}
          aria-label="전화 상담"
          aria-expanded={isModalOpen}
        >
          <Icon name="phone" strokeWidth={1.8} />
          {/* 툴팁이 열리면 같은 자리에 겹치므로 라벨은 숨긴다 */}
          {!isModalOpen && <span className="floating-btn__label">전화 상담</span>}
        </button>

        {isModalOpen && (
          <div ref={tooltipRef} className="phone-tooltip">
            <button
              className="phone-tooltip__close"
              onClick={handleModalClose}
              aria-label="닫기"
            >
              <Icon name="close" size={12} strokeWidth={2.2} />
            </button>
            <span className="phone-tooltip__icon-wrapper">
              <Icon name="phone" size={18} strokeWidth={1.8} />
            </span>
            <p className="phone-tooltip__number">{PHONE_NUMBER}</p>
            <button
              className="phone-tooltip__copy-btn"
              onClick={handleCopyNumber}
              aria-label="전화번호 복사"
            >
              <Icon name="clipboard" size={18} />
            </button>
            {isCopied && <span className="phone-tooltip__copied">복사됨!</span>}
          </div>
        )}
      </div>

      {/*
        높이를 담당하는 슬롯을 버튼과 분리했다.
        버튼에 직접 height 를 걸면 브레이크포인트별 크기 규칙과 우선순위가 부딪혀
        숨겨진 상태에서도 자리를 차지하는 문제가 생긴다.
      */}
      <div
        className={`floating-buttons__top-slot ${showTop ? "floating-buttons__top-slot--visible" : ""}`}
        aria-hidden={!showTop}
      >
        <button
          className="floating-btn floating-btn--top"
          onClick={handleScrollTop}
          aria-label="맨 위로"
          tabIndex={showTop ? 0 : -1}
        >
          <Icon name="chevron-up" strokeWidth={2.2} />
          <span className="floating-btn__label">맨 위로</span>
        </button>
      </div>
    </div>
  );
};

export default FloatingButtons;
