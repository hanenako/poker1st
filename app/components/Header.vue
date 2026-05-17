<template>
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-zinc-200 dark:bg-zinc-900/90 dark:border-zinc-800">
    <div class="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
      <!-- Logo + nav -->
      <div class="flex items-center gap-8">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 text-zinc-900 font-semibold tracking-tight dark:text-zinc-50"
          @click="mobileOpen = false"
        >
          <span class="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white text-sm">
            ♠
          </span>
          <span>PokerTripJP</span>
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 rounded-md transition dark:text-zinc-400 dark:hover:text-zinc-100"
            active-class="text-zinc-900 bg-zinc-100 dark:text-zinc-50 dark:bg-zinc-800"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>

      <!-- Right -->
      <div class="flex items-center gap-2">
        <!-- 언어 선택 드롭다운 -->
        <div class="relative hidden sm:block" ref="langRef">
          <button
            class="flex items-center gap-1 h-8 px-2 w-[4.5rem] rounded-md text-xs font-semibold border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            @click="langOpen = !langOpen"
          >
            <span>{{ currentLocale.flag }}</span>
            <span>{{ currentLocale.value.toUpperCase() }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="opacity-50">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="langOpen"
              class="absolute right-0 mt-1 w-36 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 z-50 origin-top-right dark:bg-zinc-900 dark:border-zinc-700"
            >
              <button
                v-for="loc in LOCALES"
                :key="loc.value"
                class="flex items-center gap-2.5 w-full px-3 py-2 text-sm transition"
                :class="locale === loc.value
                  ? 'text-indigo-600 font-semibold bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800'"
                @click="setLocale(loc.value); langOpen = false"
              >
                <span>{{ loc.flag }}</span>
                <span>{{ loc.label }}</span>
                <svg v-if="locale === loc.value" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="ml-auto text-indigo-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
            </div>
          </Transition>
        </div>

        <!-- 다크모드 토글 -->
        <button
          class="flex items-center justify-center w-9 h-9 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
          :title="isDark ? 'Light mode' : 'Dark mode'"
          @click="toggleColor"
        >
          <!-- Moon (라이트 모드일 때 → 누르면 다크) -->
          <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>
          </svg>
          <!-- Sun (다크 모드일 때 → 누르면 라이트) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>

        <!-- 즐겨찾기 -->
        <NuxtLink
          to="/favorites"
          class="flex items-center justify-center w-9 h-9 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
          title="즐겨찾기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </NuxtLink>

        <!-- 검색 -->
        <NuxtLink
          to="/search"
          class="flex items-center justify-center w-9 h-9 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
          title="검색"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="m21 21-4.35-4.35"/>
          </svg>
        </NuxtLink>
        <!-- 어드민 로그인 상태일 때만 표시 -->
        <template v-if="loggedIn && user?.role === 'ADMIN'">
          <NuxtLink
            to="/admin"
            class="hidden sm:inline-flex btn-ghost text-sm"
          >
            Admin
          </NuxtLink>
          <button class="hidden sm:inline-flex btn-secondary text-sm" @click="onLogout">Logout</button>
        </template>

        <!-- 햄버거 버튼 (모바일) -->
        <button
          class="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-zinc-600 hover:bg-zinc-100 transition"
          :aria-label="mobileOpen ? '메뉴 닫기' : '메뉴 열기'"
          @click="mobileOpen = !mobileOpen"
        >
          <svg v-if="!mobileOpen" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 모바일 드로어 -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileOpen" class="md:hidden border-t border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800">
        <nav class="px-4 py-3 space-y-0.5">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center px-3 py-2.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
            active-class="text-zinc-900 bg-zinc-100 font-medium dark:text-zinc-50 dark:bg-zinc-800"
            @click="mobileOpen = false"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="px-4 py-3 border-t border-zinc-100 space-y-2 dark:border-zinc-800">
          <!-- 모바일 언어 선택 -->
          <div class="px-3 py-2">
            <div class="text-xs text-zinc-400 mb-2">언어 / Language</div>
            <div class="flex gap-2">
              <button
                v-for="loc in LOCALES"
                :key="loc.value"
                class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm border transition"
                :class="locale === loc.value
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'"
                @click="setLocale(loc.value)"
              >
                <span>{{ loc.flag }}</span>
                <span>{{ loc.value.toUpperCase() }}</span>
              </button>
            </div>
          </div>
          <!-- 어드민 로그인 상태일 때만 표시 -->
          <template v-if="loggedIn && user?.role === 'ADMIN'">
            <NuxtLink
              to="/admin"
              class="flex items-center px-3 py-2.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition"
              @click="mobileOpen = false"
            >
              Admin
            </NuxtLink>
            <button
              class="w-full text-left px-3 py-2.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition"
              @click="onLogout"
            >
              Logout
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { LOCALES } from '~/composables/useLocale'

const { loggedIn, user, clear } = useUserSession()
const { locale, setLocale, currentLocale } = useLocale()
const { isDark, toggle: toggleColor } = useColorMode()

const langOpen = ref(false)
const langRef  = ref(null)

// 외부 클릭 시 드롭다운 닫기
function onLangClickOutside(e) {
  if (langRef.value && !langRef.value.contains(e.target)) langOpen.value = false
}
onMounted(() => document.addEventListener('click', onLangClickOutside))
onUnmounted(() => document.removeEventListener('click', onLangClickOutside))
const router = useRouter()
const route  = useRoute()

const mobileOpen = ref(false)

// 라우트 변경 시 자동으로 드로어 닫기
watch(() => route.path, () => { mobileOpen.value = false })

const navItems = [
  { to: '/brands',      label: 'Brands' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/schedule',    label: 'Schedule' },
  { to: '/pubs',        label: 'PokerRooms' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/guide',       label: 'Guide' },
  { to: '/about',       label: 'About' },
  { to: '/notice',      label: 'Notice' }
]

async function onLogout() {
  mobileOpen.value = false
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  router.push('/')
}
</script>
