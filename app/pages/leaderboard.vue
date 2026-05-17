<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 py-10">

    <header class="mb-8">
      <h1 class="page-title">{{ ui.leaderboard }}</h1>
      <p class="mt-2 text-zinc-500 text-sm">{{ ui.leaderboardDesc }}</p>
    </header>

    <!-- 필터 -->
    <div class="flex flex-wrap gap-3 mb-6">
      <!-- 브랜드 -->
      <select v-model="filters.brandId" class="input-base w-auto text-sm">
        <option value="">{{ ui.allBrands }}</option>
        <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
      </select>

      <!-- 연도 -->
      <select v-model="filters.year" class="input-base w-auto text-sm">
        <option value="">{{ ui.allYears }}</option>
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>

      <!-- 특정 대회 -->
      <select v-model="filters.tournamentId" class="input-base w-auto text-sm">
        <option value="">{{ ui.allTournaments }}</option>
        <option v-for="t in filteredTournaments" :key="t.id" :value="t.id">
          {{ t.titleShort }}
        </option>
      </select>
    </div>

    <div v-if="pending" class="muted text-sm">{{ ui.loading }}</div>

    <div v-else-if="!players?.length" class="surface-card p-10 text-center muted">
      {{ ui.leaderboardEmpty }}
    </div>

    <template v-else>
      <p class="text-xs text-zinc-400 mb-3">{{ players.length }}명</p>

      <!-- 테이블 -->
      <div class="surface-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th class="text-left font-medium px-4 py-3 w-12">#</th>
                <th class="text-left font-medium px-4 py-3">{{ ui.player }}</th>
                <th class="text-left font-medium px-4 py-3 hidden sm:table-cell">{{ ui.country }}</th>
                <th class="text-right font-medium px-4 py-3">{{ ui.cashes }}</th>
                <th class="text-right font-medium px-4 py-3">{{ ui.totalPrize }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
              <template v-for="p in players" :key="p.playerName">
                <tr
                  class="cursor-pointer transition"
                  :class="[
                    opened === p.playerName ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                    p.rank === 1 ? 'bg-amber-50/60 dark:bg-amber-950/30' : ''
                  ]"
                  @click="opened = opened === p.playerName ? null : p.playerName"
                >
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                      :class="{
                        'bg-amber-400 text-white': p.rank === 1,
                        'bg-zinc-300 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200': p.rank === 2,
                        'bg-orange-300 text-white': p.rank === 3,
                        'text-zinc-500': p.rank > 3
                      }"
                    >{{ p.rank }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="font-semibold text-zinc-900">{{ p.playerName }}</div>
                    <div v-if="p.playerNameKo" class="text-xs text-zinc-400">{{ p.playerNameKo }}</div>
                  </td>
                  <td class="px-4 py-3 text-zinc-500 hidden sm:table-cell">
                    {{ p.country || '—' }}
                  </td>
                  <td class="px-4 py-3 text-right">
                    <span class="font-medium text-zinc-700">{{ p.cashes }}</span>
                    <span v-if="p.wins" class="ml-1 text-xs text-amber-600 font-semibold">({{ p.wins }}🏆)</span>
                  </td>
                  <td class="px-4 py-3 text-right font-semibold text-zinc-800">
                    {{ p.totalPrize ? '¥' + p.totalPrize.toLocaleString() : '—' }}
                  </td>
                </tr>

                <!-- 펼치기: 입상 내역 -->
                <tr v-if="opened === p.playerName">
                  <td colspan="5" class="bg-indigo-50/50 dark:bg-indigo-950/20 px-8 py-3">
                    <div class="space-y-1.5">
                      <div
                        v-for="(e, i) in p.entries"
                        :key="i"
                        class="flex items-center gap-3 text-xs text-zinc-700"
                      >
                        <span
                          class="inline-flex items-center justify-center w-5 h-5 rounded-full font-bold shrink-0"
                          :class="{
                            'bg-amber-400 text-white': e.place === 1,
                            'bg-zinc-300 dark:bg-zinc-600 text-zinc-600': e.place === 2,
                            'bg-orange-300 text-white': e.place === 3,
                            'bg-zinc-100 dark:bg-zinc-700 text-zinc-500': e.place > 3
                          }"
                        >{{ e.place }}</span>
                        <NuxtLink :to="`/tournaments/${e.tournamentSlug}`" class="hover:text-indigo-600 hover:underline flex-1">
                          {{ e.brandName }} · {{ e.tournamentTitle }}
                          <span class="text-zinc-400 ml-1">({{ e.year }})</span>
                          <span v-if="e.eventName" class="block text-zinc-400 font-normal text-[10px] mt-0.5">
                            📋 {{ e.eventName }}
                          </span>
                        </NuxtLink>
                        <span v-if="e.prizeText || e.prize" class="font-semibold text-zinc-700 shrink-0">
                          {{ e.prizeText || '¥' + e.prize.toLocaleString() }}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const { ui } = useUiT()

useSeoMeta({
  title: '리더보드 · PokerTripJP',
  description: '일본 포커 대회 결과 리더보드 — 플레이어별 입상 이력 및 상금 집계'
})

// ── 필터 데이터 ────────────────────────────────────────────
const { data: brands } = await useFetch('/api/brands')
const { data: tournaments } = await useFetch('/api/tournaments', { query: { limit: 200 } })

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

const filters = ref({ brandId: '', year: '', tournamentId: '' })

const filteredTournaments = computed(() => {
  const list = Array.isArray(tournaments.value) ? tournaments.value : (tournaments.value?.data ?? [])
  if (!filters.value.brandId) return list
  return list.filter(t => t.brand?.id === Number(filters.value.brandId))
})

// ── 리더보드 fetch ─────────────────────────────────────────
const query = computed(() => {
  const q = {}
  if (filters.value.tournamentId) q.tournamentId = filters.value.tournamentId
  else {
    if (filters.value.brandId) q.brandId = filters.value.brandId
    if (filters.value.year)    q.year    = filters.value.year
  }
  return q
})

const { data: players, pending, refresh } = await useFetch('/api/leaderboard', {
  query,
  watch: [query]
})

// 브랜드 바꾸면 대회 필터 초기화
watch(() => filters.value.brandId, () => { filters.value.tournamentId = '' })

// 펼치기 상태
const opened = ref(null)
</script>
