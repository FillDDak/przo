import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import imageCompression from "browser-image-compression";
import ConfirmModal from "../components/ConfirmModal";
import { getErrorMessage } from "../utils/errorMessage";
import { Link, useNavigate, useLocation, useBlocker } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./ReviewWrite.css";
import homeIcon from "../assets/other-page-icon-image/home-icon.svg";
import getCroppedImg from "../utils/getCroppedImg";

const API_BASE_URL = "/api";

let _uidCounter = 0;
const uid = () => `block-${Date.now()}-${++_uidCounter}`;

const toRelativeUrl = (url) => {
  try { return new URL(url).pathname; } catch { return url; }
};

const parseHtmlToBlocks = (html) => {
  if (!html) return [{ id: uid(), type: "text", html: "" }];
  const parts = html.split(/(<img\s[^>]*\/?>)/i);
  const blocks = parts.reduce((acc, part) => {
    if (/^<img\s/i.test(part)) {
      const src = part.match(/src="([^"]+)"/i)?.[1];
      if (src) acc.push({ id: uid(), type: "image", url: toRelativeUrl(src) });
    } else {
      const hasContent = part.replace(/<p>(\s|<br\s*\/?>)*<\/p>/gi, "").trim() !== "";
      if (hasContent) acc.push({ id: uid(), type: "text", html: part });
    }
    return acc;
  }, []);
  return blocks.length > 0 ? blocks : [{ id: uid(), type: "text", html: "" }];
};

const blocksToHtml = (blocks) =>
  blocks.map((b) => (b.type === "text" ? b.html : `<img src="${toRelativeUrl(b.url)}">`)).join("");

const MOSAIC_BLOCK_SIZE = 14;
const CROP_MIN = 0.04; // 최소 선택 영역 (4%)

// 핸들 드래그 계산 (순수 함수)
const computeNewSel = (handle, startSel, dx, dy) => {
  let { x, y, w, h } = startSel;
  if (handle === "move") {
    x = Math.max(0, Math.min(1 - w, x + dx));
    y = Math.max(0, Math.min(1 - h, y + dy));
  } else if (handle === "nw") {
    const nx = Math.max(0, Math.min(x + w - CROP_MIN, x + dx));
    const ny = Math.max(0, Math.min(y + h - CROP_MIN, y + dy));
    w = x + w - nx; h = y + h - ny; x = nx; y = ny;
  } else if (handle === "n") {
    const ny = Math.max(0, Math.min(y + h - CROP_MIN, y + dy));
    h = y + h - ny; y = ny;
  } else if (handle === "ne") {
    const ny = Math.max(0, Math.min(y + h - CROP_MIN, y + dy));
    h = y + h - ny; y = ny;
    w = Math.max(CROP_MIN, Math.min(1 - x, w + dx));
  } else if (handle === "e") {
    w = Math.max(CROP_MIN, Math.min(1 - x, w + dx));
  } else if (handle === "se") {
    w = Math.max(CROP_MIN, Math.min(1 - x, w + dx));
    h = Math.max(CROP_MIN, Math.min(1 - y, h + dy));
  } else if (handle === "s") {
    h = Math.max(CROP_MIN, Math.min(1 - y, h + dy));
  } else if (handle === "sw") {
    const nx = Math.max(0, Math.min(x + w - CROP_MIN, x + dx));
    w = x + w - nx; x = nx;
    h = Math.max(CROP_MIN, Math.min(1 - y, h + dy));
  } else if (handle === "w") {
    const nx = Math.max(0, Math.min(x + w - CROP_MIN, x + dx));
    w = x + w - nx; x = nx;
  }
  return { x, y, w, h };
};

const ReviewWrite = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const dateInputRef = useRef(null);
  const titleRef = useRef(null);
  const blockErrorRef = useRef(null);
  const { isAdmin, loading: authLoading } = useAuth();

  // 관리자가 아니면 /admin으로 리다이렉트
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isAdmin, authLoading, navigate]);

  const editData = routerLocation.state?.review || null;
  const isEdit = !!editData;

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const [title, setTitle] = useState(editData?.title || "");
  const [createdDate, setCreatedDate] = useState(
    editData?.createdAt ? editData.createdAt.replaceAll(".", "-") : today
  );
  const [blocks, setBlocks] = useState(() => {
    if (isEdit && editData?.content) return parseHtmlToBlocks(editData.content);
    return [{ id: uid(), type: "text", html: "" }];
  });
  const [thumbnailId, setThumbnailId] = useState(() => {
    if (isEdit && editData?.content && editData?.thumbnail) {
      const parsed = parseHtmlToBlocks(editData.content);
      const match = parsed.find(
        (b) => b.type === "image" && toRelativeUrl(b.url) === toRelativeUrl(editData.thumbnail)
      );
      return match?.id || parsed.find((b) => b.type === "image")?.id || null;
    }
    return null;
  });

  const [modal, setModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [blockError, setBlockError] = useState("");

  // 편집 모달 상태
  const [cropQueue, setCropQueue] = useState([]);
  const [cropQueueIndex, setCropQueueIndex] = useState(0);
  const [showCropModal, setShowCropModal] = useState(false);
  const [isCropUploading, setIsCropUploading] = useState(false);
  const insertAfterRef = useRef(null);
  const successCountRef = useRef(0);

  const [editMode, setEditMode] = useState("crop"); // 'crop' | 'mosaic'

  // 자르기 상태
  const [cropSel, setCropSel] = useState({ x: 0, y: 0, w: 1, h: 1 }); // 0~1 비율
  const cropDragRef = useRef(null);
  const cropContainerRef = useRef(null);
  const cropNaturalDimsRef = useRef(null);

  // 모자이크 상태
  const [brushSize, setBrushSize] = useState(30);
  const [mosaicApplied, setMosaicApplied] = useState(false);
  const mosaicCanvasRef = useRef(null);
  const origImageDataRef = useRef(null);
  const mosaicDrawingRef = useRef(false);
  const mosaicInitializedRef = useRef(false);
  const mosaicScaleRef = useRef(1);

  const submittedRef = useRef(false);

  const isDirty =
    title.trim() !== "" ||
    blocks.some((b) => b.type === "image") ||
    blocks.some((b) => b.type === "text" && b.html.replace(/<[^>]*>/g, "").trim() !== "");

  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }) =>
      isDirty && !submittedRef.current && currentLocation.pathname !== nextLocation.pathname,
    [isDirty]
  );

  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    return () => { cropQueue.forEach((item) => URL.revokeObjectURL(item.objectUrl)); };
  }, [cropQueue]);

  useEffect(() => {
    const imageBlocks = blocks.filter((b) => b.type === "image");
    if (imageBlocks.length === 0) {
      setThumbnailId(null);
    } else if (!imageBlocks.find((b) => b.id === thumbnailId)) {
      setThumbnailId(imageBlocks[0].id);
    }
  }, [blocks, thumbnailId]);

  // 모자이크 캔버스 초기화
  const currentCropItemForEffect = cropQueue[cropQueueIndex];
  useEffect(() => {
    if (editMode !== "mosaic" || !showCropModal || !currentCropItemForEffect) return;
    if (mosaicInitializedRef.current) return;
    const canvas = mosaicCanvasRef.current;
    if (!canvas) return;
    const img = new window.Image();
    img.onload = () => {
      const maxDim = 1200;
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      canvas.width = w;
      canvas.height = h;
      mosaicScaleRef.current = scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      origImageDataRef.current = ctx.getImageData(0, 0, w, h);
      mosaicInitializedRef.current = true;
    };
    img.src = currentCropItemForEffect.objectUrl;
  }, [editMode, showCropModal, cropQueueIndex, currentCropItemForEffect]);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["clean"],
      ],
    },
  }), []);

  const compressImage = async (blobOrFile, filename) => {
    if (filename.toLowerCase().endsWith(".gif")) return blobOrFile;
    try {
      return await imageCompression(blobOrFile instanceof File ? blobOrFile : new File([blobOrFile], filename), {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
      });
    } catch {
      return blobOrFile;
    }
  };

  const uploadImageBlob = async (blobOrFile, filename) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    const formData = new FormData();
    formData.append("image", blobOrFile, filename);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/upload-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
        signal: controller.signal,
      });
      if (res.status === 403) throw new Error("관리자 권한이 필요합니다. 다시 로그인 후 시도해주세요.");
      if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
      const data = await res.json();
      if (data.success) return data.url;
      throw new Error(data.message || "Upload failed");
    } catch (e) {
      if (e.name === "AbortError") throw new Error("이미지 업로드 시간이 초과되었습니다.");
      throw e;
    } finally {
      clearTimeout(timer);
    }
  };

  const canvasToBlob = (canvas) =>
    new Promise((res, rej) =>
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error("캔버스 변환에 실패했습니다."))),
        "image/jpeg",
        0.95
      )
    );

  const insertImageBlock = useCallback((afterIndex, url) => {
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, { id: uid(), type: "image", url });
      return next;
    });
    setBlockError("");
  }, []);

  const processCropQueue = useCallback((queue, index) => {
    if (index >= queue.length) {
      queue.forEach((item) => URL.revokeObjectURL(item.objectUrl));
      setCropQueue([]);
      setCropQueueIndex(0);
      setShowCropModal(false);
      successCountRef.current = 0;
      return;
    }
    setCropQueueIndex(index);
    setCropSel({ x: 0, y: 0, w: 1, h: 1 });
    cropNaturalDimsRef.current = null;
    cropDragRef.current = null;
    setEditMode("crop");
    setMosaicApplied(false);
    mosaicInitializedRef.current = false;
    origImageDataRef.current = null;
    setShowCropModal(true);
  }, []);

  const triggerImageUpload = (afterIndex) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.click();
    const ALLOWED = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    input.onchange = () => {
      const files = Array.from(input.files);
      if (!files.length) return;
      const invalid = files.find((f) => !ALLOWED.includes(f.name.substring(f.name.lastIndexOf(".")).toLowerCase()));
      if (invalid) {
        setModal({ title: `"${invalid.name}" 파일은 업로드할 수 없습니다. (jpg, jpeg, png, gif, webp만 가능)`, buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
        return;
      }
      const oversized = files.find((f) => f.size > 10 * 1024 * 1024);
      if (oversized) {
        setModal({ title: `"${oversized.name}" 파일 용량은 10MB를 초과할 수 없습니다.`, buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
        return;
      }
      insertAfterRef.current = afterIndex;
      successCountRef.current = 0;
      const queue = files.map((file) => ({ file, objectUrl: URL.createObjectURL(file) }));
      setCropQueue(queue);
      processCropQueue(queue, 0);
    };
  };

  // ─── 자르기 핸들 드래그 ───
  const handleCropPointerDown = useCallback((e) => {
    const handle = e.target.getAttribute("data-handle");
    if (!handle) return;
    e.preventDefault();
    const container = cropContainerRef.current;
    if (container) container.setPointerCapture(e.pointerId);
    cropDragRef.current = {
      handle,
      startSel: { ...cropSel },
      startX: e.clientX,
      startY: e.clientY,
    };
  }, [cropSel]);

  const handleCropPointerMove = useCallback((e) => {
    if (!cropDragRef.current) return;
    const container = cropContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const { handle, startSel, startX, startY } = cropDragRef.current;
    const dx = (e.clientX - startX) / rect.width;
    const dy = (e.clientY - startY) / rect.height;
    setCropSel(computeNewSel(handle, startSel, dx, dy));
  }, []);

  const handleCropPointerUp = useCallback(() => {
    cropDragRef.current = null;
  }, []);

  // ─── 모자이크 ───
  const applyMosaicAt = useCallback((cx, cy, brushRadius) => {
    const canvas = mosaicCanvasRef.current;
    const origData = origImageDataRef.current;
    if (!canvas || !origData) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const x0 = Math.max(0, Math.floor((cx - brushRadius) / MOSAIC_BLOCK_SIZE) * MOSAIC_BLOCK_SIZE);
    const y0 = Math.max(0, Math.floor((cy - brushRadius) / MOSAIC_BLOCK_SIZE) * MOSAIC_BLOCK_SIZE);
    const x1 = Math.min(w, Math.ceil(cx + brushRadius));
    const y1 = Math.min(h, Math.ceil(cy + brushRadius));
    for (let by = y0; by < y1; by += MOSAIC_BLOCK_SIZE) {
      for (let bx = x0; bx < x1; bx += MOSAIC_BLOCK_SIZE) {
        const cx2 = bx + MOSAIC_BLOCK_SIZE / 2;
        const cy2 = by + MOSAIC_BLOCK_SIZE / 2;
        if (Math.sqrt((cx2 - cx) ** 2 + (cy2 - cy) ** 2) > brushRadius) continue;
        const sx = Math.min(Math.floor(cx2), w - 1);
        const sy = Math.min(Math.floor(cy2), h - 1);
        const oi = (sy * w + sx) * 4;
        ctx.fillStyle = `rgb(${origData.data[oi]},${origData.data[oi + 1]},${origData.data[oi + 2]})`;
        ctx.fillRect(bx, by, Math.min(MOSAIC_BLOCK_SIZE, w - bx), Math.min(MOSAIC_BLOCK_SIZE, h - by));
      }
    }
    setMosaicApplied(true);
  }, []);

  const applyMosaicAtEvent = useCallback((clientX, clientY) => {
    const canvas = mosaicCanvasRef.current;
    if (!canvas || !origImageDataRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    applyMosaicAt(
      (clientX - rect.left) * scaleX,
      (clientY - rect.top) * scaleY,
      (brushSize / 2) * ((scaleX + scaleY) / 2)
    );
  }, [brushSize, applyMosaicAt]);

  const handleMosaicPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    mosaicDrawingRef.current = true;
    applyMosaicAtEvent(e.clientX, e.clientY);
  }, [applyMosaicAtEvent]);

  const handleMosaicPointerMove = useCallback((e) => {
    if (!mosaicDrawingRef.current) return;
    applyMosaicAtEvent(e.clientX, e.clientY);
  }, [applyMosaicAtEvent]);

  const handleMosaicPointerUp = useCallback(() => { mosaicDrawingRef.current = false; }, []);

  const handleMosaicReset = () => {
    const canvas = mosaicCanvasRef.current;
    const origData = origImageDataRef.current;
    if (!canvas || !origData) return;
    canvas.getContext("2d").putImageData(origData, 0, 0);
    setMosaicApplied(false);
  };

  // ─── 적용 ───
  const handleCropApply = async () => {
    setIsCropUploading(true);
    try {
      const currentItem = cropQueue[cropQueueIndex];
      const dims = cropNaturalDimsRef.current;
      const isFullImage = cropSel.x < 0.001 && cropSel.y < 0.001 && cropSel.w > 0.999 && cropSel.h > 0.999;

      let finalBlob;

      if (mosaicApplied && !isFullImage && dims) {
        // 모자이크 + 자르기
        const scale = mosaicScaleRef.current;
        const pixelCrop = {
          x: Math.max(0, Math.round(cropSel.x * dims.width * scale)),
          y: Math.max(0, Math.round(cropSel.y * dims.height * scale)),
          width: Math.max(1, Math.round(cropSel.w * dims.width * scale)),
          height: Math.max(1, Math.round(cropSel.h * dims.height * scale)),
        };
        const mosaicBlob = await canvasToBlob(mosaicCanvasRef.current);
        const mosaicUrl = URL.createObjectURL(mosaicBlob);
        try {
          finalBlob = await getCroppedImg(mosaicUrl, pixelCrop);
        } finally {
          URL.revokeObjectURL(mosaicUrl);
        }
      } else if (mosaicApplied) {
        finalBlob = await canvasToBlob(mosaicCanvasRef.current);
      } else if (!isFullImage && dims) {
        const pixelCrop = {
          x: Math.max(0, Math.round(cropSel.x * dims.width)),
          y: Math.max(0, Math.round(cropSel.y * dims.height)),
          width: Math.max(1, Math.round(cropSel.w * dims.width)),
          height: Math.max(1, Math.round(cropSel.h * dims.height)),
        };
        finalBlob = await getCroppedImg(currentItem.objectUrl, pixelCrop);
      } else {
        finalBlob = currentItem.file;
      }

      const compressed = await compressImage(finalBlob, currentItem.file.name);
      const url = await uploadImageBlob(compressed, currentItem.file.name);
      insertImageBlock(insertAfterRef.current + successCountRef.current, url);
      successCountRef.current++;
      processCropQueue(cropQueue, cropQueueIndex + 1);
    } catch (e) {
      setModal({ title: "이미지 처리에 실패했습니다.", subtitle: getErrorMessage(e), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    } finally {
      setIsCropUploading(false);
    }
  };

  const handleCropSkip = async () => {
    setIsCropUploading(true);
    try {
      const currentItem = cropQueue[cropQueueIndex];
      const compressed = await compressImage(currentItem.file, currentItem.file.name);
      const url = await uploadImageBlob(compressed, currentItem.file.name);
      insertImageBlock(insertAfterRef.current + successCountRef.current, url);
      successCountRef.current++;
      processCropQueue(cropQueue, cropQueueIndex + 1);
    } catch (e) {
      setModal({ title: "이미지 업로드에 실패했습니다.", subtitle: getErrorMessage(e), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    } finally {
      setIsCropUploading(false);
    }
  };

  const handleCropClose = () => {
    cropQueue.forEach((item) => URL.revokeObjectURL(item.objectUrl));
    setCropQueue([]);
    setCropQueueIndex(0);
    setShowCropModal(false);
    successCountRef.current = 0;
  };

  const addTextBlock = (afterIndex) => {
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, { id: uid(), type: "text", html: "" });
      return next;
    });
  };

  const deleteBlock = (id) => {
    setBlocks((prev) => prev.length <= 1 ? prev : prev.filter((b) => b.id !== id));
  };

  const moveBlock = (id, direction) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  const updateTextBlock = (id, html) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, html } : b)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errMsg = !title.trim() ? "제목을 입력해주세요." : title.length > 50 ? "제목은 50자 이내로 입력해주세요." : "";
    if (errMsg) {
      setTitleError(errMsg);
      titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      titleRef.current?.focus({ preventScroll: true });
      return;
    }
    const imageBlocks = blocks.filter((b) => b.type === "image");
    if (imageBlocks.length === 0) {
      setBlockError("사진을 최소 1장 이상 추가해주세요.");
      blockErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setBlockError("");
    try {
      setIsSubmitting(true);
      const finalContent = blocksToHtml(blocks);
      const thumbnailBlock = imageBlocks.find((b) => b.id === thumbnailId) || imageBlocks[0];
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", finalContent);
      formData.append("thumbnailUrl", toRelativeUrl(thumbnailBlock.url));
      if (createdDate) formData.append("createdDate", createdDate);
      const url = isEdit ? `${API_BASE_URL}/reviews/${editData.id}` : `${API_BASE_URL}/reviews`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 30000);
      let response;
      try {
        response = await fetch(url, { method: isEdit ? "PUT" : "POST", credentials: "include", body: formData, signal: ctrl.signal });
      } catch (e) {
        if (e.name === "AbortError") throw new Error("요청 시간이 초과되었습니다. 다시 시도해주세요.");
        throw e;
      } finally {
        clearTimeout(timer);
      }
      const data = await response.json();
      if (data.success) {
        submittedRef.current = true;
        setModal({ title: isEdit ? "수정되었습니다." : "등록되었습니다.", buttons: [{ label: "확인", variant: "confirm", onClick: () => { setModal(null); navigate("/reviews"); } }] });
      } else {
        setModal({ title: data.message || (isEdit ? "수정에 실패했습니다." : "등록에 실패했습니다."), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
      }
    } catch (e) {
      setModal({ title: isEdit ? "수정 중 오류가 발생했습니다." : "등록 중 오류가 발생했습니다.", subtitle: getErrorMessage(e), buttons: [{ label: "확인", variant: "confirm", onClick: () => setModal(null) }] });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCropItem = cropQueue[cropQueueIndex];

  const BlockInsertBar = ({ afterIndex, alwaysVisible = false }) => (
    <div className={`review-write__insert-bar${alwaysVisible ? " review-write__insert-bar--visible" : ""}`}>
      <button type="button" className="review-write__insert-btn" onClick={() => addTextBlock(afterIndex)}>+ 텍스트</button>
      <button type="button" className="review-write__insert-btn" onClick={() => triggerImageUpload(afterIndex)}>+ 이미지</button>
    </div>
  );

  return (
    <>
      {modal && (
        <ConfirmModal title={modal.title} subtitle={modal.subtitle} onClose={() => setModal(null)} buttons={modal.buttons} />
      )}
      {blocker.state === "blocked" && (
        <ConfirmModal
          title="변경되지 않은 내용이 있습니다."
          subtitle="변경사항을 잃어버릴 수 있습니다."
          onClose={() => blocker.reset()}
          buttons={[
            { label: "나가기", variant: "cancel", onClick: () => blocker.proceed() },
            { label: "계속 작성하기", variant: "confirm", onClick: () => blocker.reset() },
          ]}
        />
      )}

      {/* 사진 편집 모달 */}
      {showCropModal && currentCropItem && (
        <div className="crop-modal__overlay">
          <div className="crop-modal">
            <div className="crop-modal__header">
              <h2 className="crop-modal__title">사진 편집</h2>
              <span className="crop-modal__count">{cropQueueIndex + 1} / {cropQueue.length}</span>
              <button className="crop-modal__close" onClick={handleCropClose}>✕</button>
            </div>

            <div className="crop-modal__tabs">
              <button
                type="button"
                className={`crop-modal__tab${editMode === "crop" ? " crop-modal__tab--active" : ""}`}
                onClick={() => setEditMode("crop")}
              >자르기</button>
              <button
                type="button"
                className={`crop-modal__tab${editMode === "mosaic" ? " crop-modal__tab--active" : ""}`}
                onClick={() => setEditMode("mosaic")}
              >모자이크</button>
            </div>

            {/* 자르기 탭 */}
            {editMode === "crop" && (
              <div className="crop-modal__crop-outer">
                <div
                  ref={cropContainerRef}
                  className="crop-modal__crop-inner"
                  onPointerDown={handleCropPointerDown}
                  onPointerMove={handleCropPointerMove}
                  onPointerUp={handleCropPointerUp}
                  onPointerLeave={handleCropPointerUp}
                >
                  <img
                    src={currentCropItem.objectUrl}
                    className="crop-modal__crop-img"
                    onLoad={(e) => {
                      cropNaturalDimsRef.current = { width: e.target.naturalWidth, height: e.target.naturalHeight };
                    }}
                    draggable={false}
                    alt=""
                  />
                  {/* 어두운 오버레이 */}
                  <div className="crop-modal__overlay-piece" style={{ top: 0, left: 0, right: 0, height: `${cropSel.y * 100}%` }} />
                  <div className="crop-modal__overlay-piece" style={{ top: `${(cropSel.y + cropSel.h) * 100}%`, left: 0, right: 0, bottom: 0 }} />
                  <div className="crop-modal__overlay-piece" style={{ top: `${cropSel.y * 100}%`, left: 0, width: `${cropSel.x * 100}%`, height: `${cropSel.h * 100}%` }} />
                  <div className="crop-modal__overlay-piece" style={{ top: `${cropSel.y * 100}%`, left: `${(cropSel.x + cropSel.w) * 100}%`, right: 0, height: `${cropSel.h * 100}%` }} />
                  {/* 선택 영역 */}
                  <div
                    className="crop-modal__selection"
                    data-handle="move"
                    style={{
                      top: `${cropSel.y * 100}%`,
                      left: `${cropSel.x * 100}%`,
                      width: `${cropSel.w * 100}%`,
                      height: `${cropSel.h * 100}%`,
                    }}
                  >
                    <div className="crop-modal__handle crop-modal__handle--nw" data-handle="nw" />
                    <div className="crop-modal__handle crop-modal__handle--n"  data-handle="n" />
                    <div className="crop-modal__handle crop-modal__handle--ne" data-handle="ne" />
                    <div className="crop-modal__handle crop-modal__handle--e"  data-handle="e" />
                    <div className="crop-modal__handle crop-modal__handle--se" data-handle="se" />
                    <div className="crop-modal__handle crop-modal__handle--s"  data-handle="s" />
                    <div className="crop-modal__handle crop-modal__handle--sw" data-handle="sw" />
                    <div className="crop-modal__handle crop-modal__handle--w"  data-handle="w" />
                    <div className="crop-modal__thirds" />
                  </div>
                </div>
              </div>
            )}

            {/* 모자이크 탭 */}
            <div
              className="crop-modal__mosaic-area"
              style={{ display: editMode === "mosaic" ? "block" : "none" }}
              onPointerDown={handleMosaicPointerDown}
              onPointerMove={handleMosaicPointerMove}
              onPointerUp={handleMosaicPointerUp}
              onPointerLeave={handleMosaicPointerUp}
            >
              <canvas ref={mosaicCanvasRef} className="crop-modal__mosaic-canvas" />
            </div>

            {/* 모자이크 컨트롤 */}
            {editMode === "mosaic" && (
              <div className="crop-modal__mosaic-controls">
                <span className="crop-modal__zoom-label">브러시</span>
                <input
                  type="range" min={10} max={80} step={1} value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="crop-modal__zoom-slider"
                />
                <button
                  type="button"
                  className="crop-modal__mosaic-reset"
                  onClick={handleMosaicReset}
                  disabled={!mosaicApplied}
                >초기화</button>
              </div>
            )}

            <div className="crop-modal__buttons">
              <button className="crop-modal__btn crop-modal__btn--skip" onClick={handleCropSkip} disabled={isCropUploading}>
                {isCropUploading ? "처리 중..." : "건너뛰기"}
              </button>
              <button className="crop-modal__btn crop-modal__btn--apply" onClick={handleCropApply} disabled={isCropUploading}>
                {isCropUploading ? "처리 중..." : "적용"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="review-write">
        <section className="review-write__banner">
          <div className="review-write__breadcrumb">
            <Link to="/" className="review-write__breadcrumb-link">
              <img src={homeIcon} alt="홈" className="review-write__breadcrumb-icon" />
            </Link>
            <span className="review-write__breadcrumb-separator">&gt;</span>
            <span className="review-write__breadcrumb-text">이미지 모음</span>
            <span className="review-write__breadcrumb-separator">&gt;</span>
            <span className="review-write__breadcrumb-current">{isEdit ? "이미지 모음 수정" : "이미지 모음 등록"}</span>
          </div>
        </section>

        <section className="review-write__main">
          <div className="review-write__content">
            <h1 className="review-write__title">{isEdit ? "이미지 모음 수정" : "이미지 모음 등록"}</h1>

            <form className="review-write__form" onSubmit={handleSubmit}>
              <div className="review-write__row">
                <div className="review-write__field review-write__field--title">
                  <label className="review-write__label">제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                    ref={titleRef}
                    className={`review-write__input${titleError ? " review-write__input--error" : ""}`}
                    placeholder="제목을 입력해주세요."
                    maxLength={50}
                  />
                  <div className="review-write__field-bottom">
                    {titleError && <p className="review-write__field-error">{titleError}</p>}
                    <span className="review-write__char-count">{title.length}/50</span>
                  </div>
                </div>
                <div className="review-write__field review-write__field--date">
                  <label className="review-write__label">날짜</label>
                  <div className="review-write__date-wrapper">
                    <input
                      type="date"
                      ref={dateInputRef}
                      value={createdDate}
                      max="9999-12-31"
                      onChange={(e) => setCreatedDate(e.target.value)}
                      onClick={() => { try { dateInputRef.current?.showPicker(); } catch { /* ignore */ } }}
                      className="review-write__date-hidden"
                    />
                    <div className="review-write__input review-write__date-display">
                      <span>
                        {(() => {
                          const d = new Date(createdDate + "T00:00:00");
                          const days = ["일", "월", "화", "수", "목", "금", "토"];
                          return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${days[d.getDay()]})`;
                        })()}
                      </span>
                      <svg className="review-write__date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="review-write__blocks" ref={blockErrorRef}>
                <BlockInsertBar afterIndex={-1} alwaysVisible />
                {blocks.map((block, idx) => (
                  <div key={block.id} className="review-write__block-wrapper">
                    <div className="review-write__block-controls">
                      <button type="button" className="review-write__block-ctrl-btn" onClick={() => moveBlock(block.id, "up")} disabled={idx === 0} title="위로">▲</button>
                      <button type="button" className="review-write__block-ctrl-btn" onClick={() => moveBlock(block.id, "down")} disabled={idx === blocks.length - 1} title="아래로">▼</button>
                      <button type="button" className="review-write__block-ctrl-btn review-write__block-ctrl-btn--delete" onClick={() => deleteBlock(block.id)} disabled={blocks.length <= 1} title="삭제">✕</button>
                    </div>
                    {block.type === "text" ? (
                      <div className="review-write__block--text">
                        <div className="review-write__editor-wrapper">
                          <ReactQuill
                            theme="snow"
                            value={block.html}
                            onChange={(html) => updateTextBlock(block.id, html)}
                            modules={quillModules}
                            placeholder="내용을 입력해주세요."
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`review-write__block--image${thumbnailId === block.id ? " review-write__block--image-selected" : ""}`}
                        onClick={() => setThumbnailId(block.id)}
                        title="클릭하여 대표 이미지 설정"
                      >
                        <img src={block.url} alt="" className="review-write__block-img" />
                        {thumbnailId === block.id && <span className="review-write__block-badge">대표 이미지</span>}
                      </div>
                    )}
                    <BlockInsertBar afterIndex={idx} />
                  </div>
                ))}
              </div>
              {blockError && <p className="review-write__field-error review-write__field-error--block">{blockError}</p>}

              <div className="review-write__button-wrapper">
                <button type="button" className="review-write__cancel-btn" onClick={() => navigate("/reviews")}>취소</button>
                <button type="submit" className="review-write__submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? "처리 중..." : isEdit ? "수정 완료" : "작성 완료"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </>
  );
};

export default ReviewWrite;
