import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import "./About.css";
import PageHero from "../components/PageHero";
import Icon from "../components/Icon";
import useReveal from "../hooks/useReveal";
import greetingsBanner from "../assets/image/greetings_banner.webp";
import logoGreen from "../assets/logo/przo-logo-green.webp";

const ADDRESS = "인천 계양구 마장로544번길 10, 제일풍경채 계양위너스카이 A1블럭 B1동 207호";

/* 홈에서 약속하는 내용과 동일한 항목이다. 두 곳의 문구가 어긋나지 않게 유지할 것. */
const PROMISES = [
  {
    icon: "inspect",
    title: "무료 방문 점검",
    desc: "전문 인력이 직접 방문해 시설을 진단하고, 해충의 종류와 유입 경로를 확인한 뒤 필요한 공법을 정합니다.",
  },
  {
    icon: "leaf",
    title: "안전 인증 약품",
    desc: "사람과 반려동물이 함께 지내는 공간을 전제로, 안전성이 확인된 약품만 규정된 용법에 맞춰 사용합니다.",
  },
  {
    icon: "refresh",
    title: "단계별 집중 관리",
    desc: "2~3개월에 걸쳐 초기 방제 · 잔존 개체 제거 · 재유입 차단을 순서대로 진행해 발생 원인까지 억제합니다.",
  },
  {
    icon: "shield-check",
    title: "사후 관리 · 보증",
    desc: "시공이 끝나도 정기 점검으로 상태를 확인하고, 보증 기간 내 재발 시 무상으로 다시 조치합니다.",
  },
];

const VALUES = [
  {
    no: "01",
    title: "진단이 먼저입니다",
    desc: "약제를 뿌리는 일부터 시작하지 않습니다. 어떤 해충이 어디서 들어와 어디에 서식하는지 확인해야 같은 문제가 반복되지 않습니다.",
  },
  {
    no: "02",
    title: "공간마다 답이 다릅니다",
    desc: "가정집과 주방, 창고와 사무실은 위험 요인도 제약 조건도 다릅니다. 현장 조건에 맞춰 공법과 약제를 다시 선택합니다.",
  },
  {
    no: "03",
    title: "설명할 수 있는 시공",
    desc: "무엇을 왜 하는지, 어떤 약품을 얼마나 쓰는지 고객이 알 수 있게 안내합니다. 확인되지 않은 효과를 앞세우지 않습니다.",
  },
];

const About = () => {
  const { state } = useLocation();
  const mapRef = useRef(null);

  useReveal();

  useEffect(() => {
    // 맨 위로 올리는 건 useScrollRestoration 이 처리한다. 여기서 또 부르면
    // 뒤로가기로 돌아왔을 때 복원된 위치를 덮어써 버린다.
    if (state?.scrollTo === "location") {
      const el = document.getElementById("location");
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [state]);

  useEffect(() => {
    const renderMap = (coords) => {
      if (!mapRef.current) return;
      const map = new window.naver.maps.Map(mapRef.current, {
        center: coords,
        zoom: 17,
      });
      const marker = new window.naver.maps.Marker({ position: coords, map });
      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="padding:12px 14px;min-width:140px;max-width:220px;word-break:keep-all;word-wrap:break-word;">
            <strong style="font-size:14px;">프르조</strong>
            <p style="margin:4px 0 0;font-size:12px;color:#555;line-height:1.5;">인천 계양구 마장로544번길 10, 판매시설동 2층 B1동 207호</p>
          </div>
        `,
        borderWidth: 1,
        anchorSkew: true,
      });
      infoWindow.open(map, marker);
      window.naver.maps.Event.addListener(marker, "click", () => {
        if (infoWindow.getMap()) infoWindow.close();
        else infoWindow.open(map, marker);
      });
    };

    const initMap = () => {
      if (!mapRef.current || !window.naver?.maps) return;
      renderMap(new window.naver.maps.LatLng(37.526595, 126.706445));
    };

    if (window.naver?.maps) {
      initMap();
      return;
    }

    const scriptId = "naver-map-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAP_CLIENT_ID}`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      document.getElementById(scriptId).addEventListener("load", initMap);
    }
  }, []);

  return (
    <div className="about">
      <PageHero
        eyebrow="About PRZO"
        title="보이지 않는 위험까지 잡는 위생·방역 파트너"
        description="프르조는 인천·경기 지역을 중심으로 주거 공간부터 상업 시설까지 맞춤형 방역 서비스를 제공합니다."
        breadcrumb={[{ label: "회사 소개" }]}
        image={greetingsBanner}
      />

      {/* -- 약속 카드 : 히어로에 살짝 걸쳐 시선을 아래로 넘긴다 -- */}
      <section className="about__promise" aria-label="프르조의 약속">
        <div className="u-container">
          <ul className="about__promise-grid">
            {PROMISES.map((item, i) => (
              <li
                key={item.title}
                className="about__promise-card reveal"
                style={{ "--reveal-delay": `${i * 0.08}s` }}
              >
                <span className="about__promise-icon">
                  <Icon name={item.icon} size={24} />
                </span>
                <h3 className="about__promise-title">{item.title}</h3>
                <p className="about__promise-desc">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* -- 대표 인사말 -- */}
      <section className="about__greeting u-section">
        <div className="u-container">
          <div className="about__greeting-layout">
            <aside className="about__greeting-aside reveal">
              <p className="section-head__eyebrow">Greetings</p>
              <h2 className="about__greeting-title">
                고객의 자리에서
                <br />
                문제를 바라봅니다
              </h2>
              <p className="about__greeting-lead">
                단순히 해충을 제거하는 것이 아니라, 고객님과 가족 그리고
                이용자 모두가 안심할 수 있는 환경을 만드는 것이 프르조의
                목표입니다.
              </p>
            </aside>

            <div className="about__greeting-body reveal" style={{ "--reveal-delay": "0.12s" }}>
              <p>
                저희 프르조는 체계적이고 철저한 교육 과정을 수료한 숙련된
                전문가들이 직접 현장을 방문하여, 고객님의 공간에 적합한 맞춤
                방역 서비스를 제공하고 있습니다.
              </p>
              <p>
                단순히 약제를 살포하는 방식이 아닌, 사전에 세밀한 환경 분석과
                상담을 진행하여 해충 발생 원인을 파악하고, 공간 특성과 상황에
                맞는 공법을 선정해 신속하게 문제를 해결합니다.
              </p>
              <p>
                당사의 모든 전문가는 현장 진단 능력, 약제 사용 지식, 안전 관리
                지침에 대한 내부 교육을 이수한 인력으로 구성되어 있으며, 주거
                공간은 물론 상가, 사무실, 음식점, 창고 등 다양한 공간 환경에도
                대응 가능한 전문성을 갖추고 있습니다.
              </p>
              <p>
                또한 서비스 종료 후에도 지속적인 관리 팁 안내와 유지보수 관련
                상담을 진행하여 고객님의 생활 공간이 보다 안전하고 쾌적하게
                유지되도록 돕고 있습니다.
              </p>
              <p>
                고객의 입장에서 문제를 바라보고, 정직하고 투명한 서비스를
                제공하는 방역 기업으로서 앞으로도 깨끗하고 건강한 공간을 만드는
                데 최선을 다하는 프르조가 되겠습니다.
              </p>

              <div className="about__signature">
                <img
                  src={logoGreen}
                  alt="PRZO"
                  className="about__signature-logo"
                  loading="lazy"
                />
                <span className="about__signature-name">대표 김선미 올림</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- 일하는 방식 -- */}
      <section className="about__values u-section on-inverse">
        <div className="u-container">
          <div className="section-head about__values-head reveal">
            <p className="section-head__eyebrow">How we work</p>
            <h2 className="section-head__title">프르조가 일하는 방식</h2>
            <p className="section-head__desc">
              방제는 한 번의 시공으로 끝나지 않습니다. 원인을 찾고, 조건에 맞게
              대응하고, 결과를 설명하는 것까지가 저희 일입니다.
            </p>
          </div>

          <ol className="about__values-list">
            {VALUES.map((v, i) => (
              <li
                key={v.no}
                className="about__value reveal"
                style={{ "--reveal-delay": `${0.1 + i * 0.1}s` }}
              >
                <span className="about__value-no">{v.no}</span>
                <div className="about__value-text">
                  <h3 className="about__value-title">{v.title}</h3>
                  <p className="about__value-desc">{v.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* -- 찾아오시는 길 -- */}
      <section className="about__location u-section" id="location">
        <div className="u-container">
          <div className="section-head reveal">
            <p className="section-head__eyebrow">Location</p>
            <h2 className="section-head__title">찾아오시는 길</h2>
          </div>

          <div className="about__location-layout">
            <div className="about__location-card reveal">
              <dl className="about__location-info">
                <div className="about__location-row">
                  <dt>
                    <Icon name="map-pin" size={17} />
                    주소
                  </dt>
                  <dd>{ADDRESS}</dd>
                </div>
                <div className="about__location-row">
                  <dt>
                    <Icon name="phone" size={17} />
                    상담 문의
                  </dt>
                  <dd>
                    <a href="tel:16702335" className="about__location-tel">
                      1670-2335
                    </a>
                  </dd>
                </div>
                <div className="about__location-row">
                  <dt>
                    <Icon name="clock" size={17} />
                    운영 시간
                  </dt>
                  <dd>
                    평일 09:00 – 18:00
                    <span className="about__location-note">
                      주말·공휴일 휴무 (문의는 상시 접수 가능)
                    </span>
                  </dd>
                </div>
                <div className="about__location-row">
                  <dt>
                    <Icon name="mail" size={17} />
                    이메일
                  </dt>
                  <dd>
                    <a href="mailto:pestredzone@naver.com">
                      pestredzone@naver.com
                    </a>
                  </dd>
                </div>
              </dl>

              <a
                href={`https://map.naver.com/p/search/${encodeURIComponent("프르조")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--secondary btn--block about__location-link"
              >
                네이버지도에서 보기
                <span className="btn__icon">
                  <Icon name="external" size={16} />
                </span>
              </a>
            </div>

            <div ref={mapRef} className="about__map" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
