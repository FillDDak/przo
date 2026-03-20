import exclamationIcon from "../assets/other-page-icon-image/exclamation-icon.svg";
import "./ConfirmModal.css";

const ConfirmModal = ({ title, subtitle, onClose, buttons }) => (
  <div className="confirm-modal__overlay" onClick={onClose}>
    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
      <div className="confirm-modal__header">
        <div className="confirm-modal__icon">
          <img src={exclamationIcon} alt="경고" />
        </div>
        <div className="confirm-modal__body">
          <div className="confirm-modal__text">
            <h2 className="confirm-modal__title">{title}</h2>
            {subtitle && <p className="confirm-modal__subtitle">{subtitle}</p>}
          </div>
          <div className="confirm-modal__buttons">
            {buttons.map(({ label, variant = "confirm", onClick }, i) => (
              <button
                key={i}
                className={`confirm-modal__btn confirm-modal__btn--${variant}`}
                onClick={onClick}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <button className="confirm-modal__close" onClick={onClose}>
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="1" y1="1" x2="15" y2="15" stroke="#767676" strokeWidth="2" strokeLinecap="round"/>
            <line x1="15" y1="1" x2="1" y2="15" stroke="#767676" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
