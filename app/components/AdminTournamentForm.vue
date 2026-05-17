<template>
  <form class="space-y-6 max-w-3xl" @submit.prevent="onSubmit">
    <section class="surface-card p-5 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label-base">Brand</label>
          <select v-model="form.brandId" required class="input-base">
            <option :value="null" disabled>Select brand</option>
            <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>

        <!-- 상태 -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="label-base mb-0">Status</label>
            <label class="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer select-none">
              <input v-model="form.autoStatus" type="checkbox" class="accent-indigo-600" />
              날짜 기반 자동 설정
            </label>
          </div>
          <!-- 자동 모드: 계산된 상태 뱃지 표시 -->
          <div v-if="form.autoStatus" class="input-base flex items-center gap-2 bg-zinc-50 cursor-default">
            <span :class="computedBadge">{{ computedLabel }}</span>
            <span class="text-xs text-zinc-400">날짜 기반으로 자동 계산됩니다</span>
          </div>
          <!-- 수동 모드: 드롭다운 -->
          <select v-else v-model="form.status" class="input-base">
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="FINISHED">Finished</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <label class="label-base">Slug</label>
        <input v-model="form.slug" required placeholder="jopt-tokyo-02" class="input-base font-mono" />
        <p class="hint">URL 식별자 — 영문 소문자/숫자/하이픈</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label-base">Title (short)</label>
          <input v-model="form.titleShort" required placeholder="JOPT Tokyo #02" class="input-base" />
        </div>
        <div>
          <label class="label-base">Title (full)</label>
          <input v-model="form.titleFull" required placeholder="Japan Open Poker Tour Tokyo #02" class="input-base" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label-base">Title (Korean)</label>
          <input v-model="form.titleFullKo" placeholder="재팬 오픈 포커 투어 도쿄 #02" class="input-base" />
        </div>
        <div>
          <label class="label-base">Title (Japanese)</label>
          <input v-model="form.titleFullJa" placeholder="ジャパン・オープン・ポーカー・ツアー東京 #02" class="input-base" />
        </div>
      </div>
    </section>

    <section class="surface-card p-5 space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">Location & schedule</h3>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="label-base">Country</label>
          <select v-model="form.countryCode" class="input-base">
            <option value="JP">Japan</option>
            <option value="KR">Korea</option>
            <option value="TW">Taiwan</option>
          </select>
        </div>
        <div>
          <label class="label-base">City</label>
          <input v-model="form.city" required class="input-base" />
        </div>
        <div>
          <label class="label-base">Timezone</label>
          <input v-model="form.timezone" placeholder="Asia/Tokyo" class="input-base" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label-base">Venue name</label>
          <input v-model="form.venueName" class="input-base" />
        </div>
        <div>
          <label class="label-base">Venue address</label>
          <input v-model="form.venueAddress" class="input-base" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label-base">Start date</label>
          <input v-model="form.startDate" type="date" required class="input-base" />
        </div>
        <div>
          <label class="label-base">End date</label>
          <input v-model="form.endDate" type="date" required class="input-base" />
        </div>
      </div>
    </section>

    <section class="surface-card p-5 space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">Media & content</h3>

      <div>
        <label class="label-base">Poster image URL</label>
        <input v-model="form.posterImageUrl" type="text" placeholder="https://..." class="input-base" />
        <p class="hint">파일 업로드는 추후. 지금은 URL 직접 입력.</p>
      </div>

      <div>
        <label class="label-base">Description</label>
        <textarea v-model="form.description" rows="3" class="input-base" />
      </div>

      <div>
        <label class="label-base">Description (Korean)</label>
        <textarea v-model="form.descriptionKo" rows="3" class="input-base" />
      </div>

      <div>
        <label class="label-base">Description (Japanese)</label>
        <textarea v-model="form.descriptionJa" rows="3" class="input-base" />
      </div>
    </section>

    <!-- Player's Guide URLs -->
    <section class="surface-card p-5 space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">Player's Guide</h3>
      <p class="text-xs text-zinc-500">언어별 플레이어 가이드 URL. 비워두면 해당 언어 버튼이 표시되지 않습니다.</p>

      <div>
        <label class="label-base">Japanese (日本語) <span class="text-zinc-400 font-normal">— 기본 표시</span></label>
        <input v-model="form.playerGuides.ja" type="url" placeholder="https://..." class="input-base" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label-base">Korean (한국어)</label>
          <input v-model="form.playerGuides.ko" type="url" placeholder="https://..." class="input-base" />
        </div>
        <div>
          <label class="label-base">English</label>
          <input v-model="form.playerGuides.en" type="url" placeholder="https://..." class="input-base" />
        </div>
      </div>
    </section>

    <section class="surface-card p-5">
      <label class="flex items-start gap-3 cursor-pointer">
        <input v-model="form.published" type="checkbox" class="mt-1 accent-indigo-600" />
        <div>
          <div class="text-sm font-medium text-zinc-900">Publish now</div>
          <div class="text-xs text-zinc-500">체크 안 하면 Draft로 저장됩니다.</div>
        </div>
      </label>
    </section>

    <div v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</div>

    <div class="flex items-center gap-3">
      <button type="submit" :disabled="submitting" class="btn-primary">
        {{ submitting ? 'Saving...' : submitLabel }}
      </button>
      <NuxtLink to="/admin/tournaments" class="btn-ghost">Cancel</NuxtLink>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  brands:      { type: Array,   default: () => [] },
  initial:     { type: Object,  default: null },
  submitting:  { type: Boolean, default: false },
  errorMsg:    { type: String,  default: '' },
  submitLabel: { type: String,  default: 'Save' }
})

const emit = defineEmits(['submit'])

function calcStatus(startDate, endDate) {
  if (!startDate || !endDate) return 'UPCOMING'
  const now  = new Date()
  const start = new Date(startDate)
  const end   = new Date(endDate)
  end.setHours(23, 59, 59, 999)
  if (now < start) return 'UPCOMING'
  if (now > end)   return 'FINISHED'
  return 'ONGOING'
}

function fromInitial(init) {
  return {
    brandId:        init?.brandId        ?? null,
    slug:           init?.slug           ?? '',
    titleShort:     init?.titleShort     ?? '',
    titleFull:      init?.titleFull      ?? '',
    titleFullKo:    init?.titleFullKo    ?? '',
    titleFullJa:    init?.titleFullJa    ?? '',
    countryCode:    init?.countryCode    ?? 'JP',
    city:           init?.city           ?? '',
    timezone:       init?.timezone       ?? 'Asia/Tokyo',
    venueName:      init?.venueName      ?? '',
    venueAddress:   init?.venueAddress   ?? '',
    startDate:      init?.startDate ? String(init.startDate).slice(0, 10) : '',
    endDate:        init?.endDate   ? String(init.endDate).slice(0, 10)   : '',
    posterImageUrl: init?.posterImageUrl ?? '',
    status:         init?.status         ?? 'UPCOMING',
    autoStatus:     true,   // 항상 자동 모드로 시작
    description:    init?.description    ?? '',
    descriptionKo:  init?.descriptionKo  ?? '',
    descriptionJa:  init?.descriptionJa  ?? '',
    playerGuides: {
      ja: init?.playerGuides?.ja ?? '',
      ko: init?.playerGuides?.ko ?? '',
      en: init?.playerGuides?.en ?? ''
    },
    published:      !!init?.publishedAt
  }
}

const form = reactive(fromInitial(props.initial))

watch(() => props.initial, (v) => {
  if (v) Object.assign(form, fromInitial(v))
})

// 날짜가 바뀔 때마다 자동 계산
const computedStatus = computed(() => calcStatus(form.startDate, form.endDate))

const computedLabel = computed(() => {
  const map = { UPCOMING: 'Upcoming', ONGOING: 'Live', FINISHED: 'Finished', CANCELLED: 'Cancelled' }
  return map[computedStatus.value] ?? computedStatus.value
})

const computedBadge = computed(() => {
  const map = {
    UPCOMING:  'badge-upcoming',
    ONGOING:   'badge-ongoing',
    FINISHED:  'badge-finished',
    CANCELLED: 'badge-cancelled'
  }
  return map[computedStatus.value] ?? ''
})

function onSubmit() {
  const payload = { ...form }
  // 자동 모드면 계산된 상태로 덮어씀
  if (form.autoStatus) payload.status = computedStatus.value
  // playerGuides: 빈 문자열 → null, 모두 비었으면 null로
  const pg = form.playerGuides
  const cleanedGuides = {
    ja: pg.ja || null,
    ko: pg.ko || null,
    en: pg.en || null
  }
  payload.playerGuides = (cleanedGuides.ja || cleanedGuides.ko || cleanedGuides.en) ? cleanedGuides : null
  emit('submit', payload)
}
</script>
