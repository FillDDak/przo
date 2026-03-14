import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found__container">
        <p className="not-found__code">404</p>
        <h1 className="not-found__title">페이지를 찾을 수 없습니다</h1>
        <p className="not-found__desc">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link to="/" className="not-found__btn">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
