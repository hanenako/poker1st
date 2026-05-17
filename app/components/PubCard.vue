<template>
  <div class="group surface-card surface-card-hover overflow-hidden flex flex-col relative">
  <!-- 비교 버튼 -->
  <button
    class="absolute top-2 left-2 z-10 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-sm transition"
    :class="isCompared
      ? 'bg-indigo-600 text-white'
      : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-500 hover:bg-indigo-50 hover:text-indigo-600'"
    :title="isCompared ? ui.removeFromCompare : ui.addToCompare"
    @click.prevent="toggleCompare"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
  </button>
  <NuxtLink
    :to="`/pubs/${pub.slug}`"
    class="flex flex-col flex-1"
  >
    <!-- 커버 이미지 -->
    <div class="aspect-[16/10] bg-zinc-100 overflow-hidden relative">
      <img
        v-if="pub.coverImageUrl"
        :src="pub.coverImageUrl"
        class="w-full h-full object-cover transition duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <!-- 영업 중 배지 (이미지 위) -->
      <span
        v-if="openStatus.label"
        class="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm"
        :class="openStatus.open
          ? 'bg-emerald-500 text-white'
          : 'bg-black/40 text-white/80'"
      >
        {{ openStatus.label }}
      </span>
    </div>

    <div class="p-4 flex-1 flex flex-col gap-1.5">
      <div class="text-xs font-medium text-zinc-500 uppercase tracking-wide">
        {{ pub.city }}{{ pub.district ? ' · ' + pub.district : '' }}
      </div>

      <h3 class="text-lg font-semibold text-zinc-900 leading-tight">
        {{ displayName }}
      </h3>

      <p v-if="displayDesc" class="text-sm text-zinc-600 line-clamp-2">
        {{ displayDesc }}
      </p>

      <div v-if="featureChips.length" class="mt-auto pt-2 flex flex-wrap gap-1.5">
        <span v-for="(chip, i) in featureChips" :key="i" class="chip">
          {{ chip }}
        </span>
      </div>
    </div>
  </NuxtLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  pub: { type: Object, required: true }
})

const { t } = useLocale()
const { ui } = useUiT()
const { checkIsOpen } = useIsOpen()
const { isSelected, toggle } = usePubCompare()

const isCompared = computed(() => isSelected(props.pub.slug))
function toggleCompare() { toggle(props.pub.slug) }

const displayName = computed(() =>
  t(props.pub.nameKo, props.pub.nameJa, props.pub.name)
)
const displayDesc = computed(() =>
  t(props.pub.descriptionKo, props.pub.descriptionJa, props.pub.description)
)

const openStatus = computed(() => checkIsOpen(props.pub.hours))

const featureChips = computed(() => {
  const f = props.pub.features
  if (!f || typeof f !== 'object') return []
  const chips = []
  if (f.priceRange)  chips.push(f.priceRange)
  if (f.englishOk)   chips.push('English OK')
  if (f.cardPayment) chips.push('Card')
  if (f.smokingRoom) chips.push('Smoking room')
  return chips
})
</script>
