<template>
  <div>
    <header class="flex items-end justify-between mb-6">
      <div>
        <h1 class="page-title">Notices</h1>
        <p class="mt-2 text-zinc-600 text-sm">전체 공지 ({{ notices?.length || 0 }})</p>
      </div>
      <button class="btn-primary" @click="openCreate">+ New notice</button>
    </header>

    <div v-if="pending" class="muted text-sm">Loading...</div>

    <div v-else-if="!notices?.length" class="surface-card p-10 text-center muted">
      등록된 공지가 없습니다.
    </div>

    <div v-else class="surface-card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
          <tr>
            <th class="text-left font-medium px-4 py-3">Title</th>
            <th class="text-left font-medium px-4 py-3">Pinned</th>
            <th class="text-left font-medium px-4 py-3">Visibility</th>
            <th class="text-left font-medium px-4 py-3">Date</th>
            <th class="text-right font-medium px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="n in notices" :key="n.id" class="hover:bg-zinc-50">
            <td class="px-4 py-3 font-medium text-zinc-900 max-w-xs truncate">{{ n.title }}</td>
            <td class="px-4 py-3 text-zinc-600">{{ n.pinned ? '📌' : '—' }}</td>
            <td class="px-4 py-3">
              <span :class="n.publishedAt ? 'badge-published' : 'badge-draft'">
                {{ n.publishedAt ? 'Published' : 'Draft' }}
              </span>
            </td>
            <td class="px-4 py-3 text-zinc-500">{{ fmtDate(n.createdAt) }}</td>
            <td class="px-4 py-3 text-right">
              <div class="inline-flex items-center gap-1">
                <button class="btn-ghost" @click="openEdit(n)">Edit</button>
                <button class="btn-danger-ghost" @click="onDelete(n)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 인라인 모달 -->
    <div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/40" @click="editing = null" />
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <h2 class="text-lg font-semibold text-zinc-900">
          {{ editing.id ? 'Edit notice' : 'New notice' }}
        </h2>

        <div>
          <label class="label-base">Title</label>
          <input v-model="editing.title" required class="input-base" />
        </div>
        <div>
          <label class="label-base">Body</label>
          <ClientOnly>
            <TiptapEditor v-model="editing.body" />
            <template #fallback>
              <textarea v-model="editing.body" rows="5" class="input-base" />
            </template>
          </ClientOnly>
        </div>
        <div>
          <label class="label-base">커버 이미지 URL (선택)</label>
          <input v-model="editing.coverImageUrl" type="text" placeholder="https://..." class="input-base" />
        </div>
        <div>
          <label class="label-base">동영상 URL — YouTube (선택)</label>
          <input v-model="editing.videoUrl" type="text" placeholder="https://youtube.com/watch?v=..." class="input-base" />
          <p class="text-xs text-zinc-400 mt-1">YouTube URL 붙여넣으면 상세 페이지에 자동 embed됩니다.</p>
        </div>
        <div class="flex items-center gap-6">
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input v-model="editing.pinned" type="checkbox" class="accent-indigo-600" />
            상단 고정
          </label>
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input v-model="editing.published" type="checkbox" class="accent-indigo-600" />
            Publish
          </label>
        </div>
        <div v-if="saveError" class="text-sm text-red-600">{{ saveError }}</div>
        <div class="flex gap-3 pt-2">
          <button :disabled="saving" class="btn-primary" @click="onSave">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
          <button class="btn-ghost" @click="editing = null">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({ layout: 'admin' })

const { data: notices, pending, refresh } = await useFetch('/api/admin/notices')

const editing   = ref(null)
const saving    = ref(false)
const saveError = ref('')

function fmtDate(d) {
  return d ? String(d).slice(0, 10) : ''
}

function openCreate() {
  editing.value = { title: '', body: '', coverImageUrl: '', videoUrl: '', pinned: false, published: false }
}

function openEdit(n) {
  editing.value = {
    id:            n.id,
    title:         n.title,
    body:          n.body,
    coverImageUrl: n.coverImageUrl || '',
    videoUrl:      n.videoUrl      || '',
    pinned:    n.pinned,
    published: !!n.publishedAt
  }
}

async function onSave() {
  if (!editing.value.title || !editing.value.body) return
  saving.value    = true
  saveError.value = ''
  try {
    if (editing.value.id) {
      await $fetch(`/api/admin/notices/${editing.value.id}`, {
        method: 'PUT',
        body: editing.value
      })
    } else {
      await $fetch('/api/admin/notices', { method: 'POST', body: editing.value })
    }
    editing.value = null
    await refresh()
  } catch (e) {
    saveError.value = e?.statusMessage || e?.data?.statusMessage || '저장 실패'
  } finally {
    saving.value = false
  }
}

async function onDelete(n) {
  if (!confirm(`"${n.title}" 삭제할까요?`)) return
  await $fetch(`/api/admin/notices/${n.id}`, { method: 'DELETE' })
  await refresh()
}
</script>
