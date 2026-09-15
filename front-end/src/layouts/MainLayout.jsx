import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingButtons from "../components/FloatingButtons";
import useScrollRestoration from "../hooks/useScrollRestoration";
import "./MainLayout.css";

const MainLayout = () => {
  /* 새 페이지는 맨 위로, 뒤로가기는 떠날 때의 위치로 되돌린다 */
  useScrollRestoration();

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
