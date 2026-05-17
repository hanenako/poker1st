<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">

    <div v-if="pending" class="muted text-sm py-12">Loading...</div>

    <template v-else-if="brand">
      <div class="mb-4">
        <NuxtLink to="/brands" class="text-sm text-zinc-500 hover:text-zinc-900">
          {{ ui.backToBrands }}
        </NuxtLink>
      </div>

      <header class="flex items-start gap-4 mb-8">
        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-white border border-zinc-200 overflow-hidden shrink-0">
          <img
            v-if="brand.logoUrl"
            :src="brand.logoUrl"
            class="h-12 w-12 object-contain"
          />
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="page-title">{{ brand.name }}</h1>
          <!-- 로케일 번역명이 원제와 다를 때만 부제목 -->
          <p v-if="localizedBrandName" class="text-sm text-zinc-400 -mt-1">
            {{ localizedBrandName }}
          </p>
          <p v-if="localizedDesc" class="mt-1 text-zinc-600 text-sm">
            {{ localizedDesc }}
          </p>
          <div class="mt-3">
            <SocialLinks
              :website-url="brand.websiteUrl"
              :twitter-url="brand.twitterUrl"
              :instagram-url="brand.instagramUrl"
              :youtube-url="brand.youtubeUrl"
              :flickr-url="brand.flickrUrl"
            />
          </div>
        </div>
      </header>

      <div v-if="!brand.tournaments?.length" class="surface-card p-10 text-center muted">
        {{ ui.noTournaments }}
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <TournamentCard
          v-for="tournament in brand.tournaments"
          :key="tournament.id"
          :tournament="{ ...tournament, brand }"
        />
      </div>
    </template>

    <div v-else class="surface-card p-10 text-center muted">
      {{ ui.brandNotFound }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const route = useRoute()
const { locale, t } = useLocale()
const { ui } = useUiT()
const { data: brand, pending } = await useFetch(
  () => `/api/brands/${route.params.slug}`
)

// 원제와 다를 때만 로케일 이름 표시
const localizedBrandName = computed(() => {
  const b = brand.value
  if (!b) return null
  let candidate = null
  if (locale.value === 'ko') candidate = b.nameKo
  else if (locale.value === 'ja') candidate = b.nameJa
  if (!candidate || candidate === b.name) return null
  return candidate
})

const localizedDesc = computed(() => {
  const b = brand.value
  if (!b) return null
  return t(b.descriptionKo, b.descriptionJa, b.description)
})

useSeoMeta({
  title:          computed(() => brand.value?.name ?? 'Brand'),
  description:    computed(() => brand.value?.description ?? `${brand.value?.name} 대회 시리즈 정보`),
  ogTitle:        computed(() => `${brand.value?.name ?? 'Brand'} | PokerTripJP`),
  ogDescription:  computed(() => brand.value?.description ?? `${brand.value?.name} 대회 시리즈 일정`),
  ogImage:        computed(() => brand.value?.logoUrl ?? undefined)
})
</script>
