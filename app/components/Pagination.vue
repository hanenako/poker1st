<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-1 mt-8">
    <button
      class="px-3 py-1.5 rounded-lg text-sm border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:pointer-events-none transition"
      :disabled="page <= 1"
      @click="emit('update:page', page - 1)"
    >← 이전</button>

    <template v-for="p in pageNumbers" :key="p">
      <span v-if="p === '...'" class="px-2 text-zinc-400 text-sm">…</span>
      <button
        v-else
        class="w-9 h-9 rounded-lg text-sm border transition"
        :class="p === page
          ? 'bg-zinc-900 text-white border-zinc-900'
          : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'"
        @click="emit('update:page', p)"
      >{{ p }}</button>
    </template>

    <button
      class="px-3 py-1.5 rounded-lg text-sm border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:pointer-events-none transition"
      :disabled="page >= totalPages"
      @click="emit('update:page', page + 1)"
    >다음 →</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  page:       { type: Number, required: true },
  totalPages: { type: Number, required: true }
})
const emit = defineEmits(['update:page'])

// 앞뒤 2페이지 + 처음/끝 항상 표시, 중간 생략은 …
const pageNumbers = computed(() => {
  const total = props.totalPages
  const cur   = props.page
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set([1, total, cur - 1, cur, cur + 1].filter(p => p >= 1 && p <= total))
  const sorted = [...pages].sort((a, b) => a - b)

  const result = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) result.push('...')
    result.push(p)
    prev = p
  }
  return result
})
</script>
