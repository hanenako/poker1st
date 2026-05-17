<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
    <header class="mb-6">
      <h1 class="page-title">PokerRooms in Japan</h1>
      <p class="mt-2 text-zinc-600">대회 주변의 포커룸 — 도시별로 모았어요.</p>
    </header>

    <!-- 필터 바 -->
    <div class="surface-card p-4 mb-6 space-y-3">
      <!-- 도시 + 뷰 전환 -->
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="c in cities"
            :key="c.value"
            class="px-3 py-1.5 rounded-full text-sm border transition"
            :class="selectedCity === c.value
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'"
            @click="selectedCity = c.value"
          >
            {{ c.label }}
          </button>
        </div>

        <!-- 뷰 전환 -->
        <div class="flex items-center gap-1 border border-zinc-200 rounded-lg p-0.5 bg-white shrink-0">
          <button
            class="px-3 py-1 rounded-md text-sm transition"
            :class="view === 'grid' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'"
            @click="view = 'grid'"
          >{{ ui.gridView }}</button>
          <button
            class="px-3 py-1 rounded-md text-sm transition"
            :class="view === 'map' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'"
            @click="view = 'map'"
          >{{ ui.mapView }}</button>
        </div>
      </div>

      <!-- 영업 상태 필터 -->
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 rounded-full text-sm border transition"
          :class="openFilter === 'all'
            ? 'bg-zinc-900 text-white border-zinc-900'
            : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'"
          @click="openFilter = 'all'"
        >{{ ui.all }}</button>
        <button
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition"
          :class="openFilter === 'open'
            ? 'bg-emerald-600 text-white border-emerald-600'
            : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'"
          @click="openFilter = 'open'"
        >
          <span class="inline-block w-1.5 h-1.5 rounded-full"
            :class="openFilter === 'open' ? 'bg-white' : 'bg-emerald-500'"
          ></span>
          {{ ui.openNow }}
        </button>
      </div>

      <!-- 게임 종류 필터 -->
      <div class="flex flex-wrap gap-2">
        <button
          class="px-3 py-1.5 rounded-full text-sm border transition"
          :class="selectedGame === ''
            ? 'bg-zinc-900 text-white border-zinc-900'
            : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'"
          @click="selectedGame = ''"
        >{{ ui.allGames }}</button>
        <button
          v-for="g in gameTypes"
          :key="g"
          class="px-3 py-1.5 rounded-full text-sm border transition"
          :class="selectedGame === g
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'"
          @click="selectedGame = g"
        >
          {{ g }}
        </button>
      </div>

      <!-- 특징 필터 -->
      <div class="flex flex-wrap gap-3">
        <label
          v-for="f in featureFilters"
          :key="f.key"
          class="flex items-center gap-1.5 text-sm cursor-pointer select-none"
        >
          <input
            v-model="activeFeatures"
            type="checkbox"
            :value="f.key"
            class="accent-indigo-600"
          />
          <span :class="activeFeatures.includes(f.key) ? 'text-zinc-900 font-medium' : 'text-zinc-500'">
            {{ f.label }}
          </span>
        </label>
      </div>
    </div>

    <div v-if="pending" class="muted text-sm">Loading...</div>

    <template v-else-if="filtered.length">
      <!-- 지도 뷰 -->
      <ClientOnly v-if="view === 'map'">
        <PubMap :pubs="filtered" />
        <template #fallback>
          <div class="h-96 surface-card flex items-center justify-center muted text-sm">{{ ui.mapLoading }}</div>
        </template>
      </ClientOnly>

      <!-- 카드 뷰 - All이면 도시별 그룹, 도시 선택 시 페이지네이션 그리드 -->
      <template v-else>
        <template v-if="!selectedCity && !activeFeatures.length && openFilter === 'all' && !selectedGame">
          <p class="text-sm text-zinc-400 mb-4">{{ ui.roomsCount(filtered.length) }}</p>
          <div v-for="group in cityGroups" :key="group.city" class="mb-10">
            <h2 class="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              {{ group.city }}
              <span class="text-sm font-normal text-zinc-400">{{ ui.roomsCount(group.pubs.length) }}</span>
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <PubCard v-for="pub in group.pubs" :key="pub.id" :pub="pub" />
            </div>
          </div>
        </template>
        <template v-else>
          <p class="text-sm text-zinc-400 mb-4">{{ ui.roomsCount(filtered.length) }}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <PubCard v-for="pub in pagedPubs" :key="pub.id" :pub="pub" />
          </div>
          <Pagination :page="pubPage" :total-pages="pubTotalPages" @update:page="setPubPage" />
        </template>
      </template>
    </template>

    <div v-else class="surface-card p-10 text-center muted">
      {{ ui.noPubsFound }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { checkIsOpenRaw } from '~/composables/useIsOpen'

useSeoMeta({
  title: 'PokerRooms',
  description: '일본 현지 포커룸 — 도쿄·오사카·후쿠오카 등 도시별 포커룸 정보.',
  ogTitle: 'PokerRooms | PokerTripJP',
  ogDescription: '일본 현지 포커룸 — 도쿄·오사카·후쿠오카 등 도시별 포커룸 정보.'
})

const cities = [
  { value: '',         label: 'All' },
  { value: 'Tokyo',   label: 'Tokyo' },
  { value: 'Osaka',   label: 'Osaka' },
  { value: 'Fukuoka', label: 'Fukuoka' },
  { value: 'Others',  label: 'Others' }
]

const featureFilters = [
  { key: 'englishOk',   label: 'English OK' },
  { key: 'webCoin',     label: 'WebCoin' },
  { key: 'cardPayment', label: 'Card payment' },
  { key: 'smokingRoom', label: 'Smoking room' }
]

const { ui } = useUiT()

const selectedCity   = ref('')
const activeFeatures = ref([])
const openFilter     = ref('all') // 'all' | 'open'
const selectedGame   = ref('')
const view           = ref('grid')

const gameTypes = ['NLH', 'PLO', 'PLO-5', 'Mixed']

// 전체 fetch (클라이언트 필터링)
const { data: pubs, pending } = await useFetch('/api/pubs')

const filtered = computed(() => {
  let list = pubs.value ?? []

  // 도시 필터
  if (selectedCity.value) {
    if (selectedCity.value === 'Others') {
      const known = ['Tokyo', 'Osaka', 'Fukuoka']
      list = list.filter(p => !known.includes(p.city))
    } else {
      list = list.filter(p => p.city === selectedCity.value)
    }
  }

  // 특징 필터
  if (activeFeatures.value.length) {
    list = list.filter(p => {
      const f = p.features
      if (!f || typeof f !== 'object') return false
      return activeFeatures.value.every(key => {
        if (key === 'smokingRoom') return !!(f.smokingRoom)
        return !!f[key]
      })
    })
  }

  // 게임 종류 필터
  if (selectedGame.value) {
    list = list.filter(p => {
      const games = p.features?.games
      if (!Array.isArray(games)) return false
      return games.some(g => g.type === selectedGame.value)
    })
  }

  // 영업 상태 필터 / 정렬
  if (openFilter.value === 'open') {
    // 영업 중인 가게만
    list = list.filter(p => checkIsOpenRaw(p.hours).open)
  } else {
    // 전체: 영업 중 먼저, 나머지는 원래 순서 유지
    list = [...list].sort((a, b) => {
      const aOpen = checkIsOpenRaw(a.hours).open ? 0 : 1
      const bOpen = checkIsOpenRaw(b.hours).open ? 0 : 1
      return aOpen - bOpen
    })
  }

  return list
})

// 페이지네이션 (도시/특징 필터 시)
const PUB_PAGE_SIZE = 12
const pubPage = ref(1)
const pubTotalPages = computed(() => Math.ceil(filtered.value.length / PUB_PAGE_SIZE))
const pagedPubs = computed(() => {
  const start = (pubPage.value - 1) * PUB_PAGE_SIZE
  return filtered.value.slice(start, start + PUB_PAGE_SIZE)
})
function setPubPage(p) {
  pubPage.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
// 필터 바뀌면 첫 페이지로
watch([selectedCity, activeFeatures, openFilter, selectedGame], () => { pubPage.value = 1 }, { deep: true })

// 도시별 그룹 (All 선택 시)
const cityOrder = ['Tokyo', 'Osaka', 'Fukuoka']
const cityGroups = computed(() => {
  const map = {}
  for (const pub of filtered.value) {
    const city = pub.city || 'Others'
    if (!map[city]) map[city] = []
    map[city].push(pub)
  }
  const result = []
  for (const city of cityOrder) {
    if (map[city]?.length) result.push({ city, pubs: map[city] })
  }
  for (const [city, ps] of Object.entries(map)) {
    if (!cityOrder.includes(city)) result.push({ city, pubs: ps })
  }
  return result
})
</script>
