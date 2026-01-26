import { useState, useEffect, useRef } from "react";
import "./FloatingButtons.css";
import kakaoIcon from "../assets/floating-button/kakao-icon-floating.svg";
import telIcon from "../assets/floating-button/tel-icon-floating.svg";
import topIcon from "../assets/floating-button/top-icon-floating.svg";
import telInfoIcon from "../assets/floating-button/telinfo-icon.svg";
import telCopyIcon from "../assets/floating-button/telcopy-icon.svg";

const PHONE_NUMBER = "1670-2335";

const FloatingButtons = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const tooltipRef = useRef(null);
  const phoneButtonRef = useRef(null);

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
    <>
      <div className="floating-buttons">
        <button
          className="floating-btn floating-btn--kakao"
          onClick={handleKakaoClick}
          aria-label="카카오톡 상담"
          title="카카오톡 상담"
        >
          <img src={kakaoIcon} alt="카카오톡" className="floating-btn__icon" />
        </button>
        <div className="floating-btn-wrapper">
          <button
            ref={phoneButtonRef}
            className="floating-btn floating-btn--phone"
            onClick={handlePhoneClick}
            aria-label="전화 상담"
            title="전화 상담"
          >
            <img src={telIcon} alt="전화" className="floating-btn__icon" />
          </button>
          {isModalOpen && (
            <div ref={tooltipRef} className="phone-tooltip">
              <button
                className="phone-tooltip__close"
                onClick={handleModalClose}
              >
                ×
              </button>
              <div className="phone-tooltip__icon-wrapper">
                <img
                  src={telInfoIcon}
                  alt="전화"
                  className="phone-tooltip__icon"
                />
              </div>
              <p className="phone-tooltip__number">{PHONE_NUMBER}</p>
              <button
                className="phone-tooltip__copy-btn"
                onClick={handleCopyNumber}
              >
                <img
                  src={telCopyIcon}
                  alt="복사"
                  className="phone-tooltip__copy-icon"
                />
              </button>
              {isCopied && <span className="phone-tooltip__copied">복사됨!</span>}
            </div>
          )}
        </div>
        <button
          className="floating-btn floating-btn--top"
          onClick={handleScrollTop}
          aria-label="맨 위로"
          title="맨 위로"
        >
          <img src={topIcon} alt="맨 위로" className="floating-btn__icon" />
        </button>
      </div>
    </>
  );
};

export default FloatingButtons;
