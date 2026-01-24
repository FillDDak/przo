import "./home.css";
import banner1 from "../assets/image/banner1.png";

const Home = () => {
  return (
    <div className="home">
      <section className="home__section home__section--1" style={{ backgroundImage: `url(${banner1})` }}>
        <div className="home__content">
          <div className="home__section1-wrapper">
            <p className="home__section1-subtitle">방역 전문가들의 맞춤 솔루션</p>
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
          {/* 두 번째 섹션 내용 */}
        </div>
      </section>

      <section className="home__section home__section--3">
        <div className="home__content">
          {/* 세 번째 섹션 내용 */}
        </div>
      </section>

      <section className="home__section home__section--4">
        <div className="home__content">
          {/* 네 번째 섹션 내용 */}
        </div>
      </section>

      <section className="home__section home__section--5">
        <div className="home__content">
          {/* 다섯 번째 섹션 내용 */}
        </div>
      </section>

      <section className="home__section home__section--6">
        <div className="home__content">
          {/* 여섯 번째 섹션 내용 */}
        </div>
      </section>

      <section className="home__section home__section--7">
        <div className="home__content">
          {/* 일곱 번째 섹션 내용 */}
        </div>
      </section>
    </div>
  );
};

export default Home;
