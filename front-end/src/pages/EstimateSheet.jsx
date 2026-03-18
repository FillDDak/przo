import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import * as XLSX from "xlsx";
import { locale as fsLocale } from "@fortune-sheet/core";
import { observeKoreanTitles } from "../utils/fortuneSheetKo";
import "./EstimateSheet.css";

// fontarray[0]을 Arial로 교체 → 새 셀의 기본 폰트가 Arial이 됨
const _enLocale = fsLocale({ lang: "en" });
if (_enLocale?.fontarray) {
  _enLocale.fontarray[0] = "Arial";
  _enLocale.fontarray[1] = "Times New Roman";
}

const TTL = { bl: 1, ht: 0, vt: 0, bg: "#4472C4", fc: "#FFFFFF", fs: 15, ff: 0 };
const SUB = { ht: 0, vt: 0, bg: "#BDD7EE", fc: "#1F1F1F", fs: 11, ff: 0 };
const HDR = { bl: 1, ht: 0, vt: 0, bg: "#4472C4", fc: "#FFFFFF", fs: 12, ff: 0 };

function buildSheet(name, id, order, active, title, subtitle, rows) {
  const celldata = [];
  const merge = {};

  const COLS = 15;

  // Row 0: 제목 (A~T 병합)
  celldata.push({
    r: 0, c: 0,
    v: { ...TTL, v: title, m: title, ct: { fa: "General", t: "s" }, mc: { r: 0, c: 0, rs: 1, cs: COLS } },
  });
  for (let c = 1; c < COLS; c++) celldata.push({ r: 0, c, v: { mc: { r: 0, c: 0 } } });
  merge["0_0"] = { r: 0, c: 0, rs: 1, cs: COLS };

  // Row 1: 부제목 (A~T 병합)
  celldata.push({
    r: 1, c: 0,
    v: { ...SUB, v: subtitle, m: subtitle, ct: { fa: "General", t: "s" }, mc: { r: 1, c: 0, rs: 1, cs: COLS } },
  });
  for (let c = 1; c < COLS; c++) celldata.push({ r: 1, c, v: { mc: { r: 1, c: 0 } } });
  merge["1_0"] = { r: 1, c: 0, rs: 1, cs: COLS };

  // Row 2: 빈 행

  // Row 3: 컬럼 헤더
  ["면적(평)", "면적(㎡)", "초기 2개월분", "매월 정기관리", "비고"].forEach((h, c) => {
    celldata.push({ r: 3, c, v: { ...HDR, v: h, m: h, ct: { fa: "General", t: "s" } } });
  });

  // Row 4~: 데이터
  rows.forEach((row, ri) => {
    row.forEach((val, ci) => {
      const isNum = typeof val === "number";
      celldata.push({
        r: 4 + ri, c: ci,
        v: { v: val, m: String(val), ct: { fa: "General", t: isNum ? "n" : "s" }, ht: 0, ff: 0 },
      });
    });
  });

  return {
    name,
    id,
    status: active ? 1 : 0,
    order,
    hide: 0,
    row: 60,
    column: 15,
    celldata,
    config: {
      merge,
      rowlen: { 0: 44, 1: 34, 3: 36 },
      columnlen: { 0: 130, 1: 85, 2: 140, 3: 140, 4: 120 },
    },
  };
}

const BIZ_ROWS = [
  ["10평", 9.9, "100,000원", "15,000원", ""],
  ["10평~20평", 66, "120,000원", "17,000원", ""],
  ["20평~30평", 99, "140,000원", "18,000원", ""],
  ["30평~40평", 132, "160,000원", "20,000원", ""],
  ["40평~50평", 165, "180,000원", "22,000원", ""],
  ["50평~70평", 231, "200,000원", "25,000원", ""],
  ["70평~100평", 330, "250,000원", "40,000원", ""],
];

const HOME_ROWS = [
  ["10평 이하", 33, "80,000원", "12,000원", ""],
  ["10평~20평", 66, "100,000원", "14,000원", ""],
  ["20평~30평", 99, "120,000원", "16,000원", ""],
  ["30평~40평", 132, "140,000원", "18,000원", ""],
  ["40평~50평", 165, "160,000원", "20,000원", ""],
];

function initialSheets() {
  return [
    buildSheet(
      "사업용", "biz", 0, true,
      "PES-TOP 방역 서비스 가격표",
      "초기관리 2개월 (2개월 선결제) / 정기관리 10개월",
      BIZ_ROWS
    ),
    buildSheet(
      "가정용", "home", 1, false,
      "PES-TOP 방역 서비스 가격표 (가정용)",
      "초기관리 2개월 (2개월 선결제) / 정기관리 10개월",
      HOME_ROWS
    ),
  ];
}

export default function EstimateSheet() {
  const { isAdmin, loading, token } = useAuth();
  const navigate = useNavigate();
  const [sheets, setSheets] = useState(null); // 초기 렌더링 전용
  const sheetsRef = useRef(null);             // 저장용 live 상태 (re-render 없음)
  const decreaseHandlerRef = useRef(null);    // DOM injection 버튼용 핸들러 ref
  const workbookApiRef = useRef(null);        // Fortune Sheet 명령 API
  const [saving, setSaving] = useState(false);
  const workbookRef = useRef(null);

  const handleWheel = useCallback((e) => {
    const el = workbookRef.current;
    if (!el) return;
    const scrollbarY = el.querySelector(".luckysheet-scrollbar-y");
    const scrollbarX = el.querySelector(".luckysheet-scrollbar-x");
    if (!scrollbarY && !scrollbarX) return;
    e.preventDefault();
    e.stopPropagation();
    if (Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
      if (scrollbarY) scrollbarY.scrollTop += e.deltaY;
    } else {
      if (scrollbarX) scrollbarX.scrollLeft += e.deltaX;
    }
  }, []);

  useEffect(() => {
    const el = workbookRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => el.removeEventListener("wheel", handleWheel, { capture: true });
  }, [handleWheel]);

  // 행 줄이기 핸들러를 ref에 항상 최신 상태로 유지
  decreaseHandlerRef.current = () => {
    const api = workbookApiRef.current;
    const current = sheetsRef.current;
    if (!api || !current) return;
    current.forEach((sheet) => {
      const rows = sheet._rows || sheet.row || 84;
      const deleteCount = Math.min(50, Math.max(0, rows - 10));
      if (deleteCount <= 0) return;
      api.applyOp([{
        op: "deleteRowCol",
        value: { type: "row", start: rows - deleteCount, end: rows - 1, id: sheet.id },
      }]);
    });
  };

  // "Add 50 rows" 버튼(.fortune-add-row-button) 옆에 "행 50개 줄이기" 버튼 주입
  useEffect(() => {
    const INJECTED_ID = "fortune-decrease-row-btn";
    const inject = () => {
      if (document.querySelector(`#${INJECTED_ID}`)) return;
      const addBtn = document.querySelector(".fortune-add-row-button");
      if (!addBtn) return;
      const btn = document.createElement("button");
      btn.id = INJECTED_ID;
      btn.textContent = "행 50개 줄이기";
      btn.className = addBtn.className;
      btn.style.marginLeft = "6px";
      btn.addEventListener("click", (e) => { e.stopPropagation(); decreaseHandlerRef.current?.(); });
      addBtn.parentNode.insertBefore(btn, addBtn.nextSibling);
    };
    // Fortune Sheet가 외부 DOM을 re-render할 때도 감지하기 위해 document.body 감시
    const observer = new MutationObserver(inject);
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(inject, 600);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let disconnect = () => {};
    const timer = setTimeout(() => {
      disconnect = observeKoreanTitles(workbookRef.current);
    }, 500);
    return () => {
      clearTimeout(timer);
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/admin");
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (loading || !isAdmin) return;
    console.log("[EstimateSheet] 데이터 로드 시작");
    fetch("/api/estimate-sheet")
      .then((r) => {
        console.log("[EstimateSheet] 로드 응답 status:", r.status);
        return r.json();
      })
      .then((res) => {
        console.log("[EstimateSheet] 로드 응답:", { success: res.success, dataLength: res.data?.length, message: res.message });
        if (res.success && res.data) {
          const parsed = JSON.parse(res.data);
          const hasContent = parsed.some(
            (s) => s.celldata?.length > 0 || s.data?.some((row) => row?.some((c) => c !== null))
          );
          const initial = hasContent ? parsed : initialSheets();
          setSheets(initial);
          sheetsRef.current = initial;
        } else {
          const initial = initialSheets();
          setSheets(initial);
          sheetsRef.current = initial;
        }
      })
      .catch((e) => {
        console.error("[EstimateSheet] 로드 실패:", e);
        const initial = initialSheets();
        setSheets(initial);
        sheetsRef.current = initial;
      });
  }, [loading, isAdmin]);

  // onChange는 ref에만 저장 → setSheets 호출 없음 → Fortune Sheet re-render/스크롤 초기화 없음
  const handleChange = useCallback((newSheets) => {
    const prev = sheetsRef.current;
    sheetsRef.current = newSheets.map((sheet, i) => {
      const prevSheet = prev?.[i];
      const actualRows = sheet.data?.length; // 실제 표시 행 수 (줄이기 버튼에서 사용)
      if (!prevSheet?.celldata?.length) return { ...sheet, _rows: actualRows };
      return { ...sheet, celldata: prevSheet.celldata, _rows: actualRows };
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = (sheetsRef.current || []).map((sheet) => {
        const { name, id, order, status, hide, row, column, data, celldata, config, _rows } = sheet;

        // celldata를 base로, data(2D 배열)의 편집 내용을 병합 (교체 아님)
        const celldataMap = new Map((celldata || []).map((c) => [`${c.r}_${c.c}`, c]));
        if (data) {
          data.forEach((rowArr, r) => {
            if (!rowArr) return;
            rowArr.forEach((cell, c) => {
              if (cell !== null && cell !== undefined) {
                celldataMap.set(`${r}_${c}`, { r, c, v: cell });
              }
            });
          });
        }
        const savedCelldata = Array.from(celldataMap.values());
        // data.length가 실제 행 수 (insertRowCol/deleteRowCol은 row 필드를 갱신하지 않음)
        const savedRow = data?.length || _rows || row;

        return { name, id, order, status, hide, row: savedRow, column, celldata: savedCelldata, config };
      });
      const bodyStr = JSON.stringify({ data: JSON.stringify(payload) });
      console.log("[EstimateSheet] 저장 요청 크기:", bodyStr.length, "bytes");
      const res = await fetch("/api/estimate-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: bodyStr,
      });
      console.log("[EstimateSheet] 저장 응답 status:", res.status);
      const result = await res.json();
      console.log("[EstimateSheet] 저장 응답:", { success: result.success, dataLength: result.data?.length, message: result.message });
      if (result.success) {
        alert("저장되었습니다.");
      } else {
        alert(result.message || "저장 실패");
      }
    } catch (e) {
      console.error("[EstimateSheet] 저장 중 예외:", e);
      alert("저장 중 오류가 발생했습니다: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();
    (sheetsRef.current || []).forEach((sheet) => {
      if (!sheet.celldata?.length) return;
      const maxR = Math.max(...sheet.celldata.map((c) => c.r)) + 1;
      const maxC = Math.max(...sheet.celldata.map((c) => c.c)) + 1;
      const grid = Array.from({ length: maxR }, () => Array(maxC).fill(""));
      sheet.celldata.forEach(({ r, c, v }) => {
        if (!v) return;
        const isMain = !v.mc || v.mc.rs !== undefined;
        if (isMain && v.v !== undefined && v.v !== null) {
          grid[r][c] = v.m ?? String(v.v);
        }
      });
      const ws = XLSX.utils.aoa_to_sheet(grid);
      if (sheet.config?.merge) {
        ws["!merges"] = Object.values(sheet.config.merge).map((m) => ({
          s: { r: m.r, c: m.c },
          e: { r: m.r + m.rs - 1, c: m.c + m.cs - 1 },
        }));
      }
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });
    XLSX.writeFile(wb, "방역서비스_가격표.xlsx");
  };

  if (loading || sheets === null) return null;

  return (
    <div className="estimate-sheet">
      <div className="estimate-sheet__header">
        <h1 className="estimate-sheet__title">가격 견적 시트</h1>
        <div>
          <button className="estimate-sheet__save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </button>
          <button className="estimate-sheet__download-btn" onClick={handleDownload}>
            엑셀 다운로드
          </button>
        </div>
      </div>
      <div className="estimate-sheet__workbook" ref={workbookRef}>
        <Workbook
          ref={workbookApiRef}
          data={sheets}
          onChange={handleChange}
          showToolbar
          showFormulaBar
          showSheetTabs
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
}
