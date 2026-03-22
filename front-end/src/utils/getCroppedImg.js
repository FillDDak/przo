const TIMEOUT_MS = 15000;

function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} 시간이 초과되었습니다.`)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

/**
 * Canvas API helper: crops an image to the given pixel area and returns a Blob.
 * @param {string} imageSrc - object URL or data URL of the source image
 * @param {Object} pixelCrop - { x, y, width, height } in image pixels
 * @param {string} [mimeType] - output mime type (default: image/jpeg)
 * @returns {Promise<Blob>}
 */
export default async function getCroppedImg(imageSrc, pixelCrop, mimeType = "image/jpeg") {
  const image = await withTimeout(loadImage(imageSrc), TIMEOUT_MS, "이미지 로드");
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  const blobPromise = new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("이미지 변환에 실패했습니다."));
    }, mimeType, 0.92);
  });

  return withTimeout(blobPromise, TIMEOUT_MS, "이미지 변환");
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
    img.src = src;
  });
}
