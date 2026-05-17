<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
    <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="page-title">Tournaments</h1>
        <p class="mt-2 text-zinc-600">일본 포커 대회 일정 모음.</p>
      </div>
      <a
        href="/api/tournaments.ics"
        download="pokertripjp-tournaments.ics"
        class="btn-secondary text-sm flex items-center gap-1.5 shrink-0"
        title="구글 캘린더 / 애플 캘린더 / 아웃룩에서 구독"
      >
        📅 {{ ui.subscribeCalendar }}
      </a>
    </header>

    <!-- 필터 -->
    <div class="surface-card p-4 mb-6 space-y-3">
      <!-- Status -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="s in statusOptions"
          :key="s.value"
          class="px-3 py-1.5 rounded-full text-sm border transition"
          :class="filters.status === s.value
            ? 'bg-zinc-900 text-white border-zinc-900'
            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'"
          @click="setFilter('status', s.value)"
        >{{ s.label }}</button>
      </div>

      <!-- Brand (2개 이상일 때만 표시) -->
      <div v-if="brands?.length > 1" class="flex flex-wrap gap-2">
        <button
          class="px-3 py-1.5 rounded-full text-sm border transition"
          :class="filters.brand === ''
            ? 'bg-zinc-900 text-white border-zinc-900'
            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'"
          @click="setFilter('brand', '')"
        >{{ ui.allBrands }}</button>
        <button
          v-for="b in brands"
          :key="b.slug"
          class="px-3 py-1.5 rounded-full text-sm border transition"
          :class="filters.brand === b.slug
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'"
          @click="setFilter('brand', b.slug)"
        >{{ b.name }}</button>
      </div>
    </div>

    <div v-if="pending" class="muted text-sm">{{ ui.loading }}</div>

    <template v-else-if="result">
      <div v-if="!result.data?.length" class="surface-card p-10 text-center muted">
        {{ ui.noTournaments }}
      </div>

      <template v-else>
        <p class="text-sm text-zinc-400 mb-4">{{ ui.eventsTotal(result.total) }}</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <TournamentCard
            v-for="tournament in result.data"
            :key="tournament.id"
            :tournament="tournament"
          />
        </div>

        <Pagination
          :page="page"
          :total-pages="result.totalPages"
          @update:page="goPage"
        />
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
const { ui } = useUiT()

useSeoMeta({
  title: 'Tournaments',
  description: '일본 포커 대회 일정 목록. JOPT, APL 등 주요 대회를 확인하세요.',
  ogTitle: 'Tournaments | PokerTripJP',
  ogDescription: '일본 포커 대회 일정 목록. JOPT, APL 등 주요 대회를 확인하세요.'
})

const route  = useRoute()
const router = useRouter()

const page = ref(Number(route.query.page) || 1)
const filters = ref({
  status: route.query.status || '',
  brand:  route.query.brand  || ''
})

const statusOptions = computed(() => [
  { value: '',          label: ui.value.all || 'All' },
  { value: 'UPCOMING',  label: 'Upcoming' },
  { value: 'ONGOING',   label: 'Live' },
  { value: 'FINISHED',  label: 'Finished' }
])

const { data: brands } = await useFetch('/api/brands')

const { data: result, pending, refresh } = await useFetch('/api/tournaments', {
  query: computed(() => ({
    page:     page.value,
    pageSize: 12,
    status:   filters.value.status || undefined,
    brand:    filters.value.brand  || undefined
  })),
  watch: false
})

function setFilter(key, value) {
  filters.value[key] = value
  page.value = 1
  router.replace({ query: { ...route.query, [key]: value || undefined, page: undefined } })
  refresh()
}

function goPage(p) {
  page.value = p
  router.replace({ query: { ...route.query, page: p } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
  refresh()
}

watch(page, () => refresh())
</script>
