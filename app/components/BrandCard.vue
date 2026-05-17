<template>
  <NuxtLink
    :to="`/brands/${brand.slug}`"
    class="surface-card surface-card-hover p-5 flex items-center gap-3"
  >
    <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200 overflow-hidden">
      <img
        v-if="brand.logoUrl"
        :src="brand.logoUrl"
        class="h-10 w-10 object-contain"
      />
      <span v-else class="text-zinc-400 text-xs">—</span>
    </div>
    <div class="flex-1 min-w-0">
      <div class="font-semibold text-zinc-900 truncate">
        {{ brand.name }}
      </div>
      <div class="text-xs text-zinc-500 truncate">
        {{ brand.nameKo || brand.countryCode }}
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  brand: { type: Object, required: true }
})
</script>
