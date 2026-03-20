import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_BASE_URL = "/api";

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [loading, setLoading] = useState(true);

  // 페이지 로드 시 토큰 유효성 검사
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem("adminToken");
      if (storedToken) {
        try {
          const response = await fetch(`${API_BASE_URL}/admin/validate`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${storedToken}`,
            },
          });
          const data = await response.json();
          if (data.valid) {
            setIsAdmin(true);
            setToken(storedToken);
            setAdminName(localStorage.getItem("adminName") || "");
          } else {
            // 토큰이 유효하지 않으면 제거
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminName");
            setIsAdmin(false);
            setToken("");
            setAdminName("");
          }
        } catch (error) {
          console.error("토큰 검증 오류:", error);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  const login = async (username, password) => {
    // 1. 네트워크 연결 오류
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
    } catch {
      return { success: false, message: "서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요." };
    }

    // 2. HTTP 상태 코드별 처리
    if (response.status === 429) {
      return { success: false, message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." };
    }
    if (response.status >= 500) {
      return { success: false, message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
    }

    // 3. JSON 파싱 오류
    let data;
    try {
      data = await response.json();
    } catch {
      return { success: false, message: "서버 응답을 처리할 수 없습니다." };
    }

    if (data.success) {
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminName", data.adminName);
      setToken(data.token);
      setAdminName(data.adminName);
      setIsAdmin(true);
      return { success: true };
    }

    // 4. 서버에서 내려온 메시지 (아이디/비밀번호 불일치 등)
    return { success: false, message: data.message || "로그인에 실패했습니다." };
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    setToken("");
    setAdminName("");
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, adminName, token, login, logout, loading }}>
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
