<template>
  <div :style="`grid-template-columns: 160px repeat(${pubs.length}, 1fr)`" class="grid gap-4">
    <div class="py-3 px-2 text-xs font-medium text-zinc-500 flex items-center">{{ label }}</div>
    <div
      v-for="pub in pubs"
      :key="pub.id"
      class="py-3 px-3 text-sm text-zinc-700 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-center flex items-center justify-center"
    >
      <slot :pub="pub" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  pubs:  { type: Array,  required: true }
})
</script>
