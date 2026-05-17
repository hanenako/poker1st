<template>
  <div>
    <header class="mb-6">
      <div class="mb-2">
        <NuxtLink :to="`/admin/tournaments/${id}/edit`" class="text-sm text-zinc-500 hover:text-zinc-900">
          ← Edit tournament
        </NuxtLink>
      </div>
      <div class="flex items-end justify-between">
        <div>
          <h1 class="page-title">Results</h1>
          <p class="mt-1 text-sm text-zinc-500">{{ tournament?.titleShort }}</p>
        </div>
        <div class="flex gap-2">
          <button class="btn-ghost text-sm" @click="csvOpen = !csvOpen">📥 CSV 업로드</button>
          <button class="btn-primary" @click="openAdd">+ Add result</button>
        </div>
      </div>
    </header>

    <!-- CSV 업로드 패널 -->
    <div v-if="csvOpen" class="surface-card p-5 mb-6 space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-zinc-800">CSV 일괄 업로드</h2>
        <button class="text-xs text-zinc-400 hover:text-zinc-700" @click="csvOpen = false">✕ 닫기</button>
      </div>
      <p class="text-xs text-zinc-500">
        헤더 포함 CSV를 붙여넣으세요.<br>
        컬럼 순서: <code class="bg-zinc-100 px-1 rounded">place, playerName, playerNameKo, country, eventName, prize, prizeText, note</code>
      </p>
      <textarea
        v-model="csvText"
        rows="8"
        class="input-base text-xs font-mono"
        placeholder="place,playerName,playerNameKo,country,eventName,prize,prizeText,note
1,John Doe,홍길동,KR,Main Event,1000000,,
2,Jane Smith,,JP,Main Event,500000,¥500,000,"
      />
      <div class="flex items-center gap-3">
        <button class="btn-primary text-sm" :disabled="!csvText.trim() || csvUploading" @click="parseCsv">
          {{ csvUploading ? '업로드 중...' : '파싱 & 미리보기' }}
        </button>
        <span v-if="csvError" class="text-xs text-red-600">{{ csvError }}</span>
      </div>

      <!-- 미리보기 테이블 -->
      <template v-if="csvRows.length">
        <div class="overflow-x-auto border border-zinc-200 rounded-lg">
          <table class="w-full text-xs">
            <thead class="bg-zinc-50 text-zinc-500">
              <tr>
                <th class="px-3 py-2 text-left font-medium">순위</th>
                <th class="px-3 py-2 text-left font-medium">플레이어</th>
                <th class="px-3 py-2 text-left font-medium">한국어명</th>
                <th class="px-3 py-2 text-left font-medium">국적</th>
                <th class="px-3 py-2 text-left font-medium">이벤트</th>
                <th class="px-3 py-2 text-left font-medium">상금</th>
                <th class="px-3 py-2 text-left font-medium">상금 텍스트</th>
                <th class="px-3 py-2 text-left font-medium">메모</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              <tr v-for="(r, i) in csvRows" :key="i" class="hover:bg-zinc-50">
                <td class="px-3 py-2 font-bold">{{ r.place }}</td>
                <td class="px-3 py-2">{{ r.playerName }}</td>
                <td class="px-3 py-2 text-zinc-400">{{ r.playerNameKo }}</td>
                <td class="px-3 py-2">{{ r.country }}</td>
                <td class="px-3 py-2">{{ r.eventName }}</td>
                <td class="px-3 py-2">{{ r.prize }}</td>
                <td class="px-3 py-2">{{ r.prizeText }}</td>
                <td class="px-3 py-2 text-zinc-400">{{ r.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex items-center gap-3">
          <button class="btn-primary text-sm" :disabled="csvUploading" @click="submitCsv">
            {{ csvUploading ? '등록 중...' : `${csvRows.length}건 등록` }}
          </button>
          <button class="btn-ghost text-sm" @click="csvRows = []">다시 파싱</button>
        </div>
      </template>
    </div>

    <!-- 결과 테이블 -->
    <div v-if="results?.length" class="surface-card overflow-hidden mb-6">
      <table class="w-full text-sm">
        <thead class="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
          <tr>
            <th class="text-left font-medium px-4 py-3 w-16">순위</th>
            <th class="text-left font-medium px-4 py-3">플레이어</th>
            <th class="text-left font-medium px-4 py-3">국적</th>
            <th class="text-left font-medium px-4 py-3">이벤트</th>
            <th class="text-left font-medium px-4 py-3">상금</th>
            <th class="text-left font-medium px-4 py-3">메모</th>
            <th class="text-right font-medium px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="r in results" :key="r.id" class="hover:bg-zinc-50">
            <td class="px-4 py-3 font-bold text-zinc-800">{{ r.place }}위</td>
            <td class="px-4 py-3">
              <div class="font-medium text-zinc-900">{{ r.playerName }}</div>
              <div v-if="r.playerNameKo" class="text-xs text-zinc-400">{{ r.playerNameKo }}</div>
            </td>
            <td class="px-4 py-3 text-zinc-600">{{ r.country || '—' }}</td>
            <td class="px-4 py-3 text-zinc-500 text-xs">{{ r.event?.name || '전체' }}</td>
            <td class="px-4 py-3 font-medium text-zinc-800">{{ r.prizeText || (r.prize ? '¥' + Number(r.prize).toLocaleString() : '—') }}</td>
            <td class="px-4 py-3 text-zinc-500 text-xs max-w-xs truncate">{{ r.note || '' }}</td>
            <td class="px-4 py-3 text-right">
              <div class="inline-flex items-center gap-1">
                <button class="btn-ghost text-xs" @click="openEdit(r)">수정</button>
                <button class="btn-danger-ghost text-xs" @click="onDelete(r)">삭제</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="surface-card p-10 text-center muted mb-6">
      등록된 결과가 없습니다.
    </div>

    <!-- 추가/수정 모달 -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/40" @click="closeModal" />
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 class="text-lg font-semibold text-zinc-900">
          {{ editingId ? '결과 수정' : '결과 추가' }}
        </h2>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label-base">순위 <span class="text-red-500">*</span></label>
            <input v-model.number="form.place" type="number" min="1" class="input-base" placeholder="1" />
          </div>
          <div>
            <label class="label-base">국적</label>
            <input v-model="form.country" type="text" class="input-base" placeholder="JP / KR ..." />
          </div>
        </div>

        <div>
          <label class="label-base">플레이어명 (영문) <span class="text-red-500">*</span></label>
          <input v-model="form.playerName" type="text" class="input-base" placeholder="John Doe" />
        </div>

        <div>
          <label class="label-base">플레이어명 (한국어)</label>
          <input v-model="form.playerNameKo" type="text" class="input-base" placeholder="홍길동" />
        </div>

        <div>
          <label class="label-base">이벤트 (선택)</label>
          <select v-model="form.eventId" class="input-base">
            <option value="">전체 대회</option>
            <option v-for="ev in events" :key="ev.id" :value="ev.id">{{ ev.name }}</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label-base">상금 표시 문자열</label>
            <input v-model="form.prizeText" type="text" class="input-base" placeholder="¥1,000,000" />
          </div>
          <div>
            <label class="label-base">상금 숫자</label>
            <input v-model.number="form.prize" type="number" class="input-base" placeholder="1000000" />
          </div>
        </div>

        <div>
          <label class="label-base">메모</label>
          <input v-model="form.note" type="text" class="input-base" />
        </div>

        <div v-if="saveError" class="text-sm text-red-600">{{ saveError }}</div>
        <div class="flex gap-3 pt-1">
          <button :disabled="saving" class="btn-primary" @click="onSave">
            {{ saving ? '저장 중...' : (editingId ? '수정' : '추가') }}
          </button>
          <button class="btn-ghost" @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// ── CSV 업로드 ──────────────────────────────────────────
const csvOpen      = ref(false)
const csvText      = ref('')
const csvRows      = ref([])
const csvError     = ref('')
const csvUploading = ref(false)

const CSV_HEADERS = ['place', 'playerName', 'playerNameKo', 'country', 'eventName', 'prize', 'prizeText', 'note']

function parseCsv() {
  csvError.value = ''
  csvRows.value  = []
  const lines = csvText.value.trim().split('\n').filter(l => l.trim())
  if (!lines.length) { csvError.value = '내용이 없습니다.'; return }

  // 첫 행이 헤더인지 확인 (place가 숫자가 아니면 헤더로 간주)
  const firstCols = lines[0].split(',').map(c => c.trim())
  const startIdx  = isNaN(Number(firstCols[0])) ? 1 : 0

  const rows = []
  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const row  = {}
    CSV_HEADERS.forEach((h, idx) => { row[h] = cols[idx] ?? '' })
    if (!row.place || !row.playerName) {
      csvError.value = `${i + 1}행: 순위(place)와 플레이어명(playerName)은 필수입니다.`
      return
    }
    rows.push(row)
  }
  csvRows.value = rows
}

async function submitCsv() {
  csvUploading.value = true
  csvError.value     = ''
  try {
    const res = await $fetch(`/api/admin/tournaments/${id}/results/bulk`, {
      method: 'POST',
      body: { rows: csvRows.value }
    })
    alert(`${res.created}건 등록되었습니다.`)
    csvOpen.value  = false
    csvText.value  = ''
    csvRows.value  = []
    await refresh()
  } catch (e) {
    csvError.value = e?.data?.statusMessage || '등록 실패'
  } finally {
    csvUploading.value = false
  }
}

definePageMeta({ layout: 'admin' })

const route = useRoute()
const id    = Number(route.params.id)

const { data: tournament } = await useFetch(`/api/admin/tournaments/${id}`)
const { data: results, refresh } = await useFetch(`/api/admin/tournaments/${id}/results`)
const { data: events } = await useFetch(`/api/admin/tournaments/${id}/events`)

const modalOpen  = ref(false)
const editingId  = ref(null)   // null = 추가 모드, 숫자 = 수정 모드
const saving     = ref(false)
const saveError  = ref('')

const defaultForm = () => ({
  place: null, playerName: '', playerNameKo: '', country: '',
  eventId: '', prize: null, prizeText: '', note: ''
})
const form = ref(defaultForm())

function openAdd() {
  editingId.value = null
  form.value      = defaultForm()
  saveError.value = ''
  modalOpen.value = true
}

function openEdit(r) {
  editingId.value = r.id
  form.value = {
    place:        r.place,
    playerName:   r.playerName,
    playerNameKo: r.playerNameKo || '',
    country:      r.country      || '',
    eventId:      r.eventId      ?? '',
    prize:        r.prize        ? Number(r.prize) : null,
    prizeText:    r.prizeText    || '',
    note:         r.note         || ''
  }
  saveError.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingId.value = null
}

async function onSave() {
  if (!form.value.place || !form.value.playerName) return
  saving.value    = true
  saveError.value = ''
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/tournaments/${id}/results/${editingId.value}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $fetch(`/api/admin/tournaments/${id}/results`, {
        method: 'POST',
        body: form.value
      })
    }
    closeModal()
    await refresh()
  } catch (e) {
    saveError.value = e?.data?.statusMessage || '저장 실패'
  } finally {
    saving.value = false
  }
}

async function onDelete(r) {
  if (!confirm(`${r.place}위 ${r.playerName} 결과를 삭제할까요?`)) return
  await $fetch(`/api/admin/tournaments/${id}/results/${r.id}`, { method: 'DELETE' })
  await refresh()
}
</script>
