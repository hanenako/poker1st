<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
    <header class="mb-8 flex items-start justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
          <img v-if="user?.avatarUrl" :src="user.avatarUrl" class="w-full h-full object-cover" />
          <span v-else class="text-2xl font-semibold text-zinc-500">
            {{ (user?.name || user?.email || '?')[0].toUpperCase() }}
          </span>
        </div>
        <div>
          <h1 class="text-xl font-semibold text-zinc-900">{{ user?.name || '닉네임 없음' }}</h1>
          <p class="text-sm text-zinc-400 mt-0.5">{{ user?.email }}</p>
        </div>
      </div>
      <button class="btn-ghost text-sm text-red-500 hover:text-red-700 shrink-0" @click="onLogout">로그아웃</button>
    </header>

    <!-- 탭 -->
    <div class="flex border-b border-zinc-200 mb-6 gap-0">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="px-4 py-2.5 text-sm font-medium border-b-2 transition"
        :class="activeTab === tab.key
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-zinc-500 hover:text-zinc-900'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span class="ml-1 text-xs text-zinc-400">{{ tab.count }}</span>
      </button>
    </div>

    <!-- 즐겨찾기 탭 -->
    <template v-if="activeTab === 'favorites'">
      <div v-if="favPending" class="muted text-sm">Loading...</div>
      <div v-else-if="!favorites?.length" class="surface-card p-10 text-center muted">
        아직 즐겨찾기한 대회가 없습니다.
        <NuxtLink to="/tournaments" class="block mt-2 text-indigo-600 hover:underline text-sm">대회 둘러보기 →</NuxtLink>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TournamentCard v-for="t in favorites" :key="t.id" :tournament="t" />
      </div>
    </template>

    <!-- 리뷰 탭 -->
    <template v-else-if="activeTab === 'reviews'">
      <div v-if="reviewPending" class="muted text-sm">Loading...</div>
      <div v-else-if="!myReviews?.length" class="surface-card p-10 text-center muted">
        작성한 리뷰가 없습니다.
        <NuxtLink to="/pubs" class="block mt-2 text-indigo-600 hover:underline text-sm">포커룸 둘러보기 →</NuxtLink>
      </div>
      <div v-else class="space-y-3">
        <div v-for="r in myReviews" :key="r.id" class="surface-card p-4">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <NuxtLink :to="`/pubs/${r.pub.slug}`" class="text-sm font-semibold text-indigo-600 hover:underline">
                {{ r.pub.name }}
              </NuxtLink>
              <div class="flex items-center gap-2 mt-1">
                <StarRating :value="r.rating" readonly size="sm" />
                <span class="text-xs text-zinc-400">{{ fmtDate(r.createdAt) }}</span>
              </div>
              <p v-if="r.title" class="text-sm font-medium text-zinc-800 mt-1">{{ r.title }}</p>
              <p v-if="r.body" class="text-sm text-zinc-500 mt-0.5">{{ r.body }}</p>
            </div>
            <button
              class="text-xs text-red-500 hover:text-red-700 shrink-0"
              @click="deleteReview(r)"
            >삭제</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: '마이페이지' })

const { user, clear } = useUserSession()
const router = useRouter()

const { data: favorites, pending: favPending } = await useFetch('/api/favorites')
const { data: myReviews, pending: reviewPending, refresh: refreshReviews } = await useFetch('/api/me/reviews')

const activeTab = ref('favorites')

const tabs = computed(() => [
  { key: 'favorites', label: '즐겨찾기', count: favorites.value?.length ?? 0 },
  { key: 'reviews',   label: '내 리뷰',  count: myReviews.value?.length  ?? 0 }
])

function fmtDate(d) {
  return d ? String(d).slice(0, 10) : ''
}

async function deleteReview(r) {
  if (!confirm('리뷰를 삭제할까요?')) return
  await $fetch(`/api/pubs/${r.pub.slug}/reviews/${r.id}`, { method: 'DELETE' })
  await refreshReviews()
}

async function onLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  router.push('/')
}
</script>
