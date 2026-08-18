<template>
  <div
    class="relative mx-auto flex w-full max-w-[360px] rounded-full bg-[var(--muted)] p-1"
    role="tablist"
    aria-label="Choose scan mode"
  >
    <span
      class="absolute top-1 bottom-1 rounded-full bg-[var(--primary)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      style="width: calc(50% - 4px)"
      :class="
        modelValue === 'camera'
          ? 'translate-x-[calc(100%+8px)]'
          : 'translate-x-0'
      "
    />
    <button
      type="button"
      role="tab"
      :aria-selected="modelValue === 'upload'"
      class="press cursor-pointer relative z-10 flex-1 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors"
      :class="
        modelValue === 'upload'
          ? 'text-white'
          : 'text-[var(--muted-foreground)]'
      "
      @click="$emit('update:modelValue', 'upload')"
    >
      <i class="fa-solid fa-cloud-arrow-up mr-1.5"></i>Upload Photo
    </button>
    <button
      type="button"
      role="tab"
      :aria-selected="modelValue === 'camera'"
      class="press cursor-pointer relative z-10 flex-1 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors"
      :class="
        modelValue === 'camera'
          ? 'text-white'
          : 'text-[var(--muted-foreground)]'
      "
      @click="$emit('update:modelValue', 'camera')"
    >
      <i class="fa-solid fa-camera mr-1.5"></i>Take Photo
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true }, // 'upload' | 'camera'
});
defineEmits(["update:modelValue"]);
</script>
