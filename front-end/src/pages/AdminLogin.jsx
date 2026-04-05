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
                <div className="admin-login__box">
                    <img
                        src={logoGreenGradation}
                        alt="PRZO"
                        className="admin-login__logo"
                    />
                    <p className="admin-login__text">
                        <strong>{adminName}</strong>님으로 로그인 중입니다.
                    </p>
                    <div className="admin-login__actions">
                        <Link to="/admin/estimate" className="admin-login__button">
                            가격 견적 시트
                        </Link>
                        <Link to="/admin/price-table" className="admin-login__button">
                            가격표 관리
                        </Link>
                        <Link to="/admin/logs" className="admin-login__button admin-login__button--logs">
                            로그인 기록 확인
                        </Link>
                    </div>
                    <button
                        className="admin-login__button admin-login__button--logout"
                        onClick={handleLogout}
                    >
                        로그아웃
                    </button>
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
