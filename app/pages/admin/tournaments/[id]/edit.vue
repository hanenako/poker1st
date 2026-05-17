<template>
  <div>
    <header class="mb-6">
      <div class="mb-2">
        <NuxtLink to="/admin/tournaments" class="text-sm text-zinc-500 hover:text-zinc-900">
          ← Tournaments
        </NuxtLink>
      </div>
      <div class="flex items-end justify-between">
        <h1 class="page-title">Edit tournament</h1>
        <div class="flex gap-2">
          <NuxtLink :to="`/admin/tournaments/${id}/results`" class="btn-ghost">
            Results
          </NuxtLink>
          <NuxtLink :to="`/admin/tournaments/${id}/events`" class="btn-secondary">
            Manage events →
          </NuxtLink>
        </div>
      </div>
    </header>

    <div v-if="pending" class="muted text-sm">Loading...</div>

    <AdminTournamentForm
      v-else-if="tournament"
      :brands="brands || []"
      :initial="tournament"
      :submitting="submitting"
      :error-msg="errorMsg"
      submit-label="Save"
      @submit="onSubmit"
    />

    <div v-else class="surface-card p-10 text-center muted">
      대회를 찾을 수 없습니다.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const id = Number(route.params.id)

const { data: tournament, pending } = await useFetch(`/api/admin/tournaments/${id}`)
const { data: brands } = await useFetch('/api/brands')

const submitting = ref(false)
const errorMsg = ref('')

async function onSubmit(payload) {
  submitting.value = true
  errorMsg.value = ''
  try {
    await $fetch(`/api/admin/tournaments/${id}`, {
      method: 'PUT',
      body: payload
    })
    alert('저장되었습니다.')
  } catch (e) {
    errorMsg.value = e?.statusMessage || e?.data?.statusMessage || '저장 실패'
  } finally {
    submitting.value = false
  }
}
</script>
