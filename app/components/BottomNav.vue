<template>
  <nav class="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 backdrop-blur border-t border-zinc-200 safe-bottom">
    <div class="grid grid-cols-5 h-14">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center justify-center gap-0.5 text-zinc-400 transition"
        :class="isActive(item) ? 'text-indigo-600' : 'hover:text-zinc-700'"
      >
        <span class="text-lg leading-none">{{ item.icon }}</span>
        <span class="text-[10px] font-medium leading-none">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup>
const route = useRoute()
const { loggedIn } = useUserSession()

const items = computed(() => [
  { to: '/',            icon: '🏠', label: '홈' },
  { to: '/tournaments', icon: '🃏', label: '대회' },
  { to: '/schedule',    icon: '📅', label: '일정' },
  { to: '/pubs',        icon: '🎰', label: '포커룸' },
  loggedIn.value
    ? { to: '/me',        icon: '👤', label: '마이' }
    : { to: '/login',     icon: '🔑', label: '로그인' }
])

function isActive(item) {
  if (item.to === '/') return route.path === '/'
  return route.path.startsWith(item.to)
}
</script>
