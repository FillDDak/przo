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

const Home = () => {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

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

  // 섹션 4 갤러리 데이터
  const galleries2 = [
    { id: 1, src: gallery2_1, alt: "갤러리1" },
    { id: 2, src: gallery2_2, alt: "갤러리2" },
    { id: 3, src: gallery2_3, alt: "갤러리3" },
    { id: 4, src: gallery2_4, alt: "갤러리4" },
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
              <div
                className="home__section4-gallery-item home__section4-gallery-item--offset"
                style={{ backgroundImage: `url(${gallery2_1})` }}
              ></div>
              <div
                className="home__section4-gallery-item"
                style={{ backgroundImage: `url(${gallery2_2})` }}
              ></div>
              <div
                className="home__section4-gallery-item home__section4-gallery-item--offset"
                style={{ backgroundImage: `url(${gallery2_3})` }}
              ></div>
              <div
                className="home__section4-gallery-item"
                style={{ backgroundImage: `url(${gallery2_4})` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      <section className="home__section home__section--5">
        <div className="home__content">{/* 다섯 번째 섹션 내용 */}</div>
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
