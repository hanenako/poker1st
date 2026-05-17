<template>
  <div v-if="rate" class="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
    <span class="text-zinc-400 dark:text-zinc-500 text-xs">¥1 =</span>
    <span class="font-semibold text-zinc-700 dark:text-zinc-200 tabular-nums">
      ₩{{ rate.rate.toFixed(2) }}
    </span>
    <span
      v-if="updatedLabel"
      class="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:inline"
    >
      {{ updatedLabel }}
    </span>
    <button
      class="w-5 h-5 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
      title="환율 새로고침"
      :class="{ 'animate-spin': refreshing }"
      @click="refresh"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const { data: rate, refresh: doRefresh } = await useFetch('/api/exchange-rate', {
  server: false,   // 클라이언트에서만 호출 (외부 API)
  lazy: true
})

const refreshing = ref(false)

async function refresh() {
  refreshing.value = true
  await doRefresh()
  setTimeout(() => { refreshing.value = false }, 600)
}

const updatedLabel = computed(() => {
  if (!rate.value?.updatedAt) return null
  const d = new Date(rate.value.updatedAt)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
})
</script>
