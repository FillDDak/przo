import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminLogin.css";
import logoGreenGradation from "../assets/logo/przo-logo-green-gradation.webp";

const AdminLogin = () => {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login, logout, isAdmin, adminName } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!id.trim() || !password.trim()) {
            setError("아이디와 비밀번호를 입력해주세요.");
            setIsLoading(false);
            return;
        }

        const result = await login(id, password);

        if (result.success) {
            navigate("/");
        } else {
            setError(result.message);
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
                    {error && <p className="admin-login__error">{error}</p>}
                    <button type="submit" className="admin-login__button" disabled={isLoading}>
                        {isLoading ? "로그인 중..." : "로그인"}
                    </button>
                </form>
            </div>
        </div>
    )
};

export default AdminLogin;
