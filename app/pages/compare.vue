<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="page-title">{{ ui.compareTitle }}</h1>
        <p class="mt-1 text-sm text-zinc-500">{{ ui.compareDesc }}</p>
      </div>
      <NuxtLink to="/pubs" class="btn-secondary text-sm">{{ ui.backToPubs }}</NuxtLink>
    </div>

    <div v-if="pending" class="muted text-sm">{{ ui.loading }}</div>

    <div v-else-if="!pubs.length" class="surface-card p-10 text-center muted">
      {{ ui.compareEmpty }}
      <NuxtLink to="/pubs" class="block mt-3 text-indigo-600 hover:underline text-sm">{{ ui.backToPubs }}</NuxtLink>
    </div>

    <template v-else>
      <!-- 포커룸 헤더 행 -->
      <div :class="`grid gap-4 mb-4`" :style="`grid-template-columns: 160px repeat(${pubs.length}, 1fr)`">
        <div />
        <div v-for="pub in pubs" :key="pub.id" class="surface-card p-4 text-center">
          <div class="aspect-video bg-zinc-100 rounded-lg overflow-hidden mb-3">
            <img v-if="pub.coverImageUrl" :src="pub.coverImageUrl" class="w-full h-full object-cover" loading="lazy" />
            <div v-else class="w-full h-full flex items-center justify-center text-zinc-300 text-3xl">🃏</div>
          </div>
          <h2 class="text-sm font-semibold text-zinc-900 leading-tight">{{ t(pub.nameKo, pub.nameJa, pub.name) }}</h2>
          <p class="text-xs text-zinc-500 mt-0.5">{{ pub.city }}{{ pub.district ? ' · ' + pub.district : '' }}</p>
          <NuxtLink :to="`/pubs/${pub.slug}`" class="mt-2 inline-block text-xs text-indigo-600 hover:underline">
            {{ ui.viewDetail }} →
          </NuxtLink>
        </div>
      </div>

      <!-- 비교 행들 -->
      <div class="space-y-px">
        <!-- 가는 방법 -->
        <CompareRow :label="ui.pubAccess" :pubs="pubs">
          <template #default="{ pub }">
            <template v-if="pub.nearestStation || pub.walkMinutes">
              <span v-if="pub.nearestStation">{{ pub.nearestStation }}</span>
              <span v-if="pub.nearestStation && pub.walkMinutes"> · </span>
              <span v-if="pub.walkMinutes">{{ ui.pubWalk(pub.walkMinutes) }}</span>
            </template>
            <span v-else class="text-zinc-300">—</span>
          </template>
        </CompareRow>

        <!-- 영업시간 -->
        <CompareRow :label="ui.pubHours" :pubs="pubs">
          <template #default="{ pub }">
            <span v-if="getOpenStatus(pub).label"
              class="text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="getOpenStatus(pub).open ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-400'"
            >{{ getOpenStatus(pub).label }}</span>
            <span v-else class="text-zinc-300">—</span>
          </template>
        </CompareRow>

        <!-- 주소 -->
        <CompareRow :label="ui.pubAddress" :pubs="pubs">
          <template #default="{ pub }">
            <span class="text-xs">{{ pub.address || '—' }}</span>
          </template>
        </CompareRow>

        <!-- 전화 -->
        <CompareRow :label="ui.pubPhone" :pubs="pubs">
          <template #default="{ pub }">
            {{ pub.phone || '—' }}
          </template>
        </CompareRow>

        <!-- 특징 -->
        <CompareRow :label="'Features'" :pubs="pubs">
          <template #default="{ pub }">
            <div class="flex flex-wrap gap-1 justify-center">
              <template v-if="getChips(pub).length">
                <span v-for="(c, i) in getChips(pub)" :key="i" class="chip text-[10px]">{{ c }}</span>
              </template>
              <span v-else class="text-zinc-300">—</span>
            </div>
          </template>
        </CompareRow>

        <!-- SNS -->
        <CompareRow :label="'SNS'" :pubs="pubs">
          <template #default="{ pub }">
            <div class="flex gap-2 justify-center">
              <a v-if="pub.twitterUrl"   :href="pub.twitterUrl"   target="_blank" class="text-xs text-zinc-500 hover:text-blue-500">𝕏</a>
              <a v-if="pub.instagramUrl" :href="pub.instagramUrl" target="_blank" class="text-xs text-zinc-500 hover:text-pink-500">IG</a>
              <a v-if="pub.websiteUrl"   :href="pub.websiteUrl"   target="_blank" class="text-xs text-zinc-500 hover:text-indigo-500">Web</a>
              <span v-if="!pub.twitterUrl && !pub.instagramUrl && !pub.websiteUrl" class="text-zinc-300">—</span>
            </div>
          </template>
        </CompareRow>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const route = useRoute()
const { t } = useLocale()
const { ui } = useUiT()
const { checkIsOpen } = useIsOpen()

useSeoMeta({ title: '포커룸 비교 · PokerTripJP' })

const slugs = computed(() =>
  String(route.query.slugs || '').split(',').filter(Boolean).slice(0, 3)
)

// 복수 slug 동시 fetch
const { data: pubs, pending } = await useFetch('/api/pubs/by-slugs', {
  query: computed(() => ({ slugs: slugs.value.join(',') }))
})

function getOpenStatus(pub) {
  return checkIsOpen(pub.hours)
}

function getChips(pub) {
  const f = pub.features
  if (!f || typeof f !== 'object') return []
  const out = []
  if (f.priceRange)   out.push(f.priceRange)
  if (f.englishOk)    out.push('English OK')
  if (f.cardPayment)  out.push('Card')
  if (f.smokingRoom)  out.push('Smoking')
  return out
}
</script>
