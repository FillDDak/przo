import { useState } from "react";
import "./AdminLogin.css";
import logoGreenGradation from "../assets/logo/przo-logo-green-gradation.png";

const AdminLogin = () => {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // 로그인 처리 로직
        console.log("로그인 시도:", { id, password });
    };

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
                        className="admin-login__input"
                        placeholder="아이디"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                    />
                    <input
                        type="password"
                        className="admin-login__input"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className="admin-login__button">
                        로그인
                    </button>
                </form>
            </div>
        </div>
    )
};

export default AdminLogin;
