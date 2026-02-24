import { useState } from "react";
import { Link } from "react-router-dom";
import "./Faq.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";

const FAQ_DATA = [
  {
    question: "상담 문의는 어떻게 하나요?",
    answer:
      "상담 문의 페이지에서 '문의하기' 버튼을 통해 내용을 작성해 주시면 담당자가 확인 후 빠르게 답변 드립니다.",
  },
  {
    question: "시공 기간은 얼마나 걸리나요?",
    answer:
      "시공 규모 및 범위에 따라 다르지만, 상담 후 현장 확인을 거쳐 일정을 확정합니다. 자세한 내용은 상담 문의를 통해 확인해 주세요.",
  },
  {
    question: "견적은 어떻게 받을 수 있나요?",
    answer:
      "상담 문의 페이지에서 원하시는 내용을 작성해 주시면 무료로 견적을 안내해 드립니다. 현장 상황에 따라 방문 견적도 진행됩니다.",
  },
  {
    question: "시공 후 AS는 어떻게 되나요?",
    answer:
      "시공 완료 후에도 불편하신 사항이 있으시면 상담 문의로 접수해 주시면 신속하게 처리해 드립니다.",
  },
  {
    question: "서비스 가능 지역이 어떻게 되나요?",
    answer:
      "현재 서비스 가능 지역은 상담을 통해 확인하실 수 있습니다. 상담 문의로 지역을 남겨 주시면 안내해 드리겠습니다.",
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq">
      {/* 배너 섹션 */}
      <section className="faq__banner">
        <div className="faq__breadcrumb">
          <Link to="/" className="faq__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="faq__breadcrumb-icon" />
          </Link>
          <span className="faq__breadcrumb-separator">&gt;</span>
          <span className="faq__breadcrumb-text">문의</span>
          <span className="faq__breadcrumb-separator">&gt;</span>
          <span className="faq__breadcrumb-current">많이 묻는 질문</span>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <section className="faq__main">
        <div className="faq__content">
          <h1 className="faq__title">많이 묻는 질문</h1>
          <ul className="faq__list">
            {FAQ_DATA.map((item, index) => (
              <li
                key={index}
                className={`faq__item ${openIndex === index ? "faq__item--open" : ""}`}
              >
                <button
                  className="faq__question"
                  onClick={() => toggle(index)}
                >
                  <span className="faq__question-text">Q. {item.question}</span>
                  <svg
                    className="faq__icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="faq__answer">
                  <p>A. {item.answer}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Faq;
