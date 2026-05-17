<template>
  <div>
    <header class="mb-6">
      <div class="flex items-center gap-2 mb-2 text-sm text-zinc-500">
        <NuxtLink to="/admin/tournaments" class="hover:text-zinc-900">Tournaments</NuxtLink>
        <span>/</span>
        <NuxtLink :to="`/admin/tournaments/${id}/edit`" class="hover:text-zinc-900">
          {{ tournament?.titleShort || `#${id}` }}
        </NuxtLink>
        <span>/</span>
        <span class="text-zinc-900">Events</span>
      </div>
      <div class="flex items-end justify-between">
        <h1 class="page-title">Events</h1>
        <div class="flex gap-2">
          <button class="btn-secondary" @click="bulkModal = true">엑셀 붙여넣기</button>
          <button class="btn-primary" @click="openCreate">+ Add event</button>
        </div>
      </div>
    </header>

    <div v-if="pending" class="muted text-sm">Loading...</div>

    <div v-else-if="!events?.length" class="surface-card p-10 text-center muted">
      아직 등록된 이벤트가 없습니다.
    </div>

    <div v-else class="surface-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th class="text-left font-medium px-4 py-3 w-16">#No</th>
              <th class="text-left font-medium px-4 py-3">Date</th>
              <th class="text-left font-medium px-4 py-3">Name</th>
              <th class="text-left font-medium px-4 py-3">Buy-in</th>
              <th class="text-left font-medium px-4 py-3">GTD</th>
              <th class="text-left font-medium px-4 py-3">Game</th>
              <th class="text-left font-medium px-4 py-3">Tags</th>
              <th class="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr
              v-for="ev in localEvents"
              :key="ev.id"
              class="hover:bg-zinc-50 transition"
            >
              <td class="px-4 py-3 text-zinc-400 text-xs font-mono whitespace-nowrap">
                {{ ev.eventNo != null ? `#${ev.eventNo}` : '' }}
              </td>
              <td class="px-4 py-3 text-zinc-600 whitespace-nowrap">{{ fmtDate(ev.date) }}</td>
              <td class="px-4 py-3 font-medium text-zinc-900">
                {{ ev.name }}
                <span v-if="ev.nameKo" class="block text-xs text-zinc-400 font-normal">{{ ev.nameKo }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">{{ ev.buyInText || fmtYen(ev.buyInAmount) || '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ ev.gtdText || fmtYen(ev.gtdAmount) || '—' }}</td>
              <td class="px-4 py-3">
                <span v-if="ev.gameType" class="chip">{{ ev.gameType }}</span>
                <span v-if="ev.structure" class="chip ml-1">{{ ev.structure }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span v-for="et in ev.tags" :key="et.tag.slug" class="chip">{{ et.tag.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="inline-flex items-center gap-1">
                  <NuxtLink :to="`/admin/events/${ev.id}/structure`" class="btn-ghost">Structure</NuxtLink>
                  <button class="btn-ghost" @click="openEdit(ev)">Edit</button>
                  <button class="btn-danger-ghost" @click="onDelete(ev)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 엑셀 붙여넣기 모달 -->
    <Teleport to="body">
      <div v-if="bulkModal" class="fixed inset-0 z-50 flex items-start justify-center px-4 py-8 overflow-y-auto">
        <div class="absolute inset-0 bg-black/40" @click="closeBulk" />

        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-4xl my-auto">
          <div class="p-6 border-b border-zinc-100">
            <h2 class="text-lg font-semibold text-zinc-900">엑셀 붙여넣기</h2>
            <p class="text-sm text-zinc-500 mt-1">엑셀에서 아래 컬럼 순서대로 작성 후 복사 → 붙여넣기</p>
          </div>

          <div class="p-6 space-y-4">
            <!-- 컬럼 가이드 -->
            <div class="surface-card p-3 overflow-x-auto">
              <div class="flex items-center justify-between mb-2">
                <p class="text-xs font-medium text-zinc-500 uppercase tracking-wide">컬럼 순서 (탭 구분)</p>
                <button class="btn-ghost text-xs py-1 px-2" @click="downloadSample">
                  샘플 파일 다운로드 (.tsv)
                </button>
              </div>
              <div class="flex gap-1 flex-wrap">
                <span v-for="(col, i) in COLUMNS" :key="col.key"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono"
                  :class="col.required ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-zinc-100 text-zinc-600'"
                >
                  {{ i + 1 }}. {{ col.label }}
                  <span v-if="col.required" class="text-red-400">*</span>
                </span>
              </div>
              <p class="text-xs text-zinc-400 mt-2">* 필수 · 나머지는 비워도 됨 · 헤더 행 제외하고 붙여넣기</p>
            </div>

            <!-- 붙여넣기 영역 -->
            <div>
              <label class="label-base">데이터 붙여넣기</label>
              <textarea
                v-model="bulkRaw"
                rows="10"
                placeholder="엑셀에서 복사한 내용을 여기에 붙여넣으세요..."
                class="input-base font-mono text-xs"
                @paste="onPaste"
              />
            </div>

            <!-- 파싱 결과 미리보기 -->
            <div v-if="bulkPreview.length">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium text-zinc-700">미리보기 — {{ bulkPreview.length }}행</p>
                <span v-if="bulkParseErrors.length" class="text-xs text-red-600">
                  {{ bulkParseErrors.length }}개 오류
                </span>
              </div>

              <div v-if="bulkParseErrors.length" class="mb-3 space-y-1">
                <div v-for="err in bulkParseErrors" :key="err" class="text-xs text-red-600">{{ err }}</div>
              </div>

              <div class="surface-card overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-xs">
                    <thead class="bg-zinc-50 text-zinc-500 uppercase tracking-wide">
                      <tr>
                        <th class="text-left font-medium px-3 py-2">Date</th>
                        <th class="text-left font-medium px-3 py-2">Name</th>
                        <th class="text-left font-medium px-3 py-2">Buy-in</th>
                        <th class="text-left font-medium px-3 py-2">GTD</th>
                        <th class="text-left font-medium px-3 py-2">Game</th>
                        <th class="text-left font-medium px-3 py-2">Structure</th>
                        <th class="text-left font-medium px-3 py-2">Stack</th>
                        <th class="text-left font-medium px-3 py-2">Re-entry</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100">
                      <tr v-for="(row, i) in bulkPreview" :key="i"
                        :class="row._error ? 'bg-red-50' : 'hover:bg-zinc-50'"
                      >
                        <td class="px-3 py-2 whitespace-nowrap">{{ row.date }}</td>
                        <td class="px-3 py-2">
                          {{ row.name }}
                          <span v-if="row._error" class="block text-red-500">{{ row._error }}</span>
                        </td>
                        <td class="px-3 py-2">{{ row.buyInText || row.buyInAmount }}</td>
                        <td class="px-3 py-2">{{ row.gtdText || row.gtdAmount }}</td>
                        <td class="px-3 py-2">{{ row.gameType }}</td>
                        <td class="px-3 py-2">{{ row.structure }}</td>
                        <td class="px-3 py-2">{{ row.startingStack }}</td>
                        <td class="px-3 py-2">{{ row.reEntry }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div v-if="bulkError" class="text-sm text-red-600">{{ bulkError }}</div>
          </div>

          <div class="px-6 pb-6 flex gap-3">
            <button
              :disabled="bulkSaving || !bulkPreview.length || bulkParseErrors.length > 0"
              class="btn-primary"
              @click="onBulkSave"
            >
              {{ bulkSaving ? '저장 중...' : `${bulkPreview.length}개 저장` }}
            </button>
            <button class="btn-ghost" @click="closeBulk">Cancel</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 이벤트 모달 -->
    <Teleport to="body">
      <div v-if="editing" class="fixed inset-0 z-50 flex items-start justify-center px-4 py-8 overflow-y-auto">
        <div class="absolute inset-0 bg-black/40" @click="editing = null" />

        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl my-auto">
          <div class="p-6 border-b border-zinc-100">
            <h2 class="text-lg font-semibold text-zinc-900">
              {{ editing.id ? 'Edit event' : 'New event' }}
            </h2>
          </div>

          <div class="p-6 space-y-5">
            <!-- 기본 -->
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2 sm:col-span-1">
                <label class="label-base">Name <span class="text-red-500">*</span></label>
                <input v-model="editing.name" required class="input-base" />
              </div>
              <div class="col-span-2 sm:col-span-1">
                <label class="label-base">Name (한국어)</label>
                <input v-model="editing.nameKo" class="input-base" />
              </div>
              <div>
                <label class="label-base">Date <span class="text-red-500">*</span></label>
                <input v-model="editing.date" type="date" required class="input-base" />
              </div>
              <div>
                <label class="label-base">Event No <span class="text-zinc-400 font-normal text-xs">(공식 번호)</span></label>
                <input v-model.number="editing.eventNo" type="number" placeholder="1" class="input-base" />
              </div>
              <div>
                <label class="label-base">Order No <span class="text-zinc-400 font-normal text-xs">(정렬)</span></label>
                <input v-model.number="editing.orderNo" type="number" class="input-base" />
              </div>
            </div>

            <!-- 등록 시간 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-base">Registration open</label>
                <input v-model="editing.registrationStart" placeholder="10:00" class="input-base" />
              </div>
              <div>
                <label class="label-base">Registration close</label>
                <input v-model="editing.registrationClose" placeholder="14:00" class="input-base" />
              </div>
            </div>

            <!-- 바이인 / GTD -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-base">Buy-in amount (¥)</label>
                <input v-model.number="editing.buyInAmount" type="number" placeholder="30000" class="input-base" />
              </div>
              <div>
                <label class="label-base">Buy-in display text</label>
                <input v-model="editing.buyInText" placeholder="¥30,000" class="input-base" />
              </div>
              <div>
                <label class="label-base">GTD amount (¥)</label>
                <input v-model.number="editing.gtdAmount" type="number" placeholder="10000000" class="input-base" />
              </div>
              <div>
                <label class="label-base">GTD display text</label>
                <input v-model="editing.gtdText" placeholder="¥10M" class="input-base" />
              </div>
            </div>

            <!-- 게임 설정 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-base">Game type</label>
                <select v-model="editing.gameType" class="input-base">
                  <option value="">—</option>
                  <optgroup label="Hold'em">
                    <option>NLH</option>
                    <option>Short Deck</option>
                  </optgroup>
                  <optgroup label="Omaha">
                    <option>PLO</option>
                    <option>PLO-5</option>
                    <option>PLO-6</option>
                    <option>NLO</option>
                  </optgroup>
                  <optgroup label="Stud">
                    <option>Stud Hi</option>
                    <option>Stud Hi-Lo</option>
                    <option>Razz</option>
                  </optgroup>
                  <optgroup label="Draw">
                    <option>2-7 Triple Draw</option>
                    <option>2-7 Single Draw</option>
                    <option>Badugi</option>
                  </optgroup>
                  <optgroup label="Chinese Poker">
                    <option>OFC</option>
                    <option>Pineapple OFC</option>
                    <option>Chinese Poker</option>
                  </optgroup>
                  <optgroup label="Mixed">
                    <option>H.O.R.S.E</option>
                    <option>8-Game</option>
                    <option>Mixed</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label class="label-base">Structure</label>
                <select v-model="editing.structure" class="input-base">
                  <option value="">—</option>
                  <option>Normal</option>
                  <option>Hyper</option>
                  <option>Turbo</option>
                  <option>Deep Stack</option>
                  <option>Bounty</option>
                </select>
              </div>
              <div>
                <label class="label-base">Starting stack</label>
                <input v-model.number="editing.startingStack" type="number" placeholder="50000" class="input-base" />
              </div>
              <div>
                <label class="label-base">Re-entry</label>
                <input v-model="editing.reEntry" placeholder="가능 / Freeze-out" class="input-base" />
              </div>
              <div>
                <label class="label-base">Level duration (min)</label>
                <input v-model="editing.levelDuration" placeholder="40 또는 40/30/25" class="input-base" />
              </div>
              <div>
                <label class="label-base">In Prize (순위 수)</label>
                <input v-model.number="editing.inPrize" type="number" placeholder="10" class="input-base" />
              </div>
              <div>
                <label class="label-base">Next day % (0.15 = 15%)</label>
                <input v-model.number="editing.nextDayPct" type="number" step="0.01" placeholder="0.15" class="input-base" />
              </div>
            </div>

            <!-- 멀티데이 일정 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="label-base mb-0">Multi-day 일정</label>
                <button type="button" class="btn-ghost text-xs py-1" @click="addDay">+ Day 추가</button>
              </div>
              <div v-if="editing.days?.length" class="space-y-2">
                <div
                  v-for="(day, i) in editing.days"
                  :key="i"
                  class="flex items-center gap-2 flex-wrap"
                >
                  <input v-model="day.label" placeholder="Day 1A" class="input-base w-24 shrink-0" />
                  <input v-model="day.date" type="date" class="input-base w-36 shrink-0" />
                  <input v-model="day.start" placeholder="19:00" class="input-base w-24 shrink-0" />
                  <input v-model="day.regClose" placeholder="02:10 (reg close)" class="input-base w-36 shrink-0" />
                  <button type="button" class="text-zinc-400 hover:text-red-500 transition text-lg leading-none shrink-0" @click="editing.days.splice(i, 1)">×</button>
                </div>
              </div>
              <p v-else class="text-xs text-zinc-400">Day 추가 버튼으로 Day 1A, Day 1B, Day 2 등 입력</p>
            </div>

            <!-- 태그 -->
            <div>
              <label class="label-base">Tags</label>
              <div class="flex flex-wrap gap-2 mt-1">
                <label
                  v-for="tag in allTags"
                  :key="tag.id"
                  class="flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    v-model="editing.tagIds"
                    type="checkbox"
                    :value="tag.id"
                    class="accent-indigo-600"
                  />
                  <span class="text-sm text-zinc-700">{{ tag.name }}</span>
                  <span class="text-xs text-zinc-400">({{ tag.category }})</span>
                </label>
              </div>
            </div>

            <!-- 메모 -->
            <div>
              <label class="label-base">Description</label>
              <textarea v-model="editing.description" rows="2" class="input-base" />
            </div>

            <div v-if="saveError" class="text-sm text-red-600">{{ saveError }}</div>
          </div>

          <div class="px-6 pb-6 flex gap-3">
            <button :disabled="saving" class="btn-primary" @click="onSave">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
            <button class="btn-ghost" @click="editing = null">Cancel</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const id    = Number(route.params.id)

const { data: tournament }               = await useFetch(`/api/admin/tournaments/${id}`)
const { data: events, pending, refresh } = await useFetch(`/api/admin/tournaments/${id}/events`)
const { data: allTags }                  = await useFetch('/api/tags')

const editing   = ref(null)
const saving    = ref(false)
const saveError = ref('')

const localEvents = ref([])

watch(events, (val) => {
  localEvents.value = val ? [...val] : []
}, { immediate: true })

function fmtDate(d) {
  return d ? String(d).slice(0, 10) : ''
}

function fmtYen(n) {
  if (!n) return ''
  return '¥' + Number(n).toLocaleString()
}

function blankEvent() {
  return {
    name: '', nameKo: '', date: '', orderNo: 0, eventNo: null,
    registrationStart: '', registrationClose: '',
    buyInAmount: null, buyInText: '',
    gtdAmount: null, gtdText: '',
    gameType: '', structure: '',
    startingStack: null, reEntry: '',
    levelDuration: '', inPrize: null, nextDayPct: null,
    days: [], description: '', tagIds: []
  }
}

function openCreate() {
  editing.value = blankEvent()
}

function addDay() {
  if (!editing.value.days) editing.value.days = []
  editing.value.days.push({ label: '', date: '', start: '', regClose: '' })
}

function openEdit(ev) {
  editing.value = {
    id:                ev.id,
    name:              ev.name              ?? '',
    nameKo:            ev.nameKo            ?? '',
    date:              fmtDate(ev.date),
    orderNo:           ev.orderNo           ?? 0,
    eventNo:           ev.eventNo           ?? null,
    registrationStart: ev.registrationStart ?? '',
    registrationClose: ev.registrationClose ?? '',
    buyInAmount:       ev.buyInAmount       ? Number(ev.buyInAmount)   : null,
    buyInText:         ev.buyInText         ?? '',
    gtdAmount:         ev.gtdAmount         ? Number(ev.gtdAmount)     : null,
    gtdText:           ev.gtdText           ?? '',
    gameType:          ev.gameType          ?? '',
    structure:         ev.structure         ?? '',
    startingStack:     ev.startingStack     ?? null,
    reEntry:           ev.reEntry           ?? '',
    levelDuration:     ev.levelDuration     ?? '',
    inPrize:           ev.inPrize           ?? null,
    nextDayPct:        ev.nextDayPct        ? Number(ev.nextDayPct)    : null,
    days:              Array.isArray(ev.days) ? ev.days.map(d => ({ ...d })) : [],
    description:       ev.description       ?? '',
    tagIds:            ev.tags?.map(et => et.tag.id) ?? []
  }
}

async function onSave() {
  if (!editing.value.name || !editing.value.date) return
  saving.value    = true
  saveError.value = ''
  try {
    if (editing.value.id) {
      await $fetch(`/api/admin/events/${editing.value.id}`, {
        method: 'PUT',
        body: editing.value
      })
    } else {
      await $fetch(`/api/admin/tournaments/${id}/events`, {
        method: 'POST',
        body: editing.value
      })
    }
    editing.value = null
    await refresh()
  } catch (e) {
    saveError.value = e?.statusMessage || e?.data?.statusMessage || '저장 실패'
  } finally {
    saving.value = false
  }
}

async function onDelete(ev) {
  if (!confirm(`"${ev.name}" 삭제할까요?`)) return
  await $fetch(`/api/admin/events/${ev.id}`, { method: 'DELETE' })
  await refresh()
}

// ─── Bulk paste ───────────────────────────────────────────
const COLUMNS = [
  { key: 'date',              label: 'date',              required: true  },
  { key: 'name',              label: 'name',              required: true  },
  { key: 'nameKo',            label: 'nameKo',            required: false },
  { key: 'eventNo',           label: 'eventNo',           required: false },
  { key: 'buyInAmount',       label: 'buyInAmount',       required: false },
  { key: 'buyInText',         label: 'buyInText',         required: false },
  { key: 'gtdAmount',         label: 'gtdAmount',         required: false },
  { key: 'gtdText',           label: 'gtdText',           required: false },
  { key: 'gameType',          label: 'gameType',          required: false },
  { key: 'structure',         label: 'structure',         required: false },
  { key: 'startingStack',     label: 'startingStack',     required: false },
  { key: 'reEntry',           label: 'reEntry',           required: false },
  { key: 'levelDuration',     label: 'levelDuration',     required: false },
  { key: 'registrationStart', label: 'regOpen',           required: false },
  { key: 'registrationClose', label: 'regClose',          required: false },
]

const bulkModal       = ref(false)
const bulkRaw         = ref('')
const bulkPreview     = ref([])
const bulkParseErrors = ref([])
const bulkSaving      = ref(false)
const bulkError       = ref('')

function closeBulk() {
  bulkModal.value       = false
  bulkRaw.value         = ''
  bulkPreview.value     = []
  bulkParseErrors.value = []
  bulkError.value       = ''
}

function parseBulk(raw) {
  const lines  = raw.trim().split('\n').filter(l => l.trim())
  const errors = []
  const rows   = []

  lines.forEach((line, idx) => {
    const cells = line.split('\t').map(c => c.trim())
    const row   = {}

    COLUMNS.forEach((col, i) => {
      row[col.key] = cells[i] ?? ''
    })

    const rowErrors = []
    if (!row.date) rowErrors.push(`행 ${idx + 1}: date 필수`)
    if (!row.name) rowErrors.push(`행 ${idx + 1}: name 필수`)
    if (row.date && isNaN(Date.parse(row.date))) rowErrors.push(`행 ${idx + 1}: date 형식 오류 (YYYY-MM-DD)`)

    if (rowErrors.length) {
      row._error = rowErrors.join(', ')
      errors.push(...rowErrors)
    }

    rows.push(row)
  })

  return { rows, errors }
}

// 붙여넣기 또는 직접 입력 시 자동 파싱
watch(bulkRaw, (val) => {
  if (!val.trim()) {
    bulkPreview.value     = []
    bulkParseErrors.value = []
    return
  }
  const { rows, errors } = parseBulk(val)
  bulkPreview.value       = rows
  bulkParseErrors.value   = errors
})

function onPaste(e) {
  // paste 이벤트는 textarea에 자동 반영되므로 watch가 처리
}

function downloadSample() {
  const header = COLUMNS.map(c => c.label).join('\t')
  const example = [
    '2026-07-16', 'Main Event Day1A', '메인 이벤트 Day1A',
    '30000', '¥30,000', '10000000', '¥10M',
    'NLH', 'Normal', '50000', '가능', '50', '10:00', '14:00'
  ].join('\t')
  const example2 = [
    '2026-07-17', 'Mystery Bounty', '미스터리 바운티',
    '20000', '¥20,000', '5000000', '¥5M',
    'NLH', 'Bounty', '30000', 'Freeze-out', '40', '11:00', '15:00'
  ].join('\t')

  const tsv  = [header, example, example2].join('\n')
  const blob = new Blob(['﻿' + tsv], { type: 'text/tab-separated-values;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'events_sample.tsv'
  a.click()
  URL.revokeObjectURL(url)
}

async function onBulkSave() {
  if (!bulkPreview.value.length || bulkParseErrors.value.length) return
  bulkSaving.value = true
  bulkError.value  = ''
  try {
    const clean = bulkPreview.value.map(({ _error, ...row }) => row)
    const result = await $fetch(`/api/admin/tournaments/${id}/events/bulk`, {
      method: 'POST',
      body: { events: clean }
    })
    closeBulk()
    await refresh()
    alert(`${result.created}개 이벤트가 저장되었습니다.`)
  } catch (e) {
    bulkError.value = e?.statusMessage || e?.data?.statusMessage || '저장 실패'
  } finally {
    bulkSaving.value = false
  }
}
</script>
