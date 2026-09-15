import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import ConfirmModal from "../components/ConfirmModal";
import PrivacyModal from "../components/PrivacyModal";
import Icon from "../components/Icon";
import useReveal from "../hooks/useReveal";
import { getErrorMessage } from "../utils/errorMessage";
import "./Home.css";

// 섹션 2 — 방역 과정 사진
import process1 from "../assets/section2-gallery/gallery1-item1.webp";
import process2 from "../assets/section2-gallery/gallery1-item2.webp";
import process3 from "../assets/section2-gallery/gallery1-item3.webp";
import process4 from "../assets/section2-gallery/gallery1-item4.webp";

// 섹션 3 — 시설 유형 일러스트
import homeIcon from "../assets/section3-icon/icon-01-home.svg";
import restaurantIcon from "../assets/section3-icon/icon-02-restaurant.svg";
import officeIcon from "../assets/section3-icon/icon-03-office.svg";
import transportIcon from "../assets/section3-icon/icon-04-transport.svg";
import schoolIcon from "../assets/section3-icon/icon-05-school.svg";
import industryIcon from "../assets/section3-icon/icon-06-industry.svg";
import hotelIcon from "../assets/section3-icon/icon-07-hotel.svg";
import medicalIcon from "../assets/section3-icon/icon-08-medical.svg";
import cultureIcon from "../assets/section3-icon/icon-09-culture.svg";

// 섹션 5 — 해충 라이브러리 사진
import pestAnt from "../assets/section5-bugs/pharaoh-ant.webp";
import pestRat from "../assets/section5-bugs/rat.webp";
import pestFly from "../assets/section5-bugs/housefly.webp";
import pestRoach from "../assets/section5-bugs/german-cockroach.webp";
import pestMoth from "../assets/section5-bugs/moth.webp";
import pestCentipede from "../assets/section5-bugs/centipede.webp";
import pestMosquito from "../assets/section5-bugs/mosquito.webp";
import pestCricket from "../assets/section5-bugs/camel-cricket.webp";
import pestMidge from "../assets/section5-bugs/midge.webp";

// 섹션 6 — 이스터 에그 진입점 캐릭터
import mascot from "../assets/section6-banner/section6-pest.webp";

const API_BASE_URL = "/api";
const KAKAO_CHAT_URL = "https://open.kakao.com/o/sYCdK5og";

/* -------------------------------------------------------------------------
   정적 데이터 — 컴포넌트 밖에 두어 렌더마다 새 배열을 만들지 않는다.
   ------------------------------------------------------------------------- */

// 섹션 2 — 2~3개월에 걸친 방제 사이클
const PROCESS_STEPS = [
  {
    no: "01",
    src: process1,
    title: "해충 종류와 서식 환경 분석",
    desc: "시설을 진단하고 서식하는 해충의 종류를 파악한 뒤, 필요한 약제와 방제 공법을 선택합니다.",
  },
  {
    no: "02",
    src: process2,
    title: "초기 집중 방제",
    desc: "선별된 공법과 약제를 적용해 해충 성충·유충의 약 50%를 1차로 제거합니다.",
  },
  {
    no: "03",
    src: process3,
    title: "남아 있는 해충 추가 제거",
    desc: "1차 퇴치 후 남은 해충 중 성충·유충의 약 40%를 추가로 제거합니다.",
  },
  {
    no: "04",
    src: process4,
    title: "재발 방지 시스템 관리",
    desc: "초기 관리 이후 정기 점검을 통해 외부 유입을 차단하고 재서식을 예방합니다.",
  },
];

// 섹션 3 — 방역 대상 시설
const FIELDS = [
  { icon: homeIcon, label: "가정집" },
  { icon: restaurantIcon, label: "외식 업장" },
  { icon: officeIcon, label: "사무실" },
  { icon: transportIcon, label: "교통 시설" },
  { icon: schoolIcon, label: "교육 시설" },
  { icon: industryIcon, label: "산업 시설" },
  { icon: hotelIcon, label: "호텔" },
  { icon: medicalIcon, label: "의료 시설" },
  { icon: cultureIcon, label: "문화 시설" },
];

// 섹션 4 — 프르조의 약속
const PROMISES = [
  {
    icon: "chat",
    title: "무료 상담",
    desc: "전문가와 직접 상담하며 상황에 맞는 방역 방향을 무료로 안내받으세요.",
  },
  {
    icon: "leaf",
    title: "안전 인증 약품 사용",
    desc: "사람과 반려동물 모두 안심할 수 있는 안전 인증 약품만을 사용합니다.",
  },
  {
    icon: "inspect",
    title: "무료 방문 점검",
    desc: "전문 인력이 직접 방문하여 꼼꼼히 점검하고 무료로 진단해 드립니다.",
  },
  {
    icon: "refresh",
    title: "사후 관리 · 보증제",
    desc: "시공 후에도 정기 점검을 실시하며 무상 보증 서비스를 제공합니다.",
  },
];

// 섹션 5 — 해충 라이브러리 (집파리부터 시작)
const PEST_LIBRARY = [
  {
    id: 1,
    name: "집파리",
    engName: "Housefly",
    src: pestFly,
    desc: "집파릿과의 곤충으로, 몸은 검은 갈색이며 주로 여름에 번식하여 집 안에 모여듭니다. 유충은 쓰레기, 퇴비, 가축 분뇨 따위의 부패물에 자라고 성충은 반찬, 우유, 당분이 많은 음식물을 먹고 삽니다. 세균을 운반하여 식품을 오염시켜 전염병을 옮깁니다.",
  },
  {
    id: 2,
    name: "바퀴벌레",
    engName: "Cockroach",
    src: pestRoach,
    desc: "바퀴벌레는 따뜻하고 습한 환경을 좋아하는 대표적인 위생 해충입니다. 주로 주방, 욕실, 하수구, 배관 주변 등에 서식하며 야간에 활동하고 음식물 냄새를 따라 실내로 유입됩니다. 각종 세균을 옮기고 불쾌감과 위생 문제를 유발합니다.",
  },
  {
    id: 3,
    name: "나방",
    engName: "Moth",
    src: pestMoth,
    desc: "나방은 옷장, 식품 보관 공간 등에서 자주 발견됩니다. 유충이 의류나 곡물류를 손상시켜 재산 피해를 유발할 수 있습니다. 습기와 어두운 공간을 좋아해 관리가 중요합니다.",
  },
  {
    id: 4,
    name: "지네",
    engName: "Centipede",
    src: pestCentipede,
    desc: "지네는 습하고 어두운 환경에서 서식하는 절지동물입니다. 독성을 가진 종도 있어 물릴 경우 통증과 부종을 유발할 수 있습니다. 배수구, 욕실, 지하 공간에서 자주 발견됩니다.",
  },
  {
    id: 5,
    name: "꼽등이",
    engName: "Camel cricket",
    src: pestCricket,
    desc: "꼽등이는 습하고 어두운 환경을 좋아하는 야행성 곤충입니다. 주로 지하, 하수구, 욕실, 창고 등에서 서식하며 여름철에 실내로 유입되는 경우가 많습니다. 사람을 직접 해치지는 않지만 외형과 갑작스러운 출현으로 큰 불쾌감과 공포감을 유발합니다.",
  },
  {
    id: 6,
    name: "깔따구",
    engName: "Chironomidae",
    src: pestMidge,
    desc: "깔따구는 작은 날벌레로 주로 습한 환경과 하수구 주변에서 발생합니다. 사람을 물지는 않지만 대량 발생 시 실내로 유입되어 불쾌감을 유발합니다. 배수구, 화분 흙, 물이 고인 공간에서 번식하며 위생 관리가 필요합니다.",
  },
  {
    id: 7,
    name: "모기",
    engName: "Mosquito",
    src: pestMosquito,
    desc: "모기는 흡혈성 해충으로 여름철에 급격히 번식합니다. 사람의 피를 빨아 가려움과 염증을 유발하며, 각종 질병을 옮길 수 있습니다. 고인 물과 습한 환경에서 서식하므로 지속적인 관리가 필요합니다.",
  },
  {
    id: 8,
    name: "애집개미",
    engName: "Monomorium pharaonis",
    src: pestAnt,
    desc: "애집개미는 실내에서 자주 발견되는 소형 개미로 주방과 거실을 중심으로 서식합니다. 음식물 찌꺼기와 당분을 따라 무리를 지어 이동하며 빠르게 번식합니다. 식품을 오염시키고 틈새에 둥지를 형성해 위생 문제를 일으킬 수 있어 관리가 필요합니다.",
  },
  {
    id: 9,
    name: "시궁쥐",
    engName: "Rattus norvegicus",
    src: pestRat,
    desc: "시궁쥐는 하수구와 건물 내부를 오가며 서식하는 대표적인 위생 해충입니다. 음식물과 쓰레기를 먹고 살며 각종 세균과 질병을 옮길 위험이 높습니다. 전선, 배관 등을 갉아 시설 피해를 유발할 수 있어 조기 방제와 지속 관리가 필요합니다.",
  },
];

const MAX_FILES = 5;

// 전화번호 포맷팅 (서울 02 지역번호 / 10자리 / 11자리)
const formatPhoneNumber = (value) => {
  const numbers = value.replace(/[^\d]/g, "");

  if (numbers.startsWith("02")) {
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    if (numbers.length <= 9) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
    }
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  }

  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  }
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

const Home = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);

  // 섹션 5 — 해충 라이브러리
  const [pestIndex, setPestIndex] = useState(0);
  const [isBlurred, setIsBlurred] = useState(true);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // 섹션 7 — 문의 폼
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    phone: "",
    title: "",
    content: "",
  });
  const [attachments, setAttachments] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ name: "", phone: "", title: "", content: "" });
  const [captchaSiteKey, setCaptchaSiteKey] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  useReveal();

  useEffect(() => {
    fetch("/api/config/turnstile-site-key")
      .then((r) => r.json())
      .then((d) => setCaptchaSiteKey(d.siteKey || ""))
      .catch(() => {
        // 사이트 키를 못 받으면 CAPTCHA 없이 진행한다. 서버가 최종 검증하므로
        // 여기서 막을 필요가 없고, 첫 화면에 오류를 띄울 이유도 없다.
      });
  }, []);

  /* --- 섹션 5 --------------------------------------------------------- */

  const activePest = PEST_LIBRARY[pestIndex];

  const goPrev = () => setPestIndex((i) => (i === 0 ? PEST_LIBRARY.length - 1 : i - 1));
  const goNext = () => setPestIndex((i) => (i === PEST_LIBRARY.length - 1 ? 0 : i + 1));

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  // touchmove 로 preventDefault 하지 않는다. 세로 스크롤을 가로채지 않으려는
  // 의도이고, 끝점만 비교해도 스와이프 판정에는 충분하다.
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  /* --- 섹션 7 --------------------------------------------------------- */

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const oversized = files.find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) {
      setFileError(`"${oversized.name}" 파일 용량은 10MB를 초과할 수 없습니다.`);
      e.target.value = "";
      return;
    }
    setAttachments((prev) => {
      const existing = prev.map((f) => f.name);
      const newFiles = files.filter((f) => !existing.includes(f.name));
      const merged = [...prev, ...newFiles];
      if (merged.length > MAX_FILES) {
        setFileError(`파일은 최대 ${MAX_FILES}개까지 첨부할 수 있습니다.`);
        return prev;
      }
      setFileError("");
      return merged;
    });
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phone" ? formatPhoneNumber(value) : value,
    }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.name.trim()) errors.name = "이름을 입력해주세요.";
    if (!formData.phone.trim()) errors.phone = "전화번호를 입력해주세요.";
    if (!formData.title.trim()) errors.title = "제목을 입력해주세요.";
    if (!formData.content.trim()) errors.content = "문의 내용을 입력해주세요.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = ["name", "phone", "title", "content"].find((k) => errors[k]);
      const refMap = { name: nameRef, phone: phoneRef, title: titleRef, content: contentRef };
      const firstRef = refMap[firstKey];
      if (firstRef?.current) {
        firstRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        firstRef.current.focus({ preventScroll: true });
      }
      return;
    }

    if (captchaSiteKey && !captchaToken) {
      setModal({
        title: "보안 확인을 완료해주세요.",
        subtitle: "잠시 후 자동으로 완료됩니다. 완료 후 다시 시도해주세요.",
        buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }],
      });
      return;
    }

    if (!privacyAgreed) {
      setModal({
        title: "개인정보 수집 및 이용에 동의해주세요.",
        buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }],
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("companyName", formData.companyName);
      submitData.append("phone", formData.phone);
      submitData.append("password", formData.phone.replace(/\D/g, "").slice(-4));
      submitData.append("title", formData.title);
      submitData.append("content", formData.content);
      attachments.forEach((file) => submitData.append("attachments", file));
      if (captchaToken) submitData.append("captchaToken", captchaToken);

      const response = await fetch(`${API_BASE_URL}/inquiries`, {
        method: "POST",
        body: submitData,
      });

      if (response.ok) {
        setFormData({ name: "", companyName: "", phone: "", title: "", content: "" });
        setAttachments([]);
        setCaptchaToken(null);
        captchaRef.current?.reset();
        setModal({
          title: "문의가 성공적으로 등록되었습니다.",
          buttons: [
            {
              label: "확인",
              variant: "confirm",
              onClick: () => {
                setModal(null);
                navigate("/qna");
              },
            },
          ],
        });
      } else {
        setCaptchaToken(null);
        captchaRef.current?.reset();
        setModal({
          title: "문의 등록에 실패했습니다. 다시 시도해주세요.",
          buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }],
        });
      }
    } catch (error) {
      console.error("문의 등록 오류:", error);
      setModal({
        title: "문의 등록 중 오류가 발생했습니다.",
        subtitle: getErrorMessage(error),
        buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {privacyModalOpen && <PrivacyModal onClose={() => setPrivacyModalOpen(false)} />}
      {modal && (
        <ConfirmModal
          title={modal.title}
          subtitle={modal.subtitle}
          onClose={() => setModal(null)}
          buttons={modal.buttons}
        />
      )}

      <div className="home">
        {/* ================= 1. 히어로 ================= */}
        <section className="home__section home__section--1">
          <div className="home__content">
            <div className="home__section1-wrapper">
              <p className="home__section1-subtitle reveal">인천·경기 방역 · 해충 방제 전문</p>
              <h1 className="home__section1-title reveal" style={{ "--reveal-delay": "0.1s" }}>
                당신의 소중한 공간을
                <br />
                안전하게 지켜드립니다
              </h1>
              <p className="home__section1-lead reveal" style={{ "--reveal-delay": "0.2s" }}>
                현장 진단부터 시공, 사후 관리까지.{" "}
                <br className="home__section1-lead-br" />
                공간에 맞는 방법으로 원인을 잡습니다.
              </p>

              {/*
                reveal 을 이 줄(컨테이너)이 아니라 버튼 각각에 건다.
                opacity < 1 인 조상은 backdrop-filter 의 backdrop root 가 되어
                자식의 블러를 무력화하므로, 컨테이너를 페이드시키면 전화 버튼의
                간유리 배경이 페이드가 끝날 때까지 사라진다.
              */}
              <div className="home__section1-actions">
                <a href="#contact" className="home__section1-btn reveal" style={{ "--reveal-delay": "0.3s" }}>
                  무료 상담 문의
                  <Icon name="arrow-right" size={18} strokeWidth={1.8} />
                </a>
                <a
                  href="tel:16702335"
                  className="home__section1-tel reveal"
                  style={{ "--reveal-delay": "0.3s" }}
                >
                  <Icon name="phone" size={18} />
                  1670-2335
                </a>
              </div>

              {/* 상담 전 고객이 가장 궁금해하는 3가지를 미리 못박아 둔다 */}
              <ul className="home__section1-trust reveal" style={{ "--reveal-delay": "0.4s" }}>
                <li>무료 방문 점검</li>
                <li>안전 인증 약품</li>
                <li>사후 관리 · 보증</li>
              </ul>
            </div>
          </div>

          <div className="home__section1-scroll-hint" aria-hidden="true">
            <Icon name="arrow-down" size={26} className="home__section1-scroll-hint__icon" />
            <span className="home__section1-scroll-hint__text">SCROLL</span>
          </div>
        </section>

        {/* ================= 2. 방역 과정 ================= */}
        <section className="home__process u-section" aria-labelledby="home-process-title">
          <div className="u-container">
            <div className="section-head section-head--center">
              <p className="section-head__eyebrow">Process</p>
              <h2 className="section-head__title" id="home-process-title">
                체계적으로 진행되는 단계별 방역 과정
              </h2>
              <p className="section-head__desc">
                <span className="home__lede-more">
                  2~3개월간 진행되는 이 관리 기간은 단순한 해충 제거를 넘어, 서식과 발생 원인을
                  근본적으로 억제하고{" "}
                </span>
                단계별 방역 과정을 통해 남은 해충까지 점진적으로 퇴치하여 공간을 안전하게 유지하는
                종합적인 과정입니다.
              </p>
            </div>

            <ol className="home__process-list">
              {PROCESS_STEPS.map((step, i) => (
                <li
                  key={step.no}
                  className="home__process-step reveal"
                  style={{ "--reveal-delay": `${i * 0.08}s` }}
                >
                  <div className="home__process-figure">
                    <img src={step.src} alt={step.title} loading="lazy" decoding="async" />
                  </div>
                  {/* 번호 옆 가로선이 다음 카드의 번호까지 이어져 '과정'으로 읽힌다 */}
                  <div className="home__process-mark">
                    <span className="home__process-no">{step.no}</span>
                    <span className="home__process-rail" aria-hidden="true" />
                  </div>
                  <h3 className="home__process-title">{step.title}</h3>
                  <p className="home__process-desc">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ================= 3. 방역 대상 시설 ================= */}
        <section className="home__fields u-section" aria-labelledby="home-fields-title">
          <div className="u-container">
            <div className="home__fields-layout">
              <div className="home__fields-intro reveal">
                <p className="section-head__eyebrow">Coverage</p>
                <h2 className="home__fields-title" id="home-fields-title">
                  <em>생활</em>과 <em>일터</em>를 지키는
                  <br />
                  맞춤형 방역 솔루션
                </h2>
                <p className="home__fields-desc">
                  <span className="home__lede-more">
                    사람이 생활하고 일하는 모든 공간은 보이지 않는 해충과 세균의 위협에 노출되어
                    있습니다.{" "}
                  </span>
                  쾌적하고 안전한 환경을 위해서는 단순한 청소를 넘어선 전문적인 방역 관리가
                  필요합니다.
                </p>
                <button
                  type="button"
                  className="btn btn--primary btn--arrow home__fields-btn"
                  onClick={() => navigate("/reviews")}
                >
                  시공 사례 보기
                  <span className="btn__icon">
                    <Icon name="arrow-right" size={18} />
                  </span>
                </button>
              </div>

              <ul className="home__fields-grid">
                {FIELDS.map((field, i) => (
                  <li
                    key={field.label}
                    className="home__fields-item reveal"
                    style={{ "--reveal-delay": `${0.05 + i * 0.04}s` }}
                  >
                    <img src={field.icon} alt="" loading="lazy" decoding="async" />
                    <span>{field.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= 4. 프르조의 약속 ================= */}
        <section
          className="home__promise on-inverse u-section"
          aria-labelledby="home-promise-title"
        >
          <div className="u-container">
            <div className="section-head home__promise-head">
              <p className="section-head__eyebrow">Our Promise</p>
              <h2 className="section-head__title" id="home-promise-title">
                신뢰와 전문성을 담은 프르조만의 약속
              </h2>
              <p className="section-head__desc">
                시공 한 번으로 끝내지 않습니다. 상담부터 사후 관리까지 네 가지를 약속드립니다.
              </p>
            </div>

            <ul className="home__promise-grid">
              {PROMISES.map((item, i) => (
                <li
                  key={item.title}
                  className="home__promise-card reveal"
                  style={{ "--reveal-delay": `${i * 0.08}s` }}
                >
                  <span className="home__promise-icon">
                    <Icon name={item.icon} size={22} />
                  </span>
                  <span className="home__promise-no">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="home__promise-title">{item.title}</h3>
                  <p className="home__promise-desc">{item.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ================= 5. 해충 라이브러리 ================= */}
        <section className="home__pest u-section" aria-labelledby="home-pest-title">
          <div className="u-container">
            <div className="home__pest-head reveal">
              <div className="section-head home__pest-head-text">
                <p className="section-head__eyebrow">Pest Library</p>
                <h2 className="section-head__title" id="home-pest-title">
                  해충 라이브러리
                </h2>
                <p className="section-head__desc">
                  집과 공간을 위협하는 해충 정보를 쉽게 찾아보세요.
                </p>
              </div>

              {/* 사진을 보기 힘들어하는 방문자를 위해 기본값은 '흐리게' 다 */}
              <label className="home__pest-blur">
                <input
                  type="checkbox"
                  checked={isBlurred}
                  onChange={(e) => setIsBlurred(e.target.checked)}
                />
                <span className="home__pest-blur__track" aria-hidden="true" />
                <span className="home__pest-blur__label">해충 사진 흐리게</span>
              </label>
            </div>

            <div className="home__pest-panel reveal" style={{ "--reveal-delay": "0.1s" }}>
              <div
                className="home__pest-figure"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* 모자이크는 img 가 아니라 이 레이어에 건다. 이유는 Home.css 참고. */}
                <div className={`home__pest-shot${isBlurred ? " is-blurred" : ""}`}>
                  {/* key 를 바꿔 이미지를 새로 마운트시키면 CSS 로 크로스페이드가 걸린다.
                      alt 는 비워 둔다 — 바로 옆 제목이 같은 정보를 이미 읽어 준다. */}
                  <img
                    key={activePest.id}
                    src={activePest.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span className="home__pest-count">
                  {pestIndex + 1} <i>/</i> {PEST_LIBRARY.length}
                </span>
              </div>

              <div className="home__pest-body">
                <p className="home__pest-eng">{activePest.engName}</p>
                <h3 className="home__pest-name">{activePest.name}</h3>
                <p className="home__pest-desc">{activePest.desc}</p>

                <div className="home__pest-nav">
                  <button type="button" onClick={goPrev} aria-label="이전 해충 보기">
                    <Icon name="chevron-left" size={20} />
                  </button>
                  <button type="button" onClick={goNext} aria-label="다음 해충 보기">
                    <Icon name="chevron-right" size={20} />
                  </button>
                </div>
              </div>
            </div>

            <ul className="home__pest-thumbs reveal" style={{ "--reveal-delay": "0.16s" }}>
              {PEST_LIBRARY.map((pest, i) => (
                <li key={pest.id}>
                  <button
                    type="button"
                    className="home__pest-thumb"
                    aria-current={i === pestIndex ? "true" : undefined}
                    onClick={() => setPestIndex(i)}
                  >
                    {/* 사진 경로를 background-image 가 아니라 변수로 넘긴다.
                        모자이크 상태에서 부모의 선명한 배경을 꺼야 하는데,
                        가상 요소가 inherit 로 물려받으면 같이 꺼지기 때문이다. */}
                    <span
                      className={`home__pest-thumb-img${isBlurred ? " is-blurred" : ""}`}
                      style={{ "--thumb": `url(${pest.src})` }}
                    />
                    <span className="home__pest-thumb-name">{pest.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ================= 6. 브랜드 배너 ================= */}
        <section className="home__cta" aria-labelledby="home-cta-title">
          <div className="u-container">
            <div className="home__cta-inner">
              <div className="home__cta-text reveal">
                <h2 className="home__cta-title" id="home-cta-title">
                  프르조와 함께 소중한 공간을
                  <br /> 안전하게 이어가세요.
                </h2>
                <p className="home__cta-desc">작은 공간까지 세심하게 지켜드립니다.</p>
              </div>

              {/* 이스터 에그 진입점. 내비게이션에는 없는 /pest 로만 이어진다.
                  겉보기는 그림 그대로이고, 마우스를 올리면 옅게 빛난다. */}
              <Link
                to="/pest"
                className="home__cta-mascot reveal"
                style={{ "--reveal-delay": "0.15s" }}
                aria-label="해충 방제 캐릭터를 3D로 살펴보기"
              >
                <img src={mascot} alt="" loading="lazy" decoding="async" />
              </Link>
            </div>
          </div>
        </section>

        {/* ================= 7. 문의 ================= */}
        <section className="home__contact u-section" id="contact" aria-labelledby="home-contact-title">
          <div className="u-container">
            <div className="home__contact-layout">
              <div className="home__contact-intro reveal">
                <p className="section-head__eyebrow">Contact</p>
                <h2 className="home__contact-title" id="home-contact-title">
                  프르조에 무료로
                  <br />
                  문의해 보세요
                </h2>
                <p className="home__contact-desc">
                  보다 안전하고 효과적인 방역 솔루션이 필요하신가요?{" "}
                  <span className="home__lede-more">
                    공간의 유형과 상황에 맞춘 맞춤형 진단과 시공 방안을 안내해 드립니다.{" "}
                  </span>
                  아래 정보를 남겨주시면 전문 상담원이 빠르게 연락드리겠습니다.
                </p>

                <ul className="home__contact-channels">
                  <li>
                    <a href="tel:16702335" className="home__contact-channel">
                      <span className="home__contact-channel__icon">
                        <Icon name="phone" size={22} />
                      </span>
                      <span className="home__contact-channel__body">
                        <span className="home__contact-channel__label">전화 상담</span>
                        <strong className="home__contact-channel__value">1670-2335</strong>
                      </span>
                      <Icon name="chevron-right" size={18} className="home__contact-channel__go" />
                    </a>
                  </li>
                  <li>
                    <a
                      href={KAKAO_CHAT_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="home__contact-channel"
                    >
                      <span className="home__contact-channel__icon home__contact-channel__icon--kakao">
                        <Icon name="kakao" size={22} />
                      </span>
                      <span className="home__contact-channel__body">
                        <span className="home__contact-channel__label">카카오톡 오픈채팅</span>
                        <strong className="home__contact-channel__value">‘프르조’ 검색</strong>
                      </span>
                      <Icon name="external" size={18} className="home__contact-channel__go" />
                    </a>
                  </li>
                </ul>
              </div>

              <div className="home__contact-form-wrap reveal" style={{ "--reveal-delay": "0.12s" }}>
                <form className="home__form" onSubmit={handleFormSubmit} noValidate>
                  <div className="home__form-row">
                    <div className="field">
                      <label className="field__label" htmlFor="home-name">
                        이름 <span className="field__required">*</span>
                      </label>
                      <input
                        id="home-name"
                        className={`input${fieldErrors.name ? " input--error" : ""}`}
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        ref={nameRef}
                        placeholder="홍길동"
                        maxLength={20}
                        autoComplete="name"
                      />
                      <div className="field__foot">
                        {fieldErrors.name && <p className="field__error">{fieldErrors.name}</p>}
                        <span className="field__count">{formData.name.length}/20</span>
                      </div>
                    </div>

                    {/* 필수 입력인 전화번호를 윗줄에 두고, 선택 항목인
                        업체명 / 주소를 아래로 내렸다 (문의 작성 페이지와 동일) */}
                    <div className="field">
                      <label className="field__label" htmlFor="home-phone">
                        전화번호 <span className="field__required">*</span>
                      </label>
                      <input
                        id="home-phone"
                        className={`input${fieldErrors.phone ? " input--error" : ""}`}
                        type="tel"
                        inputMode="numeric"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        ref={phoneRef}
                        placeholder="010-1234-5678"
                        maxLength={13}
                        autoComplete="tel"
                      />
                      <div className="field__foot">
                        {fieldErrors.phone ? (
                          <p className="field__error">{fieldErrors.phone}</p>
                        ) : (
                          <p className="field__hint">
                            전화번호 뒤 4자리가 게시글 비밀번호로 자동 설정됩니다.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="home-company">
                      업체명 / 주소 <span className="field__optional">(선택)</span>
                    </label>
                    <input
                      id="home-company"
                      className="input"
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleFormChange}
                      placeholder="프르조"
                      maxLength={100}
                    />
                    <div className="field__foot">
                      <p className="field__hint">
                        방문이 필요한 경우 대략적인 위치를 알려주세요.
                      </p>
                    </div>
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="home-title">
                      제목 <span className="field__required">*</span>
                    </label>
                    <input
                      id="home-title"
                      className={`input${fieldErrors.title ? " input--error" : ""}`}
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      ref={titleRef}
                      placeholder="30평 가정집 견적 문의 드립니다."
                      maxLength={100}
                    />
                    <div className="field__foot">
                      {fieldErrors.title && <p className="field__error">{fieldErrors.title}</p>}
                      <span className="field__count">{formData.title.length}/100</span>
                    </div>
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="home-content">
                      문의 내용 <span className="field__required">*</span>
                    </label>
                    <textarea
                      id="home-content"
                      className={`textarea${fieldErrors.content ? " textarea--error" : ""}`}
                      name="content"
                      value={formData.content}
                      onChange={handleFormChange}
                      ref={contentRef}
                      placeholder="해충방제 정기 관리를 신청하면 매월 얼마의 비용이 드나요?"
                      rows="5"
                      maxLength={2000}
                    />
                    <div className="field__foot">
                      {fieldErrors.content && <p className="field__error">{fieldErrors.content}</p>}
                      <span className="field__count">{formData.content.length}/2000</span>
                    </div>
                  </div>

                  <div className="field">
                    <span className="field__label">
                      첨부파일 <span className="field__optional">(선택)</span>
                    </span>
                    <div className="home__file">
                      <input type="file" id="contactFile" multiple onChange={handleFileChange} />
                      <label htmlFor="contactFile" className="home__file-drop">
                        <Icon name="paperclip" size={18} />
                        <span>파일 선택 · 최대 {MAX_FILES}개, 파일당 10MB</span>
                      </label>
                    </div>
                    {attachments.length > 0 && (
                      <ul className="home__file-list">
                        {attachments.map((file, i) => (
                          <li key={file.name} className="home__file-item">
                            <Icon name="image" size={16} />
                            <span className="home__file-name">{file.name}</span>
                            <button
                              type="button"
                              className="home__file-remove"
                              onClick={() => removeAttachment(i)}
                              aria-label={`${file.name} 첨부 취소`}
                            >
                              <Icon name="close" size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {fileError && <p className="field__error">{fileError}</p>}
                  </div>

                  <div className="home__agree">
                    <label className="home__agree-label">
                      <input
                        type="checkbox"
                        checked={privacyAgreed}
                        onChange={(e) => setPrivacyAgreed(e.target.checked)}
                      />
                      <span>
                        <strong>개인정보 수집 및 이용</strong>에 동의합니다.
                        <span className="home__agree-required">(필수)</span>
                      </span>
                    </label>
                    <button
                      type="button"
                      className="home__agree-view"
                      onClick={() => setPrivacyModalOpen(true)}
                    >
                      내용 보기
                    </button>
                  </div>

                  {captchaSiteKey && (
                    <div className="home__captcha">
                      <Turnstile
                        ref={captchaRef}
                        siteKey={captchaSiteKey}
                        onSuccess={(token) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken(null)}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn--primary btn--lg btn--block home__submit"
                    disabled={isSubmitting}
                  >
                    <span className="btn__icon">
                      <Icon name="send" size={18} />
                    </span>
                    {isSubmitting ? "등록 중..." : "문의 보내기"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
