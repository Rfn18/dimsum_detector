<template>
  <Header />

  <main class="mx-auto w-full max-w-[1200px] px-5 pb-40 pt-2 sm:px-8">
    <div
      class="mx-auto mb-8 mt-10 flex max-w-[560px] flex-col items-center gap-2 text-center sm:mb-10"
    >
      <h1 class="text-4xl font-black tracking-tight sm:text-5xl">
        What's on your <span class="text-[var(--primary)]">dimsum plate?</span>
      </h1>
      <p class="text-[15px] leading-relaxed text-[var(--muted-foreground)]">
        Snap or upload a photo and let AI identify everything in the steamer.
      </p>
    </div>

    <ScannerCard
      :image-url="imageUrl"
      :result="result"
      :loading="loading"
      :error-message="errorMessage"
      :active-index="activeIndex"
      @file-selected="handleFileSelected"
      @detect="handleDetect"
      @replace="resetScan"
      @retry="resetScan"
    />
  </main>

  <DetectionBottomSheet
    :visible="!!result && !errorMessage"
    :image-url="imageUrl"
    :detections="result?.detections || []"
    :active-index="activeIndex"
    @select-detection="onSelectDetection"
  />
</template>

<script setup>
import { ref } from "vue";
import Header from "./components/Header.vue";
import ScannerCard from "./components/Scanner/ScannerCard.vue";
import DetectionBottomSheet from "./components/Detection/DetectionBottomSheet.vue";
import { detectDimsum } from "./api/detectApi.js";

// ---- Preserved existing state & API contract ----
const imageUrl = ref(null);
const result = ref(null);
const loading = ref(false);
const errorMessage = ref("");

// ---- Additive UI-only state ----
const pendingFile = ref(null); // file selected but not yet sent for detection
const activeIndex = ref(-1); // highlighted detection card/box

async function handleFileSelected(file) {
  errorMessage.value = "";
  result.value = null;
  activeIndex.value = -1;
  pendingFile.value = file;

  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  imageUrl.value = URL.createObjectURL(file);
}

async function handleDetect() {
  if (!pendingFile.value) return;
  errorMessage.value = "";
  loading.value = true;

  try {
    result.value = await detectDimsum(pendingFile.value);
  } catch (err) {
    errorMessage.value =
      err.response?.data?.detail ||
      "Please check your connection and try again.";
  } finally {
    loading.value = false;
  }
}

function resetScan() {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  imageUrl.value = null;
  result.value = null;
  loading.value = false;
  errorMessage.value = "";
  pendingFile.value = null;
  activeIndex.value = -1;
}

function onSelectDetection(index) {
  activeIndex.value = activeIndex.value === index ? -1 : index;
}
</script>
