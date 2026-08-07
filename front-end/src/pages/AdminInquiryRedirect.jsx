import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";

const AdminInquiryRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();

  // 관리자면 문의 상세로 바로 넘긴다.
  // 라우터 이동은 외부 시스템 조작이므로 effect 가 맞다.
  useEffect(() => {
    if (!loading && isAdmin) {
      navigate(`/qna/${id}`, { replace: true });
    }
  }, [isAdmin, loading, id, navigate]);

  // 안내 모달을 띄울지 여부는 loading·isAdmin 에서 그대로 유도된다.
  // 별도 state 로 두면 effect 안에서 setState 를 해야 해 렌더가 한 번 더 돈다.
  if (loading || isAdmin) return <div style={{ minHeight: "60vh" }} />;

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
