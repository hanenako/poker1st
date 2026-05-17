<template>
  <div>
    <header class="flex items-end justify-between mb-6">
      <div>
        <h1 class="page-title">PokerRooms</h1>
        <p class="mt-2 text-zinc-600 text-sm">
          {{ cityFilter ? `${cityFilter} · ` : '' }}{{ filtered.length }}건
          <span v-if="cityFilter" class="text-zinc-400">/ 전체 {{ pubs?.length || 0 }}</span>
        </p>
      </div>
      <NuxtLink to="/admin/pubs/create" class="btn-primary">+ New PokerRoom</NuxtLink>
    </header>

    <!-- 도시 필터 -->
    <div v-if="cities.length > 1" class="flex flex-wrap gap-2 mb-4">
      <button
        class="px-3 py-1 rounded-full text-xs font-medium transition"
        :class="cityFilter === '' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
        @click="cityFilter = ''"
      >All</button>
      <button
        v-for="city in cities"
        :key="city"
        class="px-3 py-1 rounded-full text-xs font-medium transition"
        :class="cityFilter === city ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
        @click="cityFilter = city"
      >{{ city }}</button>
    </div>

    <div v-if="pending" class="muted text-sm">Loading...</div>

    <div v-else-if="!filtered.length" class="surface-card p-10 text-center muted">
      {{ cityFilter ? `${cityFilter}에 등록된 포커룸이 없습니다.` : '등록된 포커룸이 없습니다.' }}
    </div>

    <div v-else class="surface-card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
          <tr>
            <th class="text-left font-medium px-4 py-3">Name</th>
            <th class="text-left font-medium px-4 py-3">City</th>
            <th class="text-left font-medium px-4 py-3">District</th>
            <th class="text-left font-medium px-4 py-3">Visibility</th>
            <th class="text-right font-medium px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="p in filtered" :key="p.id" class="hover:bg-zinc-50">
            <td class="px-4 py-3 font-medium text-zinc-900">
              <NuxtLink :to="`/pubs/${p.slug}`" target="_blank" class="hover:underline">
                {{ p.name }}
              </NuxtLink>
              <span v-if="p.nameKo" class="block text-xs text-zinc-400 font-normal">{{ p.nameKo }}</span>
            </td>
            <td class="px-4 py-3 text-zinc-600">{{ p.city }}</td>
            <td class="px-4 py-3 text-zinc-600">{{ p.district || '—' }}</td>
            <td class="px-4 py-3">
              <span :class="p.publishedAt ? 'badge-published' : 'badge-draft'">
                {{ p.publishedAt ? 'Published' : 'Draft' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="inline-flex items-center gap-1">
                <NuxtLink :to="`/admin/pubs/${p.id}/edit`" class="btn-ghost">Edit</NuxtLink>
                <button
                  class="btn-ghost"
                  :disabled="copying === p.id"
                  @click="onCopy(p)"
                >{{ copying === p.id ? '복사 중…' : 'Copy' }}</button>
                <button class="btn-danger-ghost" @click="onDelete(p)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
definePageMeta({ layout: 'admin' })

const { data: pubs, pending, refresh } = await useFetch('/api/admin/pubs')

const cityFilter = ref('')

const cities = computed(() => {
  if (!pubs.value) return []
  return [...new Set(pubs.value.map(p => p.city))].sort()
})

const filtered = computed(() => {
  if (!pubs.value) return []
  if (!cityFilter.value) return pubs.value
  return pubs.value.filter(p => p.city === cityFilter.value)
})

const copying = ref(null)

async function onCopy(p) {
  if (!confirm(`"${p.name}"을 복사할까요?\n영업시간·특징 등이 함께 복사됩니다.`)) return
  copying.value = p.id
  try {
    const { id } = await $fetch(`/api/admin/pubs/${p.id}/duplicate`, { method: 'POST' })
    await refresh()
    await navigateTo(`/admin/pubs/${id}/edit`)
  } finally {
    copying.value = null
  }
}

async function onDelete(p) {
  if (!confirm(`"${p.name}" 삭제할까요?`)) return
  await $fetch(`/api/admin/pubs/${p.id}`, { method: 'DELETE' })
  await refresh()
}
</script>
