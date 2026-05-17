<template>
  <div>
    <header class="mb-6">
      <div class="mb-2">
        <NuxtLink to="/admin/pubs" class="text-sm text-zinc-500 hover:text-zinc-900">← PokerRooms</NuxtLink>
      </div>
      <h1 class="page-title">Edit PokerRoom</h1>
    </header>

    <div v-if="pending" class="muted text-sm">Loading...</div>

    <template v-else-if="pub">
      <AdminPubForm
        :initial="pub"
        :submitting="submitting"
        :error-msg="errorMsg"
        submit-label="Save"
        @submit="onSubmit"
      />

      <!-- 혼잡도 초기화 -->
      <div class="surface-card p-5 mt-6 border border-rose-100">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-sm font-semibold text-zinc-800">혼잡도 초기화</h2>
            <p class="text-xs text-zinc-400 mt-0.5">이 포커룸에 쌓인 혼잡도 투표 기록을 모두 삭제합니다.</p>
          </div>
          <button
            class="shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium bg-rose-50 text-rose-600 hover:bg-rose-100 transition disabled:opacity-50"
            :disabled="resetting"
            @click="resetCongestion"
          >
            {{ resetting ? '초기화 중…' : '혼잡도 초기화' }}
          </button>
        </div>
        <p v-if="resetMsg" class="mt-2 text-xs" :class="resetOk ? 'text-emerald-600' : 'text-rose-600'">
          {{ resetMsg }}
        </p>
      </div>
    </template>

    <div v-else class="surface-card p-10 text-center muted">
      포커룸을 찾을 수 없습니다.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({ layout: 'admin' })

const route      = useRoute()
const id         = Number(route.params.id)
const submitting = ref(false)
const errorMsg   = ref('')
const resetting  = ref(false)
const resetMsg   = ref('')
const resetOk    = ref(false)

const { data: pub, pending } = await useFetch(`/api/admin/pubs/${id}`)

async function onSubmit(payload) {
  submitting.value = true
  errorMsg.value   = ''
  try {
    await $fetch(`/api/admin/pubs/${id}`, { method: 'PUT', body: payload })
    alert('저장되었습니다.')
  } catch (e) {
    errorMsg.value = e?.statusMessage || e?.data?.statusMessage || '저장 실패'
  } finally {
    submitting.value = false
  }
}

async function resetCongestion() {
  if (!confirm('혼잡도 기록을 모두 삭제하시겠습니까?')) return
  resetting.value = true
  resetMsg.value  = ''
  try {
    const res = await $fetch(`/api/admin/pubs/${id}/congestion`, { method: 'DELETE' })
    resetOk.value  = true
    resetMsg.value = `${res.deleted}건 삭제되었습니다.`
  } catch (e) {
    resetOk.value  = false
    resetMsg.value = e?.statusMessage || e?.data?.statusMessage || '초기화 실패'
  } finally {
    resetting.value = false
  }
}
</script>
