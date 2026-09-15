import { createContext, useContext } from "react";

/**
 * 관리자 인증 컨텍스트.
 *
 * 이 파일에는 컴포넌트를 두지 않는다(.js 확장자). 컴포넌트와 훅을 한
 * 파일에서 함께 내보내면 Fast Refresh 가 동작하지 않기 때문에,
 * Provider 는 AuthProvider.jsx 로 분리했다.
 *
 * import 경로는 기존과 동일하게 "…/context/AuthContext" 를 쓰면 된다.
 * Vite 의 기본 확장자 해석 순서상 .js 가 .jsx 보다 먼저 잡힌다.
 */
export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
