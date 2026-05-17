<template>
  <div>
    <header class="mb-6">
      <div class="flex items-center gap-2 mb-2 text-sm text-zinc-500 flex-wrap">
        <NuxtLink to="/admin/tournaments" class="hover:text-zinc-900">Tournaments</NuxtLink>
        <span>/</span>
        <NuxtLink v-if="ev" :to="`/admin/tournaments/${ev.tournamentId}/events`" class="hover:text-zinc-900">
          Events
        </NuxtLink>
        <span>/</span>
        <span class="text-zinc-900 truncate max-w-xs">{{ ev?.name || `Event #${id}` }}</span>
        <span>/</span>
        <span class="text-zinc-900">Structure</span>
      </div>
      <div class="flex items-end justify-between gap-3 flex-wrap">
        <h1 class="page-title">Structure</h1>
        <div class="flex gap-2">
          <button class="btn-ghost" @click="pasteOpen = !pasteOpen">
            {{ pasteOpen ? '닫기' : 'TSV / CSV 붙여넣기' }}
          </button>
          <button class="btn-ghost" @click="addRow">+ 행 추가</button>
          <button class="btn-ghost" @click="addBreak">+ Break</button>
          <button
            class="btn-primary"
            :disabled="saving || !rows.length"
            @click="onSave"
          >
            {{ saving ? '저장 중...' : `저장 (${rows.length}행)` }}
          </button>
        </div>
      </div>
    </header>

    <!-- TSV/CSV 붙여넣기 패널 -->
    <div v-if="pasteOpen" class="surface-card p-5 mb-6 space-y-3">
      <div>
        <p class="text-sm font-medium text-zinc-700 mb-1">컬럼 순서 (탭 또는 쉼표 구분)</p>
        <div class="flex gap-1 flex-wrap">
          <span v-for="(c, i) in PASTE_COLS" :key="c.key"
            class="px-2 py-0.5 rounded text-xs font-mono"
            :class="c.required ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-zinc-100 text-zinc-500'"
          >{{ i + 1 }}. {{ c.label }}<span v-if="c.required" class="text-red-400 ml-0.5">*</span></span>
        </div>
        <p class="text-xs text-zinc-400 mt-1">헤더 행은 자동 감지해서 제외합니다.</p>
      </div>
      <textarea
        v-model="pasteRaw"
        rows="8"
        placeholder="엑셀에서 복사한 내용을 붙여넣으세요..."
        class="input-base font-mono text-xs"
      />
      <div v-if="pasteError" class="text-sm text-red-600">{{ pasteError }}</div>
      <div class="flex gap-2">
        <button class="btn-primary" :disabled="!pasteRaw.trim()" @click="applyPaste">
          적용 (현재 행 교체)
        </button>
        <button class="btn-ghost" @click="pasteOpen = false; pasteRaw = ''">취소</button>
      </div>
    </div>

    <!-- 구조표 편집 -->
    <div v-if="rows.length" class="surface-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th class="text-left font-medium px-3 py-2 w-16">Level</th>
              <th class="text-left font-medium px-3 py-2">Small Blind</th>
              <th class="text-left font-medium px-3 py-2">Big Blind</th>
              <th class="text-left font-medium px-3 py-2">BB Ante</th>
              <th class="text-left font-medium px-3 py-2 w-24">Minutes</th>
              <th class="w-10 px-2 py-2"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr
              v-for="(row, i) in rows"
              :key="i"
              :class="row.isBreak ? 'bg-amber-50' : 'hover:bg-zinc-50'"
            >
              <td class="px-3 py-1.5">
                <input v-model.number="row.level" type="number" class="input-base py-1 text-center w-16 font-mono" />
              </td>
              <td class="px-3 py-1.5" :colspan="row.isBreak ? 3 : 1">
                <template v-if="row.isBreak">
                  <span class="text-xs font-semibold text-amber-700 uppercase tracking-wider px-1">— BREAK —</span>
                </template>
                <input v-else v-model.number="row.smallBlind" type="number" class="input-base py-1 font-mono" @change="autoFill(i)" />
              </td>
              <template v-if="!row.isBreak">
                <td class="px-3 py-1.5">
                  <input v-model.number="row.bigBlind" type="number" class="input-base py-1 font-mono" />
                </td>
                <td class="px-3 py-1.5">
                  <input v-model.number="row.bbAnte" type="number" placeholder="—" class="input-base py-1 font-mono" />
                </td>
              </template>
              <td class="px-3 py-1.5">
                <input v-model.number="row.minutes" type="number" class="input-base py-1 text-center w-20" />
              </td>
              <td class="px-2 py-1.5 whitespace-nowrap">
                <button
                  class="text-xs px-1.5 py-0.5 rounded border mr-1 transition"
                  :class="row.isBreak ? 'border-amber-300 text-amber-600 hover:bg-amber-50' : 'border-zinc-200 text-zinc-400 hover:text-amber-600'"
                  @click="row.isBreak = !row.isBreak"
                  title="Break 전환"
                >B</button>
                <button class="text-zinc-300 hover:text-red-500 text-lg leading-none" @click="rows.splice(i, 1)">×</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="surface-card p-10 text-center muted text-sm">
      아직 레벨이 없습니다. 행 추가 또는 TSV 붙여넣기로 입력하세요.
    </div>

    <div v-if="saveMsg" class="mt-3 text-sm" :class="saveOk ? 'text-emerald-600' : 'text-red-600'">{{ saveMsg }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const id    = Number(route.params.id)

const { data: ev }             = await useFetch(`/api/admin/events/${id}`)
const { data: savedLevels }    = await useFetch(`/api/admin/events/${id}/structure`)

const rows      = ref([])
const saving    = ref(false)
const saveMsg   = ref('')
const saveOk    = ref(false)
const pasteOpen = ref(false)
const pasteRaw  = ref('')
const pasteError = ref('')

const PASTE_COLS = [
  { key: 'level',      label: 'Level',      required: true  },
  { key: 'smallBlind', label: 'Small Blind', required: true  },
  { key: 'bigBlind',   label: 'Big Blind',   required: true  },
  { key: 'bbAnte',     label: 'BB Ante',     required: false },
  { key: 'minutes',    label: 'Minutes',     required: true  },
]

watch(savedLevels, (val) => {
  if (val) rows.value = val.map(r => ({ ...r, isBreak: r.isBreak ?? false }))
}, { immediate: true })

function blankRow() {
  const last = rows.value[rows.value.length - 1]
  return {
    level:      last ? last.level + 1 : 1,
    isBreak:    false,
    smallBlind: 0,
    bigBlind:   0,
    bbAnte:     null,
    minutes:    last ? last.minutes : 20,
  }
}

function addRow() {
  rows.value.push(blankRow())
}

function addBreak() {
  const last = rows.value[rows.value.length - 1]
  rows.value.push({
    level:      last ? last.level + 1 : 1,
    isBreak:    true,
    smallBlind: 0,
    bigBlind:   0,
    bbAnte:     null,
    minutes:    15,
  })
}

function autoFill(i) {
  const row = rows.value[i]
  if (row.smallBlind && !row.bigBlind) {
    row.bigBlind = row.smallBlind * 2
  }
}

function parsePaste(raw) {
  const sep   = raw.includes('\t') ? '\t' : ','
  const lines = raw.trim().split('\n').filter(l => l.trim())

  // 헤더 행 감지: 첫 셀이 숫자가 아니면 헤더로 간주
  const startIdx = isNaN(Number(lines[0]?.split(sep)[0]?.trim())) ? 1 : 0

  const result = []
  for (let i = startIdx; i < lines.length; i++) {
    const cells = lines[i].split(sep).map(c => c.trim().replace(/,/g, ''))
    const level      = Number(cells[0])
    const smallBlind = Number(cells[1])
    const bigBlind   = Number(cells[2])
    const bbAnte     = cells[3] !== '' && cells[3] !== '-' && cells[3] !== '—' ? Number(cells[3]) : null
    const minutes    = Number(cells[4]) || 20

    if (!level || !bigBlind) continue
    result.push({ level, smallBlind, bigBlind, bbAnte, minutes })
  }
  return result
}

function applyPaste() {
  pasteError.value = ''
  const parsed = parsePaste(pasteRaw.value)
  if (!parsed.length) {
    pasteError.value = '파싱된 행이 없습니다. 컬럼 순서를 확인하세요.'
    return
  }
  rows.value   = parsed
  pasteOpen.value = false
  pasteRaw.value  = ''
}

async function onSave() {
  saving.value  = true
  saveMsg.value = ''
  try {
    const result = await $fetch(`/api/admin/events/${id}/structure`, {
      method: 'PUT',
      body: { levels: rows.value }
    })
    saveOk.value  = true
    saveMsg.value = `${result.count}개 레벨이 저장되었습니다.`
  } catch (e) {
    saveOk.value  = false
    saveMsg.value = e?.data?.statusMessage || e?.statusMessage || '저장 실패'
  } finally {
    saving.value = false
  }
}
</script>
