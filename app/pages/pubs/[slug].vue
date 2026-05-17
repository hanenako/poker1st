<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 py-10">

    <div v-if="pending" class="muted text-sm py-12">Loading...</div>

    <template v-else-if="pub">
      <div class="mb-4">
        <NuxtLink to="/pubs" class="text-sm text-zinc-500 hover:text-zinc-900">
          {{ ui.backToPubs }}
        </NuxtLink>
      </div>

      <div class="surface-card overflow-hidden mb-6">
        <div class="aspect-[21/9] bg-zinc-100">
          <img
            v-if="pub.coverImageUrl"
            :src="pub.coverImageUrl"
            class="w-full h-full object-cover"
          />
        </div>

        <div class="p-6">
          <div class="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
            {{ pub.city }}{{ pub.district ? ' · ' + pub.district : '' }}
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-3xl font-semibold tracking-tight text-zinc-900">
              {{ t(pub.nameKo, pub.nameJa, pub.name) }}
            </h1>
            <!-- 영업 중 배지 -->
            <span
              v-if="openStatus.label"
              class="text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="openStatus.open
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-zinc-100 text-zinc-400'"
            >
              {{ openStatus.label }}
            </span>
          </div>
          <p v-if="pub.description || pub.descriptionKo || pub.descriptionJa" class="mt-3 text-zinc-700">
            {{ t(pub.descriptionKo, pub.descriptionJa, pub.description) }}
          </p>
          <div class="mt-3">
            <ShareButton :title="pub.name" />
          </div>
          <div class="mt-2">
            <SocialLinks
              :website-url="pub.websiteUrl"
              :twitter-url="pub.twitterUrl"
              :instagram-url="pub.instagramUrl"
              :youtube-url="pub.youtubeUrl"
              :flickr-url="pub.flickrUrl"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <!-- Info -->
        <div class="surface-card p-5">
          <h2 class="section-title text-base mb-3">{{ ui.pubInfo }}</h2>
          <dl class="space-y-3 text-sm">
            <div v-if="pub.address || pub.addressKo">
              <dt class="text-zinc-500">{{ ui.pubAddress }}</dt>
              <!-- 항상 원문(일본어) 주소를 메인으로, KO면 한국어 주소를 메인에 / 원문을 부제목으로 -->
              <dd class="text-zinc-900">{{ isKo ? (pub.addressKo || pub.address) : pub.address }}</dd>
              <dd v-if="isKo && pub.address && pub.addressKo && pub.address !== pub.addressKo"
                  class="text-zinc-500 text-xs mt-0.5">{{ pub.address }}</dd>
            </div>
            <div v-if="pub.phone">
              <dt class="text-zinc-500">{{ ui.pubPhone }}</dt>
              <dd class="text-zinc-900">{{ pub.phone }}</dd>
            </div>
            <!-- 가는 방법 -->
            <div v-if="pub.nearestStation || pub.walkMinutes">
              <dt class="text-zinc-500">{{ ui.pubAccess }}</dt>
              <dd class="text-zinc-900">
                <span v-if="pub.nearestStation">{{ pub.nearestStation }}</span>
                <span v-if="pub.nearestStation && pub.walkMinutes"> · </span>
                <span v-if="pub.walkMinutes">{{ ui.pubWalk(pub.walkMinutes) }}</span>
              </dd>
            </div>
            <div v-if="pub.address">
              <dt class="text-zinc-500">Map</dt>
              <dd>
                <a :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pub.address)}`" target="_blank" rel="noopener" class="text-indigo-600 hover:underline">
                  {{ ui.pubMap }}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Hours -->
        <div class="surface-card p-5">
          <div class="flex items-center justify-between mb-3">
            <h2 class="section-title text-base">{{ ui.pubHours }}</h2>
            <span
              v-if="openStatus.label"
              class="text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="openStatus.open
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-zinc-100 text-zinc-400'"
            >
              {{ openStatus.label }}
            </span>
          </div>
          <div v-if="hoursRows.length" class="space-y-1.5 text-sm">
            <div
              v-for="row in hoursRows"
              :key="row.day"
              class="flex justify-between"
              :class="row.isToday ? 'font-semibold text-zinc-900' : ''"
            >
              <span class="w-24" :class="row.isToday ? 'text-zinc-900' : 'text-zinc-500'">{{ row.day }}</span>
              <span :class="row.isToday ? 'text-zinc-900' : 'text-zinc-700'">{{ row.value }}</span>
            </div>
          </div>
          <div v-else class="muted text-sm">{{ ui.pubNoHours }}</div>
          <p v-if="hoursRows.length" class="text-xs text-zinc-400 leading-relaxed mt-1">
            {{ ui.pubHolidayNote }}
          </p>
        </div>

        <!-- 혼잡도 -->
        <CongestionWidget :slug="route.params.slug" />

        <!-- Games -->
        <div v-if="gameRows.length" class="surface-card p-5">
          <h2 class="section-title text-base mb-3">Games</h2>
          <div class="space-y-2">
            <div v-for="(g, i) in gameRows" :key="i" class="text-sm">
              <div class="font-medium text-zinc-900">{{ g.type }}</div>
              <div v-if="g.info" class="text-zinc-500 text-xs mt-0.5">{{ g.info }}</div>
            </div>
          </div>
        </div>

        <!-- Features -->
        <div v-if="featureChips.length" class="surface-card p-5">
          <h2 class="section-title text-base mb-3">Features</h2>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="(f, i) in featureChips" :key="i" class="chip">{{ f }}</span>
          </div>
        </div>

      </div>

      <!-- 특별 공지 배너 -->
      <div
        v-if="activeNotice"
        class="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"
      >
        <div class="flex items-start gap-3">
          <span class="text-amber-500 text-lg leading-none mt-0.5">📢</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-amber-900 whitespace-pre-line">{{ activeNotice.text }}</p>
            <div v-if="activeNotice.until" class="text-xs text-amber-600 mt-1">~ {{ activeNotice.until }}</div>
            <a
              v-if="activeNotice.url"
              :href="activeNotice.url"
              target="_blank"
              rel="noopener"
              class="inline-block mt-2 text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2"
            >상세보기 →</a>
          </div>
        </div>
        <div v-if="activeNotice.imageUrl" class="mt-3">
          <img
            :src="activeNotice.imageUrl"
            alt="공지 이미지"
            class="rounded-lg max-w-full cursor-zoom-in"
            @click="openNoticeImage"
          />
        </div>

        <!-- 공지 이미지 라이트박스 -->
        <Lightbox
          v-model="noticeLightboxOpen"
          :images="activeNotice.imageUrl ? [{ url: activeNotice.imageUrl }] : []"
          :start-index="0"
        />
      </div>

      <!-- 이미지 갤러리 -->
      <div v-if="pub.images?.length" class="mt-5">
        <h2 class="section-title text-base mb-4">{{ ui.pubGallery }}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            v-for="(img, idx) in pub.images"
            :key="img.id"
            type="button"
            class="group relative aspect-square rounded-lg overflow-hidden bg-zinc-100 block"
            @click="openGallery(idx)"
          >
            <img
              :src="img.url"
              :alt="img.caption || ''"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              loading="lazy"
            />
            <div v-if="img.caption" class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition">
              <p class="text-white text-xs truncate">{{ img.caption }}</p>
            </div>
          </button>
        </div>
      </div>

      <!-- 갤러리 라이트박스 -->
      <Lightbox
        v-model="lightboxOpen"
        :images="galleryImages"
        :start-index="lightboxIndex"
      />

      <!-- 영상 섹션 -->
      <div v-if="videoList.length" class="mt-5">
        <h2 class="section-title text-base mb-4">{{ ui.pubMedia }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="(v, i) in videoList" :key="i" class="surface-card overflow-hidden">
            <!-- YouTube 임베드 -->
            <div v-if="v.embedUrl" class="aspect-video">
              <iframe
                :src="v.embedUrl"
                class="w-full h-full"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
            <!-- 임베드 불가 URL은 링크로 -->
            <div v-else class="p-4">
              <a :href="v.url" target="_blank" rel="noopener" class="text-indigo-600 hover:underline text-sm break-all">
                {{ v.title || v.url }}
              </a>
            </div>
            <div v-if="v.title && v.embedUrl" class="px-4 py-2 text-sm text-zinc-600 border-t border-zinc-100">
              {{ v.title }}
            </div>
          </div>
        </div>
      </div>

      <!-- 리뷰 섹션 -->
      <div class="mt-8">
        <!-- 헤더: 리뷰 수 + 종합 평균 -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title text-base">{{ ui.reviews }} ({{ reviews?.length || 0 }})</h2>
          <div v-if="avgOverall" class="flex items-center gap-1.5">
            <StarRating :value="avgOverall" readonly size="sm" />
            <span class="text-sm font-semibold text-zinc-800">{{ avgOverall.toFixed(1) }}</span>
          </div>
        </div>

        <!-- 항목별 평균 바 (리뷰가 있을 때만) -->
        <div v-if="reviews?.length" class="surface-card p-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div v-for="cat in ratingCategories" :key="cat.key" class="text-center">
            <div class="text-xs text-zinc-500 mb-1">{{ cat.label }}</div>
            <div class="text-lg font-semibold text-zinc-900">
              {{ catAvg(cat.key) > 0 ? catAvg(cat.key).toFixed(1) : '—' }}
            </div>
            <div class="text-xs text-zinc-400 mt-0.5">/ 5.0</div>
          </div>
        </div>

        <!-- 리뷰 작성 폼 -->
        <div class="surface-card p-5 mb-4">
          <h3 class="text-sm font-semibold text-zinc-800 mb-3">{{ ui.writeReview }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label class="label-base">{{ ui.nickname }} <span class="text-red-500">*</span></label>
              <input v-model="form.nickname" type="text" :placeholder="ui.nicknamePh" class="input-base" />
            </div>
            <div>
              <label class="label-base">{{ ui.password }} <span class="text-red-500">*</span></label>
              <input v-model="form.password" type="password" :placeholder="ui.passwordPh" class="input-base" />
            </div>
          </div>

          <!-- 항목별 평점 -->
          <div class="mb-4">
            <label class="label-base">{{ ui.rating }} <span class="text-red-500">*</span> <span class="text-zinc-400 font-normal text-xs">{{ ui.ratingHint }}</span></label>
            <div class="grid grid-cols-2 gap-3 mt-2">
              <div v-for="cat in ratingCategories" :key="cat.key" class="flex items-center gap-2">
                <span class="text-xs text-zinc-500 w-16 shrink-0">{{ cat.label }}</span>
                <StarRating v-model="form[cat.key]" size="sm" />
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="label-base">{{ ui.titleOpt }}</label>
            <input v-model="form.title" type="text" :placeholder="ui.titlePh" class="input-base" />
          </div>
          <div class="mb-3">
            <label class="label-base">{{ ui.bodyOpt }}</label>
            <textarea v-model="form.body" rows="3" :placeholder="ui.bodyPh" class="input-base" />
          </div>
          <div v-if="formError" class="text-sm text-red-600 mb-2">{{ formError }}</div>
          <button
            :disabled="formSaving || !formHasRating || !form.nickname || !form.password"
            class="btn-primary text-sm"
            @click="submitReview"
          >
            {{ formSaving ? ui.saving : ui.submit }}
          </button>
        </div>

        <!-- 리뷰 없을 때 -->
        <div v-if="!reviews?.length" class="surface-card p-8 text-center text-zinc-400 text-sm">
          {{ ui.noReviews }}
        </div>

        <!-- 리뷰 목록 -->
        <div v-if="reviews?.length" class="space-y-3">
          <div v-for="r in reviews" :key="r.id" class="surface-card p-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-semibold text-zinc-500 shrink-0 overflow-hidden">
                <img v-if="r.user?.avatarUrl" :src="r.user.avatarUrl" class="w-full h-full object-cover" />
                <span v-else>{{ (r.nickname || r.user?.name || '?')[0].toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <span class="text-sm font-medium text-zinc-800">{{ r.nickname || r.user?.name || ui.anonymous }}</span>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="text-xs text-zinc-400">{{ fmtDate(r.createdAt) }}</span>
                    <button class="text-xs text-zinc-400 hover:text-red-500 transition" @click="openDeleteModal(r.id)">{{ ui.delete }}</button>
                  </div>
                </div>
                <!-- 항목별 평점 칩 -->
                <div class="flex flex-wrap gap-x-3 gap-y-1 mb-1.5">
                  <span v-for="cat in ratingCategories" :key="cat.key" class="text-xs text-zinc-500">
                    <template v-if="r[cat.key]">
                      {{ cat.label }} <span class="font-semibold text-zinc-700">{{ r[cat.key] }}.0</span>
                    </template>
                  </span>
                </div>
                <p v-if="r.title" class="text-sm font-medium text-zinc-900">{{ r.title }}</p>
                <p v-if="r.body" class="text-sm text-zinc-600 mt-0.5">{{ r.body }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 삭제 확인 모달 -->
      <Teleport to="body">
        <div v-if="deleteModalId" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 class="text-base font-semibold text-zinc-900 mb-1">{{ ui.deleteReview }}</h3>
            <p class="text-sm text-zinc-500 mb-4">
              <template v-if="isAdminUser">{{ ui.deleteAdminNote }}</template>
              <template v-else>{{ ui.deletePasswordNote }}</template>
            </p>
            <input
              v-if="!isAdminUser"
              v-model="deletePassword"
              type="password"
              :placeholder="ui.passwordModalPh"
              class="input-base mb-3"
              @keydown.enter="confirmDelete"
            />
            <div v-if="deleteError" class="text-sm text-red-500 mb-3">{{ deleteError }}</div>
            <div class="flex gap-2">
              <button
                class="btn-primary bg-red-600 hover:bg-red-700 flex-1 text-sm"
                :disabled="deleting"
                @click="confirmDelete"
              >{{ deleting ? ui.deleting : ui.delete }}</button>
              <button class="btn-ghost flex-1 text-sm" @click="closeDeleteModal">{{ ui.cancel }}</button>
            </div>
          </div>
        </div>
      </Teleport>

    </template>

    <div v-else class="surface-card p-10 text-center muted">
      {{ ui.pubNotFound }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// ── 라이트박스 ──────────────────────────────────────────
const lightboxOpen    = ref(false)
const lightboxIndex   = ref(0)
const noticeLightboxOpen = ref(false)

const galleryImages = computed(() =>
  (pub.value?.images || []).map(img => ({ url: img.url, caption: img.caption || '' }))
)

function openGallery(idx) {
  lightboxIndex.value = idx
  lightboxOpen.value  = true
}
function openNoticeImage() {
  noticeLightboxOpen.value = true
}
import { getActiveDayKey } from '~/composables/useIsOpen'

const route = useRoute()
const { t, isKo, isJa, locale } = useLocale()
const { ui } = useUiT()
const { checkIsOpen } = useIsOpen()
const { data: pub, pending } = await useFetch(
  () => `/api/pubs/${route.params.slug}`
)

// 영업 중 상태
const openStatus = computed(() => checkIsOpen(pub.value?.hours))

// 특별 공지 — noticeUntil이 있으면 오늘 이후인지 확인, 없으면 항상 표시
const activeNotice = computed(() => {
  const p = pub.value
  if (!p?.notice) return null
  if (p.noticeUntil) {
    const today = new Date().toISOString().slice(0, 10)
    if (String(p.noticeUntil).slice(0, 10) < today) return null
  }
  return {
    text:     p.notice,
    until:    p.noticeUntil    ? String(p.noticeUntil).slice(0, 10) : null,
    imageUrl: p.noticeImageUrl || null,
    url:      p.noticeUrl      || null
  }
})

// JSON-LD
useHead(computed(() => {
  const p = pub.value
  if (!p) return {}
  return {
    script: [{
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context':   'https://schema.org',
        '@type':      'LocalBusiness',
        name:          p.name,
        description:   p.description || p.descriptionKo || undefined,
        address: p.address ? {
          '@type':          'PostalAddress',
          streetAddress:     p.address,
          addressLocality:   p.city,
          addressCountry:   (p.countryCode || 'JP')
        } : undefined,
        telephone:   p.phone   || undefined,
        url:         p.websiteUrl || undefined,
        image:       p.coverImageUrl || undefined
      })
    }]
  }
}))

// ── 리뷰 ──────────────────────────────────────────────
const { loggedIn, user } = useUserSession()
const isAdminUser = computed(() => loggedIn.value && user.value?.role === 'ADMIN')

const { data: reviews, refresh: refreshReviews } = await useFetch(
  () => `/api/pubs/${route.params.slug}/reviews`
)

// ── 항목별 평점 카테고리 정의 ─────────────────────────────
const ratingCategories = computed(() => [
  { key: 'ratingAtmosphere', label: ui.value.ratingAtmosphere },
  { key: 'ratingDealer',     label: ui.value.ratingDealer     },
  { key: 'ratingWait',       label: ui.value.ratingWait       },
  { key: 'ratingValue',      label: ui.value.ratingValue      },
])

function catAvg(key) {
  if (!reviews.value?.length) return 0
  const vals = reviews.value.map(r => r[key]).filter(v => v != null && v > 0)
  if (!vals.length) return 0
  return vals.reduce((s, v) => s + v, 0) / vals.length
}

const avgOverall = computed(() => {
  if (!reviews.value?.length) return 0
  const keys = ['ratingAtmosphere', 'ratingDealer', 'ratingWait', 'ratingValue']
  const all = reviews.value.flatMap(r => keys.map(k => r[k]).filter(v => v != null && v > 0))
  if (!all.length) return 0
  return all.reduce((s, v) => s + v, 0) / all.length
})

// 작성 폼
const form       = ref({ nickname: '', password: '', ratingAtmosphere: 0, ratingDealer: 0, ratingWait: 0, ratingValue: 0, title: '', body: '' })
const formSaving = ref(false)
const formError  = ref('')

const formHasRating = computed(() =>
  form.value.ratingAtmosphere > 0 || form.value.ratingDealer > 0 ||
  form.value.ratingWait > 0 || form.value.ratingValue > 0
)

async function submitReview() {
  if (!formHasRating.value || !form.value.nickname || !form.value.password) return
  formSaving.value = true
  formError.value  = ''
  try {
    await $fetch(`/api/pubs/${route.params.slug}/reviews`, {
      method: 'POST',
      body: form.value
    })
    form.value = { nickname: '', password: '', ratingAtmosphere: 0, ratingDealer: 0, ratingWait: 0, ratingValue: 0, title: '', body: '' }
    await refreshReviews()
  } catch (e) {
    formError.value = e?.data?.statusMessage || '등록 실패'
  } finally {
    formSaving.value = false
  }
}

// 삭제 모달
const deleteModalId  = ref(null)
const deletePassword = ref('')
const deleteError    = ref('')
const deleting       = ref(false)

function openDeleteModal(id) {
  deleteModalId.value  = id
  deletePassword.value = ''
  deleteError.value    = ''
}
function closeDeleteModal() {
  deleteModalId.value = null
}

async function confirmDelete() {
  if (!deleteModalId.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch(`/api/pubs/${route.params.slug}/reviews/${deleteModalId.value}`, {
      method: 'DELETE',
      body: isAdminUser.value ? {} : { password: deletePassword.value }
    })
    closeDeleteModal()
    await refreshReviews()
  } catch (e) {
    deleteError.value = e?.data?.statusMessage || '삭제 실패'
  } finally {
    deleting.value = false
  }
}

function fmtDate(d) {
  return d ? String(d).slice(0, 10) : ''
}

useSeoMeta({
  title:         computed(() => pub.value?.name ?? 'PokerRoom'),
  description:   computed(() => pub.value?.descriptionKo || pub.value?.description || `${pub.value?.name} — ${pub.value?.city} 포커룸 정보`),
  ogTitle:       computed(() => `${pub.value?.name ?? 'PokerRoom'} | poker1st`),
  ogDescription: computed(() => pub.value?.descriptionKo || pub.value?.description || `${pub.value?.city} 포커룸 정보`),
  ogImage:       computed(() => pub.value?.coverImageUrl ?? undefined)
})

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
// Mon–Sun display order (indices into DAY_KEYS / ui.daysFull)
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

const hoursRows = computed(() => {
  const h = pub.value?.hours
  if (!h || typeof h !== 'object') return []
  const jst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  const activeKey = getActiveDayKey(h, jst)
  return DISPLAY_ORDER
    .filter(idx => h[DAY_KEYS[idx]])
    .map(idx => {
      const key   = DAY_KEYS[idx]
      const slots = h[key]
      return {
        day:     ui.value.daysFull[idx],
        value:   Array.isArray(slots) ? slots.join(', ') : String(slots),
        isToday: key === activeKey
      }
    })
})

const gameRows = computed(() => {
  const games = pub.value?.features?.games
  if (!Array.isArray(games)) return []
  return games.filter(g => g.type)
})

const featureChips = computed(() => {
  const f = pub.value?.features
  if (!f || typeof f !== 'object') return []
  const out = []
  if (f.priceRange)   out.push(f.priceRange)
  if (f.nearStation)  out.push(`Near ${f.nearStation}`)
  if (f.englishOk)    out.push('English OK')
  if (f.englishMenu)  out.push('English menu')
  if (f.cardPayment)  out.push('Card payment')
  if (f.smokingRoom)  out.push('Smoking room')
  if (f.webCoin)      out.push('WebCoin')
  if (f.cover)        out.push(`Cover ${f.cover}`)
  return out
})

function getYoutubeEmbedUrl(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

const videoList = computed(() => {
  const vids = pub.value?.videos
  if (!Array.isArray(vids)) return []
  return vids.filter(v => v.url).map(v => ({
    ...v,
    embedUrl: getYoutubeEmbedUrl(v.url)
  }))
})

</script>
