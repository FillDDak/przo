import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import { locale as fsLocale } from "@fortune-sheet/core";
import { observeKoreanTitles } from "../utils/fortuneSheetKo";
import { getErrorMessage } from "../utils/errorMessage";
import ConfirmModal from "../components/ConfirmModal";
import "./EstimateSheet.css";

// fontarray[0]을 Arial로 교체 → 새 셀의 기본 폰트가 Arial이 됨
const _enLocale = fsLocale({ lang: "en" });
if (_enLocale?.fontarray) {
  _enLocale.fontarray[0] = "Arial";
  _enLocale.fontarray[1] = "Times New Roman";
}

// celldata(sparse) → makeSnapshot과 동일한 포맷의 스냅샷 문자열 생성
// Fortune Sheet는 초기 마운트 시 onChange를 발화하지 않으므로
// 로드·저장·초기화 직후 이 함수로 baseline을 즉시 설정한다
function makeCelldataSnapshot(sheets) {
  return JSON.stringify(sheets.map((s) => {
    const cellValues = {};
    (s.celldata || []).forEach(({ r, c, v }) => {
      const val = v != null ? (v.v ?? null) : null;
      if (val !== null && val !== "") cellValues[`${r}_${c}`] = val;
    });
    return {
      cellValues,
      rowlen: s.config?.rowlen || {},
      columnlen: s.config?.columnlen || {},
    };
  }));
}

const TTL = { bl: 1, ht: 0, vt: 0, bg: "#E8F5E9", fc: "#1A1A1A", fs: 16, ff: 0 };
const HDR = { bl: 1, ht: 0, vt: 0, bg: "#4CAF50", fc: "#FFFFFF", fs: 12, ff: 0 };

// ExcelJS Worksheet → Fortune Sheet 시트 객체로 변환
function wsToFortuneSheet(ws, name, id, order) {
  const celldata = [];
  const merge = {};
  const rowlen = {};
  const columnlen = {};

  const FONT_NAME_MAP = { Arial: 0, "Times New Roman": 1, Tahoma: 2, Verdana: 3, Georgia: 4, "Courier New": 5 };
  const htMap = { center: 0, left: 1, right: 2, justify: 3 };
  const vtMap = { middle: 0, top: 1, bottom: 2 };

  const argbToHex = (argb) => {
    if (!argb || argb.length < 6) return null;
    const hex = argb.length === 8 ? argb.slice(2) : argb;
    return "#" + hex.toUpperCase();
  };

  const parseAddr = (addr) => {
    const m = addr.match(/^([A-Z]+)(\d+)$/);
    if (!m) return null;
    const c = m[1].split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;
    return { r: parseInt(m[2]) - 1, c };
  };

  // 병합 맵 구성
  const slaveToMasterMap = {};
  (ws.model?.merges || []).forEach((rangeStr) => {
    const [s, e] = rangeStr.split(":");
    const start = parseAddr(s);
    const end = parseAddr(e);
    if (!start || !end) return;
    const { r, c } = start;
    const rs = end.r - start.r + 1;
    const cs = end.c - start.c + 1;
    merge[`${r}_${c}`] = { r, c, rs, cs };
    for (let ri = r; ri < r + rs; ri++) {
      for (let ci = c; ci < c + cs; ci++) {
        if (ri === r && ci === c) continue;
        slaveToMasterMap[`${ri}_${ci}`] = { r, c };
      }
    }
  });

  // 행 높이 (pt → px)
  ws.eachRow((row, rn) => {
    if (row.height) rowlen[rn - 1] = Math.round(row.height / 0.75);
  });

  // 열 너비 (chars → px)
  (ws.columns || []).forEach((col, ci) => {
    if (col?.width) columnlen[ci] = Math.round(col.width * 7);
  });

  // 셀 값 + 스타일
  ws.eachRow((row, rn) => {
    row.eachCell({ includeEmpty: false }, (cell, cn) => {
      const r = rn - 1, c = cn - 1;
      const key = `${r}_${c}`;
      const v = {};

      let raw = cell.value;
      if (raw !== null && raw !== undefined) {
        if (typeof raw === "object" && raw?.result !== undefined) raw = raw.result;
        if (raw instanceof Date) {
          v.v = raw.toLocaleDateString("ko-KR");
          v.m = v.v;
          v.ct = { fa: "General", t: "s" };
        } else if (typeof raw === "number") {
          v.v = raw; v.m = String(raw); v.ct = { fa: "General", t: "n" };
        } else {
          v.v = String(raw); v.m = String(raw); v.ct = { fa: "General", t: "s" };
        }
      }

      const f = cell.font || {};
      if (f.bold) v.bl = 1;
      if (f.italic) v.it = 1;
      if (f.size) v.fs = f.size;
      if (f.color?.argb) { const h = argbToHex(f.color.argb); if (h) v.fc = h; }
      if (f.name) v.ff = FONT_NAME_MAP[f.name] ?? 0;

      if (cell.fill?.type === "pattern" && cell.fill.fgColor?.argb) {
        const h = argbToHex(cell.fill.fgColor.argb);
        if (h) v.bg = h;
      }

      const al = cell.alignment || {};
      if (al.horizontal != null) v.ht = htMap[al.horizontal] ?? 1;
      if (al.vertical != null) v.vt = vtMap[al.vertical] ?? 0;

      if (merge[key]) v.mc = merge[key];
      else if (slaveToMasterMap[key]) v.mc = slaveToMasterMap[key];

      if (Object.keys(v).length > 0) celldata.push({ r, c, v });
    });
  });

  // Fortune Sheet는 slave 셀 항목도 필요
  Object.entries(slaveToMasterMap).forEach(([key, master]) => {
    const [r, c] = key.split("_").map(Number);
    if (!celldata.find((cd) => cd.r === r && cd.c === c)) {
      celldata.push({ r, c, v: { mc: master } });
    }
  });

  return {
    name, id, status: 0, order, hide: 0,
    row: Math.max(60, (ws.rowCount || 0) + 10),
    column: Math.max(15, (ws.columnCount || 0) + 5),
    celldata,
    config: { merge, rowlen, columnlen },
  };
}

function buildSheet(name, id, order, active, title, rows, colHeaders) {
  const celldata = [];
  const merge = {};

  const COLS = 5;

  // Row 0: 제목 (표 넓이와 동일하게 5열 병합)
  celldata.push({
    r: 0, c: 0,
    v: { ...TTL, v: title, m: title, ct: { fa: "General", t: "s" }, mc: { r: 0, c: 0, rs: 1, cs: COLS } },
  });
  for (let c = 1; c < COLS; c++) celldata.push({ r: 0, c, v: { mc: { r: 0, c: 0 } } });
  merge["0_0"] = { r: 0, c: 0, rs: 1, cs: COLS };

  // Row 1: 좁은 구분 행

  // Row 2: 컬럼 헤더
  (colHeaders || ["면적(평)", "면적(㎡)", "초기 2개월분", "매월 정기관리", "비고"]).forEach((h, c) => {
    celldata.push({ r: 2, c, v: { ...HDR, v: h, m: h, ct: { fa: "General", t: "s" } } });
  });

  // Row 3~: 데이터 (줄무늬 배경)
  rows.forEach((row, ri) => {
    const rowBg = ri % 2 === 0 ? "#FFFFFF" : "#F2F2F2";
    row.forEach((val, ci) => {
      const isNum = typeof val === "number";
      celldata.push({
        r: 3 + ri, c: ci,
        v: { v: val, m: String(val), ct: { fa: "General", t: isNum ? "n" : "s" }, ht: 0, vt: 0, ff: 0, bg: rowBg },
      });
    });
  });

  return {
    name,
    id,
    status: active ? 1 : 0,
    order,
    hide: 0,
    row: 20,
    column: 22,
    celldata,
    config: {
      merge,
      rowlen: { 0: 44, 1: 8, 2: 36 },
      columnlen: { 0: 130, 1: 100, 2: 160, 3: 160, 4: 120 },
    },
  };
}

const BIZ_ROWS = [
  ["10평~25평", "약 82m²", "30,000원", "40,000원", ""],
  ["25평~35평", "약 115m²", "30,000원", "45,000원", ""],
  ["35평~45평", "약 148m²", "30,000원", "50,000원", ""],
  ["45평~55평", "약 182m²", "30,000원", "60,000원", ""],
  ["55평~65평", "약 215m²", "30,000원", "70,000원", ""],
  ["65평~75평", "약 248m²", "30,000원", "80,000원", ""],
  ["75평~85평", "약 281m²", "40,000원", "90,000원", ""],
  ["85평~100평", "약 330m²", "40,000원", "100,000원", ""],
  ["100평 이상", "약 330m²", "방문 상담 후 견적", "방문 상담 후 견적", ""],
];

const HOME_ROWS = [
  ["10평~25평", "약 82m²", "140,000원", "40,000원", ""],
  ["25평~35평", "약 115m²", "150,000원", "45,000원", ""],
  ["35평~45평", "약 148m²", "160,000원", "50,000원", ""],
  ["45평~55평", "약 182m²", "165,000원", "60,000원", ""],
  ["55평~65평", "약 215m²", "170,000원", "70,000원", ""],
  ["65평 이상", "약 215m²", "방문 상담 후 견적", "방문 상담 후 견적", ""],
];

function initialSheets() {
  return [
    buildSheet(
      "사업장", "biz", 0, true,
      "PRZO (프르조) 사업장 가격표",
      BIZ_ROWS,
      ["면적(평)", "면적(㎡)", "초기 3개월(월별)", "매월 정기관리", "비고"]
    ),
    buildSheet(
      "가정집", "home", 1, false,
      "PRZO (프르조) 가정집 가격표",
      HOME_ROWS,
      ["면적(평)", "면적(㎡)", "초기 2개월(일시불)", "매월 정기관리", "비고"]
    ),
  ];
}

export default function EstimateSheet() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [sheets, setSheets] = useState(null); // 초기 렌더링 전용
  const sheetsRef = useRef(null);             // 저장용 live 상태 (re-render 없음)
  const decreaseHandlerRef = useRef(null);    // DOM injection 버튼용 핸들러 ref
  const workbookApiRef = useRef(null);        // Fortune Sheet 명령 API
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [workbookKey, setWorkbookKey] = useState(0);
  const workbookRef = useRef(null);
  // 저장된 상태의 스냅샷 (셀 값만 비교)
  const savedSnapshotRef = useRef(null);
  // true이면 다음 onChange에서 스냅샷을 새로 캡처 (로드·저장 직후)
  const captureNextAsBaseline = useRef(true);
  // onChange 타이밍 문제 보정용: 언제든 호출 가능한 dirty 재확인 함수
  const recheckDirtyRef = useRef(null);
  // 엑셀 불러오기
  const fileInputRef = useRef(null);
  const importSheetsRef = useRef([]);
  const [importModal, setImportModal] = useState(null); // { names: string[], selected: Set<number> }

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
    if (!sheets) return; // sheets가 null이면 workbookRef.current도 null
    const el = workbookRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => el.removeEventListener("wheel", handleWheel, { capture: true });
  }, [handleWheel, sheets]);


  // 행 줄이기 핸들러를 ref에 항상 최신 상태로 유지
  decreaseHandlerRef.current = () => {
    const api = workbookApiRef.current;
    const current = sheetsRef.current;
    if (!api || !current) return;
    const addBtn = document.querySelector(".fortune-add-row-button");
    const inputEl = addBtn?.parentNode?.querySelector("input[type='text']");
    const inputVal = parseInt(inputEl?.value || inputEl?.placeholder, 10);
    const count = (!isNaN(inputVal) && inputVal > 0) ? inputVal : 50;
    sheetsRef.current = current.map((sheet) => {
      const rows = sheet._rows || sheet.row || 84;
      const deleteCount = Math.min(count, Math.max(0, rows - 10));
      if (deleteCount <= 0) return sheet;
      api.applyOp([{
        op: "deleteRowCol",
        value: { type: "row", start: rows - deleteCount, end: rows - 1, id: sheet.id },
      }]);
      const newRows = rows - deleteCount;
      return { ...sheet, _rows: newRows, row: newRows };
    });
  };

  // "Add 50 rows" 버튼(.fortune-add-row-button) 옆에 "행 N개 줄이기" 버튼 주입
  useEffect(() => {
    const INJECTED_ID = "fortune-decrease-row-btn";
    const inject = () => {
      if (document.querySelector(`#${INJECTED_ID}`)) return;
      const addBtn = document.querySelector(".fortune-add-row-button");
      if (!addBtn) return;
      const btn = document.createElement("button");
      btn.id = INJECTED_ID;
      btn.textContent = "행 줄이기";
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
    fetch("/api/estimate-sheet")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const parsed = JSON.parse(res.data);
          const hasContent = parsed.some(
            (s) => s.celldata?.length > 0 || s.data?.some((row) => row?.some((c) => c !== null))
          );
          const initial = hasContent ? parsed : initialSheets();
          setSheets(initial);
          sheetsRef.current = initial;
          savedSnapshotRef.current = makeCelldataSnapshot(initial);
          captureNextAsBaseline.current = false;
          setIsDirty(false);
        } else {
          const initial = initialSheets();
          setSheets(initial);
          sheetsRef.current = initial;
          savedSnapshotRef.current = makeCelldataSnapshot(initial);
          captureNextAsBaseline.current = false;
          setIsDirty(false);
        }
      })
      .catch((e) => {
        console.error("[EstimateSheet] 로드 실패:", e);
        const initial = initialSheets();
        setSheets(initial);
        sheetsRef.current = initial;
        savedSnapshotRef.current = makeCelldataSnapshot(initial);
        captureNextAsBaseline.current = false;
        setIsDirty(false);
        setModal({ title: "저장된 데이터를 불러오지 못했습니다.", subtitle: "초기값으로 표시합니다.", buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
      });
  }, [loading, isAdmin]);

  // Fortune Sheet data(2D배열) → makeCelldataSnapshot과 동일한 포맷의 스냅샷 문자열 생성
  const makeSnapshot = useCallback((sheets) =>
    JSON.stringify(sheets.map((s) => {
      const cellValues = {};
      (s.data || []).forEach((row, r) => {
        (row || []).forEach((cell, c) => {
          const v = cell != null ? (cell.v ?? null) : null;
          if (v !== null && v !== "") cellValues[`${r}_${c}`] = v;
        });
      });
      return {
        cellValues,
        rowlen: s.config?.rowlen || {},
        columnlen: s.config?.columnlen || {},
      };
    }))
  , []);

  // onChange는 ref에만 저장 → setSheets 호출 없음 → Fortune Sheet re-render/스크롤 초기화 없음
  const handleChange = useCallback((newSheets) => {
    const prev = sheetsRef.current;
    // data도 함께 보관 → mouseup 재확인 시 최신 값 접근 가능
    sheetsRef.current = newSheets.map((sheet, i) => {
      const prevSheet = prev?.[i];
      const actualRows = sheet.data?.length; // 실제 표시 행 수 (줄이기 버튼에서 사용)
      if (!prevSheet?.celldata?.length) return { ...sheet, _rows: actualRows };
      return { ...sheet, celldata: prevSheet.celldata, data: sheet.data, _rows: actualRows };
    });

    // 로드·저장 직후 첫 onChange → 현재 상태를 기준 스냅샷으로 캡처
    if (captureNextAsBaseline.current) {
      savedSnapshotRef.current = makeSnapshot(newSheets);
      captureNextAsBaseline.current = false;
      setIsDirty(false);
      return;
    }

    // 현재 값과 저장된 스냅샷을 비교해 dirty 여부 결정
    setIsDirty(makeSnapshot(newSheets) !== savedSnapshotRef.current);
  }, [makeSnapshot]);

  // onChange 타이밍 보정: mouseup 후 100ms 뒤 sheetsRef.data 기준으로 재확인
  recheckDirtyRef.current = () => {
    if (captureNextAsBaseline.current || !savedSnapshotRef.current) return;
    setIsDirty(makeSnapshot(sheetsRef.current) !== savedSnapshotRef.current);
  };

  useEffect(() => {
    if (!sheets) return;
    const el = workbookRef.current;
    if (!el) return;
    const recheck = () => setTimeout(() => recheckDirtyRef.current?.(), 200);
    el.addEventListener("mouseup", recheck);
    el.addEventListener("keyup", recheck);
    return () => {
      el.removeEventListener("mouseup", recheck);
      el.removeEventListener("keyup", recheck);
    };
  }, [sheets]);

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
        // _rows: applyOp 후 수동 갱신된 값 우선 사용 (applyOp은 onChange를 트리거하지 않으므로 data?.length 신뢰 불가)
        const savedRow = _rows || data?.length || row;
        // savedRow 범위 밖의 celldata 항목 제거 (삭제된 행에 데이터가 있어도 강제로 제거)
        const savedCelldata = Array.from(celldataMap.values()).filter((c) => c.r < savedRow);

        return { name, id, order, status, hide, row: savedRow, column, celldata: savedCelldata, config };
      });
      const bodyStr = JSON.stringify({ data: JSON.stringify(payload) });
      const res = await fetch("/api/estimate-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: bodyStr,
      });
      const result = await res.json();
      if (result.success) {
        setModal({ title: "저장되었습니다.", subtitle: "변경 내용이 성공적으로 저장되었습니다.", buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
        savedSnapshotRef.current = makeSnapshot(sheetsRef.current);
        captureNextAsBaseline.current = false;
        setIsDirty(false);
      } else {
        setModal({ title: "저장 실패", subtitle: result.message || "다시 시도해 주세요.", buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
      }
    } catch (e) {
      console.error("[EstimateSheet] 저장 중 예외:", e);
      setModal({ title: "저장 중 오류가 발생했습니다.", subtitle: getErrorMessage(e), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    } finally {
      setSaving(false);
    }
  };

  const addImportedSheets = (selectedIndices) => {
    const current = sheetsRef.current || [];
    const usedNames = new Set(current.map((s) => s.name));
    const getUniqueName = (name) => {
      let n = name, i = 1;
      while (usedNames.has(n)) n = `${name} (${i++})`;
      usedNames.add(n);
      return n;
    };
    const startOrder = current.length;
    const newSheets = selectedIndices.map((wi, idx) => {
      const ws = importSheetsRef.current[wi];
      return wsToFortuneSheet(ws, getUniqueName(ws.name), `imp_${Date.now()}_${idx}`, startOrder + idx);
    });
    const merged = [...current, ...newSheets];
    setSheets(merged);
    sheetsRef.current = merged;
    setWorkbookKey((k) => k + 1);
    setImportModal(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await file.arrayBuffer());
      importSheetsRef.current = wb.worksheets;
      if (wb.worksheets.length === 1) {
        addImportedSheets([0]);
      } else {
        setImportModal({ names: wb.worksheets.map((ws) => ws.name), selected: new Set(wb.worksheets.map((_, i) => i)) });
      }
    } catch (err) {
      console.error("[Import] 파일 읽기 실패:", err);
      setModal({ title: "엑셀 파일을 읽는 중 오류가 발생했습니다.", subtitle: getErrorMessage(err), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    }
  };

  const handleDownload = async () => {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();

    const FONT_NAMES = ["Arial", "Times New Roman", "Tahoma", "Verdana", "Georgia", "Courier New"];
    const toArgb = (hex) => hex ? "FF" + hex.replace("#", "").toUpperCase() : null;
    const htMap = { 0: "center", 1: "left", 2: "right", 3: "justify" };
    const vtMap = { 0: "middle", 1: "top", 2: "bottom" };

    (sheetsRef.current || []).forEach((sheet) => {
      // celldata(스타일 포함) + data(최신 편집값) 병합
      const celldataMap = new Map(
        (sheet.celldata || []).map((c) => [`${c.r}_${c.c}`, { ...c, v: { ...c.v } }])
      );
      if (sheet.data) {
        sheet.data.forEach((row, r) => {
          if (!row) return;
          row.forEach((cell, c) => {
            if (cell == null) return;
            const key = `${r}_${c}`;
            const existing = celldataMap.get(key);
            if (existing) {
              celldataMap.set(key, { ...existing, v: { ...existing.v, v: cell.v, m: cell.m } });
            } else {
              celldataMap.set(key, { r, c, v: cell });
            }
          });
        });
      }

      const cells = Array.from(celldataMap.values());
      if (!cells.length) return;

      const ws = wb.addWorksheet(sheet.name);

      // 행 높이 (px → pt)
      if (sheet.config?.rowlen) {
        Object.entries(sheet.config.rowlen).forEach(([ri, h]) => {
          ws.getRow(Number(ri) + 1).height = Math.round(h * 0.75);
        });
      }

      // 열 너비 (px → chars)
      if (sheet.config?.columnlen) {
        Object.entries(sheet.config.columnlen).forEach(([ci, w]) => {
          ws.getColumn(Number(ci) + 1).width = Math.max(w / 7, 3);
        });
      }

      // 셀 값 + 스타일
      cells.forEach(({ r, c, v }) => {
        if (!v) return;
        const isMain = !v.mc || v.mc.rs !== undefined;
        const cell = ws.getCell(r + 1, c + 1);

        if (isMain && v.v !== undefined && v.v !== null) {
          cell.value = v.m ?? v.v;
        }
        if (v.bg) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: toArgb(v.bg) } };
        }
        const font = {};
        if (v.bl) font.bold = true;
        if (v.it) font.italic = true;
        if (v.fs) font.size = v.fs;
        if (v.fc) font.color = { argb: toArgb(v.fc) };
        if (v.ff != null) font.name = FONT_NAMES[v.ff] ?? "Arial";
        if (Object.keys(font).length) cell.font = font;

        const align = {};
        if (v.ht != null) align.horizontal = htMap[v.ht];
        if (v.vt != null) align.vertical = vtMap[v.vt];
        if (Object.keys(align).length) cell.alignment = align;
      });

      // 셀 병합
      if (sheet.config?.merge) {
        Object.values(sheet.config.merge).forEach((m) => {
          ws.mergeCells(m.r + 1, m.c + 1, m.r + m.rs, m.c + m.cs);
        });
      }
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "방역서비스_가격표.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || sheets === null) return null;

  return (
    <>
    {modal && (
      <ConfirmModal
        title={modal.title}
        subtitle={modal.subtitle}
        onClose={() => setModal(null)}
        buttons={modal.buttons}
      />
    )}
    <div className="estimate-sheet">
      <div className="estimate-sheet__header">
        <div className="estimate-sheet__title-area">
          <svg className="estimate-sheet__title-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" />
          </svg>
          <h1 className="estimate-sheet__title">가격 견적 시트</h1>
        </div>
        <div className="estimate-sheet__actions">
          <div className="estimate-sheet__btn-group">
            <button className="estimate-sheet__import-btn" onClick={() => fileInputRef.current?.click()} title="불러오기">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 14l1.5-2.9A2 2 0 019.24 10H20a2 2 0 011.94 2.5l-1.55 6a2 2 0 01-1.94 1.5H4a2 2 0 01-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 011.66.9l.82 1.2a2 2 0 001.66.9H18a2 2 0 012 2v2"/>
              </svg>
              <span className="estimate-sheet__btn-label">불러오기</span>
            </button>
            <button className="estimate-sheet__download-btn" onClick={handleDownload} title="다운로드">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span className="estimate-sheet__btn-label">다운로드</span>
            </button>
          </div>
          <div className="estimate-sheet__btn-separator" />
          <div className="estimate-sheet__btn-group">
            <button
              className="estimate-sheet__reset-btn"
              onClick={() => {
                setModal({
                  title: "시트를 초기값으로 되돌리겠습니까?",
                  subtitle: "현재 편집 내용이 모두 사라집니다.",
                  buttons: [
                    { label: "확인", variant: "confirm", onClick: () => {
                      const initial = initialSheets();
                      setSheets(initial);
                      sheetsRef.current = initial;
                      setWorkbookKey((k) => k + 1);
                      setModal(null);
                    }},
                    { label: "취소", variant: "cancel", onClick: () => setModal(null) },
                  ],
                });
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
              <span className="estimate-sheet__btn-label">초기화</span>
            </button>
            <button className="estimate-sheet__save-btn" onClick={handleSave} disabled={saving || !isDirty} title={saving ? "저장 중..." : "저장"}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              <span className="estimate-sheet__btn-label">{saving ? "저장 중..." : "저장"}</span>
            </button>
          </div>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept=".xlsx" style={{ display: "none" }} onChange={handleFileChange} />
      {importModal && (
        <div className="estimate-sheet__import-overlay">
          <div className="estimate-sheet__import-modal">
            <h3 className="estimate-sheet__import-title">불러올 시트 선택</h3>
            <ul className="estimate-sheet__import-list">
              {importModal.names.map((name, i) => (
                <li key={i}>
                  <label>
                    <input
                      type="checkbox"
                      checked={importModal.selected.has(i)}
                      onChange={(e) => {
                        const next = new Set(importModal.selected);
                        e.target.checked ? next.add(i) : next.delete(i);
                        setImportModal({ ...importModal, selected: next });
                      }}
                    />
                    {name}
                  </label>
                </li>
              ))}
            </ul>
            <div className="estimate-sheet__import-actions">
              <button className="estimate-sheet__import-cancel" onClick={() => setImportModal(null)}>취소</button>
              <button
                className="estimate-sheet__import-confirm"
                onClick={() => addImportedSheets([...importModal.selected].sort((a, b) => a - b))}
                disabled={importModal.selected.size === 0}
              >
                불러오기
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="estimate-sheet__workbook" ref={workbookRef}>
        <Workbook
          key={workbookKey}
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
    </>
  );
}
