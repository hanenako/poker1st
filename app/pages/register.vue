<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="mb-6 text-center">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-zinc-900 font-semibold tracking-tight">
          <span class="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white text-sm">♠</span>
          <span>PokerTripJP</span>
        </NuxtLink>
      </div>

      <form class="surface-card p-6 space-y-4" @submit.prevent="onSubmit">
        <h1 class="text-xl font-semibold text-zinc-900">회원가입</h1>

        <div>
          <label class="label-base">닉네임 (선택)</label>
          <input v-model="name" type="text" autocomplete="name" class="input-base" placeholder="포커왕" />
        </div>
        <div>
          <label class="label-base">이메일</label>
          <input v-model="email" type="email" autocomplete="email" required class="input-base" />
        </div>
        <div>
          <label class="label-base">비밀번호 (8자 이상)</label>
          <input v-model="password" type="password" autocomplete="new-password" required class="input-base" />
        </div>
        <div>
          <label class="label-base">비밀번호 확인</label>
          <input v-model="passwordConfirm" type="password" autocomplete="new-password" required class="input-base" />
        </div>

        <div v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</div>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          {{ loading ? '처리 중...' : '가입하기' }}
        </button>

        <p class="text-center text-sm text-zinc-500">
          이미 계정이 있나요?
          <NuxtLink to="/login" class="text-indigo-600 hover:underline">로그인</NuxtLink>
        </p>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-zinc-200" />
          </div>
          <div class="relative flex justify-center text-xs text-zinc-400 bg-white px-3">또는</div>
        </div>

        <a
          href="/auth/google"
          class="flex items-center justify-center gap-2 w-full px-4 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 transition font-medium"
          :class="{ 'opacity-40 pointer-events-none': !googleConfigured }"
          :title="!googleConfigured ? 'Google OAuth 설정이 필요합니다' : ''"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 가입하기
        </a>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({ layout: false })

const router = useRouter()
const config = useRuntimeConfig()
const googleConfigured = config.public.googleOAuthReady
const { fetch: refreshSession } = useUserSession()

const name            = ref('')
const email           = ref('')
const password        = ref('')
const passwordConfirm = ref('')
const loading         = ref(false)
const errorMsg        = ref('')

async function onSubmit() {
  if (password.value !== passwordConfirm.value) {
    errorMsg.value = '비밀번호가 일치하지 않습니다.'
    return
  }
  loading.value  = true
  errorMsg.value = ''
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { email: email.value, password: password.value, name: name.value || undefined }
    })
    await refreshSession()
    await router.push('/')
  } catch (e) {
    errorMsg.value = e?.data?.statusMessage || e?.statusMessage || '가입에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>
