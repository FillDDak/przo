import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import "./About.css";
import greetingsBanner from "../assets/image/greetings_banner.webp";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";
import logoGreen from "../assets/logo/przo-logo-green.webp";


const About = () => {
  const { state } = useLocation();
  const mapRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
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
      {/* 배너 섹션 */}
      <section className="about__banner">
        <img src={greetingsBanner} alt="인사말 배너" className="about__banner-img" />
        <div className="about__banner-overlay"></div>
        {/* 브레드크럼 */}
        <div className="about__breadcrumb">
          <Link to="/" className="about__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="about__breadcrumb-icon" />
          </Link>
          <span className="about__breadcrumb-separator">&gt;</span>
          <span className="about__breadcrumb-current">회사 소개</span>
        </div>
        <div className="about__banner-content">
          <h1 className="about__banner-title">프르조 인사말</h1>
          <p className="about__banner-subtitle">"보이지 않는 위험까지 잡는 위생·방역 파트너, 프르조입니다."</p>
        </div>
      </section>

      {/* To our customers 섹션 */}
      <section className="about__customers">
        <div className="about__content">
          <h2 className="about__customers-title">To our customers</h2>
          <div className="about__customers-grid">
            <div className="about__customers-col">
              <p>
                저희 프르조는 체계적이고 철저한 교육 과정을 수료한 숙련된 전문가들이 직접 현장을 방문하여, 고객님의 공간에 적합한 맞춤 방역 서비스를 제공하고 있습니다.
              </p>
              <p>
                단순히 약제를 살포하는 방식이 아닌, 사전에 세밀한 환경 분석과 상담을 진행하여 해충 발생 원인을 파악하고, 공간 특성과 상황에 맞는 공법을 선정해 신속하게 문제를 해결합니다.
              </p>
              <p>
                당사의 모든 전문가는 현장 진단 능력, 약제 사용 지식, 안전 관리 지침에 대한 내부 교육을 이수한 인력으로 구성되어 있으며, 주거 공간은 물론 상가, 사무실, 음식점, 창고 등 다양한 공간 환경에도 대응 가능한 전문성을 갖추고 있습니다.
              </p>
            </div>
            <div className="about__customers-col">
              <p>
                또한 서비스 종료 후에도 지속적인관리 팁 안내, 유지보수 관련 상담을 진행하여 고객님의 생활 공간이 보다 안전하고 쾌적하게 유지되도록 돕고 있습니다.
              </p>
              <p>
                프르조의 목표는 단순히 해충을 제거하는 것이 아니라, 고객님과 가족, 그리고 이용자 모두가 안심할 수 있는 환경을 조성하는 것입니다. 
              </p>
              <p>
                고객의 입장에서 문제를 바라보고, 정직하고 투명한 서비스를 제공하는 방역 기업으로서 앞으로도 깨끗하고 건강한 공간을 만드는 데 최선을 다하는 프르조가 되겠습니다.
              </p>
            </div>
          </div>
          <div className="about__signature">
            <img src={logoGreen} alt="PRZO" className="about__signature-logo" loading="lazy" />
            <span className="about__signature-name">대표 김선미 올림</span>
          </div>
        </div>
      </section>

      {/* 찾아오시는길 섹션 */}
      <section className="about__location" id="location">
        <div className="about__content">
          <div className="about__location-header">
            <div className="about__location-info">
              <h2 className="about__location-title">찾아오시는길</h2>
              <p className="about__location-address">인천 계양구 마장로544번길 10, 제일풍경채 계양위너스카이 A1블럭 B1동 207호</p>
            </div>
            <a
              href={`https://map.naver.com/p/search/${encodeURIComponent("프르조")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="about__location-link"
            >
              네이버지도 바로가기 &gt;
            </a>
          </div>
          <div ref={mapRef} className="about__map" />
        </div>
      </section>
    </div>
  );
};

export default About;
