<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
    <header class="mb-8">
      <h1 class="page-title">Search</h1>
      <div class="mt-4 max-w-xl">
        <input
          v-model="q"
          type="search"
          :placeholder="ui.searchPh"
          class="input-base text-base"
          autofocus
          @keydown.enter="doSearch"
        />
      </div>
    </header>

    <div v-if="pending" class="muted text-sm">{{ ui.searching }}</div>

    <div v-else-if="searchError" class="surface-card p-6 text-center">
      <p class="text-red-500 text-sm font-medium">{{ ui.searchError }}</p>
      <p class="text-zinc-400 text-xs mt-1">{{ ui.searchRetryMsg }}</p>
      <button class="mt-3 btn-ghost text-sm" @click="doSearch">{{ ui.retry }}</button>
    </div>

    <template v-else-if="hasResult">
      <!-- 대회 결과 -->
      <section v-if="result.tournaments.length" class="mb-10">
        <h2 class="section-title mb-4">
          Tournaments
          <span class="text-zinc-400 font-normal text-sm ml-1">({{ result.tournaments.length }})</span>
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <TournamentCard
            v-for="t in result.tournaments"
            :key="t.id"
            :tournament="t"
          />
        </div>
      </section>

      <!-- 포커룸 결과 -->
      <section v-if="result.pubs.length">
        <h2 class="section-title mb-4">
          PokerRooms
          <span class="text-zinc-400 font-normal text-sm ml-1">({{ result.pubs.length }})</span>
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <PubCard v-for="pub in result.pubs" :key="pub.id" :pub="pub" />
        </div>
      </section>
    </template>

    <div v-else-if="searched" class="surface-card p-10 text-center muted">
      <p>{{ ui.noSearchResults(lastQ) }}</p>
    </div>

    <div v-else class="muted text-sm">{{ ui.searchPrompt }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const { ui } = useUiT()

useSeoMeta({ title: 'Search' })

const route  = useRoute()
const router = useRouter()

const q       = ref(String(route.query.q ?? ''))
const lastQ   = ref(q.value)
const searched = ref(false)

const { data: result, pending, error: fetchError, execute } = await useFetch('/api/search', {
  query: computed(() => ({ q: q.value })),
  immediate: !!q.value,
  watch: false
})

const searchError = computed(() => searched.value && !pending.value && !!fetchError.value)

if (q.value) { searched.value = true }

const hasResult = computed(() =>
  result.value && (result.value.tournaments.length || result.value.pubs.length)
)

async function doSearch() {
  if (!q.value.trim()) return
  lastQ.value = q.value
  searched.value = true
  router.replace({ query: { q: q.value } })
  await execute()
}
</script>
