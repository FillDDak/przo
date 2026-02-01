import "./About.css";

const About = () => {
  return (
    <div className="about">
      <section className="about__hero">
        <div className="about__content">
          <h1 className="about__hero-title">회사 소개</h1>
          <p className="about__hero-desc">
            고객의 건강하고 쾌적한 환경을 위해 최선을 다하는 방역 전문 기업입니다.
          </p>
        </div>
      </section>

      <section className="about__section">
        <div className="about__content">
          <h2 className="about__section-title">우리의 <span className="about__highlight">미션</span></h2>
          <p className="about__section-desc">
            깨끗하고 안전한 환경은 모든 사람의 기본 권리입니다.<br />
            저희는 전문적인 방역 서비스를 통해 고객의 일상을 보호하고,<br />
            건강한 생활 환경을 만들어 나가는 것을 사명으로 합니다.
          </p>
        </div>
      </section>

      <section className="about__section about__section--gray">
        <div className="about__content">
          <h2 className="about__section-title">우리의 <span className="about__highlight">비전</span></h2>
          <p className="about__section-desc">
            대한민국 최고의 방역 서비스 기업으로 도약하여,<br />
            고객에게 신뢰받는 파트너가 되겠습니다.
          </p>
        </div>
      </section>

      <section className="about__section">
        <div className="about__content">
          <h2 className="about__section-title">핵심 <span className="about__highlight">가치</span></h2>
          <div className="about__values">
            <div className="about__value-item">
              <div className="about__value-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#51c488" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="about__value-title">신뢰</h3>
              <p className="about__value-desc">고객과의 약속을 지키며 투명한 서비스를 제공합니다.</p>
            </div>
            <div className="about__value-item">
              <div className="about__value-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#51c488" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="about__value-title">신속</h3>
              <p className="about__value-desc">빠른 대응과 정확한 처리로 고객의 시간을 소중히 합니다.</p>
            </div>
            <div className="about__value-item">
              <div className="about__value-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#51c488" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
              </div>
              <h3 className="about__value-title">전문성</h3>
              <p className="about__value-desc">끊임없는 연구와 교육으로 최고의 기술력을 유지합니다.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
