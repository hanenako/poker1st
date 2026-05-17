<template>
  <div>
    <header class="mb-8 flex items-end justify-between">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="mt-1 text-sm text-zinc-500">{{ today }}</p>
      </div>
      <button class="btn-ghost text-sm" @click="refresh">
        <span :class="pending ? 'animate-spin inline-block' : ''">↻</span> 새로고침
      </button>
    </header>

    <div v-if="pending && !stats" class="text-sm text-zinc-400 py-12 text-center">
      Loading...
    </div>

    <template v-else-if="stats">

      <!-- ── KPI 카드 ─────────────────────────────────────── -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="surface-card p-5">
          <div class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">포커룸</div>
          <div class="text-3xl font-bold text-zinc-900">{{ stats.pubs.total }}</div>
          <div class="text-xs text-zinc-400 mt-1">
            draft {{ stats.pubs.draft }}
          </div>
        </div>
        <div class="surface-card p-5">
          <div class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">대회</div>
          <div class="text-3xl font-bold text-zinc-900">{{ stats.tournaments.total }}</div>
          <div class="flex gap-2 text-xs text-zinc-400 mt-1 flex-wrap">
            <span class="text-emerald-500">진행 {{ stats.tournaments.ongoing }}</span>
            <span>예정 {{ stats.tournaments.upcoming }}</span>
            <span>완료 {{ stats.tournaments.finished }}</span>
          </div>
        </div>
        <div class="surface-card p-5">
          <div class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">회원</div>
          <div class="text-3xl font-bold text-zinc-900">{{ stats.users.total }}</div>
          <div class="text-xs text-zinc-400 mt-1">
            즐겨찾기 {{ stats.favorites.total }}개
          </div>
        </div>
        <div class="surface-card p-5">
          <div class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">리뷰</div>
          <div class="text-3xl font-bold text-zinc-900">{{ stats.reviews.total }}</div>
          <div class="text-xs text-zinc-400 mt-1">
            평균 ★ {{ Number(stats.reviews.avgRating).toFixed(1) }}
          </div>
        </div>
      </div>

      <!-- ── 메인 2열 그리드 ─────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        <!-- 최근 등록 대회 -->
        <div class="surface-card lg:col-span-2">
          <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <h2 class="font-semibold text-zinc-900 text-sm">최근 대회</h2>
            <NuxtLink to="/admin/tournaments" class="text-xs text-indigo-600 hover:underline">전체 보기 →</NuxtLink>
          </div>
          <div class="divide-y divide-zinc-50">
            <div
              v-for="t in stats.recentTournaments"
              :key="t.id"
              class="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 transition"
            >
              <span
                class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
                :class="statusClass(t.status)"
              >{{ statusLabel(t.status) }}</span>
              <div class="min-w-0 flex-1">
                <NuxtLink
                  :to="`/admin/tournaments/${t.id}/edit`"
                  class="text-sm font-medium text-zinc-900 hover:text-indigo-600 truncate block"
                >
                  {{ t.titleShort || '(제목 없음)' }}
                </NuxtLink>
                <div class="text-xs text-zinc-400">{{ fmtDate(t.startDate) }}</div>
              </div>
              <div class="shrink-0 flex gap-1">
                <NuxtLink :to="`/admin/tournaments/${t.id}/events`" class="text-xs btn-ghost py-0.5 px-2">Events</NuxtLink>
                <NuxtLink :to="`/admin/tournaments/${t.id}/results`" class="text-xs btn-ghost py-0.5 px-2">Results</NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- 대회 상태 도넛 차트 (SVG) -->
        <div class="surface-card p-5 flex flex-col">
          <h2 class="font-semibold text-zinc-900 text-sm mb-4">대회 상태 분포</h2>
          <div class="flex-1 flex flex-col items-center justify-center gap-4">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <template v-for="(seg, i) in donutSegments" :key="i">
                <circle
                  cx="70" cy="70" r="54"
                  fill="none"
                  :stroke="seg.color"
                  stroke-width="22"
                  :stroke-dasharray="`${seg.dash} ${seg.gap}`"
                  :stroke-dashoffset="seg.offset"
                  transform="rotate(-90 70 70)"
                />
              </template>
              <text x="70" y="70" text-anchor="middle" dominant-baseline="middle" class="text-lg font-bold" font-size="24" font-weight="700" fill="#18181b">
                {{ stats.tournaments.total }}
              </text>
              <text x="70" y="88" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="#a1a1aa">총 대회</text>
            </svg>
            <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              <div v-for="seg in donutSegments" :key="seg.label" class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: seg.color }"></span>
                <span class="text-zinc-600">{{ seg.label }}</span>
                <span class="ml-auto font-semibold text-zinc-900">{{ seg.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── 하단 2열 ──────────────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <!-- 최근 리뷰 -->
        <div class="surface-card">
          <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <h2 class="font-semibold text-zinc-900 text-sm">최근 리뷰</h2>
            <span class="text-xs text-zinc-400">최근 5건</span>
          </div>
          <div v-if="!stats.recentReviews.length" class="px-5 py-8 text-sm text-zinc-400 text-center">
            아직 리뷰가 없습니다
          </div>
          <div v-else class="divide-y divide-zinc-50">
            <div
              v-for="r in stats.recentReviews"
              :key="r.id"
              class="px-5 py-3"
            >
              <div class="flex items-start justify-between gap-2 mb-1">
                <div class="flex items-center gap-2 min-w-0">
                  <img
                    v-if="r.user?.avatarUrl"
                    :src="r.user.avatarUrl"
                    class="w-6 h-6 rounded-full shrink-0 object-cover"
                  />
                  <span v-else class="w-6 h-6 rounded-full bg-zinc-200 shrink-0 flex items-center justify-center text-xs">👤</span>
                  <span class="text-xs font-medium text-zinc-700 truncate">{{ r.user?.name || '익명' }}</span>
                </div>
                <span class="text-xs text-zinc-400 shrink-0">{{ timeAgo(r.createdAt) }}</span>
              </div>
              <div class="flex items-center gap-1 mb-1">
                <span class="text-yellow-400 text-xs">{{ reviewStars(r) }}</span>
                <NuxtLink :to="`/admin/pubs/${r.pub.id}/edit`" class="text-xs text-indigo-600 hover:underline ml-1">{{ r.pub.name }}</NuxtLink>
              </div>
              <p v-if="r.body" class="text-xs text-zinc-500 line-clamp-2">{{ r.body }}</p>
            </div>
          </div>
        </div>

        <!-- 최근 등록 포커룸 -->
        <div class="surface-card">
          <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <h2 class="font-semibold text-zinc-900 text-sm">최근 포커룸</h2>
            <NuxtLink to="/admin/pubs" class="text-xs text-indigo-600 hover:underline">전체 보기 →</NuxtLink>
          </div>
          <div class="divide-y divide-zinc-50">
            <div
              v-for="p in stats.recentPubs"
              :key="p.id"
              class="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 transition"
            >
              <div class="min-w-0 flex-1">
                <NuxtLink
                  :to="`/admin/pubs/${p.id}/edit`"
                  class="text-sm font-medium text-zinc-900 hover:text-indigo-600 truncate block"
                >
                  {{ p.name }}
                </NuxtLink>
                <div class="text-xs text-zinc-400">
                  {{ p.city }}
                  · ⭐ {{ p._count.reviews }}리뷰
                </div>
              </div>
              <span
                class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
                :class="p.publishedAt ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'"
              >
                {{ p.publishedAt ? '공개' : 'Draft' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── 빠른 이동 ─────────────────────────────────────── -->
      <div class="surface-card p-5">
        <h2 class="font-semibold text-zinc-900 text-sm mb-4">빠른 이동</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-100 hover:border-indigo-200 hover:bg-indigo-50 transition text-center group"
          >
            <span class="text-2xl">{{ link.icon }}</span>
            <span class="text-xs font-medium text-zinc-700 group-hover:text-indigo-700">{{ link.label }}</span>
          </NuxtLink>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

definePageMeta({ layout: 'admin' })

const { data: stats, pending, refresh } = await useFetch('/api/admin/stats')

const today = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
})

// ── 도넛 차트 ─────────────────────────────────────────────
const donutSegments = computed(() => {
  if (!stats.value) return []
  const t = stats.value.tournaments
  const total = t.total || 1
  const circumference = 2 * Math.PI * 54  // r=54

  const items = [
    { label: '진행중', value: t.ongoing,   color: '#10b981' },
    { label: '예정',   value: t.upcoming,  color: '#6366f1' },
    { label: '완료',   value: t.finished,  color: '#a1a1aa' },
    { label: '취소',   value: t.cancelled, color: '#f43f5e' },
  ]

  let cumulativeDash = 0
  return items.map(item => {
    const dash   = (item.value / total) * circumference
    const gap    = circumference - dash
    const offset = -cumulativeDash
    cumulativeDash += dash
    return { ...item, dash, gap, offset }
  })
})

// ── 유틸 ──────────────────────────────────────────────────
function statusLabel(s) {
  return { UPCOMING: '예정', ONGOING: '진행', FINISHED: '완료', CANCELLED: '취소' }[s] ?? s
}
function statusClass(s) {
  return {
    UPCOMING:  'bg-indigo-50 text-indigo-700',
    ONGOING:   'bg-emerald-50 text-emerald-700',
    FINISHED:  'bg-zinc-100 text-zinc-500',
    CANCELLED: 'bg-rose-50 text-rose-600',
  }[s] ?? 'bg-zinc-100 text-zinc-500'
}
function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}
function reviewStars(r) {
  const vals = [r.ratingAtmosphere, r.ratingDealer, r.ratingWait, r.ratingValue].filter(v => v != null)
  if (!vals.length) return '—'
  const avg = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
  return '★'.repeat(avg) + '☆'.repeat(5 - avg)
}
function timeAgo(d) {
  const sec = Math.floor((Date.now() - new Date(d)) / 1000)
  if (sec < 60)   return '방금'
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`
  return `${Math.floor(sec / 86400)}일 전`
}

const quickLinks = [
  { to: '/admin/tournaments/create', icon: '🃏', label: '대회 등록' },
  { to: '/admin/pubs/create',        icon: '🎰', label: '포커룸 등록' },
  { to: '/admin/brands/create' ,     icon: '🏷️', label: '브랜드 등록' },
  { to: '/admin/notices',            icon: '📢', label: '공지사항' },
  { to: '/admin/tournaments',        icon: '📋', label: '대회 목록' },
  { to: '/admin/pubs',               icon: '📍', label: '포커룸 목록' },
]
</script>
