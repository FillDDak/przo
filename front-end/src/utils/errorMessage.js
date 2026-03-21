/**
 * 브라우저가 생성하는 영문 에러 메시지를 한국어로 변환합니다.
 */
export const getErrorMessage = (e) => {
  if (!e) return "알 수 없는 오류가 발생했습니다.";

  if (e.name === "TypeError" && e.message?.includes("Failed to fetch"))
    return "서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.";

  if (e.name === "TypeError" && e.message?.includes("NetworkError"))
    return "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.";

  if (e.name === "AbortError")
    return "요청이 취소되었습니다.";

  if (e instanceof SyntaxError || e.message?.includes("JSON"))
    return "서버 응답을 처리할 수 없습니다.";

  if (e.name === "TypeError")
    return "요청 처리 중 오류가 발생했습니다.";

  return "알 수 없는 오류가 발생했습니다.";
};
