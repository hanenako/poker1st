<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
    <header class="mb-8">
      <h1 class="page-title">{{ ui.favTitle }}</h1>
      <p class="mt-2 text-zinc-600 text-sm">{{ ui.favDesc }}</p>
    </header>

    <div v-if="pending" class="muted text-sm">{{ ui.loading }}</div>

    <div v-else-if="!list.length" class="surface-card p-10 text-center muted">
      {{ ui.favEmpty }}<br />
      <NuxtLink to="/tournaments" class="text-indigo-600 hover:underline text-sm mt-2 inline-block">
        {{ ui.browseTournaments }}
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <TournamentCard
        v-for="t in list"
        :key="t.id"
        :tournament="t"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

useSeoMeta({ title: '즐겨찾기 · PokerTripJP' })

const { loggedIn } = useUserSession()
const { ui } = useUiT()
const { favIds, loaded, ensureLoaded, readLocalIds } = useFavorites()

const pending = ref(true)
const list = ref([])

onMounted(async () => {
  await ensureLoaded()

  if (loggedIn.value) {
    // 로그인: 서버에서 전체 tournament 객체 가져오기
    const data = await $fetch('/api/favorites')
    list.value = data
    favIds.value = data.map(t => t.id)
    loaded.value = true
  } else {
    // 비로그인: localStorage ID로 조회
    const ids = readLocalIds()
    if (ids.length) {
      const data = await $fetch('/api/tournaments/by-ids', {
        query: { ids: ids.join(',') }
      })
      list.value = data
    }
  }
  pending.value = false
})
</script>
