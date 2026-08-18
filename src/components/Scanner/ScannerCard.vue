<template>
  <section
    class="mx-auto w-full max-w-[640px] rounded-[32px] border border-[var(--border)] bg-white p-4 sm:p-6"
    aria-label="Dimsum scanner"
  >
    <ScanModeSwitcher v-if="!imageUrl" v-model="mode" class="mb-5" />

    <ScannerEmptyState
      v-if="!imageUrl && mode === 'upload'"
      @file-selected="$emit('file-selected', $event)"
    />

    <CameraScanner
      v-else-if="!imageUrl && mode === 'camera'"
      @file-selected="$emit('file-selected', $event)"
    />

    <ScannerPreview
      v-else
      :image-url="imageUrl"
      :result="result"
      :loading="loading"
      :error-message="errorMessage"
      :active-index="activeIndex"
      @detect="$emit('detect')"
      @replace="$emit('replace')"
      @retry="$emit('retry')"
    />
  </section>
</template>

<script setup>
import { ref } from "vue";
import ScanModeSwitcher from "./ScanModeSwitcher.vue";
import ScannerEmptyState from "./ScannerEmptyState.vue";
import CameraScanner from "./CameraScanner.vue";
import ScannerPreview from "./ScannerPreview.vue";

defineProps({
  imageUrl: { type: String, default: null },
  result: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  errorMessage: { type: String, default: "" },
  activeIndex: { type: Number, default: -1 },
});

defineEmits(["file-selected", "detect", "replace", "retry"]);

const mode = ref("upload");
</script>
