import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";
import "./PriceTable.css";

const DEFAULT_DATA = {
  biz: {
    title: "PRZO (프르조) 사업장 가격표",
    headers: ["면적(평)", "면적(㎡)", "초기 3개월(월별)", "매월 정기관리"],
    rows: [
      ["10평~25평", "약 82㎡", "30,000원", "40,000원"],
      ["25평~35평", "약 115㎡", "30,000원", "45,000원"],
      ["35평~45평", "약 148㎡", "30,000원", "50,000원"],
      ["45평~55평", "약 182㎡", "30,000원", "60,000원"],
      ["55평~65평", "약 215㎡", "30,000원", "70,000원"],
      ["65평~75평", "약 248㎡", "30,000원", "80,000원"],
      ["75평~85평", "약 281㎡", "40,000원", "90,000원"],
      ["85평~100평", "약 330㎡", "40,000원", "100,000원"],
      ["100평 이상", "약 330㎡", "방문 상담 후 견적", "방문 상담 후 견적"],
    ],
  },
  home: {
    title: "PRZO (프르조) 가정집 가격표",
    headers: ["면적(평)", "면적(㎡)", "초기 2개월(일시불)", "매월 정기관리"],
    rows: [
      ["10평~25평", "약 82㎡", "140,000원", "40,000원"],
      ["25평~35평", "약 115㎡", "150,000원", "45,000원"],
      ["35평~45평", "약 148㎡", "160,000원", "50,000원"],
      ["45평~55평", "약 182㎡", "165,000원", "60,000원"],
      ["55평~65평", "약 215㎡", "170,000원", "70,000원"],
      ["65평 이상", "약 215㎡", "방문 상담 후 견적", "방문 상담 후 견적"],
    ],
  },
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export default function PriceTable() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("biz");
  const [data, setData] = useState(null);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("priceTableTheme") !== "light";
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("priceTableTheme", next ? "dark" : "light");
      return next;
    });
  };

  const savedDataRef = useRef(null);
  // 편집 중인 셀: { tableKey, row, col }
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/admin");
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (loading || !isAdmin) return;
    fetch("/api/price-table")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const parsed = JSON.parse(res.data);
          setData(parsed);
          savedDataRef.current = JSON.stringify(parsed);
          setIsDirty(false);
        } else {
          const initial = deepClone(DEFAULT_DATA);
          setData(initial);
          savedDataRef.current = JSON.stringify(initial);
          setIsDirty(false);
        }
      })
      .catch(() => {
        const initial = deepClone(DEFAULT_DATA);
        setData(initial);
        savedDataRef.current = JSON.stringify(initial);
        setIsDirty(false);
        setModal({
          title: "저장된 데이터를 불러오지 못했습니다.",
          subtitle: "초기값으로 표시합니다.",
          buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }],
        });
      });
  }, [loading, isAdmin]);

  // 편집 셀이 바뀔 때 input에 포커스
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const checkDirty = useCallback(
    (newData) => {
      setIsDirty(JSON.stringify(newData) !== savedDataRef.current);
    },
    []
  );

  const handleCellDoubleClick = (tableKey, rowIdx, colIdx, value) => {
    setEditingCell({ tableKey, row: rowIdx, col: colIdx });
    setEditValue(value);
  };

  const commitEdit = useCallback(() => {
    if (!editingCell) return;
    const { tableKey, row, col } = editingCell;
    setData((prev) => {
      const next = deepClone(prev);
      next[tableKey].rows[row][col] = editValue;
      checkDirty(next);
      return next;
    });
    setEditingCell(null);
    setEditValue("");
  }, [editingCell, editValue, checkDirty]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue("");
  }, []);

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
    if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
    if (e.key === "Tab") { e.preventDefault(); commitEdit(); }
  };

  const handleHeaderEdit = (tableKey, colIdx, value) => {
    setData((prev) => {
      const next = deepClone(prev);
      next[tableKey].headers[colIdx] = value;
      checkDirty(next);
      return next;
    });
  };

  const handleAddRow = (tableKey) => {
    setData((prev) => {
      const next = deepClone(prev);
      const cols = next[tableKey].headers.length;
      next[tableKey].rows.push(Array(cols).fill(""));
      checkDirty(next);
      return next;
    });
  };

  const handleDeleteRow = (tableKey, rowIdx) => {
    setData((prev) => {
      const next = deepClone(prev);
      next[tableKey].rows.splice(rowIdx, 1);
      checkDirty(next);
      return next;
    });
  };

  const handleSave = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/price-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ data: JSON.stringify(data) }),
      });
      const json = await res.json();
      if (json.success) {
        const saved = JSON.parse(json.data);
        setData(saved);
        savedDataRef.current = JSON.stringify(saved);
        setIsDirty(false);
        setModal({
          title: "저장되었습니다.",
          buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }],
        });
      } else {
        setModal({
          title: "저장 실패",
          subtitle: json.message || "다시 시도해 주세요.",
          buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }],
        });
      }
    } catch {
      setModal({
        title: "저장 중 오류가 발생했습니다.",
        subtitle: "네트워크를 확인해 주세요.",
        buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }],
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setModal({
      title: "초기값으로 되돌리겠습니까?",
      subtitle: "현재 편집 내용이 모두 사라집니다.",
      buttons: [
        { label: "취소", variant: "cancel", onClick: () => setModal(null) },
        {
          label: "초기화",
          variant: "danger",
          onClick: () => {
            const initial = deepClone(DEFAULT_DATA);
            setData(initial);
            setEditingCell(null);
            setEditValue("");
            checkDirty(initial);
            setModal(null);
          },
        },
      ],
    });
  };

  if (loading || !data) {
    return (
      <div className="price-table">
        <div className="price-table__loading">불러오는 중...</div>
      </div>
    );
  }

  const tableKeys = ["biz", "home"];
  const tabLabels = { biz: "사업장", home: "가정집" };

  return (
    <div className={`price-table${isDark ? "" : " price-table--light"}`}>
      {/* 헤더 */}
      <div className="price-table__header">
        <div className="price-table__title-area">
          <svg className="price-table__title-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
          </svg>
          <h1 className="price-table__title">가격표 관리</h1>
        </div>
        <div className="price-table__actions">
          <div className="price-table__btn-group">
            <button
              className="price-table__theme-btn"
              onClick={toggleTheme}
              title={isDark ? "밝은 모드로 전환" : "야간 모드로 전환"}
            >
              {isDark ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              <span className="price-table__btn-label">{isDark ? "밝게" : "어둡게"}</span>
            </button>
          </div>
          <div className="price-table__btn-separator" />
          <div className="price-table__btn-group">
            <button
              className="price-table__reset-btn"
              onClick={handleReset}
              title="초기값으로 되돌리기"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span className="price-table__btn-label">초기화</span>
            </button>
          </div>
          <div className="price-table__btn-separator" />
          <div className="price-table__btn-group">
            <button
              className="price-table__save-btn"
              onClick={handleSave}
              disabled={!isDirty || saving}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="price-table__tabs">
        {tableKeys.map((key) => (
          <button
            key={key}
            className={`price-table__tab${activeTab === key ? " price-table__tab--active" : ""}`}
            onClick={() => { cancelEdit(); setActiveTab(key); }}
          >
            {tabLabels[key]}
          </button>
        ))}
        {isDirty && <span className="price-table__dirty-badge">미저장</span>}
      </div>

      {/* 테이블 영역 */}
      <div className="price-table__body">
        {tableKeys.map((tableKey) => (
          <div
            key={tableKey}
            className={`price-table__table-wrap${activeTab === tableKey ? " price-table__table-wrap--active" : ""}`}
          >
            <div className="price-table__card">
              {/* 카드 헤더 */}
              <div className="price-table__card-header">
                <span className="price-table__card-dot" />
                <span className="price-table__card-title">{data[tableKey].title}</span>
              </div>

              {/* 테이블 */}
              <div className="price-table__scroll">
                <table className="price-table__table">
                  <thead>
                    <tr>
                      {data[tableKey].headers.map((h, ci) => (
                        <th key={ci}>
                          <input
                            className="price-table__header-input"
                            value={h}
                            onChange={(e) => handleHeaderEdit(tableKey, ci, e.target.value)}
                          />
                        </th>
                      ))}
                      <th className="price-table__action-col" />
                    </tr>
                  </thead>
                  <tbody>
                    {data[tableKey].rows.map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? "price-table__row-even" : "price-table__row-odd"}>
                        {row.map((cell, ci) => {
                          const isEditing =
                            editingCell &&
                            editingCell.tableKey === tableKey &&
                            editingCell.row === ri &&
                            editingCell.col === ci;
                          return (
                            <td
                              key={ci}
                              className={`price-table__cell${isEditing ? " price-table__cell--editing" : ""}`}
                              onDoubleClick={() => handleCellDoubleClick(tableKey, ri, ci, cell)}
                              title="더블클릭하여 편집"
                            >
                              {isEditing ? (
                                <input
                                  ref={inputRef}
                                  className="price-table__cell-input"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={commitEdit}
                                  onKeyDown={handleInputKeyDown}
                                />
                              ) : (
                                <span className="price-table__cell-text">{cell || <span className="price-table__cell-empty">—</span>}</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="price-table__action-col">
                          <button
                            className="price-table__delete-row-btn"
                            onClick={() => handleDeleteRow(tableKey, ri)}
                            title="행 삭제"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 카드 푸터 */}
              <div className="price-table__card-footer">
                <button
                  className="price-table__add-row-btn"
                  onClick={() => handleAddRow(tableKey)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  행 추가
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="price-table__hint">셀을 더블클릭하면 수정할 수 있습니다. Enter로 확인, Esc로 취소.</p>

      {modal && <ConfirmModal {...modal} />}
    </div>
  );
}
