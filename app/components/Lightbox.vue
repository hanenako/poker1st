<!--
  Lightbox.vue
  이미지를 오버레이로 크게 표시합니다.

  Props:
    images: { url, caption }[]  — 표시할 이미지 목록
    startIndex: number          — 처음 열 이미지 인덱스
    modelValue: boolean         — 열림/닫힘

  Emits:
    update:modelValue
-->
<template>
  <Teleport to="body">
    <Transition name="lb">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        @click.self="close"
        @keydown.esc="close"
      >
        <!-- 닫기 -->
        <button
          class="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none transition z-10"
          @click="close"
        >×</button>

        <!-- 이미지 카운터 -->
        <div v-if="images.length > 1" class="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm tabular-nums">
          {{ current + 1 }} / {{ images.length }}
        </div>

        <!-- 이전 버튼 -->
        <button
          v-if="images.length > 1"
          class="absolute left-3 sm:left-6 text-white/60 hover:text-white text-4xl leading-none transition select-none"
          @click="prev"
        >‹</button>

        <!-- 이미지 -->
        <div class="max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-3">
          <img
            :src="images[current]?.url"
            :alt="images[current]?.caption || ''"
            class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            @click.stop
          />
          <p v-if="images[current]?.caption" class="text-white/70 text-sm text-center px-4">
            {{ images[current].caption }}
          </p>
        </div>

        <!-- 다음 버튼 -->
        <button
          v-if="images.length > 1"
          class="absolute right-3 sm:right-6 text-white/60 hover:text-white text-4xl leading-none transition select-none"
          @click="next"
        >›</button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  images:     { type: Array,   default: () => [] },  // [{ url, caption }]
  startIndex: { type: Number,  default: 0 }
})
const emit = defineEmits(['update:modelValue'])

const current = ref(props.startIndex)

watch(() => props.startIndex, v => { current.value = v })
watch(() => props.modelValue, v => {
  if (v) {
    current.value = props.startIndex
    document.addEventListener('keydown', onKey)
  } else {
    document.removeEventListener('keydown', onKey)
  }
})

function close() { emit('update:modelValue', false) }
function prev()  { current.value = (current.value - 1 + props.images.length) % props.images.length }
function next()  { current.value = (current.value + 1) % props.images.length }

function onKey(e) {
  if (e.key === 'Escape')     close()
  if (e.key === 'ArrowLeft')  prev()
  if (e.key === 'ArrowRight') next()
}
</script>

<style scoped>
.lb-enter-active, .lb-leave-active { transition: opacity 0.2s ease; }
.lb-enter-from, .lb-leave-to       { opacity: 0; }
</style>
