import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingButtons from "../components/FloatingButtons";
import "./MainLayout.css";

const MainLayout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="main-layout">
      <a href="#main" className="skip-link">
        본문 바로가기
      </a>
      <Header />
      <main id="main" className="main-content">
        <Outlet />
      </main>
      <Footer />
      {/* 전화·카카오 상담은 모든 페이지에서 한 번에 닿을 수 있어야 한다 */}
      <FloatingButtons />
    </div>
  );
};

export default MainLayout;
