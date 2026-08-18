<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center"
    >
      <div
        ref="sheetEl"
        class="pointer-events-auto w-full max-w-[560px] rounded-t-[28px] bg-white shadow-[var(--shadow-lift)] sm:mx-4 sm:rounded-[28px] sm:mb-4"
        :class="
          isDragging
            ? ''
            : 'transition-transform duration-450 ease-[cubic-bezier(0.22,1,0.36,1)]'
        "
        :style="{
          transform: `translateY(${currentTranslate}px)`,
          maxHeight: sheetMaxHeight,
        }"
      >
        <!-- Drag handle + summary (always visible, toggles expansion on click) -->
        <div
          ref="headerEl"
          class="cursor-grab touch-none select-none px-6 pb-4 pt-3 active:cursor-grabbing"
          @pointerdown="onPointerDown"
          @click="onHeaderClick"
        >
          <div
            class="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[var(--border)]"
          />

          <DetectionSummary v-if="hasDetections" :count="detections.length" />
          <div v-else class="flex items-center justify-between">
            <div>
              <p class="text-[17px] font-bold tracking-tight">
                No dimsum detected
              </p>
              <p class="text-[13px] font-medium text-[var(--muted-foreground)]">
                Try another photo with better lighting
              </p>
            </div>
            <div
              class="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--muted)] text-lg"
            >
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
          </div>
        </div>

        <!-- Scrollable result list -->
        <div class="max-h-[55vh] overflow-y-auto overscroll-contain px-6 pb-8">
          <div v-if="hasDetections" class="flex flex-col gap-3">
            <DetectionCard
              v-for="(det, i) in detections"
              :key="i"
              :detection="det"
              :index="i"
              :is-active="i === activeIndex"
              :thumbnail="thumbnails[i]"
              @select="$emit('select-detection', i)"
            />
          </div>
          <p
            v-else
            class="text-sm leading-relaxed text-[var(--muted-foreground)]"
          >
            Move closer to the plate, improve the lighting, or make sure the
            dimsum is fully in frame, then scan again.
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import DetectionCard from "./DetectionCard.vue";
import DetectionSummary from "./DetectionSummary.vue";
import { cropDetectionThumbnails } from "../../composables/useCroppedThumbnails.js";

const props = defineProps({
  visible: { type: Boolean, default: false },
  imageUrl: { type: String, default: "" },
  detections: { type: Array, default: () => [] },
  activeIndex: { type: Number, default: -1 },
});

defineEmits(["select-detection"]);

const detectionCount = computed(() => props.detections?.length ?? 0);
const hasDetections = computed(() => detectionCount.value > 0);
console.log(props.detections.length);
// Cropped bbox thumbnails, generated client-side from the source image —
// purely presentational, does not touch the detection API contract.
const thumbnails = ref([]);

watch(
  [() => props.imageUrl, () => props.detections],
  async ([url, dets]) => {
    if (!url || !dets?.length) {
      thumbnails.value = [];
      return;
    }
    thumbnails.value = []; // show skeletons while cropping
    try {
      thumbnails.value = await cropDetectionThumbnails(url, dets);
    } catch {
      thumbnails.value = [];
    }
  },
  { immediate: true },
);

const sheetEl = ref(null);
const headerEl = ref(null);

const position = ref("collapsed"); // collapsed | half | full
const isDragging = ref(false);
const currentTranslate = ref(0);

const sheetMaxHeight = "min(78vh, 640px)";

let panelHeight = 0;
let headerHeight = 96;
let startY = 0;
let startTranslate = 0;

function measure() {
  panelHeight = sheetEl.value?.offsetHeight || 480;
  headerHeight = headerEl.value?.offsetHeight || 96;
}

function translateFor(pos) {
  if (!panelHeight) measure();
  const collapsedTranslate = Math.max(panelHeight - headerHeight, 0);
  if (pos === "full") return 0;
  if (pos === "half") return collapsedTranslate * 0.55;
  return collapsedTranslate;
}

function applyPosition(pos) {
  position.value = pos;
  currentTranslate.value = translateFor(pos);
}

function onHeaderClick() {
  if (isDragging.value) return;
  applyPosition(
    position.value === "collapsed"
      ? "half"
      : position.value === "half"
        ? "full"
        : "collapsed",
  );
}

function onPointerDown(event) {
  measure();
  isDragging.value = true;
  startY = event.clientY;
  startTranslate = translateFor(position.value);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
}

function onPointerMove(event) {
  if (!isDragging.value) return;
  const delta = event.clientY - startY;
  const collapsedTranslate = Math.max(panelHeight - headerHeight, 0);
  currentTranslate.value = Math.min(
    Math.max(startTranslate + delta, 0),
    collapsedTranslate,
  );
}

function onPointerUp() {
  isDragging.value = false;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);

  const collapsedTranslate = Math.max(panelHeight - headerHeight, 0);
  const halfTranslate = collapsedTranslate * 0.55;
  const distances = {
    full: Math.abs(currentTranslate.value - 0),
    half: Math.abs(currentTranslate.value - halfTranslate),
    collapsed: Math.abs(currentTranslate.value - collapsedTranslate),
  };
  const nearest = Object.entries(distances).sort((a, b) => a[1] - b[1])[0][0];
  applyPosition(nearest);
}

watch(
  () => props.visible,
  (v) => {
    if (v) {
      applyPosition("collapsed");
    }
  },
);

watch(
  () => props.activeIndex,
  (i) => {
    if (i >= 0 && position.value === "collapsed") applyPosition("half");
  },
);

onBeforeUnmount(() => {
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
});
</script>
