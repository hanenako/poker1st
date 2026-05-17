<template>
  <div class="min-h-screen flex flex-col">
    <Header />

    <main class="flex-1 flex items-center justify-center px-4 py-20">
      <div class="text-center max-w-md">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white text-3xl mx-auto mb-6">
          ♠
        </div>

        <h1 class="text-6xl font-bold text-zinc-900 mb-2">
          {{ error.statusCode }}
        </h1>

        <p class="text-xl font-medium text-zinc-700 mb-2">
          {{ title }}
        </p>

        <p class="text-zinc-500 mb-8">
          {{ description }}
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <NuxtLink to="/" class="btn-primary" @click="handleError">
            홈으로 돌아가기
          </NuxtLink>
          <button class="btn-secondary" @click="handleError">
            이전 페이지
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  error: { type: Object, required: true }
})

const title = computed(() => {
  if (props.error.statusCode === 404) return '페이지를 찾을 수 없어요.'
  if (props.error.statusCode === 403) return '접근 권한이 없어요.'
  if (props.error.statusCode === 500) return '서버 오류가 발생했어요.'
  return props.error.statusMessage || '오류가 발생했어요.'
})

const description = computed(() => {
  if (props.error.statusCode === 404) return '주소가 잘못됐거나 삭제된 페이지예요.'
  if (props.error.statusCode === 403) return '로그인이 필요하거나 권한이 부족해요.'
  if (props.error.statusCode === 500) return '잠시 후 다시 시도해 주세요.'
  return '문제가 계속되면 공지 게시판에 알려주세요.'
})

function handleError() {
  clearError({ redirect: '/' })
}
</script>
