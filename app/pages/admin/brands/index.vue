<template>
  <div>
    <header class="flex items-end justify-between mb-6">
      <div>
        <h1 class="page-title">Brands</h1>
        <p class="mt-2 text-zinc-600 text-sm">전체 브랜드 ({{ brands?.length || 0 }})</p>
      </div>
      <NuxtLink to="/admin/brands/create" class="btn-primary">+ New brand</NuxtLink>
    </header>

    <div v-if="pending" class="muted text-sm">Loading...</div>

    <div v-else-if="!brands?.length" class="surface-card p-10 text-center muted">
      등록된 브랜드가 없습니다.
    </div>

    <div v-else class="surface-card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
          <tr>
            <th class="text-left font-medium px-4 py-3">Brand</th>
            <th class="text-left font-medium px-4 py-3">Slug</th>
            <th class="text-left font-medium px-4 py-3">Country</th>
            <th class="text-left font-medium px-4 py-3">Tournaments</th>
            <th class="text-right font-medium px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="b in brands" :key="b.id" class="hover:bg-zinc-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200 overflow-hidden shrink-0">
                  <img v-if="b.logoUrl" :src="b.logoUrl" class="h-7 w-7 object-contain" />
                  <span v-else class="text-zinc-400 text-xs">—</span>
                </div>
                <div>
                  <div class="font-medium text-zinc-900">{{ b.name }}</div>
                  <div v-if="b.nameKo" class="text-xs text-zinc-400">{{ b.nameKo }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 font-mono text-xs text-zinc-500">{{ b.slug }}</td>
            <td class="px-4 py-3 text-zinc-600">{{ b.countryCode }}</td>
            <td class="px-4 py-3 text-zinc-600">{{ b._count?.tournaments ?? 0 }}</td>
            <td class="px-4 py-3 text-right">
              <div class="inline-flex items-center gap-1">
                <NuxtLink :to="`/brands/${b.slug}`" target="_blank" class="btn-ghost">View</NuxtLink>
                <NuxtLink :to="`/admin/brands/${b.id}/edit`" class="btn-ghost">Edit</NuxtLink>
                <button class="btn-danger-ghost" @click="onDelete(b)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const { data: brands, pending, refresh } = await useFetch('/api/admin/brands')

async function onDelete(b) {
  if (!confirm(`"${b.name}" 삭제할까요?`)) return
  try {
    await $fetch(`/api/admin/brands/${b.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    alert(e?.data?.statusMessage || e?.statusMessage || '삭제 실패')
  }
}
</script>
