<template>
  <div class="animate-rise relative flex h-full min-h-[340px] flex-col items-center justify-center gap-4 rounded-[28px] p-4 sm:min-h-[420px]">
    <div
      class="relative aspect-[4/3] w-full max-w-[440px] overflow-hidden rounded-[24px] bg-[var(--foreground)]"
    >
      <video
        v-show="isStreaming && !capturedFrame"
        ref="videoEl"
        class="h-full w-full object-cover"
        autoplay
        playsinline
        muted
        aria-label="Live camera preview"
      />
      <img
        v-if="capturedFrame"
        :src="capturedFrame"
        alt="Captured photo preview"
        class="h-full w-full object-cover"
      />

      <!-- Scanning frame corners -->
      <div v-if="isStreaming && !capturedFrame" class="pointer-events-none absolute inset-6">
        <span class="absolute left-0 top-0 h-8 w-8 rounded-tl-2xl border-l-[3px] border-t-[3px] border-white/80" />
        <span class="absolute right-0 top-0 h-8 w-8 rounded-tr-2xl border-r-[3px] border-t-[3px] border-white/80" />
        <span class="absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-[3px] border-l-[3px] border-white/80" />
        <span class="absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-[3px] border-r-[3px] border-white/80" />
      </div>

      <div v-if="!isStreaming && !capturedFrame && !cameraError" class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80">
        <i class="fa-solid fa-camera text-2xl"></i>
        <p class="text-sm font-medium">Starting camera…</p>
      </div>

      <div v-if="cameraError" class="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white/90">
        <i class="fa-solid fa-video-slash text-2xl"></i>
        <p class="text-sm font-medium">{{ cameraError }}</p>
      </div>
    </div>

    <canvas ref="captureCanvas" class="hidden"></canvas>

    <div class="flex items-center gap-4">
      <template v-if="!capturedFrame">
        <button
          type="button"
          class="press flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[var(--shadow-lift)] ring-4 ring-[var(--primary)]/20 disabled:opacity-40"
          :disabled="!isStreaming"
          aria-label="Capture photo"
          @click="capture"
        >
          <span class="h-12 w-12 rounded-full bg-[var(--primary)]"></span>
        </button>
      </template>
      <template v-else>
        <PrimaryButton variant="outline" icon="fa-solid fa-rotate-left" @click="retake">Retake</PrimaryButton>
        <PrimaryButton icon="fa-solid fa-wand-magic-sparkles" @click="confirm">Use Photo</PrimaryButton>
      </template>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import PrimaryButton from "../common/PrimaryButton.vue";

const emit = defineEmits(["file-selected"]);

const videoEl = ref(null);
const captureCanvas = ref(null);
const isStreaming = ref(false);
const capturedFrame = ref(null);
const cameraError = ref("");

let mediaStream = null;

async function startCamera() {
  cameraError.value = "";
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    if (videoEl.value) {
      videoEl.value.srcObject = mediaStream;
      isStreaming.value = true;
    }
  } catch (err) {
    cameraError.value = "Camera access was denied or unavailable. Please allow camera permission.";
  }
}

function stopCamera() {
  mediaStream?.getTracks().forEach((track) => track.stop());
  mediaStream = null;
  isStreaming.value = false;
}

function capture() {
  const video = videoEl.value;
  const canvas = captureCanvas.value;
  if (!video || !canvas) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  capturedFrame.value = canvas.toDataURL("image/jpeg", 0.92);
}

function retake() {
  capturedFrame.value = null;
}

function confirm() {
  captureCanvas.value.toBlob(
    (blob) => {
      if (!blob) return;
      const file = new File([blob], `dimsum-capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      emit("file-selected", file);
    },
    "image/jpeg",
    0.92
  );
}

onMounted(startCamera);
onBeforeUnmount(stopCamera);
</script>
