<template>
  <div class="animate-rise flex h-full flex-col gap-4">
    <!-- Error state -->
    <div
      v-if="errorMessage"
      class="flex min-h-[340px] flex-col items-center justify-center gap-3 rounded-[24px] bg-[var(--muted)] px-6 py-10 text-center sm:min-h-[420px]"
    >
      <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-500">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h3 class="text-lg font-bold tracking-tight">Something went wrong</h3>
      <p class="max-w-[280px] text-sm leading-relaxed text-[var(--muted-foreground)]">
        We couldn't analyze this image. {{ errorMessage }}
      </p>
      <PrimaryButton icon="fa-solid fa-rotate-right" @click="$emit('retry')">Try Again</PrimaryButton>
    </div>

    <!-- Image area: preview / scanning / detected -->
    <div v-else class="relative overflow-hidden rounded-[24px] bg-[var(--muted)]">
      <img :src="imageUrl" alt="Selected dimsum photo" class="block w-full max-h-[520px] object-contain" />

      <!-- detection canvas overlays image once result exists -->
      <div v-if="result" class="absolute inset-0">
        <DetectionCanvas
          :image-url="imageUrl"
          :detections="result.detections"
          :image-width="result.image_width"
          :image-height="result.image_height"
          :active-index="activeIndex"
          class="h-full w-full"
        />
      </div>

      <!-- scanning overlay -->
      <div v-if="loading" class="absolute inset-0 overflow-hidden bg-[var(--foreground)]/10">
        <div class="absolute inset-x-0 h-1/3 animate-scanline bg-gradient-to-b from-transparent via-[var(--primary)]/60 to-transparent" />
        <div class="absolute inset-0 flex items-end justify-center pb-6">
          <div class="animate-pulse-soft flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-[var(--shadow-soft)] backdrop-blur-sm">
            <i class="fa-solid fa-circle-notch fa-spin text-[var(--primary)]"></i>
            <span class="text-[13px] font-semibold">Analyzing your dimsum…</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="!errorMessage" class="flex flex-wrap items-center justify-center gap-3">
      <template v-if="!result && !loading">
        <PrimaryButton variant="outline" icon="fa-solid fa-arrows-rotate" @click="$emit('replace')">
          Replace photo
        </PrimaryButton>
        <PrimaryButton icon="fa-solid fa-wand-magic-sparkles" @click="$emit('detect')">
          Detect Dimsum
        </PrimaryButton>
      </template>
      <template v-else-if="loading">
        <p class="text-[13px] font-medium text-[var(--muted-foreground)]">Detecting objects…</p>
      </template>
      <template v-else>
        <PrimaryButton variant="outline" icon="fa-solid fa-arrows-rotate" @click="$emit('replace')">
          Scan Another Photo
        </PrimaryButton>
      </template>
    </div>
  </div>
</template>

<script setup>
import DetectionCanvas from "../Detection/DetectionCanvas.vue";
import PrimaryButton from "../common/PrimaryButton.vue";

defineProps({
  imageUrl: { type: String, required: true },
  result: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  errorMessage: { type: String, default: "" },
  activeIndex: { type: Number, default: -1 },
});

defineEmits(["detect", "replace", "retry"]);
</script>
