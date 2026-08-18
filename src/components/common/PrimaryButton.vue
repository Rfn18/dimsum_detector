<template>
  <button
    type="button"
    class="press inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    :class="[sizeClasses, variantClasses]"
    :disabled="disabled"
    :aria-label="ariaLabel"
    @click="$emit('click', $event)"
  >
    <i v-if="icon" :class="icon" class="text-[0.95em]"></i>
    <slot />
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: { type: String, default: "primary" }, // primary | ghost | outline
  size: { type: String, default: "md" }, // sm | md | lg
  icon: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  ariaLabel: { type: String, default: "" },
});

defineEmits(["click"]);

const sizeClasses = computed(() => {
  return (
    {
      sm: "text-sm px-4 py-2",
      md: "text-[15px] px-5 py-3",
      lg: "text-base px-7 py-4",
    }[props.size] || ""
  );
});

const variantClasses = computed(() => {
  return (
    {
      primary:
        "bg-[var(--primary)] text-[var(--primary-foreground)]  hover:bg-[var(--primary-hover)]",
      outline:
        "bg-white text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--primary)]/40]",
      ghost:
        "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--background-alt)]",
    }[props.variant] || ""
  );
});
</script>
