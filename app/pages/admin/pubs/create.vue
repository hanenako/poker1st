<template>
  <div>
    <header class="mb-6">
      <div class="mb-2">
        <NuxtLink to="/admin/pubs" class="text-sm text-zinc-500 hover:text-zinc-900">← PokerRooms</NuxtLink>
      </div>
      <h1 class="page-title">Create PokerRoom</h1>
    </header>

    <AdminPubForm
      :submitting="submitting"
      :error-msg="errorMsg"
      submit-label="Create"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({ layout: 'admin' })

const router     = useRouter()
const submitting = ref(false)
const errorMsg   = ref('')

async function onSubmit(payload) {
  submitting.value = true
  errorMsg.value   = ''
  try {
    const created = await $fetch('/api/admin/pubs', { method: 'POST', body: payload })
    router.push(`/admin/pubs/${created.id}/edit`)
  } catch (e) {
    errorMsg.value = e?.statusMessage || e?.data?.statusMessage || '저장 실패'
  } finally {
    submitting.value = false
  }
}
</script>
