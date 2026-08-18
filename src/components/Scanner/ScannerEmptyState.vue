<template>
  <div
    class="animate-rise flex h-full min-h-[340px] flex-col items-center justify-center gap-4 rounded-[28px] px-6 py-10 text-center transition-colors sm:min-h-[420px]"
    :class="
      isDragging
        ? 'bg-[var(--primary)]/5 outline outline-2 outline-dashed outline-[var(--primary)]/40'
        : ''
    "
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <div
      class="animate-floaty flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)] text-2xl"
    >
      <i class="fa-solid fa-wand-magic-sparkles"></i>
    </div>

    <div class="space-y-1.5">
      <h2 class="text-xl font-bold tracking-tight">Ready to scan?</h2>
      <p
        class="max-w-[280px] text-sm leading-relaxed text-[var(--muted-foreground)]"
      >
        Drop your photo here, or choose from your device to identify the dimsum
        on your plate.
      </p>
    </div>

    <PrimaryButton icon="fa-solid fa-cloud-arrow-up" @click="triggerFileInput">
      Upload Photo
    </PrimaryButton>

    <label for="dimsum-file-input" class="sr-only"
      >Upload a photo of your dimsum plate</label
    >
    <input
      id="dimsum-file-input"
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="sr-only"
      @change="onFileSelected"
    />

    <p class="text-[11px] font-medium text-[var(--muted-foreground)]">
      JPEG, PNG, or WebP · max 10MB
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import PrimaryButton from "../common/PrimaryButton.vue";

const emit = defineEmits(["file-selected"]);

const fileInput = ref(null);
const isDragging = ref(false);

function triggerFileInput() {
  fileInput.value?.click();
}

function onFileSelected(event) {
  const file = event.target.files[0];
  if (file) emit("file-selected", file);
  event.target.value = "";
}

function onDrop(event) {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file) emit("file-selected", file);
}
</script>
