<template>
  <button
    type="button"
    class="animate-rise press flex w-full items-center gap-4 rounded-[20px] border bg-white p-4 text-left transition-all"
    :class="
      isActive
        ? 'border-[var(--primary)]/50 shadow-[var(--shadow-glow)]'
        : 'border-[var(--border)] shadow-[var(--shadow-soft)] hover:border-[var(--primary)]/25'
    "
    :style="{ animationDelay: `${index * 45}ms` }"
    @click="$emit('select', index)"
  >
    <div
      class="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[var(--muted)] transition-shadow"
      :class="isActive ? 'ring-2 ring-[var(--primary)] ring-offset-2' : ''"
    >
      <img
        v-if="thumbnail"
        :src="thumbnail"
        :alt="detection.class_name"
        class="animate-rise h-full w-full object-cover"
      />
      <div v-else class="h-full w-full animate-pulse-soft bg-[var(--border)]" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <p class="truncate text-[15px] font-semibold capitalize">
          {{ detection.class_name }}
        </p>
        <span class="shrink-0 text-[13px] font-bold text-[var(--primary)]">
          {{ confidencePct }}%
        </span>
      </div>
      <p
        class="mt-1 text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]"
      >
        Confidence
      </p>
      <div
        class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
      >
        <div
          class="h-full rounded-full bg-[var(--primary)] transition-all duration-500 ease-out"
          :style="{ width: confidencePct + '%' }"
        />
      </div>
    </div>
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  detection: { type: Object, required: true },
  index: { type: Number, required: true },
  isActive: { type: Boolean, default: false },
  thumbnail: { type: String, default: "" }, // cropped bbox image, cover-fit square
});

defineEmits(["select"]);

const confidencePct = computed(() =>
  (props.detection.confidence * 100).toFixed(1),
);
</script>
