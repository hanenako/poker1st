<template>
  <div>
    <header class="mb-8">
      <h1 class="page-title">Statistics</h1>
      <p class="mt-2 text-zinc-600 text-sm">콘텐츠 현황 및 트래픽 분석</p>
    </header>

    <div v-if="pending" class="muted text-sm">Loading...</div>

    <template v-else-if="stats">

      <!-- 콘텐츠 요약 카드 -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div class="surface-card p-5">
          <div class="text-xs text-zinc-500 uppercase tracking-wide mb-1">Tournaments</div>
          <div class="text-3xl font-semibold text-zinc-900">{{ stats.tournaments.total }}</div>
        </div>
        <div class="surface-card p-5">
          <div class="text-xs text-zinc-500 uppercase tracking-wide mb-1">Events</div>
          <div class="text-3xl font-semibold text-zinc-900">{{ stats.events.total }}</div>
        </div>
        <div class="surface-card p-5">
          <div class="text-xs text-zinc-500 uppercase tracking-wide mb-1">PokerRooms</div>
          <div class="text-3xl font-semibold text-zinc-900">{{ stats.pubs.total }}</div>
          <div v-if="stats.pubs.draft" class="text-xs text-zinc-400 mt-0.5">+{{ stats.pubs.draft }} draft</div>
        </div>
        <div class="surface-card p-5">
          <div class="text-xs text-zinc-500 uppercase tracking-wide mb-1">Brands</div>
          <div class="text-3xl font-semibold text-zinc-900">{{ stats.brands.total }}</div>
        </div>
        <div class="surface-card p-5">
          <div class="text-xs text-zinc-500 uppercase tracking-wide mb-1">Notices</div>
          <div class="text-3xl font-semibold text-zinc-900">{{ stats.notices.published }}</div>
          <div v-if="stats.notices.total - stats.notices.published" class="text-xs text-zinc-400 mt-0.5">
            +{{ stats.notices.total - stats.notices.published }} draft
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        <!-- 대회 상태 분류 -->
        <div class="surface-card p-5">
          <h2 class="text-sm font-semibold text-zinc-900 mb-4">Tournament Status</h2>
          <div class="space-y-3">
            <div v-for="item in tournamentStatusRows" :key="item.label" class="flex items-center gap-3">
              <div class="w-20 text-xs text-zinc-500 shrink-0">{{ item.label }}</div>
              <div class="flex-1 bg-zinc-100 rounded-full h-2 overflow-hidden">
                <div
                  class="h-2 rounded-full transition-all"
                  :class="item.color"
                  :style="{ width: stats.tournaments.total ? `${(item.count / stats.tournaments.total) * 100}%` : '0%' }"
                />
              </div>
              <div class="w-6 text-xs text-zinc-700 font-medium text-right shrink-0">{{ item.count }}</div>
            </div>
          </div>
        </div>

        <!-- 최근 등록된 대회 -->
        <div class="surface-card p-5">
          <h2 class="text-sm font-semibold text-zinc-900 mb-4">Recent Tournaments</h2>
          <div class="space-y-2">
            <div
              v-for="t in stats.recentTournaments"
              :key="t.id"
              class="flex items-center justify-between gap-3 text-sm"
            >
              <span class="text-zinc-900 truncate">{{ t.titleShort }}</span>
              <div class="flex items-center gap-2 shrink-0">
                <span :class="statusBadgeClass(t.status)" class="text-xs">{{ t.status }}</span>
                <span class="text-zinc-400 text-xs">{{ fmtDate(t.createdAt) }}</span>
              </div>
            </div>
            <div v-if="!stats.recentTournaments.length" class="muted text-sm">없음</div>
          </div>
        </div>

      </div>

      <!-- 최근 등록된 포커룸 -->
      <div class="surface-card p-5 mb-8">
        <h2 class="text-sm font-semibold text-zinc-900 mb-4">Recent PokerRooms</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="p in stats.recentPubs"
            :key="p.id"
            class="flex items-center justify-between gap-2 text-sm border border-zinc-100 rounded-lg px-3 py-2"
          >
            <div>
              <div class="font-medium text-zinc-900">{{ p.name }}</div>
              <div class="text-xs text-zinc-500">{{ p.city }}</div>
            </div>
            <div class="flex flex-col items-end gap-1 shrink-0">
              <span :class="p.publishedAt ? 'badge-published' : 'badge-draft'" class="text-xs">
                {{ p.publishedAt ? 'Published' : 'Draft' }}
              </span>
              <span class="text-zinc-400 text-xs">{{ fmtDate(p.createdAt) }}</span>
            </div>
          </div>
          <div v-if="!stats.recentPubs.length" class="muted text-sm">없음</div>
        </div>
      </div>

      <!-- Umami 트래픽 대시보드 -->
      <div class="surface-card overflow-hidden">
        <div class="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-zinc-900">Traffic Analytics (Umami)</h2>
          <a
            v-if="umamiShareUrl"
            :href="umamiShareUrl"
            target="_blank"
            rel="noopener"
            class="text-xs text-indigo-600 hover:underline"
          >새 탭에서 열기 ↗</a>
        </div>

        <!-- Umami 공유 대시보드 iframe -->
        <div v-if="umamiShareUrl">
          <iframe
            :src="umamiShareUrl"
            class="w-full border-0"
            style="height: 700px;"
            loading="lazy"
          />
        </div>

        <!-- 미설정 안내 -->
        <div v-else class="p-8 text-center">
          <div class="text-zinc-400 text-sm mb-4">Umami가 아직 연결되지 않았습니다.</div>
          <ol class="text-left text-sm text-zinc-600 space-y-2 max-w-md mx-auto">
            <li>1. <a href="https://umami.is" target="_blank" class="text-indigo-600 hover:underline">umami.is</a> 가입 또는 Vercel에 자체 배포</li>
            <li>2. 사이트 추가 후 Script URL과 Website ID 복사</li>
            <li>3. Settings → Share에서 공유 링크 생성</li>
            <li>4. <code class="font-mono bg-zinc-100 px-1 rounded">.env</code>에 아래 값 추가:</li>
          </ol>
          <pre class="mt-4 text-left text-xs bg-zinc-50 border border-zinc-200 rounded-lg p-4 max-w-md mx-auto overflow-x-auto">NUXT_PUBLIC_UMAMI_SCRIPT_URL=https://...
NUXT_PUBLIC_UMAMI_WEBSITE_ID=xxxxxxxx
NUXT_PUBLIC_UMAMI_SHARE_URL=https://...</pre>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

definePageMeta({ layout: 'admin' })

const config = useRuntimeConfig()
const umamiShareUrl = config.public.umamiShareUrl || ''

const { data: stats, pending } = await useFetch('/api/admin/stats')

const tournamentStatusRows = computed(() => [
  { label: 'Upcoming',  count: stats.value?.tournaments.upcoming  ?? 0, color: 'bg-indigo-500' },
  { label: 'Ongoing',   count: stats.value?.tournaments.ongoing   ?? 0, color: 'bg-green-500' },
  { label: 'Finished',  count: stats.value?.tournaments.finished  ?? 0, color: 'bg-zinc-400' },
  { label: 'Cancelled', count: stats.value?.tournaments.cancelled ?? 0, color: 'bg-red-400' }
])

function statusBadgeClass(status) {
  if (status === 'UPCOMING')  return 'badge-upcoming'
  if (status === 'ONGOING')   return 'badge-ongoing'
  if (status === 'FINISHED')  return 'badge-finished'
  if (status === 'CANCELLED') return 'badge-cancelled'
  return ''
}

function fmtDate(d) {
  return d ? String(d).slice(0, 10) : ''
}
</script>
