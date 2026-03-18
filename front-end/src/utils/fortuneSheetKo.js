const KO_MAP = {
  // ── 툴바 ──────────────────────────────────────────────────────────────────
  "Toolbar": "툴바",
  "Undo": "실행 취소",
  "Redo": "다시 실행",
  "Clear Format": "서식 지우기",
  "Format-Painter": "서식 복사",
  "Paint format": "서식 복사",
  "Paint format start": "서식 복사 시작",
  "Format as currency": "통화 형식",
  "Format as percent": "백분율 형식",
  "Decrease decimal places": "소수점 자리 줄이기",
  "Increase decimal places": "소수점 자리 늘리기",
  "More formats": "더 많은 형식",
  "Border All": "모든 테두리",
  "Merge All Cell": "전체 셀 병합",
  "Format": "형식",
  "Font": "글꼴",
  "Font size": "글자 크기",
  "Bold (Ctrl+B)": "굵게 (Ctrl+B)",
  "Italic (Ctrl+I)": "기울임꼴 (Ctrl+I)",
  "Strikethrough (Alt+Shift+5)": "취소선 (Alt+Shift+5)",
  "Underline": "밑줄",
  "Font color": "글자 색",
  "Left aligned": "왼쪽 맞춤",
  "Horizontal Center": "가운데 맞춤",
  "Right aligned": "오른쪽 맞춤",
  "Top aligned": "위쪽 맞춤",
  "Vertical Center": "세로 가운데 맞춤",
  "Bottom aligned": "아래쪽 맞춤",
  "choose color": "색상 선택",
  "Reset": "초기화",
  "CUSTOM": "사용자 지정",
  "Alternating colors": "교대 색상",
  "OK": "확인",
  "Cancel": "취소",
  "Collapse": "축소",
  "Fill color": "채우기 색",
  "Border": "테두리",
  "Border style": "테두리 스타일",
  "Merge cells": "셀 병합",
  "Choose merge type": "병합 방식 선택",
  "Horizontal align": "가로 정렬",
  "Vertical align": "세로 정렬",
  "Alignment": "정렬",
  "Text wrap": "텍스트 줄 바꿈",
  "Text wrap mode": "줄 바꿈 방식",
  "Text rotate": "텍스트 회전",
  "Text rotate mode": "회전 방식",
  "Freeze": "고정",
  "Sort": "정렬",
  "Filter": "필터",
  "Sort and filter": "정렬 및 필터",
  "Find and replace": "찾기 및 바꾸기",
  "SUM": "합계",
  "Auto SUM": "자동 합계",
  "More functions": "더 많은 함수",
  "Conditional format": "조건부 서식",
  "Comment": "댓글",
  "Pivot Table": "피벗 테이블",
  "Chart": "차트",
  "Screenshot": "스크린샷",
  "Split text": "텍스트 나누기",
  "Insert image": "이미지 삽입",
  "Insert link": "링크 삽입",
  "Data verification": "데이터 유효성 검사",
  "Protect the sheet": "시트 보호",
  "Clear color": "색상 지우기",
  "No color is selected": "선택된 색상 없음",
  "More": "더 보기",
  "Less": "접기",
  "Close": "닫기",
  "More features": "추가 기능",
  "More options": "추가 옵션",
  "Cell format config": "셀 서식 설정",
  "Print": "인쇄",
  "Zoom settings": "확대/축소 설정",

  // ── 우클릭 컨텍스트 메뉴 ─────────────────────────────────────────────────
  "Copy": "복사",
  "Copy as": "다른 형식으로 복사",
  "Paste": "붙여넣기",
  "Insert": "삽입",
  "Delete": "삭제",
  "Delete cell": "셀 삭제",
  "Delete selected ": "선택 삭제",
  "Delete selected Rows": "선택한 행 삭제",
  "Delete selected Columns": "선택한 열 삭제",
  "Hide": "숨기기",
  "Hide selected ": "선택 숨기기",
  "Show hidden ": "숨김 표시",
  "Show hidden Rows": "숨겨진 행 표시",
  "Show hidden Columns": "숨겨진 열 표시",
  "Insert row above": "위에 행 삽입",
  "Insert row below": "아래에 행 삽입",
  "Insert column left": "왼쪽에 열 삽입",
  "Insert column right": "오른쪽에 열 삽입",
  "Delete selected rows": "선택한 행 삭제",
  "Delete selected columns": "선택한 열 삭제",
  "Hide rows": "행 숨기기",
  "Show rows": "행 표시",
  "Hide columns": "열 숨기기",
  "Show columns": "열 표시",
  "Set row height": "행 높이 설정",
  "Set column width": "열 너비 설정",
  "Cut": "잘라내기",
  "Paste Special": "선택하여 붙여넣기",
  "Clear content": "내용 지우기",
  "Insert cells": "셀 삽입",
  "Delete cells": "셀 삭제",
  "Add comment": "댓글 추가",
  "Edit comment": "댓글 편집",
  "Delete comment": "댓글 삭제",
  "Link": "링크",
  "Data Validation": "데이터 유효성 검사",
  "Cell Format": "셀 서식",
  "Freeze row": "행 고정",
  "Freeze column": "열 고정",
  "Cancel freeze": "고정 취소",
  "Sort ascending": "오름차순 정렬",
  "Sort descending": "내림차순 정렬",
  "Towards": "방향",
  "Left": "왼쪽",
  "Right": "오른쪽",
  "Above": "위",
  "Below": "아래",
  "Move left": "왼쪽으로 이동",
  "Move up": "위로 이동",
  "Add": "추가",
  "Row": "행",
  "Column": "열",
  "Width": "너비",
  "Height": "높이",
  "Number": "숫자",
  "Confirm": "확인",
  "Ascending sort": "오름차순 정렬",
  "Descending sort": "내림차순 정렬",
  "Matrix operation": "행렬 연산",
  "Create chart": "차트 생성",
  "first line title": "첫 번째 행을 제목으로",
  "untitled": "제목 없음",
  "One-dimensional array": "1차원 배열",
  "Two-dimensional array": "2차원 배열",
  "Multidimensional Arrays": "다차원 배열",
  "Diagonal": "대각선",
  "Anti-diagonal": "반대 대각선",
  "Diagonal offset": "대각선 오프셋",
  "Offset": "오프셋",
  "Boolean": "부울",
  "Flip": "뒤집기",
  "Up and down": "상하",
  "Left and right": "좌우",
  "Clockwise": "시계 방향",
  "Counterclockwise": "반시계 방향",
  "Transpose": "전치",
  "Matrix calculation": "행렬 계산",
  "Plus": "더하기",
  "Minus": "빼기",
  "Multiply": "곱하기",
  "Divided": "나누기",
  "Power": "제곱",
  "Root": "제곱근",
  "Log": "로그",
  "Delete 0 values at both ends": "양 끝 0 값 삭제",
  "Remove duplicate values": "중복 값 제거",
  "By row": "행별",
  "By column": "열별",
  "Generate new matrix": "새 행렬 생성",

  // ── 시트 탭 컨텍스트 메뉴 ────────────────────────────────────────────────
  "Rename": "이름 바꾸기",
  "Change color": "색상 변경",
  "Unhide": "숨기기 취소",
  "Move right": "오른쪽으로 이동",
  "Reset color": "색상 초기화",
  "Confirm color": "색상 확인",
  "Focus": "포커스",
  "New sheet": "새 시트",
  "Sheet options": "시트 옵션",

  // ── 정보 / 상태표시줄 ────────────────────────────────────────────────────
  "Loading...": "로딩 중...",
  "more rows at bottom": "아래에 행 추가",
  "Back to the top": "맨 위로",
  "Zoom in": "확대",
  "Zoom out": "축소",
  "New opened": "새로 열림",
  "Local cache restored": "로컬 캐시 복원됨",
  "Untitled spreadsheet": "제목 없는 스프레드시트",
  "waiting for update": "업데이트 대기 중",
  "Exit": "종료",
  "WorkBook rename": "통합 문서 이름 바꾸기",
  "Current cell input": "현재 셀 입력",
  "Dropdown": "드롭다운",
  "total:": "합계:",

  // ── 정렬 다이얼로그 ─────────────────────────────────────────────────────
  "Ascending ": "오름차순",
  "Descending ": "내림차순",
  "Custom sort": "사용자 지정 정렬",
  "Data has a header row": "데이터에 헤더 행이 있음",
  "Sort by": "정렬 기준",
  "Add another sort column": "정렬 열 추가",
  "close": "닫기",
  "sort": "정렬",
  "then by": "다음 기준",
  "Sort range": "정렬 범위",
  "Sort range from": "정렬 범위:",
  "to": "~",

  // ── 필터 ────────────────────────────────────────────────────────────────
  "create filter": "필터 생성",
  "Filter by color": "색상으로 필터",
  "Filter by condition": "조건으로 필터",
  "Filter by values": "값으로 필터",
  "None": "없음",
  "Enter filter value": "필터 값 입력",
  "Check all": "모두 선택",
  "Clear": "지우기",
  "Inverse": "반전",
  "Clear filter": "필터 지우기",
  "Is empty": "비어 있음",
  "Is not empty": "비어 있지 않음",
  "Text contains": "텍스트 포함",
  "Text does not contain": "텍스트 미포함",
  "Text starts with": "텍스트 시작",
  "Text ends with": "텍스트 끝",
  "Text is exactly": "텍스트 일치",
  "Date is": "날짜 일치",
  "Date is before": "날짜 이전",
  "Date is after": "날짜 이후",
  "Greater than": "초과",
  "Greater than or equal to": "이상",
  "Less than": "미만",
  "Less than or equal to": "이하",
  "Is equal to": "같음",
  "Is not equal to": "같지 않음",
  "Is between": "사이",
  "Is not between": "사이 아님",
  "Month": "월",
  "Year": "년",
  "Filter by cell color": "셀 색상으로 필터",
  "Filter by font color": "글자 색상으로 필터",
  "This column contains only one color": "이 열에는 색상이 하나만 있습니다",
  "Date format": "날짜 형식",
  "(Null)": "(없음)",
  "filter By Values": "값으로 필터",
  "Value for formula": "수식 값",

  // ── 테두리 ──────────────────────────────────────────────────────────────
  "Top border": "위쪽 테두리",
  "Bottom border": "아래쪽 테두리",
  "Left border": "왼쪽 테두리",
  "Right border": "오른쪽 테두리",
  "No border": "테두리 없음",
  "All borders": "모든 테두리",
  "Outside border": "바깥쪽 테두리",
  "Inside border": "안쪽 테두리",
  "Horizontal borders": "가로 테두리",
  "Vertical borders": "세로 테두리",
  "border color": "테두리 색상",
  "border size": "테두리 두께",
  "Slash border": "대각선 테두리",
  "default": "기본값",
  "border style": "테두리 스타일",

  // ── 셀 병합 ─────────────────────────────────────────────────────────────
  "Merge all": "전체 병합",
  "Merge Vertically": "세로 병합",
  "Merge Horizontally": "가로 병합",
  "Unmerge": "병합 취소",

  // ── 텍스트 줄 바꿈 ───────────────────────────────────────────────────────
  "Overflow": "넘침",
  "Wrap": "줄 바꿈",
  "Clip": "잘라내기",

  // ── 텍스트 회전 ─────────────────────────────────────────────────────────
  "Tilt Up": "위쪽 기울임",
  "Tilt Down": "아래쪽 기울임",
  "Stack Vertically": "세로 쌓기",
  "Rotate Up": "위쪽 회전",
  "Rotate Down": "아래쪽 회전",

  // ── 고정 ────────────────────────────────────────────────────────────────
  "First Row": "첫 번째 행",
  "First Column": "첫 번째 열",
  "Both": "행과 열 모두",
  "Freeze to current row": "현재 행까지 고정",
  "Freeze to current column": "현재 열까지 고정",
  "Freeze to current cell": "현재 셀까지 고정",
  "Cancel freezing": "고정 취소",

  // ── 찾기 및 바꾸기 ───────────────────────────────────────────────────────
  "Find": "찾기",
  "Replace": "바꾸기",
  "Go to": "이동",
  "Location": "위치",
  "Formula": "수식",
  "Date": "날짜",
  "String": "문자열",
  "Error": "오류",
  "Condition": "조건",
  "Row span": "행 범위",
  "Column span": "열 범위",
  "Find Content": "찾을 내용",
  "Replace Content": "바꿀 내용",
  "Regular Expression": "정규 표현식",
  "Whole word": "전체 단어",
  "Case sensitive": "대/소문자 구분",
  "Replace All": "모두 바꾸기",
  "Find All": "모두 찾기",
  "Find next": "다음 찾기",
  "Sheet": "시트",
  "Cell": "셀",
  "Value": "값",
  "Constant": "상수",
  "Logical": "논리",
  "Null": "빈 셀",
  "The content was not found": "찾을 내용이 없습니다",
  "There is nothing to replace": "바꿀 내용이 없습니다",
  "Cell not found": "셀을 찾을 수 없습니다",
  "Please enter the search content": "검색어를 입력하세요",

  // ── 버튼 ────────────────────────────────────────────────────────────────
  "Update": "업데이트",
  "Previous": "이전",
  "Next": "다음",

  // ── 교대 색상 ────────────────────────────────────────────────────────────
  "Apply to range": "범위에 적용",
  "Select a data range": "데이터 범위 선택",
  "Header": "머리글",
  "Footer": "바닥글",
  "Format style": "서식 스타일",
  "Remove alternating colors": "교대 색상 제거",
  "color": "색상",
  "Current": "현재",
  "Please select the range of alternating colors": "교대 색상 범위를 선택하세요",

  // ── 숫자 서식 ────────────────────────────────────────────────────────────
  "More currency formats": "더 많은 통화 형식",
  "More date and time formats": "더 많은 날짜 및 시간 형식",
  "More number formats": "더 많은 숫자 형식",
  "Currency formats": "통화 형식",
  "Decimal places": "소수 자리수",
  "Date and time formats": "날짜 및 시간 형식",
  "Number formats": "숫자 형식",
  "Select": "선택",
  "format": "서식",
  "currency": "통화",

  // ── 이미지 ──────────────────────────────────────────────────────────────
  "Image setting": "이미지 설정",
  "Conventional": "일반",
  "Move and resize cells": "셀과 함께 이동 및 크기 조정",
  "Move and do not resize the cell": "셀과 함께 이동 (크기 조정 없음)",
  "Do not move and resize the cell": "이동 및 크기 조정 안 함",
  "Fixed position": "고정 위치",
  "Solid": "실선",
  "Dashed": "파선",
  "Dotted": "점선",
  "Double": "이중선",
  "Color": "색상",
  "Style": "스타일",
  "Radius": "반지름",

  // ── 텍스트 나누기 ────────────────────────────────────────────────────────
  "Delimiters": "구분 기호",
  "Other": "기타",
  "Preview": "미리 보기",
  "Tab": "탭",
  "semicolon": "세미콜론",
  "comma": "쉼표",
  "space": "공백",

  // ── 스크린샷 ────────────────────────────────────────────────────────────
  "Please select the scope of the screenshot": "스크린샷 범위를 선택하세요",
  "Warning！": "경고！",
  "Successful": "성공",
  "Copy to clipboard": "클립보드에 복사",
  "Download": "다운로드",
  'Please right-click "copy" on the picture': '이미지에서 마우스 오른쪽 클릭 후 "복사"를 선택하세요',

  // ── 조건부 서식 ─────────────────────────────────────────────────────────
  "Conditionformat-GreaterThan": "조건부 서식 - 초과",
  "Format cells greater than": "다음 값보다 큰 셀 서식 지정",
  "Conditionformat-LessThan": "조건부 서식 - 미만",
  "Format cells smaller than": "다음 값보다 작은 셀 서식 지정",
  "Conditionformat-Betweenness": "조건부 서식 - 사이",
  "Format cells with values between": "다음 값 사이의 셀 서식 지정",
  "Conditionformat-Equal": "조건부 서식 - 같음",
  "Format cells equal to": "다음 값과 같은 셀 서식 지정",
  "Conditionformat-TextContains": "조건부 서식 - 텍스트 포함",
  "Format cells containing the following text": "다음 텍스트를 포함하는 셀 서식 지정",
  "Conditionformat-OccurrenceDate": "조건부 서식 - 날짜",
  "Format cells containing the following dates": "다음 날짜를 포함하는 셀 서식 지정",
  "Conditionformat-DuplicateValue": "조건부 서식 - 중복 값",
  "Format cells containing the following types of values": "다음 유형의 값을 포함하는 셀 서식 지정",
  "Conditionformat-Top10": "조건부 서식 - 상위 10개",
  "New rule": "새 규칙",
  "Edit rule": "규칙 편집",
  "Delete rule": "규칙 삭제",
  "Manage rules": "규칙 관리",
  "Highlight cell rules": "셀 강조 규칙",
  "Color scales": "색조",
  "Data bars": "데이터 막대",
  "Icon sets": "아이콘 집합",

  // ── 가로/세로 정렬 드롭다운 값 ───────────────────────────────────────────
  "left": "왼쪽",
  "center": "가운데",
  "right": "오른쪽",
  "Top": "위",
  "Middle": "중간",
  "Bottom": "아래",

  // ── 숫자 형식 드롭다운 텍스트 (defaultFmt) ───────────────────────────────
  "Automatic": "자동",
  "Plain text": "일반 텍스트",
  "Percent": "백분율",
  "Scientific": "과학적 표기",
  "Accounting": "회계",
  "Currency": "통화",
  "Time": "시간",
  "Time 24H": "시간 (24시간)",
  "Date time": "날짜 시간",
  "Date time 24 H": "날짜 시간 (24시간)",
  "Custom formats": "사용자 지정 서식",

  // ── 시트 관리 메시지 ─────────────────────────────────────────────────────
  "Are you sure to delete": "삭제하시겠습니까?",
  "Can't hide, at least keep one sheet tag": "숨길 수 없습니다. 최소 하나의 시트는 표시해야 합니다.",

  // ── 조건부 서식 추가 항목 ────────────────────────────────────────────────
  "Item selection rules": "항목 선택 규칙",
  "Management rules": "규칙 관리",
  "Conditional Formatting Rule Manager": "조건부 서식 규칙 관리자",
};

// ── 텍스트 노드 번역 (컨텍스트 메뉴, 다이얼로그 등) ──────────────────────
const UI_SELECTORS = [
  ".fortune-context-menu",
  ".fortune-sheet-list",
  ".fortune-sort",
  ".fortune-sort-modal",
  ".fortune-search-replace",
  ".fortune-dialog",
  ".fortune-toolbar-select-option",
  ".fortune-toolbar-combo-popup",
  ".fortune-toolbar-more-container",
  ".fortune-stat-area",
  ".fortune-zoom-container",
  ".fortune-add-row-button",
  ".fortune-message-box-button",
  ".fortune-modal-dialog-header",
  ".fortune-menuitem-row",
  ".fortune-byvalue-btn",
  ".fortune-change-color",
  ".fortune-data-verification",
  ".fortune-border-select-option",
  ".fortune-toolbar-menu-line",
  ".fortune-location-condition",
  ".fortune-alternating-colors",
  ".fortune-dialog-box-content",
].join(", ");

function translateTextNodes(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);
  nodes.forEach((node) => {
    const text = node.textContent?.trim();
    if (text && KO_MAP[text]) {
      node.textContent = node.textContent.replace(text, KO_MAP[text]);
    }
  });
}

function translateNode(container) {
  if (!container) return;

  // 1. 툴바 tooltip 번역
  container.querySelectorAll(".fortune-tooltip").forEach((el) => {
    const text = el.textContent?.trim();
    if (text && KO_MAP[text]) el.textContent = KO_MAP[text];
  });

  // 2. title 속성 번역
  container.querySelectorAll("[title]").forEach((el) => {
    const t = el.getAttribute("title");
    if (t && KO_MAP[t]) el.setAttribute("title", KO_MAP[t]);
  });

  // 3. UI 요소 텍스트 번역
  const targets = new Set();
  if (container.matches?.(UI_SELECTORS)) targets.add(container);
  container.querySelectorAll(UI_SELECTORS).forEach((el) => targets.add(el));
  targets.forEach(translateTextNodes);
}

export function observeKoreanTitles(container) {
  if (!container) return () => {};

  translateNode(container);

  // workbook 내부 변화 감지
  const innerObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "childList") {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === 1) translateNode(node);
        });
        translateNode(container);
      }
    }
  });
  innerObserver.observe(container, { childList: true, subtree: true });

  // 컨텍스트 메뉴, 다이얼로그 등 document 레벨 변화 감지
  const docObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "childList") {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          const cls = typeof node.className === "string" ? node.className : "";
          if (cls.includes("fortune-")) translateNode(node);
          node.querySelectorAll?.(UI_SELECTORS).forEach((el) => translateTextNodes(el));
        });
      }
    }
  });
  docObserver.observe(document.body, { childList: true, subtree: true });

  return () => {
    innerObserver.disconnect();
    docObserver.disconnect();
  };
}
