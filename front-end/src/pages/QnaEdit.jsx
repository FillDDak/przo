import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./QnaWrite.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";
import fileIcon from "../assets/section7-icon/section7-icon-file.svg";

const API_BASE_URL = "http://localhost:8080/api";

const QnaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    password: "",
    title: "",
    content: "",
  });
  const [attachment, setAttachment] = useState(null);
  const [currentAttachment, setCurrentAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // 기존 데이터 불러오기
  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/inquiries/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || "",
            companyName: data.companyName || "",
            phone: data.phone || "",
            email: data.email || "",
            password: "",
            title: data.title || "",
            content: data.content || "",
          });
          setCurrentAttachment(data.attachment);
        } else {
          alert("문의를 불러올 수 없습니다.");
          navigate("/qna");
        }
      } catch (error) {
        console.error("문의 불러오기 오류:", error);
        alert("문의를 불러오는 중 오류가 발생했습니다.");
        navigate("/qna");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [id, navigate]);

  // 전화번호 포맷팅 함수 (10자리, 11자리 지원)
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '');

    // 서울 지역번호 (02)
    if (numbers.startsWith('02')) {
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 6) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
      } else {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
      }
    }

    // 휴대폰 및 기타 지역번호 (3자리)
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length === 10) {
      // 10자리: XXX-XXX-XXXX
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    } else {
      // 11자리: XXX-XXXX-XXXX
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      setFormData((prev) => ({
        ...prev,
        [name]: formatPhoneNumber(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAttachment(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!formData.phone.trim()) {
      alert("전화번호를 입력해주세요.");
      return;
    }
    if (!formData.email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    if (!formData.password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim()) {
      alert("문의 내용을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("companyName", formData.companyName);
      submitData.append("phone", formData.phone);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("title", formData.title);
      submitData.append("content", formData.content);
      if (attachment) {
        submitData.append("attachment", attachment);
      }

      const response = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
        method: "PUT",
        body: submitData,
      });

      if (response.ok) {
        alert("문의가 성공적으로 수정되었습니다.");
        navigate(`/qna/${id}`);
      } else if (response.status === 401) {
        alert("비밀번호가 일치하지 않습니다.");
      } else {
        alert("문의 수정에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("문의 수정 오류:", error);
      alert("문의 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="qna-write">
        <div className="qna-write__content" style={{ textAlign: "center", padding: "100px 0" }}>
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="qna-write">
      {/* 배너 섹션 */}
      <section className="qna-write__banner">
        {/* 브레드크럼 */}
        <div className="qna-write__breadcrumb">
          <Link to="/" className="qna-write__breadcrumb-link">
            <img src={homeIcon} alt="홈" className="qna-write__breadcrumb-icon" />
          </Link>
          <span className="qna-write__breadcrumb-separator">&gt;</span>
          <span className="qna-write__breadcrumb-text">상담문의</span>
          <span className="qna-write__breadcrumb-separator">&gt;</span>
          <span className="qna-write__breadcrumb-current">무료문의</span>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <section className="qna-write__main">
        <div className="qna-write__content">
          <h1 className="qna-write__title">문의 수정</h1>

          <form className="qna-write__form" onSubmit={handleSubmit}>
            {/* 이름 & 업체명/주소 */}
            <div className="qna-write__row">
              <div className="qna-write__field">
                <label className="qna-write__label">이름</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="qna-write__input"
                  placeholder="홍길동"
                />
              </div>
              <div className="qna-write__field">
                <label className="qna-write__label">업체명/주소</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="qna-write__input"
                  placeholder="프르조"
                />
              </div>
            </div>

            {/* 전화번호 & 이메일 */}
            <div className="qna-write__row">
              <div className="qna-write__field">
                <label className="qna-write__label">전화번호</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="qna-write__input"
                  placeholder="010-1234-5678"
                />
              </div>
              <div className="qna-write__field">
                <label className="qna-write__label">이메일</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="qna-write__input"
                  placeholder="przo@naver.com"
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="qna-write__field qna-write__field--full">
              <label className="qna-write__label">비밀번호 (수정 확인용)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="qna-write__input"
                placeholder="작성 시 입력한 비밀번호를 입력해주세요"
              />
            </div>

            {/* 제목 */}
            <div className="qna-write__field qna-write__field--full">
              <label className="qna-write__label">제목</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="qna-write__input"
                placeholder="30평 가정집 견적 문의 드립니다."
              />
            </div>

            {/* 문의 내용 */}
            <div className="qna-write__field qna-write__field--full">
              <label className="qna-write__label">문의 내용</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="qna-write__textarea"
                placeholder="해충방제 정기 관리를 신청하면 매월 얼마의 비용이 드나요?"
              ></textarea>
            </div>

            {/* 첨부파일 */}
            <div className="qna-write__field qna-write__field--full">
              <label className="qna-write__label">첨부파일</label>
              {currentAttachment && !attachment && (
                <p style={{ fontSize: "14px", color: "#767676", marginBottom: "8px" }}>
                  현재 파일: {currentAttachment.split('/').pop()}
                </p>
              )}
              <div className="qna-write__file-wrapper">
                <input
                  type="file"
                  id="attachment"
                  onChange={handleFileChange}
                  className="qna-write__file-input"
                />
                <label htmlFor="attachment" className="qna-write__file-label">
                  <img src={fileIcon} alt="첨부파일" className="qna-write__file-icon" />
                  <span>{attachment ? attachment.name : "새 파일을 선택해주세요"}</span>
                </label>
              </div>
            </div>

            {/* 수정하기 버튼 */}
            <div className="qna-write__button-wrapper">
              <button
                type="button"
                onClick={() => navigate(`/qna/${id}`)}
                className="qna-write__submit-btn"
                style={{ marginRight: "12px" }}
              >
                취소
              </button>
              <button
                type="submit"
                className="qna-write__submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "수정 중..." : "수정하기"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default QnaEdit;
