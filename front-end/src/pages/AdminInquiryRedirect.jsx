import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";

const AdminInquiryRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (isAdmin) {
      navigate(`/qna/${id}`, { replace: true });
    } else {
      setReady(true);
    }
  }, [isAdmin, loading, id, navigate]);

  if (!ready) return <div style={{ minHeight: "60vh" }} />;

  return (
    <ConfirmModal
      title="관리자 로그인이 필요합니다."
      subtitle="해당 문의를 확인하려면 관리자 로그인이 필요합니다."
      onClose={() => navigate("/")}
      buttons={[
        { label: "취소", variant: "cancel", onClick: () => navigate("/") },
        { label: "로그인하기", variant: "confirm", onClick: () => navigate("/admin", { state: { from: `/qna/${id}` } }) },
      ]}
    />
  );
};

export default AdminInquiryRedirect;
