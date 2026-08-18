<template>
  <button
    type="button"
    class="press inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
    :aria-label="ariaLabel"
    @click="$emit('click', $event)"
  >
    <i :class="icon"></i>
  </button>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  ariaLabel: { type: String, required: true },
});
defineEmits(["click"]);
</script>
