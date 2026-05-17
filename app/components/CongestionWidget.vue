<template>
  <div class="surface-card p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{{ ui.congestionTitle }}</h3>
      <span v-if="data?.updatedAt" class="text-xs text-zinc-400">
        {{ relativeTime(data.updatedAt) }}
      </span>
    </div>

    <!-- 현재 상태 표시 -->
    <div class="flex items-center gap-2 mb-4">
      <span
        v-if="data?.status"
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
        :class="statusClass(data.status)"
      >
        <span class="w-2 h-2 rounded-full" :class="dotClass(data.status)" />
        {{ statusLabel(data.status) }}
      </span>
      <span v-else class="text-sm text-zinc-400">{{ ui.congestionNoData }}</span>
      <span v-if="data?.count" class="text-xs text-zinc-400">
        {{ ui.congestionReports(data.count) }}
      </span>
    </div>

    <!-- 신고 버튼 -->
    <div v-if="!submitted" class="space-y-2">
      <p class="text-xs text-zinc-500 mb-2">{{ ui.congestionPrompt }}</p>
      <div class="flex gap-2">
        <button
          v-for="opt in options"
          :key="opt.value"
          class="flex-1 py-2 rounded-lg text-xs font-semibold border transition"
          :class="selected === opt.value
            ? opt.activeClass
            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'"
          @click="selected = opt.value"
        >
          {{ opt.icon }} {{ opt.label }}
        </button>
      </div>
      <button
        :disabled="!selected || submitting"
        class="btn-primary w-full text-xs py-1.5 mt-2"
        @click="submit"
      >
        {{ submitting ? ui.loading : ui.congestionSubmit }}
      </button>
    </div>

    <div v-else class="text-sm text-emerald-600 font-medium text-center py-1">
      ✓ {{ ui.congestionThanks }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  slug: { type: String, required: true }
})

const { ui } = useUiT()

const { data, refresh } = await useFetch(
  () => `/api/pubs/${props.slug}/congestion`,
  { server: false, lazy: true }
)

const selected  = ref(null)
const submitting = ref(false)
const submitted  = ref(false)

const options = computed(() => [
  {
    value: 'QUIET',
    icon: '🟢',
    label: ui.value.congestionQuiet,
    activeClass: 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
  },
  {
    value: 'NORMAL',
    icon: '🟡',
    label: ui.value.congestionNormal,
    activeClass: 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700'
  },
  {
    value: 'BUSY',
    icon: '🔴',
    label: ui.value.congestionBusy,
    activeClass: 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 dark:border-red-700'
  }
])

function statusLabel(s) {
  if (s === 'QUIET')  return ui.value.congestionQuiet
  if (s === 'NORMAL') return ui.value.congestionNormal
  if (s === 'BUSY')   return ui.value.congestionBusy
  return s
}

function statusClass(s) {
  if (s === 'QUIET')  return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  if (s === 'NORMAL') return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
  if (s === 'BUSY')   return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
  return ''
}

function dotClass(s) {
  if (s === 'QUIET')  return 'bg-emerald-500'
  if (s === 'NORMAL') return 'bg-amber-500 animate-pulse'
  if (s === 'BUSY')   return 'bg-red-500 animate-pulse'
  return ''
}

function relativeTime(d) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return ui.value.congestionJustNow
  if (mins < 60) return `${mins}${ui.value.congestionMinsAgo}`
  const hrs = Math.floor(mins / 60)
  return `${hrs}${ui.value.congestionHrsAgo}`
}

async function submit() {
  if (!selected.value || submitting.value) return
  submitting.value = true
  try {
    await $fetch(`/api/pubs/${props.slug}/congestion`, {
      method: 'POST',
      body:   { status: selected.value }
    })
    submitted.value = true
    await refresh()
  } finally {
    submitting.value = false
  }
}
</script>
