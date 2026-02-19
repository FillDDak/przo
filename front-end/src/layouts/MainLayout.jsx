import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingButtons from "../components/FloatingButtons";
import "./MainLayout.css";

const MainLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="main-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      {isHome && <FloatingButtons />}
    </div>
  );
};

export default MainLayout;
