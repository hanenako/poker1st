<template>
  <form class="space-y-6 max-w-3xl" @submit.prevent="onSubmit">

    <section class="surface-card p-5 space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">기본 정보</h3>

      <div>
        <label class="label-base">Slug</label>
        <input v-model="form.slug" required placeholder="sample-tokyo-pub" class="input-base font-mono" />
        <p class="hint">URL 식별자 — 영문 소문자/숫자/하이픈</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label-base">Name</label>
          <input v-model="form.name" required class="input-base" />
        </div>
        <div>
          <label class="label-base">Name (한국어)</label>
          <input v-model="form.nameKo" class="input-base" />
        </div>
      </div>

      <div>
        <label class="label-base">Name (일본어)</label>
        <input v-model="form.nameJa" class="input-base" />
      </div>
    </section>

    <section class="surface-card p-5 space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">위치</h3>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="label-base">Country</label>
          <select v-model="form.countryCode" class="input-base">
            <option value="JP">Japan</option>
            <option value="KR">Korea</option>
          </select>
        </div>
        <div>
          <label class="label-base">City</label>
          <input v-model="form.city" required placeholder="Tokyo" class="input-base" />
        </div>
        <div>
          <label class="label-base">District</label>
          <input v-model="form.district" placeholder="Shinjuku" class="input-base" />
        </div>
      </div>

      <div>
        <label class="label-base">Address</label>
        <input v-model="form.address" required class="input-base" />
      </div>
      <div>
        <label class="label-base">Address (한국어)</label>
        <input v-model="form.addressKo" class="input-base" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label-base">위도 (Latitude)</label>
          <input v-model="form.lat" type="number" step="0.000001" placeholder="35.6762" class="input-base font-mono" />
        </div>
        <div>
          <label class="label-base">경도 (Longitude)</label>
          <input v-model="form.lng" type="number" step="0.000001" placeholder="139.6503" class="input-base font-mono" />
        </div>
      </div>
      <p class="hint">
        Google Maps에서 원하는 위치 우클릭 → 좌표 복사. 지도 뷰에 핀이 표시됩니다.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label-base">가장 가까운 역</label>
          <input v-model="form.nearestStation" type="text" placeholder="新宿駅" class="input-base" />
        </div>
        <div>
          <label class="label-base">도보 시간 (분)</label>
          <input v-model.number="form.walkMinutes" type="number" min="1" max="60" placeholder="5" class="input-base" />
        </div>
      </div>
    </section>

    <section class="surface-card p-5 space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">연락처 & 링크</h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label-base">Phone</label>
          <input v-model="form.phone" type="tel" class="input-base" />
        </div>
        <div>
          <label class="label-base">Website URL</label>
          <input v-model="form.websiteUrl" type="text" placeholder="https://..." class="input-base" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="label-base">Twitter / X URL</label>
          <input v-model="form.twitterUrl" type="text" placeholder="https://x.com/handle" class="input-base" />
        </div>
        <div>
          <label class="label-base">Instagram URL</label>
          <input v-model="form.instagramUrl" type="text" placeholder="https://www.instagram.com/..." class="input-base" />
        </div>
        <div>
          <label class="label-base">YouTube URL</label>
          <input v-model="form.youtubeUrl" type="text" placeholder="https://youtube.com/@handle" class="input-base" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label-base">Flickr URL</label>
          <input v-model="form.flickrUrl" type="text" placeholder="https://flickr.com/photos/..." class="input-base" />
        </div>
      </div>
    </section>

    <section class="surface-card p-5 space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">영업시간</h3>
      <p class="hint">각 요일 시간 입력. 예: <code class="font-mono">17:00-02:00</code> / 휴무는 비워두세요.</p>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="d in weekdays" :key="d.key">
          <label class="label-base text-xs">{{ d.label }}</label>
          <input v-model="hoursInput[d.key]" placeholder="17:00-02:00" class="input-base text-xs" />
        </div>
      </div>
    </section>

    <section class="surface-card p-5 space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">게임 정보</h3>
      <p class="hint">운영 중인 게임 종류와 조건을 입력하세요. (링 게임, 토너먼트 등)</p>

      <div class="space-y-2">
        <div
          v-for="(g, i) in form.features.games"
          :key="i"
          class="flex items-center gap-2"
        >
          <input
            v-model="g.type"
            placeholder="Ring Game NLH"
            class="input-base w-40 shrink-0"
          />
          <input
            v-model="g.info"
            placeholder="1/2 min ¥10,000 · 매일 18시~"
            class="input-base flex-1"
          />
          <button
            type="button"
            class="text-zinc-400 hover:text-red-500 transition shrink-0 text-lg leading-none"
            @click="removeGame(i)"
          >×</button>
        </div>
      </div>

      <button type="button" class="btn-ghost text-sm" @click="addGame">+ 게임 추가</button>
    </section>

    <section class="surface-card p-5 space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">특징</h3>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="form.features.englishOk" type="checkbox" class="accent-indigo-600" />
          English OK
        </label>
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="form.features.englishMenu" type="checkbox" class="accent-indigo-600" />
          English menu
        </label>
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="form.features.cardPayment" type="checkbox" class="accent-indigo-600" />
          Card payment
        </label>
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="form.features.smokingRoom" type="checkbox" class="accent-indigo-600" />
          Smoking room
        </label>
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input v-model="form.features.webCoin" type="checkbox" class="accent-indigo-600" />
          WebCoin
        </label>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label-base">Near station</label>
          <input v-model="form.features.nearStation" placeholder="Shinjuku (3 min)" class="input-base" />
        </div>
        <div>
          <label class="label-base">Cover charge</label>
          <input v-model="form.features.cover" placeholder="¥1,000" class="input-base" />
        </div>
      </div>
    </section>

    <section class="surface-card p-5 space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">이미지 갤러리</h3>
      <p class="hint">포커룸 내부·외부 사진 URL. 드래그로 순서 변경 가능.</p>

      <div class="space-y-2">
        <div
          v-for="(img, i) in form.images"
          :key="i"
          draggable="true"
          class="flex items-center gap-2 rounded-lg transition-colors"
          :class="{
            'opacity-40': imgDragIndex === i,
            'ring-2 ring-indigo-400 ring-offset-1 bg-indigo-50': imgDragOverIndex === i && imgDragIndex !== i
          }"
          @dragstart="onImgDragStart(i, $event)"
          @dragover.prevent="onImgDragOver(i)"
          @dragleave="onImgDragLeave"
          @drop.prevent="onImgDrop(i)"
          @dragend="onImgDragEnd"
        >
          <span class="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 shrink-0 select-none text-lg leading-none px-0.5">⠿</span>
          <span class="text-zinc-400 text-xs shrink-0 w-4 text-center">{{ i + 1 }}</span>
          <!-- 미리보기 썸네일 -->
          <div class="w-10 h-10 rounded border border-zinc-200 overflow-hidden shrink-0 bg-zinc-50 flex items-center justify-center">
            <img v-if="img.url" :src="img.url" class="w-full h-full object-cover" @error="e => e.target.style.display='none'" />
            <span v-else class="text-zinc-300 text-xs">IMG</span>
          </div>
          <div class="flex-1 flex gap-1 min-w-0">
            <input
              v-model="img.url"
              placeholder="https://..."
              class="input-base flex-1 min-w-0"
            />
            <label class="shrink-0 flex items-center px-2 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 cursor-pointer transition text-zinc-500 text-sm" title="파일 업로드">
              <input type="file" accept="image/*" class="hidden" @change="e => uploadImage(e, img)" />
              {{ imgUploading === img ? '...' : '📁' }}
            </label>
          </div>
          <input
            v-model="img.caption"
            placeholder="캡션 (선택)"
            class="input-base w-32 shrink-0"
          />
          <button
            type="button"
            class="text-zinc-400 hover:text-red-500 transition shrink-0 text-lg leading-none"
            @click="removeImage(i)"
          >×</button>
        </div>
      </div>

      <button type="button" class="btn-ghost text-sm" @click="addImage">+ 이미지 추가</button>
    </section>

    <section class="surface-card p-5 space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">미디어 영상</h3>
      <p class="hint">YouTube 등 이 장소가 나온 영상 URL. 드래그로 순서 변경 가능.</p>

      <div class="space-y-2">
        <div
          v-for="(v, i) in form.videos"
          :key="i"
          draggable="true"
          class="flex items-center gap-2 rounded-lg transition-colors"
          :class="{
            'opacity-40': dragIndex === i,
            'ring-2 ring-indigo-400 ring-offset-1 bg-indigo-50': dragOverIndex === i && dragIndex !== i
          }"
          @dragstart="onDragStart(i, $event)"
          @dragover.prevent="onDragOver(i)"
          @dragleave="onDragLeave"
          @drop.prevent="onDrop(i)"
          @dragend="onDragEnd"
        >
          <!-- 드래그 핸들 -->
          <span
            class="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 shrink-0 select-none text-lg leading-none px-0.5"
            title="드래그해서 순서 변경"
          >⠿</span>
          <span class="text-zinc-400 text-xs shrink-0 w-4 text-center">{{ i + 1 }}</span>
          <input
            v-model="v.title"
            placeholder="영상 제목"
            class="input-base w-36 shrink-0"
          />
          <input
            v-model="v.url"
            placeholder="https://youtube.com/watch?v=..."
            class="input-base flex-1"
          />
          <button
            type="button"
            class="text-zinc-400 hover:text-red-500 transition shrink-0 text-lg leading-none"
            @click="removeVideo(i)"
          >×</button>
        </div>
      </div>

      <button type="button" class="btn-ghost text-sm" @click="addVideo">+ 영상 추가</button>
    </section>

    <section class="surface-card p-5 space-y-4">
      <h3 class="text-sm font-semibold text-zinc-900">설명 & 커버 이미지</h3>

      <div>
        <label class="label-base">Cover image</label>
        <ImageInput v-model="form.coverImageUrl" folder="pubs/covers" />
      </div>

      <div>
        <label class="label-base">Description</label>
        <textarea v-model="form.description" rows="3" class="input-base" />
      </div>
      <div>
        <label class="label-base">Description (한국어)</label>
        <textarea v-model="form.descriptionKo" rows="3" class="input-base" />
      </div>
      <div>
        <label class="label-base">Description (日本語)</label>
        <textarea v-model="form.descriptionJa" rows="3" class="input-base" />
      </div>
    </section>

    <!-- 특별 공지 -->
    <section class="surface-card p-5 space-y-4">
      <div>
        <h3 class="text-sm font-semibold text-zinc-900">특별 공지</h3>
        <p class="text-xs text-zinc-400 mt-0.5">이번 주 이벤트, 임시 휴무 등 단기 공지. 만료일 지나면 자동으로 숨겨집니다.</p>
      </div>
      <div>
        <label class="label-base">공지 내용</label>
        <textarea v-model="form.notice" rows="2" placeholder="예) 이번 주 토요일 특별 토너먼트 개최 (바이인 ¥10,000)" class="input-base" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label-base">공지 만료일</label>
          <input v-model="form.noticeUntil" type="date" class="input-base" />
          <p class="hint">이 날짜까지 공지가 표시됩니다. 비워두면 항상 표시.</p>
        </div>
        <div>
          <label class="label-base">공지 이미지</label>
          <ImageInput v-model="form.noticeImageUrl" folder="pubs/notices" />
        </div>
        <div>
          <label class="label-base">상세보기 링크 URL</label>
          <input v-model="form.noticeUrl" type="text" placeholder="https://twitter.com/..." class="input-base" />
          <p class="hint">공지 하단에 "상세보기 →" 링크로 표시됩니다.</p>
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
      <NuxtLink to="/admin/pubs" class="btn-ghost">Cancel</NuxtLink>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  initial:     { type: Object,  default: null },
  submitting:  { type: Boolean, default: false },
  errorMsg:    { type: String,  default: '' },
  submitLabel: { type: String,  default: 'Save' }
})

const emit = defineEmits(['submit'])

const weekdays = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' }
]

function parseHours(hours) {
  const result = {}
  if (!hours || typeof hours !== 'object') return result
  for (const d of weekdays) {
    const v = hours[d.key]
    result[d.key] = Array.isArray(v) ? v[0] ?? '' : (v ?? '')
  }
  return result
}

function buildHours(input) {
  const result = {}
  for (const d of weekdays) {
    if (input[d.key]) result[d.key] = [input[d.key]]
  }
  return Object.keys(result).length ? result : undefined
}

function parseGames(features) {
  const g = features?.games
  if (Array.isArray(g)) return g.map(x => ({ type: x.type ?? '', info: x.info ?? '' }))
  return []
}

function parseVideos(videos) {
  if (Array.isArray(videos)) return videos.map(x => ({ url: x.url ?? '', title: x.title ?? '' }))
  return []
}

function parseImages(images) {
  if (Array.isArray(images)) return images.map(x => ({ url: x.url ?? '', caption: x.caption ?? '' }))
  return []
}

function fromInitial(init) {
  const feat = (init?.features && typeof init.features === 'object') ? init.features : {}
  return {
    slug:          init?.slug          ?? '',
    name:          init?.name          ?? '',
    nameKo:        init?.nameKo        ?? '',
    nameJa:        init?.nameJa        ?? '',
    countryCode:   init?.countryCode   ?? 'JP',
    city:          init?.city          ?? '',
    district:      init?.district      ?? '',
    address:       init?.address       ?? '',
    addressKo:      init?.addressKo      ?? '',
    nearestStation: init?.nearestStation ?? '',
    walkMinutes:    init?.walkMinutes    ?? '',
    phone:          init?.phone          ?? '',
    websiteUrl:    init?.websiteUrl    ?? '',
    twitterUrl:    init?.twitterUrl    ?? '',
    instagramUrl:  init?.instagramUrl  ?? '',
    youtubeUrl:    init?.youtubeUrl    ?? '',
    flickrUrl:     init?.flickrUrl     ?? '',
    lat:           init?.lat            ?? '',
    lng:           init?.lng            ?? '',
    coverImageUrl:  init?.coverImageUrl  ?? '',
    notice:         init?.notice         ?? '',
    noticeUntil:    init?.noticeUntil    ? String(init.noticeUntil).slice(0, 10) : '',
    noticeImageUrl: init?.noticeImageUrl ?? '',
    noticeUrl:      init?.noticeUrl      ?? '',
    description:    init?.description    ?? '',
    descriptionKo: init?.descriptionKo ?? '',
    descriptionJa: init?.descriptionJa ?? '',
    published:     !!init?.publishedAt,
    features: {
      englishOk:    !!feat.englishOk,
      englishMenu:  !!feat.englishMenu,
      cardPayment:  !!feat.cardPayment,
      smokingRoom:  !!(feat.smokingRoom ?? feat.smoking), // 구 필드 호환
      webCoin:      !!feat.webCoin,
      nearStation:  feat.nearStation  ?? '',
      cover:        feat.cover        ?? '',
      games:        parseGames(feat)
    },
    videos: parseVideos(init?.videos),
    images: parseImages(init?.images)
  }
}

const form       = reactive(fromInitial(props.initial))
const hoursInput = reactive(parseHours(props.initial?.hours))

watch(
  () => props.initial,
  (v) => {
    if (v) {
      const fresh = fromInitial(v)
      Object.assign(form, fresh)
      Object.assign(hoursInput, parseHours(v.hours))
    }
  }
)

// 갤러리 인라인 업로드
const imgUploading = ref(null)
async function uploadImage(e, img) {
  const file = e.target.files?.[0]
  if (!file) return
  imgUploading.value = img
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'pubs/gallery')
    const res = await $fetch('/api/admin/upload', { method: 'POST', body: fd })
    img.url = res.url
  } catch (err) {
    alert(err?.data?.statusMessage || '업로드 실패')
  } finally {
    imgUploading.value = null
    e.target.value = ''
  }
}

function addGame()       { form.features.games.push({ type: '', info: '' }) }
function removeGame(i)   { form.features.games.splice(i, 1) }
function addVideo()      { form.videos.push({ url: '', title: '' }) }
function removeVideo(i)  { form.videos.splice(i, 1) }
function addImage()      { form.images.push({ url: '', caption: '' }) }
function removeImage(i)  { form.images.splice(i, 1) }

// 영상 드래그 정렬
const dragIndex     = ref(null)
const dragOverIndex = ref(null)

function onDragStart(i, e) {
  dragIndex.value = i
  e.dataTransfer.effectAllowed = 'move'
}
function onDragOver(i) { dragOverIndex.value = i }
function onDragLeave() { dragOverIndex.value = null }
function onDrop(toIndex) {
  const from = dragIndex.value
  if (from === null || from === toIndex) return
  const moved = form.videos.splice(from, 1)[0]
  form.videos.splice(toIndex, 0, moved)
}
function onDragEnd() {
  dragIndex.value     = null
  dragOverIndex.value = null
}

// 이미지 드래그 정렬
const imgDragIndex     = ref(null)
const imgDragOverIndex = ref(null)

function onImgDragStart(i, e) {
  imgDragIndex.value = i
  e.dataTransfer.effectAllowed = 'move'
}
function onImgDragOver(i) { imgDragOverIndex.value = i }
function onImgDragLeave() { imgDragOverIndex.value = null }
function onImgDrop(toIndex) {
  const from = imgDragIndex.value
  if (from === null || from === toIndex) return
  const moved = form.images.splice(from, 1)[0]
  form.images.splice(toIndex, 0, moved)
}
function onImgDragEnd() {
  imgDragIndex.value     = null
  imgDragOverIndex.value = null
}

function onSubmit() {
  const payload = {
    ...form,
    hours: buildHours(hoursInput),
    features: {
      ...form.features,
      games: form.features.games.filter(g => g.type || g.info)
    },
    videos: form.videos.filter(v => v.url),
    images: form.images.filter(img => img.url)
  }
  // 빈 문자열 → null
  // 숫자 필드 변환
  payload.lat = payload.lat !== '' ? Number(payload.lat) : null
  payload.lng = payload.lng !== '' ? Number(payload.lng) : null

  for (const k of ['nameKo', 'nameJa', 'district', 'addressKo', 'phone', 'websiteUrl', 'twitterUrl', 'instagramUrl', 'youtubeUrl', 'flickrUrl', 'coverImageUrl', 'notice', 'noticeUntil', 'noticeImageUrl', 'noticeUrl', 'description', 'descriptionKo', 'descriptionJa']) {
    if (payload[k] === '') payload[k] = null
  }
  emit('submit', payload)
}
</script>
