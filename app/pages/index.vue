<template>
  <div>
    <!-- Hero -->
    <section class="border-b border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div class="max-w-2xl">
          <div class="chip-accent mb-4">
            For Korean poker players visiting Japan
          </div>
          <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 leading-[1.1]">
            일본 포커 대회 일정,<br />한 곳에서.
          </h1>
          <p class="mt-5 text-lg text-zinc-600 max-w-xl">
            JOPT, APL 등 주요 대회 일정과 현지 포커룸 정보를 정리합니다.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <NuxtLink to="/tournaments" class="btn-primary">
              Browse tournaments
            </NuxtLink>
            <NuxtLink to="/pubs" class="btn-secondary">
              Explore PokerRooms
            </NuxtLink>
          </div>
          <!-- 환율 -->
          <div class="mt-5">
            <ExchangeRate /></div>
        </div>

        <!-- 통계 -->
        <div v-if="stats" class="mt-10 flex flex-wrap gap-6 sm:gap-10">
          <div>
            <div class="text-2xl font-semibold text-zinc-900">{{ stats.tournaments }}</div>
            <div class="text-sm text-zinc-500 mt-0.5">Tournaments</div>
          </div>
          <div class="w-px bg-zinc-200 self-stretch hidden sm:block" />
          <div>
            <div class="text-2xl font-semibold text-zinc-900">{{ stats.pokerRooms }}</div>
            <div class="text-sm text-zinc-500 mt-0.5">PokerRooms</div>
          </div>
          <div class="w-px bg-zinc-200 self-stretch hidden sm:block" />
          <div>
            <div class="text-2xl font-semibold text-zinc-900">{{ stats.brands }}</div>
            <div class="text-sm text-zinc-500 mt-0.5">Brands</div>
          </div>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-14">

      <!-- Upcoming & Live -->
      <section v-if="activeTournaments.length">
        <div class="flex items-end justify-between mb-5">
          <h2 class="section-title">Upcoming & Live</h2>
          <NuxtLink to="/tournaments" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all →
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <TournamentCard
            v-for="t in activeTournaments"
            :key="t.id"
            :tournament="t"
          />
        </div>
      </section>

      <!-- Featured tournaments (UPCOMING 없을 때 폴백) -->
      <section v-else>
        <div class="flex items-end justify-between mb-5">
          <h2 class="section-title">Featured tournaments</h2>
          <NuxtLink to="/tournaments" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all →
          </NuxtLink>
        </div>
        <div v-if="pendingT" class="muted text-sm">Loading...</div>
        <div v-else-if="!tournaments?.length" class="muted text-sm">
          아직 등록된 대회가 없습니다.
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <TournamentCard
            v-for="t in tournaments"
            :key="t.id"
            :tournament="t"
          />
        </div>
      </section>

      <!-- Featured PokerRooms -->
      <section v-if="pubs?.length">
        <div class="flex items-end justify-between mb-5">
          <h2 class="section-title">Featured PokerRooms</h2>
          <NuxtLink to="/pubs" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all →
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <PubCard
            v-for="pub in pubs"
            :key="pub.id"
            :pub="pub"
          />
        </div>
      </section>

      <!-- Brands -->
      <section>
        <div class="flex items-end justify-between mb-5">
          <h2 class="section-title">Brands</h2>
          <NuxtLink to="/brands" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all →
          </NuxtLink>
        </div>
        <div v-if="pendingB" class="muted text-sm">Loading...</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <BrandCard
            v-for="brand in brands"
            :key="brand.id"
            :brand="brand"
          />
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

useSeoMeta({
  title: 'PokerTripJP — 일본 포커 대회 정보',
  titleTemplate: '%s',
  description: '일본 포커 대회 일정과 현지 포커룸 정보 — 한국 플레이어를 위한 통합 가이드',
  ogTitle: 'PokerTripJP — 일본 포커 대회 정보',
  ogDescription: 'JOPT, APL 등 주요 대회 일정과 현지 포커룸 정보를 한국어로 정리합니다.'
})

const [
  { data: tournaments, pending: pendingT },
  { data: brands, pending: pendingB },
  { data: pubs },
  { data: stats }
] = await Promise.all([
  useFetch('/api/tournaments', { query: { limit: 6 } }),
  useFetch('/api/brands'),
  useFetch('/api/pubs', { query: { limit: 6 } }),
  useFetch('/api/stats')
])

const activeTournaments = computed(() => {
  const twoMonthsLater = new Date()
  twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2)

  return (tournaments.value ?? []).filter(t => {
    if (t.status === 'ONGOING') return true
    if (t.status === 'UPCOMING') {
      return new Date(t.startDate) <= twoMonthsLater
    }
    return false
  })
})
</script>
