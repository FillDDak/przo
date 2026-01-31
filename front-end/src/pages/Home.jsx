import { useState } from "react";
import "./home.css";
import banner1 from "../assets/image/banner1.png";

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
import pestAnt from "../assets/section5-bugs/애집개미.webp";
import pestRat from "../assets/section5-bugs/시궁쥐.jpg";
import pestFly from "../assets/section5-bugs/집파리.jpg";
import pestRoach from "../assets/section5-bugs/독일바퀴.jpg";
import pestMoth from "../assets/section5-bugs/나방.jpg";
import pestCentipede from "../assets/section5-bugs/지네.webp";
import pestMosquito from "../assets/section5-bugs/모기.jpg";
import pestCricket from "../assets/section5-bugs/꼽등이.webp";
import pestMidge from "../assets/section5-bugs/깔따구.jpg";

const Home = () => {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [pestIndex, setPestIndex] = useState(2);
  const [isMosaic, setIsMosaic] = useState(true);

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

  // 섹션 5 해충 라이브러리 데이터
  const pestLibrary = [
    {
      id: 1,
      name: "애집개미",
      engName: "Monomorium pharaonis",
      src: pestAnt,
      desc: "열대 지방 원산의 작은 개미로, 따뜻한 실내 환경을 선호합니다. 음식물 주변에서 자주 발견되며 집단으로 서식합니다.",
    },
    {
      id: 2,
      name: "시궁쥐",
      engName: "R. norvegicus",
      src: pestRat,
      desc: "도시 환경에서 가장 흔한 쥐 종류입니다. 하수구나 지하실에 서식하며 각종 질병을 옮길 수 있습니다.",
    },
    {
      id: 3,
      name: "집파리",
      engName: "housefly",
      src: pestFly,
      desc: "집파릿과의 곤충으로, 몸은 검은 갈색이며 주로 여름에 번식하여 집 안에 모여듭니다. 유충은 쓰레기, 퇴비, 가축 분뇨 따위의 부패물에 자라고 성충은 반찬, 우유, 당분이 많은 음식물을 먹고 삽니다. 세균을 운반하여 식품을 오염시켜 전염병을 옮깁니다.",
    },
    {
      id: 4,
      name: "독일 바퀴",
      engName: "Blattella germanica",
      src: pestRoach,
      desc: "가장 흔한 바퀴벌레 종으로, 주방이나 욕실 등 따뜻하고 습한 곳에서 서식합니다. 야행성이며 번식력이 매우 강합니다.",
    },
    {
      id: 5,
      name: "나방",
      engName: "Moth",
      src: pestMoth,
      desc: "옷이나 식품을 손상시키는 해충입니다. 유충이 섬유나 곡물을 먹어 피해를 줍니다.",
    },
    {
      id: 6,
      name: "지네",
      engName: "Centipede",
      src: pestCentipede,
      desc: "습한 환경에서 서식하며 다른 곤충을 잡아먹습니다. 독이 있어 물리면 통증이 발생할 수 있습니다.",
    },
    {
      id: 7,
      name: "모기",
      engName: "Mosquito",
      src: pestMosquito,
      desc: "피를 빨아먹는 해충으로 뎅기열, 말라리아 등 각종 질병을 옮깁니다. 고인 물에서 번식합니다.",
    },
    {
      id: 8,
      name: "꼽등이",
      engName: "Camel cricket",
      src: pestCricket,
      desc: "습하고 어두운 곳에서 서식하는 곤충입니다. 지하실이나 창고에서 자주 발견됩니다.",
    },
    {
      id: 9,
      name: "깔따구",
      engName: "Chironomidae",
      src: pestMidge,
      desc: "물가 주변에서 대량 발생하는 곤충입니다. 직접적인 피해는 적지만 불쾌감을 유발합니다.",
    },
  ];

  const handlePestPrev = () => {
    setPestIndex((prev) => (prev === 0 ? pestLibrary.length - 1 : prev - 1));
  };

  const handlePestNext = () => {
    setPestIndex((prev) => (prev === pestLibrary.length - 1 ? 0 : prev + 1));
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
        style={{ backgroundImage: `url(${banner1})` }}
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
            <button className="home__section1-btn">무료 상담 문의</button>
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
              <button className="home__section3-btn">자세히 보기</button>
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
              <div className="home__section5-cards-wrapper">
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
                    const position = index - pestIndex;
                    const isActive = index === pestIndex;

                    return (
                      <div
                        key={pest.id}
                        className={`home__section5-card ${isActive ? "active" : ""}`}
                        style={{
                          transform: `translate(calc(-50% + ${position * 400}px), -50%) scale(${isActive ? 1 : 0.95})`,
                          zIndex: isActive ? 10 : 5 - Math.abs(position),
                          opacity: Math.abs(position) > 2 ? 0 : 1,
                        }}
                        onClick={() => setPestIndex(index)}
                      >
                        <div
                          className={`home__section5-card-image ${!isActive || isMosaic ? "mosaic" : ""}`}
                          style={{ backgroundImage: `url(${pest.src})` }}
                        ></div>
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

      <section className="home__section home__section--6">
        <div className="home__content">{/* 여섯 번째 섹션 내용 */}</div>
      </section>

      <section className="home__section home__section--7">
        <div className="home__content">{/* 일곱 번째 섹션 내용 */}</div>
      </section>
    </div>
  );
};

export default Home;
