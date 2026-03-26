import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_BASE_URL = "/api";

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);

  // 페이지 로드 시 쿠키 기반으로 세션 복원
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/me`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(true);
          setAdminName(data.adminName || "");
        }
      } catch {
        // 세션 없음 — 로그인 필요
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (username, password, captchaToken) => {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password, captchaToken }),
      });
    } catch {
      return { success: false, message: "서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요." };
    }

    if (response.status === 429) {
      return { success: false, message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." };
    }
    if (response.status >= 500) {
      return { success: false, message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return { success: false, message: "서버 응답을 처리할 수 없습니다." };
    }

    if (data.success) {
      setAdminName(data.adminName);
      setIsAdmin(true);
      return { success: true };
    }

    return {
      success: false,
      message: data.message || "로그인에 실패했습니다.",
      captchaRequired: data.captchaRequired || false,
      captchaSiteKey: data.captchaSiteKey || null,
      failCount: data.failCount ?? null,
    };
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // 서버 요청 실패해도 클라이언트 상태는 초기화
    }
    setAdminName("");
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, adminName, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
