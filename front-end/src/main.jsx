import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// 레이아웃
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// 페이지
import Home from "./pages/Home";
import About from "./pages/About";
import Service from "./pages/Service";
import Qna from "./pages/Qna";
import QnaWrite from "./pages/QnaWrite";
import QnaDetail from "./pages/QnaDetail";
import QnaEdit from "./pages/QnaEdit";
import Reviews from "./pages/Reviews";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "service",
        element: <Service />,
      },
      {
        path: "qna",
        element: <Qna />,
      },
      {
        path: "qna/write",
        element: <QnaWrite />,
      },
      {
        path: "qna/:id",
        element: <QnaDetail />,
      },
      {
        path: "qna/:id/edit",
        element: <QnaEdit />,
      },
      {
        path: "reviews",
        element: <Reviews />,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminLogin />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
