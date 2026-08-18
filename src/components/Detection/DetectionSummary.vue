<template>
  <div class="flex items-center justify-between">
    <div>
      <p class="text-[17px] font-bold tracking-tight">Detection Results</p>
      <p class="text-[13px] font-medium text-[var(--muted-foreground)]">
        {{ count }} {{ count === 1 ? "dimsum" : "dimsum" }} detected
      </p>
    </div>
    <div
      class="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[15px] font-bold text-[var(--primary)]"
    >
      {{ count }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, required: true },
});
</script>
