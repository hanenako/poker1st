<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
    <header class="mb-6">
      <h1 class="page-title">Schedule</h1>
      <p class="mt-1 text-zinc-500 text-sm">대회별 이벤트 통합 일정</p>    </header>

    <!-- 필터 + 뷰 토글 -->
    <div class="surface-card p-4 mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <select v-model="filters.brand" class="input-base flex-1 min-w-[8rem]">
          <option value="">{{ ui.allBrands }}</option>
          <option v-for="b in brands" :key="b.slug" :value="b.slug">{{ b.name }}</option>
        </select>
        <select v-model="filters.game" class="input-base flex-1 min-w-[8rem]">
          <option value="">{{ ui.allGames }}</option>
          <option value="NLH">NLH</option>
          <option value="PLO">PLO</option>
          <option value="PLO-5">PLO-5</option>
        </select>
        <select v-model="filters.city" class="input-base flex-1 min-w-[8rem]">
          <option value="">{{ ui.allCities }}</option>
          <option value="Tokyo">Tokyo</option>
          <option value="Osaka">Osaka</option>
          <option value="Seoul">Seoul</option>
          <option value="Taipei">Taipei</option>
        </select>
        <button class="btn-ghost text-sm whitespace-nowrap min-w-[4.5rem]" @click="resetFilters">{{ ui.reset }}</button>

        <!-- 뷰 전환 -->
        <div class="flex rounded-lg border border-zinc-200 overflow-hidden shrink-0">
          <button
            class="px-3 py-1.5 text-sm transition whitespace-nowrap"
            :class="viewMode === 'list' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500 hover:bg-zinc-50'"
            @click="viewMode = 'list'"
          >{{ ui.listView }}</button>
          <button
            class="px-3 py-1.5 text-sm transition border-l border-zinc-200 whitespace-nowrap"
            :class="viewMode === 'calendar' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500 hover:bg-zinc-50'"
            @click="viewMode = 'calendar'"
          >{{ ui.calendarView }}</button>
        </div>
      </div>
    </div>

    <div v-if="pending" class="muted text-sm py-10 text-center">{{ ui.loading }}</div>

    <div v-else-if="!events?.length" class="surface-card p-10 text-center muted">
      {{ ui.noEventsFound }}
    </div>

    <!-- ══ 달력 뷰 ══ -->
    <template v-else-if="viewMode === 'calendar'">
      <!-- 월 이동 -->
      <div class="flex items-center justify-between mb-4">
        <button class="btn-ghost" @click="prevMonth">{{ ui.prevMonth }}</button>
        <h2 class="text-base font-semibold text-zinc-800">
          {{ ui.monthLabel(calYear, calMonth) }}
        </h2>
        <button class="btn-ghost" @click="nextMonth">{{ ui.nextMonth }}</button>
      </div>

      <div class="surface-card overflow-hidden">
        <!-- 요일 헤더 -->
        <div class="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
          <div
            v-for="(d, i) in ui.days"
            :key="d"
            class="px-1 py-2 text-center text-xs font-medium"
            :class="i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-zinc-500'"
          >{{ d }}</div>
        </div>

        <!-- 날짜 그리드 -->
        <div class="grid grid-cols-7 auto-rows-fr divide-x divide-zinc-100">
          <div
            v-for="cell in calCells"
            :key="cell.key"
            class="min-h-[5.5rem] border-b border-zinc-100 p-1"
            :class="cell.outside ? 'bg-zinc-50' : 'bg-white'"
          >
            <div
              class="text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-0.5 mx-auto"
              :class="[
                cell.outside ? 'text-zinc-300' : cell.dow === 0 ? 'text-red-400' : cell.dow === 6 ? 'text-blue-400' : 'text-zinc-600',
                cell.isToday ? 'bg-indigo-600 text-white' : ''
              ]"
            >{{ cell.day }}</div>

            <!-- 이벤트 점 -->
            <div class="space-y-0.5">
              <NuxtLink
                v-for="ev in cell.events.slice(0, 3)"
                :key="ev.id"
                :to="`/tournaments/${ev.tournament?.slug}`"
                class="block truncate text-[10px] leading-4 rounded px-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                :title="`${ev.tournament?.titleShort} - ${ev.name}`"
              >{{ ev.name }}</NuxtLink>
              <div v-if="cell.events.length > 3" class="text-[10px] text-zinc-400 pl-1">
                {{ ui.moreEvents(cell.events.length - 3) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!calMonthEvents.length" class="surface-card p-8 text-center muted mt-4">
        {{ ui.noEventsMonth }}
      </div>
      <p class="text-xs text-zinc-500 mt-4">{{ ui.eventsShowing(calMonthEvents.length, events.length) }}</p>
    </template>

    <!-- ══ 목록 뷰 ══ -->
    <template v-else>
      <!-- 데스크탑: 단일 테이블 + 날짜 구분 행 -->
      <div class="surface-card overflow-hidden hidden sm:block">
        <div class="overflow-x-auto">
          <table class="w-full text-sm table-fixed">
            <colgroup>
              <col class="w-32" />   <!-- 날짜 -->
              <col class="w-40" />   <!-- 대회 -->
              <col />                <!-- 이벤트 -->
              <col class="w-40" />   <!-- Buy-in -->
              <col class="w-24" />   <!-- GTD -->
              <col class="w-36" />   <!-- 게임/포맷 -->
              <col class="w-28" />   <!-- 등록 -->
            </colgroup>
            <thead class="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide border-b border-zinc-200">
              <tr>
                <th class="text-left font-medium px-4 py-3 whitespace-nowrap">{{ ui.date }}</th>
                <th class="text-left font-medium px-4 py-3 whitespace-nowrap">Tournament</th>
                <th class="text-left font-medium px-4 py-3 whitespace-nowrap">{{ ui.eventCol }}</th>
                <th class="text-left font-medium px-4 py-3 whitespace-nowrap">Buy-in</th>
                <th class="text-left font-medium px-4 py-3 whitespace-nowrap">GTD</th>
                <th class="text-left font-medium px-4 py-3 whitespace-nowrap">{{ ui.game }} / {{ ui.format }}</th>
                <th class="text-left font-medium px-4 py-3 whitespace-nowrap">{{ ui.regTime }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="group in groupedEvents" :key="group.date">
                <!-- 날짜 구분 행 -->
                <tr class="bg-zinc-50 border-t border-zinc-200">
                  <td colspan="7" class="px-4 py-2">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-zinc-800">{{ group.label }}</span>
                      <span class="text-xs text-zinc-400">({{ group.events.length }})</span>
                    </div>
                  </td>
                </tr>
                <!-- 이벤트 행 -->
                <tr
                  v-for="ev in group.events"
                  :key="ev.id"
                  class="border-t border-zinc-100 hover:bg-zinc-50 transition"
                >
                  <td class="px-4 py-3 text-zinc-400 text-xs"></td>
                  <td class="px-4 py-3">
                    <NuxtLink
                      :to="`/tournaments/${ev.tournament.slug}`"
                      class="text-indigo-600 hover:underline text-xs font-medium block truncate"
                    >
                      {{ ev.tournament.titleShort }}
                    </NuxtLink>
                    <div class="text-xs text-zinc-400 mt-0.5 truncate">{{ ev.tournament.city }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <NuxtLink
                      :to="`/tournaments/${ev.tournament.slug}?event=${ev.id}`"
                      class="font-medium text-zinc-900 hover:text-indigo-600 truncate block transition"
                    >{{ ev.name }}</NuxtLink>
                    <div v-if="ev.nameKo" class="text-xs text-zinc-400 truncate">{{ ev.nameKo }}</div>
                  </td>
                  <td class="px-4 py-3 text-zinc-800 font-medium leading-snug">
                    {{ ev.buyInText || fmtYen(ev.buyInAmount) || '—' }}
                  </td>
                  <td class="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                    {{ ev.gtdText || fmtYen(ev.gtdAmount) || '' }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex flex-wrap gap-1">
                      <span v-if="ev.gameType" class="chip text-xs">{{ ev.gameType }}</span>
                      <span v-if="ev.structure" class="chip text-xs">{{ ev.structure }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                    {{ ev.registrationStart ? ev.registrationStart + '~' : '' }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 모바일: 날짜별 그룹 카드 -->
      <div class="sm:hidden space-y-6">
        <div v-for="group in groupedEvents" :key="group.date">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-semibold text-zinc-800">{{ group.label }}</span>
            <span class="text-xs text-zinc-400">({{ group.events.length }})</span>
          </div>
          <div class="space-y-2">
            <NuxtLink
              v-for="ev in group.events"
              :key="ev.id"
              :to="`/tournaments/${ev.tournament.slug}`"
              class="surface-card px-4 py-3 block hover:bg-zinc-50 transition"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-zinc-400 mb-0.5">{{ ev.tournament.titleShort }} · {{ ev.tournament.city }}</div>
                  <div class="font-medium text-zinc-900 text-sm truncate">{{ ev.name }}</div>
                  <div class="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-zinc-500">
                    <span v-if="ev.buyInText || ev.buyInAmount">{{ ev.buyInText || fmtYen(ev.buyInAmount) }}</span>
                    <span v-if="ev.gtdText || ev.gtdAmount">GTD {{ ev.gtdText || fmtYen(ev.gtdAmount) }}</span>
                  </div>
                </div>
                <div class="shrink-0 flex flex-col items-end gap-1">
                  <span v-if="ev.gameType" class="chip text-xs">{{ ev.gameType }}</span>
                  <span v-if="ev.registrationStart" class="text-xs text-zinc-400">{{ ev.registrationStart }}~</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <p class="text-xs text-zinc-500 mt-6">{{ ui.eventsTotal(events.length) }}</p>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const viewMode = ref('list')
const { ui } = useUiT()

useSeoMeta({
  title: 'Schedule',
  description: '일본 포커 대회 이벤트 통합 일정표. 날짜·게임·도시별 필터로 원하는 이벤트를 찾아보세요.',
  ogTitle: 'Schedule | PokerTripJP',
  ogDescription: '일본 포커 대회 이벤트 통합 일정표.'
})

const filters = reactive({ brand: '', game: '', city: '' })
const query   = ref({})

const { data: brands } = await useFetch('/api/brands')
const { data: events, pending } = await useFetch('/api/events', {
  query,
  watch: [query]
})

watch(filters, () => {
  const q = {}
  if (filters.brand) q.brand = filters.brand
  if (filters.game)  q.game  = filters.game
  if (filters.city)  q.city  = filters.city
  query.value = q
}, { deep: true })

function resetFilters() {
  filters.brand = ''
  filters.game  = ''
  filters.city  = ''
}

function fmtDate(d) {
  if (!d) return ''
  const date = new Date(String(d).slice(0, 10) + 'T00:00:00')
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const day = date.getDate()
  const dow = ui.value.days[date.getDay()]
  return `${y}.${String(m).padStart(2, '0')}.${String(day).padStart(2, '0')} (${dow})`
}

function fmtYen(n) {
  if (!n) return ''
  return '¥' + Number(n).toLocaleString()
}

// ── 달력 상태 ────────────────────────────────────────────
const today = new Date()
const calYear  = ref(today.getFullYear())
const calMonth = ref(today.getMonth())

function prevMonth() {
  if (calMonth.value === 0) { calYear.value--; calMonth.value = 11 }
  else calMonth.value--
}
function nextMonth() {
  if (calMonth.value === 11) { calYear.value++; calMonth.value = 0 }
  else calMonth.value++
}

// 현재 달의 이벤트만 필터
const calMonthEvents = computed(() => {
  if (!events.value) return []
  return events.value.filter(ev => {
    const d = new Date(String(ev.date).slice(0, 10) + 'T00:00:00')
    return d.getFullYear() === calYear.value && d.getMonth() === calMonth.value
  })
})

// 날짜 → 이벤트 맵
const calEventMap = computed(() => {
  const map = new Map()
  for (const ev of calMonthEvents.value) {
    const key = String(ev.date).slice(0, 10)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(ev)
  }
  return map
})

// 달력 셀 배열 생성
const calCells = computed(() => {
  const year  = calYear.value
  const month = calMonth.value
  const firstDay = new Date(year, month, 1).getDay()  // 0=일
  const lastDate = new Date(year, month + 1, 0).getDate()

  // 이전달 채우기
  const prevLastDate = new Date(year, month, 0).getDate()
  const cells = []

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevLastDate - i
    cells.push({ key: `prev-${d}`, day: d, outside: true, events: [], dow: new Date(year, month - 1, d).getDay(), isToday: false })
  }

  // 이번달
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  for (let d = 1; d <= lastDate; d++) {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    cells.push({
      key,
      day: d,
      outside: false,
      dow: new Date(year, month, d).getDay(),
      events: calEventMap.value.get(key) ?? [],
      isToday: key === todayStr
    })
  }

  // 다음달 채우기 (6행 유지)
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ key: `next-${d}`, day: d, outside: true, events: [], dow: new Date(year, month + 1, d).getDay(), isToday: false })
  }

  return cells
})

// ── 목록 그룹 ────────────────────────────────────────────
const groupedEvents = computed(() => {
  if (!events.value) return []
  const map = new Map()
  for (const ev of events.value) {
    const key = String(ev.date).slice(0, 10)
    if (!map.has(key)) {
      map.set(key, { date: key, label: fmtDate(ev.date), events: [] })
    }
    map.get(key).events.push(ev)
  }
  return [...map.values()]
})
</script>
