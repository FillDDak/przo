import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// 레이아웃 (즉시 로드)
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// 홈은 즉시 로드 (첫 진입 페이지)
import Home from "./pages/Home";

// 나머지 페이지 (lazy 로드)
const About = lazy(() => import("./pages/About"));
// const Service = lazy(() => import("./pages/Service"));
const Qna = lazy(() => import("./pages/Qna"));
const QnaWrite = lazy(() => import("./pages/QnaWrite"));
const QnaDetail = lazy(() => import("./pages/QnaDetail"));
const Reviews = lazy(() => import("./pages/Reviews"));
const ReviewWrite = lazy(() => import("./pages/ReviewWrite"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminLogs = lazy(() => import("./pages/AdminLogs"));
const EstimateSheet = lazy(() => import("./pages/EstimateSheet"));
const AdminInquiryRedirect = lazy(() => import("./pages/AdminInquiryRedirect"));
const Faq = lazy(() => import("./pages/Faq"));
const Terms = lazy(() => import("./pages/Terms"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

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
        element: <Suspense fallback={null}><About /></Suspense>,
      },
      // {
      //   path: "service",
      //   element: <Suspense fallback={null}><Service /></Suspense>,
      // },
      {
        path: "qna",
        element: <Suspense fallback={null}><Qna /></Suspense>,
      },
      {
        path: "qna/write",
        element: <Suspense fallback={null}><QnaWrite /></Suspense>,
      },
      {
        path: "qna/:id",
        element: <Suspense fallback={null}><QnaDetail /></Suspense>,
      },
      {
        path: "qna/:id/edit",
        element: <Suspense fallback={null}><QnaWrite /></Suspense>,
      },
      {
        path: "reviews",
        element: <Suspense fallback={null}><Reviews /></Suspense>,
      },
      {
        path: "reviews/write",
        element: <Suspense fallback={null}><ReviewWrite /></Suspense>,
      },
      {
        path: "faq",
        element: <Suspense fallback={null}><Faq /></Suspense>,
      },
      {
        path: "terms",
        element: <Suspense fallback={null}><Terms /></Suspense>,
      },
      {
        path: "cookie-policy",
        element: <Suspense fallback={null}><CookiePolicy /></Suspense>,
      },
      {
        path: "privacy-policy",
        element: <Suspense fallback={null}><PrivacyPolicy /></Suspense>,
      },
      {
        path: "admin/inquiry/:id",
        element: <Suspense fallback={null}><AdminInquiryRedirect /></Suspense>,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Suspense fallback={null}><AdminLogin /></Suspense>,
      },
      {
        path: "estimate",
        element: <Suspense fallback={null}><EstimateSheet /></Suspense>,
      },
      {
        path: "logs",
        element: <Suspense fallback={null}><AdminLogs /></Suspense>,
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
