<template>
  <div class="canvas-wrapper h-full w-full">
    <canvas ref="canvasEl" class="h-full w-full object-contain"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";

// NOTE: imageUrl, detections, imageWidth, imageHeight preserved exactly as the
// original component's public contract. `activeIndex` is an additive, optional
// prop for highlighting a detection from the result list — it does not change
// the existing backend/API contract.
const props = defineProps({
  imageUrl: { type: String, required: true },
  detections: { type: Array, default: () => [] },
  imageWidth: { type: Number, required: true },
  imageHeight: { type: Number, required: true },
  activeIndex: { type: Number, default: -1 },
});

const canvasEl = ref(null);

const BOX_COLOR = "#2f6bff";
const BOX_COLOR_ACTIVE = "#ff9f43";

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, h / 2, Math.abs(w) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function draw() {
  const canvas = canvasEl.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const img = new Image();

  img.onload = () => {
    canvas.width = props.imageWidth;
    canvas.height = props.imageHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, props.imageWidth, props.imageHeight);

    const baseLineWidth = Math.max(2.5, props.imageWidth / 260);
    const fontSize = Math.max(14, props.imageWidth / 42);
    ctx.font = `600 ${fontSize}px "Inter", sans-serif`;
    ctx.textBaseline = "middle";

    props.detections.forEach((det, i) => {
      const [x1, y1, x2, y2] = det.bbox;
      const w = x2 - x1;
      const h = y2 - y1;
      const isActive = i === props.activeIndex;
      const color = isActive ? BOX_COLOR_ACTIVE : BOX_COLOR;

      // Soft glow behind the active box
      if (isActive) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = fontSize * 1.4;
      }

      ctx.lineWidth = isActive ? baseLineWidth * 1.4 : baseLineWidth;
      ctx.strokeStyle = color;
      roundRect(ctx, x1, y1, w, h, Math.max(8, props.imageWidth / 90));
      ctx.stroke();

      if (isActive) ctx.restore();

      // Rounded pill label
      const label = `${det.class_name} · ${(det.confidence * 100).toFixed(0)}%`;
      const paddingX = fontSize * 0.6;
      const textWidth = ctx.measureText(label).width;
      const pillHeight = fontSize + paddingX;
      const pillWidth = textWidth + paddingX * 2;
      const pillX = x1;
      const pillY = Math.max(0, y1 - pillHeight - 6);

      ctx.fillStyle = color;
      roundRect(ctx, pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, pillX + paddingX, pillY + pillHeight / 2 + 1);
    });
  };

  img.src = props.imageUrl;
}

onMounted(draw);
watch(() => [props.imageUrl, props.detections, props.activeIndex], draw, { deep: true });
</script>

<style scoped>
.canvas-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}
canvas {
  animation: canvas-appear 0.4s ease both;
}
@keyframes canvas-appear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
