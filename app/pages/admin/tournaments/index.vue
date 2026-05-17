<template>
  <div>
    <header class="flex items-end justify-between mb-6">
      <div>
        <h1 class="page-title">Tournaments</h1>
        <p class="mt-2 text-zinc-600 text-sm">
          {{ activeFilters ? `${filtered.length}건` : `전체 ${tournaments?.length || 0}건` }}
          <span v-if="activeFilters" class="text-zinc-400">/ 전체 {{ tournaments?.length || 0 }}</span>
        </p>
      </div>
      <NuxtLink to="/admin/tournaments/create" class="btn-primary">
        + New tournament
      </NuxtLink>
    </header>

    <!-- 필터 -->
    <div class="space-y-2 mb-4">
      <!-- Status -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="s in statusOptions"
          :key="s.value"
          class="px-3 py-1 rounded-full text-xs font-medium transition"
          :class="statusFilter === s.value
            ? 'bg-zinc-900 text-white'
            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
          @click="statusFilter = s.value"
        >{{ s.label }}</button>
      </div>

      <!-- Brand + Published -->
      <div class="flex flex-wrap gap-2">
        <!-- Brand -->
        <template v-if="brandOptions.length > 1">
          <button
            class="px-3 py-1 rounded-full text-xs font-medium transition"
            :class="brandFilter === ''
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
            @click="brandFilter = ''"
          >All brands</button>
          <button
            v-for="b in brandOptions"
            :key="b"
            class="px-3 py-1 rounded-full text-xs font-medium transition"
            :class="brandFilter === b
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
            @click="brandFilter = b"
          >{{ b }}</button>
        </template>

        <!-- 구분선 -->
        <span v-if="brandOptions.length > 1" class="text-zinc-200 text-xs self-center">|</span>

        <!-- Published/Draft -->
        <button
          v-for="p in publishedOptions"
          :key="p.value"
          class="px-3 py-1 rounded-full text-xs font-medium transition"
          :class="publishedFilter === p.value
            ? 'bg-zinc-900 text-white'
            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
          @click="publishedFilter = p.value"
        >{{ p.label }}</button>
      </div>
    </div>

    <div v-if="pending" class="muted text-sm">Loading...</div>

    <div v-else-if="!filtered.length" class="surface-card p-10 text-center muted">
      조건에 맞는 대회가 없습니다.
    </div>

    <div v-else class="surface-card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
          <tr>
            <th class="text-left font-medium px-4 py-3">Title</th>
            <th class="text-left font-medium px-4 py-3">Brand</th>
            <th class="text-left font-medium px-4 py-3">City</th>
            <th class="text-left font-medium px-4 py-3">Dates</th>
            <th class="text-left font-medium px-4 py-3">Status</th>
            <th class="text-left font-medium px-4 py-3">Visibility</th>
            <th class="text-right font-medium px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="t in filtered" :key="t.id" class="hover:bg-zinc-50">
            <td class="px-4 py-3 font-medium text-zinc-900">
              <NuxtLink :to="`/tournaments/${t.slug}`" target="_blank" class="hover:underline">
                {{ t.titleShort }}
              </NuxtLink>
            </td>
            <td class="px-4 py-3 text-zinc-600">{{ t.brand?.name || '-' }}</td>
            <td class="px-4 py-3 text-zinc-600">{{ t.city }}</td>
            <td class="px-4 py-3 text-zinc-600 whitespace-nowrap">{{ fmt(t.startDate) }} → {{ fmt(t.endDate) }}</td>
            <td class="px-4 py-3">
              <span :class="statusBadge(t.status)">{{ statusLabel(t.status) }}</span>
            </td>
            <td class="px-4 py-3">
              <span :class="t.publishedAt ? 'badge-published' : 'badge-draft'">
                {{ t.publishedAt ? 'Published' : 'Draft' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="inline-flex items-center gap-1">
                <NuxtLink :to="`/admin/tournaments/${t.id}/edit`" class="btn-ghost">Edit</NuxtLink>
                <button
                  class="btn-ghost"
                  :disabled="copying === t.id"
                  @click="onCopy(t)"
                >{{ copying === t.id ? '복사 중…' : 'Copy' }}</button>
                <button class="btn-danger-ghost" @click="onDelete(t)">Delete</button>
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

const { data: tournaments, pending, refresh } = await useFetch('/api/admin/tournaments')

// 필터 상태
const statusFilter    = ref('')
const brandFilter     = ref('')
const publishedFilter = ref('')

const statusOptions = [
  { value: '',          label: 'All' },
  { value: 'UPCOMING',  label: 'Upcoming' },
  { value: 'ONGOING',   label: 'Live' },
  { value: 'FINISHED',  label: 'Finished' },
  { value: 'CANCELLED', label: 'Cancelled' }
]

const publishedOptions = [
  { value: '',          label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft',     label: 'Draft' }
]

const brandOptions = computed(() => {
  if (!tournaments.value) return []
  return [...new Set(tournaments.value.map(t => t.brand?.name).filter(Boolean))].sort()
})

const activeFilters = computed(() =>
  statusFilter.value || brandFilter.value || publishedFilter.value
)

const filtered = computed(() => {
  if (!tournaments.value) return []
  return tournaments.value.filter(t => {
    if (statusFilter.value    && t.status !== statusFilter.value) return false
    if (brandFilter.value     && t.brand?.name !== brandFilter.value) return false
    if (publishedFilter.value === 'published' && !t.publishedAt)  return false
    if (publishedFilter.value === 'draft'     && t.publishedAt)   return false
    return true
  })
})

const copying = ref(null)

async function onCopy(t) {
  if (!confirm(`"${t.titleShort}"을 복사할까요?\n이벤트·스트럭쳐도 함께 복사됩니다.`)) return
  copying.value = t.id
  try {
    const { id } = await $fetch(`/api/admin/tournaments/${t.id}/duplicate`, { method: 'POST' })
    await refresh()
    await navigateTo(`/admin/tournaments/${id}/edit`)
  } finally {
    copying.value = null
  }
}

function fmt(d) {
  return d ? String(d).slice(0, 10) : ''
}

function statusLabel(s) {
  if (s === 'UPCOMING')  return 'Upcoming'
  if (s === 'ONGOING')   return 'Live'
  if (s === 'FINISHED')  return 'Finished'
  if (s === 'CANCELLED') return 'Cancelled'
  return s
}

function statusBadge(s) {
  if (s === 'UPCOMING')  return 'badge-upcoming'
  if (s === 'ONGOING')   return 'badge-ongoing'
  if (s === 'FINISHED')  return 'badge-finished'
  if (s === 'CANCELLED') return 'badge-cancelled'
  return 'badge-finished'
}

async function onDelete(t) {
  if (!confirm(`"${t.titleShort}" 삭제할까요? 산하 이벤트도 같이 지워집니다.`)) return
  await $fetch(`/api/admin/tournaments/${t.id}`, { method: 'DELETE' })
  await refresh()
}
</script>
