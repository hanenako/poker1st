<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
    <header class="mb-8">
      <h1 class="page-title">Brands</h1>
      <p class="mt-2 text-zinc-600">대회 시리즈 브랜드.</p>
    </header>

    <div v-if="pending" class="muted text-sm">{{ ui.loading }}</div>

    <template v-else-if="brands?.length">
      <p class="text-sm text-zinc-400 mb-4">{{ ui.brandsTotal(brands.length) }}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BrandCard
          v-for="brand in pagedBrands"
          :key="brand.id"
          :brand="brand"
        />
      </div>
      <Pagination :page="page" :total-pages="totalPages" @update:page="p => page = p" />
    </template>

    <div v-else class="surface-card p-10 text-center muted">
      {{ ui.noBrands }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const { ui } = useUiT()

useSeoMeta({
  title: 'Brands',
  description: 'JOPT, APL 등 일본 포커 대회 시리즈 브랜드 목록.',
  ogTitle: 'Brands | PokerTripJP',
  ogDescription: 'JOPT, APL 등 일본 포커 대회 시리즈 브랜드 목록.'
})

const { data: brands, pending } = await useFetch('/api/brands')

const PAGE_SIZE = 20
const page = ref(1)
const totalPages = computed(() => Math.ceil((brands.value?.length ?? 0) / PAGE_SIZE))
const pagedBrands = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return (brands.value ?? []).slice(start, start + PAGE_SIZE)
})
</script>
