import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./AdminLayout.css";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <Header variant="admin" />
      <main className="admin-content">
        <Outlet />
      </main>
      <Footer variant="admin" />
    </div>
  );
};

export default AdminLayout;
