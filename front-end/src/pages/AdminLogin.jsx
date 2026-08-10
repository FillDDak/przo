import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import { useAuth } from "../context/AuthContext";
import "./AdminLogin.css";
import logoGreenGradation from "../assets/logo/przo-logo-green-gradation.webp";

const AdminLogin = () => {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [failCount, setFailCount] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [captchaRequired, setCaptchaRequired] = useState(false);
    const [captchaSiteKey, setCaptchaSiteKey] = useState("");
    const [captchaToken, setCaptchaToken] = useState(null);
    const captchaRef = useRef(null);
    const { login, logout, isAdmin, adminName } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!id.trim() || !password.trim()) {
            setError("아이디와 비밀번호를 입력해주세요.");
            setIsLoading(false);
            return;
        }

        if (captchaRequired && !captchaToken) {
            setError("보안 확인을 완료해주세요.");
            setIsLoading(false);
            return;
        }

        const result = await login(id, password, captchaToken);

        if (result.success) {
            if (from) navigate(from, { replace: true });
        } else {
            setError(result.message);
            setFailCount(result.failCount ?? null);
            if (result.captchaRequired) {
                setCaptchaRequired(true);
                if (result.captchaSiteKey) setCaptchaSiteKey(result.captchaSiteKey);
            }
            // 캡차 위젯 초기화 (다음 시도를 위해)
            setCaptchaToken(null);
            captchaRef.current?.reset();
        }

        setIsLoading(false);
    };

    const handleLogout = () => {
        logout();
    };

    // 로그인 상태면 로그아웃 화면 표시
    if (isAdmin) {
        return (
            <div className="admin-login">
                <div className="admin-login__box admin-login__box--dashboard">
                    <div className="admin-login__dashboard-top">
                        <img src={logoGreenGradation} alt="PRZO" className="admin-login__logo" />
                        <p className="admin-login__text">
                            <strong>{adminName}</strong>님 환영합니다
                        </p>
                    </div>

                    {/*
                        견적 시트(/admin/estimate)는 이 목록에서만 뺐다.
                        라우트와 페이지는 그대로라 주소로 직접 들어가면 동작한다.
                    */}
                    <div className="admin-login__grid">
                        {/* 가격표 관리 */}
                        <Link to="/admin/price-table" className="admin-login__card admin-login__card--green">
                            <div className="admin-login__card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                                </svg>
                            </div>
                            <div className="admin-login__card-body">
                                <span className="admin-login__card-title">가격표 관리</span>
                                <span className="admin-login__card-desc">사업장 · 가정집 가격표</span>
                            </div>
                        </Link>

                        {/* 로그인 기록 */}
                        <Link to="/admin/logs" className="admin-login__card admin-login__card--neutral">
                            <div className="admin-login__card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div className="admin-login__card-body">
                                <span className="admin-login__card-title">로그인 기록</span>
                                <span className="admin-login__card-desc">관리자 접속 이력 조회</span>
                            </div>
                        </Link>

                        {/* 로그아웃 */}
                        <button onClick={handleLogout} className="admin-login__card admin-login__card--logout">
                            <div className="admin-login__card-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                            </div>
                            <span className="admin-login__card-title">로그아웃</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return(
        <div className="admin-login">
            <div className="admin-login__box">
                <img
                    src={logoGreenGradation}
                    alt="PRZO"
                    className="admin-login__logo"
                />
                <p className="admin-login__text">
                    아이디와 비밀번호를 입력해주세요.
                </p>
                <form className="admin-login__form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        autoComplete="username"
                        className="admin-login__input"
                        placeholder="아이디"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                    />
                    <input
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        className="admin-login__input"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {captchaRequired && captchaSiteKey && (
                        <div className="admin-login__captcha">
                            <Turnstile
                                ref={captchaRef}
                                siteKey={captchaSiteKey}
                                onSuccess={(token) => setCaptchaToken(token)}
                                onExpire={() => setCaptchaToken(null)}
                                options={{ theme: "dark" }}
                            />
                        </div>
                    )}
                    {error && (
                        <p className="admin-login__error">
                            {error}
                            {failCount !== null && <span className="admin-login__fail-count"> ({failCount}/5)</span>}
                        </p>
                    )}
                    <button type="submit" className="admin-login__button" disabled={isLoading}>
                        {isLoading ? "로그인 중..." : "로그인"}
                    </button>
                </form>
            </div>
        </div>
    )
};

export default AdminLogin;
