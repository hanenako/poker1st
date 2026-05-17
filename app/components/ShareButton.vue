<template>
  <div class="relative inline-block" ref="wrapRef">
    <button
      class="btn-ghost gap-1.5 text-sm"
      @click="toggle"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
      </svg>
      공유
    </button>

    <!-- 드롭다운 — body에 teleport해서 overflow:hidden 클리핑 방지 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="open"
          :style="dropdownStyle"
          class="fixed w-44 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 z-[9999] origin-top-left"
        >
          <button
            class="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition"
            @click="copyLink"
          >
            <span>🔗</span> 링크 복사
          </button>
          <a
            :href="kakaoUrl"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition"
            @click="open = false"
          >
            <span>💬</span> 카카오톡
          </a>
          <a
            :href="twitterUrl"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition"
            @click="open = false"
          >
            <span>🐦</span> Twitter / X
          </a>
        </div>
      </Transition>

      <!-- 복사 완료 토스트 -->
      <Transition
        enter-active-class="transition duration-200"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="copied"
          :style="toastStyle"
          class="fixed bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-[9999]"
        >
          링크 복사됨 ✓
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  url:   { type: String, default: '' }
})

const open    = ref(false)
const copied  = ref(false)
const wrapRef = ref(null)

// 버튼의 뷰포트 기준 위치 (fixed positioning에서는 scrollY 불필요)
const btnRect = ref({ top: 0, left: 0, bottom: 0, right: 0, width: 0 })

function updateRect() {
  if (!wrapRef.value) return
  const r = wrapRef.value.getBoundingClientRect()
  btnRect.value = { top: r.top, left: r.left, bottom: r.bottom, right: r.right, width: r.width }
}

// 버튼 왼쪽 정렬 기준, 화면 오른쪽 넘치면 오른쪽 정렬
const dropdownStyle = computed(() => {
  const DROPDOWN_W = 176 // w-44
  const left = btnRect.value.left
  const overflows = left + DROPDOWN_W > window.innerWidth - 8
  return {
    top:  `${btnRect.value.bottom + 4}px`,
    left: overflows
      ? `${btnRect.value.right - DROPDOWN_W}px`
      : `${left}px`,
  }
})

const toastStyle = computed(() => ({
  top:  `${btnRect.value.bottom + 4}px`,
  left: `${btnRect.value.left}px`,
}))

const fullUrl = computed(() => {
  if (props.url) return props.url
  if (import.meta.client) return window.location.href
  return ''
})

const twitterUrl = computed(() =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.title)}&url=${encodeURIComponent(fullUrl.value)}`
)

const kakaoUrl = computed(() =>
  `https://story.kakao.com/share?url=${encodeURIComponent(fullUrl.value)}`
)

function toggle() {
  updateRect()
  open.value = !open.value
}

async function copyLink() {
  open.value = false
  try {
    await navigator.clipboard.writeText(fullUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const el = document.createElement('textarea')
    el.value = fullUrl.value
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

function onClickOutside(e) {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) open.value = false
}

function onScroll() { if (open.value) updateRect() }

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>
