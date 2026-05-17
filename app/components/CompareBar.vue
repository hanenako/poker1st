<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="compareIds.length"
      class="fixed bottom-20 sm:bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
    >
      <div class="pointer-events-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 flex-wrap max-w-lg w-full">
        <!-- 선택된 룸 칩 -->
        <div class="flex flex-wrap gap-2 flex-1 min-w-0">
          <div
            v-for="slug in compareIds"
            :key="slug"
            class="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            <span class="truncate max-w-[100px]">{{ slug }}</span>
            <button
              class="text-zinc-400 hover:text-red-500 transition leading-none"
              @click="remove(slug)"
            >×</button>
          </div>
          <!-- 빈 슬롯 -->
          <div
            v-for="i in (3 - compareIds.length)"
            :key="`empty-${i}`"
            class="flex items-center justify-center w-20 h-6 border border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg text-xs text-zinc-400"
          >+</div>
        </div>

        <!-- 버튼 -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            class="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            @click="clear"
          >{{ ui.compareReset }}</button>
          <NuxtLink
            :to="`/compare?slugs=${compareIds.join(',')}`"
            class="btn-primary text-xs px-3 py-1.5"
          >
            {{ ui.compareNow }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const { compareIds, remove, clear } = usePubCompare()
const { ui } = useUiT()
</script>
