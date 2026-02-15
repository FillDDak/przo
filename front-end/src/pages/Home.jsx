import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import home_banner from "../assets/image/home_banner.png";

// 섹션 2 갤러리 이미지
import gallery1_1 from "../assets/section2-gallery/gallery1-item1.png";
import gallery1_2 from "../assets/section2-gallery/gallery1-item2.png";
import gallery1_3 from "../assets/section2-gallery/gallery1-item3.png";
import gallery1_4 from "../assets/section2-gallery/gallery1-item4.png";

// 섹션 3 아이콘
import homeIcon from "../assets/section3-icon/icon-01-home.svg";
import restaurantIcon from "../assets/section3-icon/icon-02-restaurant.svg";
import officeIcon from "../assets/section3-icon/icon-03-office.svg";
import transportIcon from "../assets/section3-icon/icon-04-transport.svg";
import schoolIcon from "../assets/section3-icon/icon-05-school.svg";
import industryIcon from "../assets/section3-icon/icon-06-industry.svg";
import hotelIcon from "../assets/section3-icon/icon-07-hotel.svg";
import medicalIcon from "../assets/section3-icon/icon-08-medical.svg";
import cultureIcon from "../assets/section3-icon/icon-09-culture.svg";

// 섹션 4 갤러리 이미지
import gallery2_1 from "../assets/section4-gallery/gallery2-item1.png";
import gallery2_2 from "../assets/section4-gallery/gallery2-item2.png";
import gallery2_3 from "../assets/section4-gallery/gallery2-item3.png";
import gallery2_4 from "../assets/section4-gallery/gallery2-item4.png";

// 섹션 5 해충 이미지
import pestAnt from "../assets/section5-bugs/pharaoh-ant.webp";
import pestRat from "../assets/section5-bugs/rat.jpg";
import pestFly from "../assets/section5-bugs/housefly.jpg";
import pestRoach from "../assets/section5-bugs/german-cockroach.jpg";
import pestMoth from "../assets/section5-bugs/moth.jpg";
import pestCentipede from "../assets/section5-bugs/centipede.webp";
import pestMosquito from "../assets/section5-bugs/mosquito.jpg";
import pestCricket from "../assets/section5-bugs/camel-cricket.webp";
import pestMidge from "../assets/section5-bugs/midge.jpg";

// 섹션 6 배너 이미지
import section6Banner from "../assets/section6-banner/section6-banner.png";
import section6Pest from "../assets/section6-banner/section6-pest.png";

// 섹션 7 아이콘
import kakaoIcon from "../assets/section7-icon/section7-icon-kakao.svg";
import telIcon from "../assets/section7-icon/section7-icon-tel.svg";
import fileIcon from "../assets/section7-icon/section7-icon-file.svg";
import arrowIcon from "../assets/section7-icon/section7-icon-arrow.svg";

const API_BASE_URL = "http://localhost:8080/api";

const truncateFileName = (name, maxLength = 35) => {
  if (!name || name.length <= maxLength) return name;
  const ext = name.lastIndexOf('.') !== -1 ? name.slice(name.lastIndexOf('.')) : '';
  const nameOnly = name.slice(0, name.length - ext.length);
  const truncLength = maxLength - ext.length - 3;
  return truncLength > 0 ? nameOnly.slice(0, truncLength) + '...' + ext : name.slice(0, maxLength - 3) + '...';
};

const Home = () => {
  const navigate = useNavigate();
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [pestIndex, setPestIndex] = useState(0);
  const [isMosaic, setIsMosaic] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const cardsWrapperRef = useRef(null);

  // 섹션 7 폼 상태
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    password: "",
    title: "",
    content: "",
  });
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAttachment(file);
  };

  // 전화번호 포맷팅 함수 (10자리, 11자리 지원)
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '');

    // 서울 지역번호 (02)
    if (numbers.startsWith('02')) {
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 6) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
      } else {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
      }
    }

    // 휴대폰 및 기타 지역번호 (3자리)
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length === 10) {
      // 10자리: XXX-XXX-XXXX
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    } else {
      // 11자리: XXX-XXXX-XXXX
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      setFormData((prev) => ({
        ...prev,
        [name]: formatPhoneNumber(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!formData.phone.trim()) {
      alert("전화번호를 입력해주세요.");
      return;
    }
    if (!formData.email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    if (!formData.password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim()) {
      alert("문의 내용을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("companyName", formData.companyName);
      submitData.append("phone", formData.phone);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("title", formData.title);
      submitData.append("content", formData.content);
      if (attachment) {
        submitData.append("attachment", attachment);
      }

      const response = await fetch(`${API_BASE_URL}/inquiries`, {
        method: "POST",
        body: submitData,
      });

      if (response.ok) {
        alert("문의가 성공적으로 등록되었습니다.");
        // 폼 초기화
        setFormData({
          name: "",
          companyName: "",
          phone: "",
          email: "",
          password: "",
          title: "",
          content: "",
        });
        setAttachment(null);
        navigate("/qna");
      } else {
        alert("문의 등록에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("문의 등록 오류:", error);
      alert("문의 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 섹션 2 갤러리 데이터
  const galleries1 = [
    {
      id: 1,
      src: gallery1_1,
      alt: "갤러리1",
      title: <>해충 종류와 서식 환경 분석</>,
      desc: <>시설을 진단하고 서식하는 해충의 종류를 파악한 뒤,<br />필요한 약제와 방제 공법을 선택합니다.</>,
    },
    {
      id: 2,
      src: gallery1_2,
      alt: "갤러리2",
      title: <>초기 집중 방제</>,
      desc: <>선별된 공법과 약제를 적용해<br />해충 성충·유충의 약 50%를 1차로 제거합니다.</>,
    },
    {
      id: 3,
      src: gallery1_3,
      alt: "갤러리3",
      title: <>남아 있는 해충 추가 제거</>,
      desc: <>1차 퇴치 후 남은 해충 중<br />성충·유충의 약 40%를 추가로 제거합니다.</>,
    },
    {
      id: 4,
      src: gallery1_4,
      alt: "갤러리4",
      title: <>재발 방지 시스템 관리</>,
      desc: <>초기 관리 이후 정기 점검을 통해<br />외부 유입을 차단하고 재서식을 예방합니다.</>,
    },
  ];

  // 섹션 3 아이콘 버튼 데이터
  const iconButtons = [
    { id: 1, icon: homeIcon, label: "가정집" },
    { id: 2, icon: restaurantIcon, label: "외식 업장" },
    { id: 3, icon: officeIcon, label: "사무실" },
    { id: 4, icon: transportIcon, label: "교통 시설" },
    { id: 5, icon: schoolIcon, label: "교육 시설" },
    { id: 6, icon: industryIcon, label: "산업 시설" },
    { id: 7, icon: hotelIcon, label: "호텔" },
    { id: 8, icon: medicalIcon, label: "의료 시설" },
    { id: 9, icon: cultureIcon, label: "문화 시설" },
  ];

  // 섹션 5 해충 라이브러리 데이터 (집파리부터 시작)
  const pestLibrary = [
    {
      id: 1,
      name: "집파리",
      engName: "housefly",
      src: pestFly,
      desc: "집파릿과의 곤충으로, 몸은 검은 갈색이며 주로 여름에 번식하여 집 안에 모여듭니다. 유충은 쓰레기, 퇴비, 가축 분뇨 따위의 부패물에 자라고 성충은 반찬, 우유, 당분이 많은 음식물을 먹고 삽니다. 세균을 운반하여 식품을 오염시켜 전염병을 옮깁니다.",
    },
    {
      id: 2,
      name: "독일 바퀴",
      engName: "Blattella germanica",
      src: pestRoach,
      desc: "독일바퀴는 실내에서 가장 흔히 발견되는 바퀴벌레입니다. 주방과 음식물 주변을 중심으로 서식하며 각종 세균을 옮깁니다.번식력이 매우 강해 전문적인 방제가 필요합니다.",
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
      engName: "R. norvegicus",
      src: pestRat,
      desc: "시궁쥐는 하수구와 건물 내부를 오가며 서식하는 대표적인 위생 해충입니다. 음식물과 쓰레기를 먹고 살며 각종 세균과 질병을 옮길 위험이 높습니다. 전선, 배관 등을 갉아 시설 피해를 유발할 수 있어 조기 방제와 지속 관리가 필요합니다.",
    },
  ];

  const handlePestPrev = () => {
    setPestIndex((prev) => (prev === 0 ? pestLibrary.length - 1 : prev - 1));
    setIsMosaic(true);
  };

  const handlePestNext = () => {
    setPestIndex((prev) => (prev === pestLibrary.length - 1 ? 0 : prev + 1));
    setIsMosaic(true);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(false);
  };

  useEffect(() => {
    const el = cardsWrapperRef.current;
    if (!el) return;
    const onTouchMove = (e) => {
      if (touchStartX.current === null) return;
      const diffX = e.touches[0].clientX - touchStartX.current;
      const diffY = e.touches[0].clientY - touchStartY.current;
      if (Math.abs(diffX) > Math.abs(diffY)) {
        e.preventDefault();
        setIsDragging(true);
        const MAX_DRAG = 180;
        setDragOffset(Math.max(-MAX_DRAG, Math.min(MAX_DRAG, diffX * 0.75)));
      }
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) handlePestNext();
      else handlePestPrev();
    }
    setIsDragging(false);
    setDragOffset(0);
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // 섹션 5 카드 위치 계산 (반응형 카드 크기에 맞게 간격 조정)
  const getCardOffset = (position) => {
    if (position === 0) return 0;
    const sign = position > 0 ? 1 : -1;
    const absPos = Math.abs(position);
    let activeHalf, inactiveHalf, gap;
    if (windowWidth <= 480) {
      activeHalf = 150; inactiveHalf = 75; gap = 60;
    } else if (windowWidth <= 768) {
      activeHalf = 170; inactiveHalf = 100; gap = 50;
    } else if (windowWidth <= 1024) {
      activeHalf = 190; inactiveHalf = 125; gap = 20;
    } else {
      activeHalf = 225; inactiveHalf = 150; gap = 24;
    }
    const firstOffset = activeHalf + gap + inactiveHalf;
    const subsequentOffset = inactiveHalf * 2 + gap;
    if (absPos === 1) return sign * firstOffset;
    return sign * (firstOffset + (absPos - 1) * subsequentOffset);
  };

  // 순환 position 계산 (무한 루프)
  const getCircularPosition = (index, activeIndex, total) => {
    let position = index - activeIndex;
    if (position > total / 2) {
      position -= total;
    } else if (position < -total / 2) {
      position += total;
    }
    return position;
  };

  // 섹션 4 갤러리 데이터
  const galleries2 = [
    {
      id: 1,
      src: gallery2_1,
      alt: "갤러리1",
      title: "무료 상담",
      desc: "전문가와 직접 상담하며 상황에 맞는 방역 방향을 무료로 안내받으세요",
    },
    {
      id: 2,
      src: gallery2_2,
      alt: "갤러리2",
      title: "안전 인증 약품 사용",
      desc: "사람과 반려동물 모두 안심할 수 있는 안전 인증 약품만을 사용합니다",
    },
    {
      id: 3,
      src: gallery2_3,
      alt: "갤러리3",
      title: "무료 방문 점검",
      desc: "전문 인력이 직접 방문하여 꼼꼼히 점검하고 무료로 진단해드립니다",
    },
    {
      id: 4,
      src: gallery2_4,
      alt: "갤러리4",
      title: "사후 관리 & 보증제",
      desc: "시공 후에도 정기 점검을 실시하며 무상 보증 서비스를 제공합니다",
    },
  ];

  return (
    <div className="home">
      <section
        className="home__section home__section--1"
        style={{ backgroundImage: `url(${home_banner})` }}
      >
        <div className="home__content">
          <div className="home__section1-wrapper">
            <p className="home__section1-subtitle">
              방역 전문가들의 맞춤 솔루션
            </p>
            <h1 className="home__section1-title">
              당신의 소중한 공간을
              <br />
              안전하게 지켜드립니다
            </h1>
            <button className="home__section1-btn" onClick={() => setIsModalOpen(true)}>무료 상담 문의</button>
          </div>
        </div>
      </section>

      <section className="home__section home__section--2">
        <div className="home__content">
          <div className="home__section2-wrapper">
            <h2 className="home__section2-title">
              <span className="home__section2-highlight">체계적</span>으로
              <span className="home__section2-highlight"> 진행</span>되는
              <br />
              단계별 방역 과정
            </h2>
            <p className="home__section2-desc">
              2~3개월간 진행되는 이 관리 기간은 단순한 해충 제거를 넘어, 서식과
              발생 원인을 근본적으로 억제하고 단계별 방역 과정을 통해 남은
              해충까지 점진적으로 퇴치하여 공간을 안전하게 유지하는 종합적인
              과정입니다.
            </p>

            <div className="home__section2-gallery">
              {galleries1.map((item, index) => (
                <div
                  key={item.id}
                  className={`home__section2-gallery-item ${activeGalleryIndex === index ? "active" : ""}`}
                  onMouseEnter={() => setActiveGalleryIndex(index)}
                >
                  {item.src ? (
                    <img src={item.src} alt={item.alt} />
                  ) : (
                    <div className="home__section2-placeholder">{item.alt}</div>
                  )}
                  <span className="home__section2-gallery-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="home__section2-gallery-info">
                    <h3 className="home__section2-gallery-title">{item.title}</h3>
                    <p className="home__section2-gallery-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="home__section2-dots">
              {galleries2.map((_, index) => (
                <span
                  key={index}
                  className={`home__section2-dot ${activeGalleryIndex === index ? "active" : ""}`}
                  onClick={() => setActiveGalleryIndex(index)}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home__section home__section--3">
        <div className="home__content">
          <div className="home__section3-wrapper">
            <div className="home__section3-text">
              <h2 className="home__section3-title">
                <span className="home__section3-highlight">생활</span>과{" "}
                <span className="home__section3-highlight">일터</span>를 지키는
                <br />
                맞춤형 방역 솔루션
              </h2>
              <p className="home__section3-desc">
                사람이 생활하고 일하는 모든 공간은 보이지 않는 해충과 세균의
                위협에 노출되어 있습니다.
                <br />
                쾌적하고 안전한 환경을 위해서는 단순한 청소를 넘어선 전문적인
                방역 관리가 필요합니다.
              </p>
              <button className="home__section3-btn" onClick={() => navigate("/reviews")}>자세히 보기</button>
            </div>

            <div className="home__section3-icons">
              {iconButtons.map((item) => (
                <button key={item.id} className="home__section3-icon-btn">
                  <img src={item.icon} alt={item.label} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home__section home__section--4">
        <div className="home__content">
          <div className="home__section4-wrapper">
            <div className="home__section4-text">
              <h2 className="home__section4-title">
                <span className="home__section4-highlight">신뢰</span>와{" "}
                <span className="home__section4-highlight">전문성</span>을 담은
                <br />
                프르조만의 약속
              </h2>
              <p className="home__section4-desc">
                안심할 수 있는 위생 환경을
                <br />
                만들어 드립니다.
              </p>
            </div>
            <div className="home__section4-gallery">
              {galleries2.map((item, index) => (
                <div
                  key={item.id}
                  className={`home__section4-gallery-item ${index % 2 === 0 ? "home__section4-gallery-item--bottom" : "home__section4-gallery-item--top"}`}
                  style={{ backgroundImage: `url(${item.src})` }}
                >
                  <div className="home__section4-gallery-content">
                    <h3 className="home__section4-gallery-title">{item.title}</h3>
                    <p className="home__section4-gallery-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home__section home__section--5">
        <div className="home__content">
          <div className="home__section5-wrapper">
            <div className="home__section5-header">
              <h2 className="home__section5-title">해충 라이브러리</h2>
              <p className="home__section5-desc">
                집과 공간을 위협하는 해충 정보를 쉽게
                <br />
                찾아보세요
              </p>
            </div>

            <div className="home__section5-slider">
              <div ref={cardsWrapperRef} className="home__section5-cards-wrapper" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <button
                  className="home__section5-arrow home__section5-arrow--prev"
                  onClick={handlePestPrev}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div className="home__section5-cards">
                  {pestLibrary.map((pest, index) => {
                    const position = getCircularPosition(index, pestIndex, pestLibrary.length);
                    const isActive = index === pestIndex;

                    return (
                      <div
                        key={pest.id}
                        className={`home__section5-card ${isActive ? "active" : ""}`}
                        style={{
                          transform: `translate(calc(-50% + ${getCardOffset(position) + dragOffset}px), -50%) scale(${isActive ? 1 : 0.95})`,
                          transition: `transform ${isDragging ? '0.05s' : '0.4s'} ease, width 0.4s ease, height 0.4s ease, opacity 0.4s ease, box-shadow 0.4s ease`,
                          zIndex: isActive ? 10 : 5 - Math.abs(position),
                          opacity: Math.abs(position) > 3 ? 0 : 1,
                        }}
                        onClick={() => {
                          if (!isActive) {
                            setPestIndex(index);
                            setIsMosaic(true);
                          }
                        }}
                      >
                        <div className="home__section5-card-image-wrapper">
                          <div
                            className={`home__section5-card-image ${!isActive || isMosaic ? "mosaic" : ""}`}
                            style={{ backgroundImage: `url(${pest.src})` }}
                          ></div>
                        </div>
                        <div className="home__section5-card-info">
                          <div className="home__section5-card-header">
                            <h3 className="home__section5-card-name">{pest.name}</h3>
                            {isActive && (
                              <label className="home__section5-toggle" onClick={(e) => e.stopPropagation()}>
                                <span>모자이크</span>
                                <input
                                  type="checkbox"
                                  checked={isMosaic}
                                  onChange={(e) => setIsMosaic(e.target.checked)}
                                />
                                <span className="home__section5-toggle-slider"></span>
                              </label>
                            )}
                          </div>
                          <p className="home__section5-card-eng">{pest.engName}</p>
                          {isActive && (
                            <div className="home__section5-card-details">
                              <p className="home__section5-card-desc">{pest.desc}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  className="home__section5-arrow home__section5-arrow--next"
                  onClick={handlePestNext}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="home__section home__section--6"
        style={{ backgroundImage: `url(${section6Banner})` }}
      >
        <div className="home__content">
          <div className="home__section6-wrapper">
            <div className="home__section6-text">
              <h2 className="home__section6-title">
                프르조와 함께 소중한 공간을<br className="home__section6-title-br" /> 안전하게 이어가세요.
              </h2>
              <p className="home__section6-desc">
                작은 공간까지 세심하게 지켜드립니다.
              </p>
            </div>
            <img
              src={section6Pest}
              alt="해충 방제"
              className="home__section6-pest"
            />
          </div>
        </div>
      </section>

      <section className="home__section home__section--7">
        <div className="home__content">
          <div className="home__section7-wrapper">
            <div className="home__section7-left">
              <p className="home__section7-subtitle">WE'RE HERE TO HELP YOU</p>
              <h2 className="home__section7-title">
                <span className="home__section7-highlight">'프르조'에</span>
              </h2>
              <h3 className="home__section7-title2">무료로 문의해보세요</h3>
              <p className="home__section7-desc">
                보다 안전하고 효과적인 방역 솔루션이 필요하신가요?
                <br />
                공간의 유형과 상황에 맞춘 맞춤형 진단과 시공 방안을 안내해드립니다.
                <br />
                아래 정보를 남겨주시면 전문 상담원이 빠르게 연락드리겠습니다.
              </p>
              <div className="home__section7-contact">
                <div className="home__section7-contact-item">
                  <img src={kakaoIcon} alt="카카오톡" />
                  <div className="home__section7-contact-info">
                    <span className="home__section7-contact-label">오픈채팅</span>
                    <span className="home__section7-contact-value">'프르조'</span>
                  </div>
                </div>
                <div className="home__section7-contact-item">
                  <img src={telIcon} alt="전화" />
                  <div className="home__section7-contact-info">
                    <span className="home__section7-contact-label">전화번호</span>
                    <span className="home__section7-contact-value">1670-2335</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="home__section7-right">
              <form className="home__section7-form" onSubmit={handleFormSubmit}>
                <div className="home__section7-form-row">
                  <div className="home__section7-form-group">
                    <label>이름</label>
                    <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="홍길동" />
                  </div>
                  <div className="home__section7-form-group">
                    <label>업체명/주소</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleFormChange} placeholder="프르조" />
                  </div>
                </div>
                <div className="home__section7-form-row">
                  <div className="home__section7-form-group">
                    <label>전화번호</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="010-1234-5678" />
                  </div>
                  <div className="home__section7-form-group">
                    <label>이메일</label>
                    <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="przo@naver.com" />
                  </div>
                </div>
                <div className="home__section7-form-group home__section7-form-group--full">
                  <label>비밀번호</label>
                  <input type="password" name="password" value={formData.password} onChange={handleFormChange} placeholder="게시글 확인 시 필요한 비밀번호를 입력해주세요" />
                </div>
                <div className="home__section7-form-group home__section7-form-group--full">
                  <label>제목</label>
                  <input type="text" name="title" value={formData.title} onChange={handleFormChange} placeholder="30평 가정집 견적 문의 드립니다." />
                </div>
                <div className="home__section7-form-group home__section7-form-group--full">
                  <label>문의 내용</label>
                  <textarea name="content" value={formData.content} onChange={handleFormChange} placeholder="해충방제 정기 관리를 신청하면 매월 얼마의 비용이 드나요?" rows="5"></textarea>
                </div>
                <div className="home__section7-form-group home__section7-form-group--full">
                  <label>첨부파일</label>
                  <div className="home__section7-file-input">
                    <input type="file" id="contactFile" onChange={handleFileChange} />
                    <label htmlFor="contactFile" className="home__section7-file-label">
                      <img src={fileIcon} alt="첨부파일" />
                      <span className="home__section7-file-name">
                        {attachment ? truncateFileName(attachment.name) : "파일을 선택해주세요"}
                      </span>
                    </label>
                  </div>
                </div>
                <button type="submit" className="home__section7-submit" disabled={isSubmitting}>
                  <span className="home__section7-submit-icon">
                    <img src={arrowIcon} alt="전송" />
                  </span>
                  <span className="home__section7-submit-text">{isSubmitting ? "등록 중..." : "전송하기"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="home__modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="home__modal" onClick={(e) => e.stopPropagation()}>
            <div className="home__modal-body">
              <div className="home__modal-left">
                <p className="home__modal-subtitle">WE'RE HERE TO HELP YOU</p>
                <h2 className="home__modal-title">
                  <span className="home__modal-highlight">'프르조'에</span>
                </h2>
                <h3 className="home__modal-title2">무료로 문의해보세요</h3>
                <p className="home__modal-desc">
                  보다 안전하고 효과적인 방역 솔루션이 필요하신가요?
                  <br />
                  공간의 유형과 상황에 맞춘 맞춤형 진단과 시공 방안을 안내해드립니다.
                  <br />
                  아래 정보를 남겨주시면 전문 상담원이 빠르게 연락드리겠습니다.
                </p>
                <div className="home__modal-contact home__modal-contact--desktop">
                  <div className="home__modal-contact-item">
                    <img src={kakaoIcon} alt="카카오톡" />
                    <div className="home__modal-contact-info">
                      <span className="home__modal-contact-label">오픈채팅</span>
                      <span className="home__modal-contact-value">'프르조'</span>
                    </div>
                  </div>
                  <div className="home__modal-contact-item">
                    <img src={telIcon} alt="전화" />
                    <div className="home__modal-contact-info">
                      <span className="home__modal-contact-label">전화번호</span>
                      <span className="home__modal-contact-value">1670-2335</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="home__modal-right">
                <form className="home__modal-form" onSubmit={(e) => { handleFormSubmit(e); setIsModalOpen(false); }}>
                  <div className="home__modal-form-row">
                    <div className="home__modal-form-group">
                      <label>이름</label>
                      <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="홍길동" />
                    </div>
                    <div className="home__modal-form-group">
                      <label>업체명/주소</label>
                      <input type="text" name="companyName" value={formData.companyName} onChange={handleFormChange} placeholder="프르조" />
                    </div>
                  </div>
                  <div className="home__modal-form-row">
                    <div className="home__modal-form-group">
                      <label>전화번호</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="010-1234-5678" />
                    </div>
                    <div className="home__modal-form-group">
                      <label>이메일</label>
                      <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="przo@naver.com" />
                    </div>
                  </div>
                  <div className="home__modal-form-group home__modal-form-group--full">
                    <label>비밀번호</label>
                    <input type="password" name="password" value={formData.password} onChange={handleFormChange} placeholder="게시글 확인 시 필요한 비밀번호를 입력해주세요" />
                  </div>
                  <div className="home__modal-form-group home__modal-form-group--full">
                    <label>제목</label>
                    <input type="text" name="title" value={formData.title} onChange={handleFormChange} placeholder="30평 가정집 견적 문의 드립니다." />
                  </div>
                  <div className="home__modal-form-group home__modal-form-group--full">
                    <label>문의 내용</label>
                    <textarea name="content" value={formData.content} onChange={handleFormChange} placeholder="해충방제 정기 관리를 신청하면 매월 얼마의 비용이 드나요?" rows="5"></textarea>
                  </div>
                  <div className="home__modal-form-group home__modal-form-group--full">
                    <label>첨부파일</label>
                    <div className="home__modal-file-input">
                      <input type="file" id="modalFile" onChange={handleFileChange} />
                      <label htmlFor="modalFile" className="home__modal-file-label">
                        <img src={fileIcon} alt="첨부파일" />
                        <span className="home__modal-file-name">
                          {attachment ? truncateFileName(attachment.name) : "파일을 선택해주세요"}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="home__modal-buttons">
                    <button type="button" className="home__modal-btn--back" onClick={() => setIsModalOpen(false)}>
                      <img src={arrowIcon} alt="뒤로" className="home__modal-btn--back-arrow" />
                      <span>뒤로가기</span>
                    </button>
                    <button type="submit" className="home__modal-btn home__modal-btn--submit" disabled={isSubmitting}>
                      <span className="home__modal-btn-icon">
                        <img src={arrowIcon} alt="전송" />
                      </span>
                      <span className="home__modal-btn-text">{isSubmitting ? "등록 중..." : "전송하기"}</span>
                    </button>
                  </div>
                  <div className="home__modal-contact home__modal-contact--mobile">
                    <div className="home__modal-contact-item">
                      <img src={kakaoIcon} alt="카카오톡" />
                      <div className="home__modal-contact-info">
                        <span className="home__modal-contact-label">오픈채팅</span>
                        <span className="home__modal-contact-value">'프르조'</span>
                      </div>
                    </div>
                    <div className="home__modal-contact-item">
                      <img src={telIcon} alt="전화" />
                      <div className="home__modal-contact-info">
                        <span className="home__modal-contact-label">전화번호</span>
                        <span className="home__modal-contact-value">1670-2335</span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
