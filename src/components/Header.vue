<template>
  <header
   class="sticky top-0 z-30 mx-auto flex w-full max-w-[1200px] items-center justify-between border-b border-[var(--border)] bg-white/90 px-5 py-4 sm:border-b-0 sm:bg-transparent sm:px-8 sm:backdrop-blur-0" >
    <div class="flex items-center gap-2.5">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-2xltext-lg"
      >
        <img src="/images/dimsum-logo.png"
      </div>
      <div class="leading-tight">
        <p class="text-[15px] font-bold tracking-tight">Dimsum Detector</p>
        <p class="text-[11px] font-medium text-[var(--muted-foreground)]">
          AI Food Scanner
        </p>
      </div>
    </div>

    <nav
      class="flex items-center gap-1 rounded-full bg-white/70 p-1 backdrop-blur-sm"
    >
      <button
        type="button"
        class="press cursor-pointer flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
      >
        <i class="fa-solid fa-clock-rotate-left"></i>
        <span class="hidden sm:inline">History</span>
      </button>
      <IconButton
        icon="fa-solid cursor-pointer fa-gear"
        aria-label="Open settings"
      />
    </nav>
  </header>
</template>

<script setup>
import IconButton from "./common/IconButton.vue";
</script>
