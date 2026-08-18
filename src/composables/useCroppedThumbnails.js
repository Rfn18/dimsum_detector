let cachedImage = null;
let cachedSrc = null;

function loadImage(src) {
  if (cachedSrc === src && cachedImage) return Promise.resolve(cachedImage);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      cachedImage = img;
      cachedSrc = src;
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

export async function cropDetectionThumbnails(imageUrl, detections, options = {}) {
  if (!imageUrl || !detections?.length) return [];

  const padding = options.padding ?? 0.08;
  const img = await loadImage(imageUrl);

  return detections.map((det) => {
    const [x1, y1, x2, y2] = det.bbox;
    const boxW = x2 - x1;
    const boxH = y2 - y1;

    const padX = boxW * padding;
    const padY = boxH * padding;

    const sx = Math.max(0, x1 - padX);
    const sy = Math.max(0, y1 - padY);
    const sw = Math.min(img.naturalWidth - sx, boxW + padX * 2);
    const sh = Math.min(img.naturalHeight - sy, boxH + padY * 2);

    const canvas = document.createElement("canvas");
    const size = 160;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const boxAspect = sw / sh;
    let drawW = size;
    let drawH = size;
    let offsetX = 0;
    let offsetY = 0;

    if (boxAspect > 1) {
      drawH = size;
      drawW = size * boxAspect;
      offsetX = -(drawW - size) / 2;
    } else {
      drawW = size;
      drawH = size / boxAspect;
      offsetY = -(drawH - size) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, offsetX, offsetY, drawW, drawH);

    return canvas.toDataURL("image/jpeg", 0.88);
  });
}