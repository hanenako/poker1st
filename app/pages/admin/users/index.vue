<template>
  <div>
    <header class="mb-6 flex items-end justify-between">
      <h1 class="page-title">Users</h1>
      <div class="text-sm text-zinc-500">총 {{ result?.total ?? 0 }}명</div>
    </header>

    <!-- 검색 -->
    <div class="mb-4">
      <input
        v-model="q"
        type="text"
        placeholder="이름 또는 이메일 검색..."
        class="input-field w-full max-w-sm"
        @input="onSearch"
      />
    </div>

    <div v-if="pending" class="text-sm text-zinc-400 py-8">Loading...</div>

    <div v-else-if="result" class="surface-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th class="text-left font-medium px-4 py-3 w-10">#</th>
              <th class="text-left font-medium px-4 py-3">이름 / 이메일</th>
              <th class="text-left font-medium px-4 py-3">로그인 방식</th>
              <th class="text-left font-medium px-4 py-3">역할</th>
              <th class="text-left font-medium px-4 py-3">활동</th>
              <th class="text-left font-medium px-4 py-3">가입일</th>
              <th class="text-right font-medium px-4 py-3">관리</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr v-for="u in result.data" :key="u.id" class="hover:bg-zinc-50">
              <td class="px-4 py-3 text-zinc-400 text-xs">{{ u.id }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <img
                    v-if="u.avatarUrl"
                    :src="u.avatarUrl"
                    class="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <span v-else class="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm shrink-0">👤</span>
                  <div>
                    <div class="font-medium text-zinc-900">{{ u.name || '(이름 없음)' }}</div>
                    <div class="text-xs text-zinc-400">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="chip">{{ u.provider || 'local' }}</span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="text-xs font-semibold px-2 py-0.5 rounded-full"
                  :class="u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-100 text-zinc-600'"
                >
                  {{ u.role }}
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-zinc-500">
                리뷰 {{ u._count.reviews }}
                · 즐겨찾기 {{ u._count.favorites }}
              </td>
              <td class="px-4 py-3 text-xs text-zinc-400">
                {{ fmtDate(u.createdAt) }}
              </td>
              <td class="px-4 py-3 text-right">
                <div class="inline-flex items-center gap-1">
                  <!-- 역할 토글 -->
                  <button
                    v-if="u.id !== me?.id"
                    class="btn-ghost text-xs"
                    :disabled="toggling === u.id"
                    @click="toggleRole(u)"
                  >
                    {{ u.role === 'ADMIN' ? '→ USER' : '→ ADMIN' }}
                  </button>
                  <span v-else class="text-xs text-zinc-300 px-2">나</span>
                  <!-- 삭제 -->
                  <button
                    v-if="u.id !== me?.id"
                    class="btn-danger-ghost text-xs"
                    @click="deleteUser(u)"
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!result.data.length">
              <td colspan="7" class="px-4 py-10 text-center text-zinc-400 text-sm">
                검색 결과가 없습니다
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="result.totalPages > 1" class="px-4 py-3 border-t border-zinc-100">
        <Pagination :page="page" :total-pages="result.totalPages" @update:page="goPage" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({ layout: 'admin' })

const { user: me } = useUserSession()

const q    = ref('')
const page = ref(1)

const { data: result, pending, refresh } = await useFetch('/api/admin/users', {
  query: computed(() => ({ page: page.value, pageSize: 20, q: q.value })),
  watch: false
})

let searchTimer = null
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    refresh()
  }, 300)
}

function goPage(p) {
  page.value = p
  refresh()
}

const toggling = ref(null)
async function toggleRole(u) {
  toggling.value = u.id
  try {
    await $fetch(`/api/admin/users/${u.id}`, {
      method: 'PUT',
      body: { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' }
    })
    await refresh()
  } finally {
    toggling.value = null
  }
}

async function deleteUser(u) {
  if (!confirm(`"${u.name || u.email}" 계정을 삭제하시겠습니까?\n리뷰, 즐겨찾기 등 모든 데이터가 삭제됩니다.`)) return
  await $fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
  await refresh()
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }) : ''
}
</script>
