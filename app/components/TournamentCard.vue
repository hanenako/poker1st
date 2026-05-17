<template>
  <div class="group surface-card surface-card-hover overflow-hidden flex flex-col relative">
    <NuxtLink :to="`/tournaments/${tournament.slug}`" class="flex flex-col flex-1">
      <div class="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
        <img
          v-if="tournament.posterImageUrl"
          :src="tournament.posterImageUrl"
          class="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <!-- 포스터 없을 때 플레이스홀더 -->
        <div v-else class="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-100 to-zinc-200">
          <span class="text-5xl text-zinc-300 select-none">♠</span>
          <span class="text-xs font-medium text-zinc-400 uppercase tracking-widest px-4 text-center line-clamp-2">
            {{ tournament.brand?.name || tournament.titleShort }}
          </span>
        </div>
        <span
          v-if="statusBadgeClass"
          class="absolute top-3 left-3"
          :class="statusBadgeClass"
        >
          <span v-if="tournament.status === 'ONGOING'" class="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          {{ statusLabel }}
        </span>
      </div>

      <div class="p-4 flex-1 flex flex-col gap-1.5">
        <div class="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          {{ tournament.brand?.name }}
        </div>
        <h3 class="text-lg font-semibold text-zinc-900 leading-tight">
          {{ tournament.titleShort }}
        </h3>
        <p v-if="subtitle" class="text-xs text-zinc-400 leading-snug -mt-0.5">
          {{ subtitle }}
        </p>
        <div class="mt-auto pt-2 text-sm text-zinc-600 flex items-center justify-between">
          <span>{{ tournament.city }}</span>
          <span class="text-zinc-500">{{ dateRange }}</span>
        </div>
      </div>
    </NuxtLink>

    <!-- 즐겨찾기 버튼 (비로그인 포함 전체 표시) -->
    <button
      class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition dark:bg-zinc-800/80 dark:hover:bg-zinc-800"
      :title="isFavThis ? '즐겨찾기 해제' : '즐겨찾기'"
      @click.prevent="handleToggleFav"
    >
      <span :class="isFavThis ? 'text-red-500' : 'text-zinc-400 hover:text-red-400'">
        {{ isFavThis ? '♥' : '♡' }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'

const props = defineProps({
  tournament: { type: Object, required: true }
})

const { locale } = useLocale()

// 로케일별 부제목 (원제와 다를 때만 표시)
const subtitle = computed(() => {
  const t = props.tournament
  if (locale.value === 'ko' && t.titleFullKo && t.titleFullKo !== t.titleShort) return t.titleFullKo
  if (locale.value === 'ja' && t.titleFullJa && t.titleFullJa !== t.titleShort) return t.titleFullJa
  if (locale.value === 'en' && t.titleFull   && t.titleFull   !== t.titleShort) return t.titleFull
  return null
})
const { ensureLoaded, isFav, toggleFav } = useFavorites()

// 로그인 상태면 즐겨찾기 목록 로드 (이미 로드됐으면 무시)
onMounted(() => ensureLoaded())

const isFavThis = computed(() => isFav(props.tournament.id))

async function handleToggleFav() {
  await toggleFav(props.tournament.id)
}

function fmt(d) {
  if (!d) return ''
  return String(d).slice(5, 10).replace('-', '.')
}

const dateRange = computed(() => {
  const s = fmt(props.tournament.startDate)
  const e = fmt(props.tournament.endDate)
  if (s && e && s !== e) return `${s} – ${e}`
  return s || e || ''
})

const statusLabel = computed(() => {
  const s = props.tournament.status
  if (s === 'UPCOMING')  return 'Upcoming'
  if (s === 'ONGOING')   return 'Live'
  if (s === 'FINISHED')  return 'Finished'
  if (s === 'CANCELLED') return 'Cancelled'
  return ''
})

const statusBadgeClass = computed(() => {
  const s = props.tournament.status
  if (s === 'UPCOMING')  return 'badge-upcoming'
  if (s === 'ONGOING')   return 'badge-ongoing'
  if (s === 'FINISHED')  return 'badge-finished'
  if (s === 'CANCELLED') return 'badge-cancelled'
  return ''
})
</script>
