<template>
  <div class="min-h-screen">
    <header class="bg-white border-b border-zinc-200">
      <div class="max-w-7xl mx-auto px-6 sm:px-12 h-14 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <NuxtLink to="/admin" class="font-semibold tracking-tight">
            Admin
          </NuxtLink>
          <nav class="flex items-center gap-1">
            <NuxtLink
              to="/admin"
              class="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 rounded-md transition"
              :class="{ 'text-zinc-900 bg-zinc-100': route.path === '/admin' }"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/admin/brands"
              class="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 rounded-md transition"
              :class="{ 'text-zinc-900 bg-zinc-100': route.path.startsWith('/admin/brands') }"
            >
              Brands
            </NuxtLink>
            <NuxtLink
              to="/admin/tournaments"
              class="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 rounded-md transition"
              :class="{ 'text-zinc-900 bg-zinc-100': route.path.startsWith('/admin/tournaments') }"
            >
              Tournaments
            </NuxtLink>
            <NuxtLink
              to="/admin/pubs"
              class="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 rounded-md transition"
              :class="{ 'text-zinc-900 bg-zinc-100': route.path.startsWith('/admin/pubs') }"
            >
              PokerRooms
            </NuxtLink>
            <NuxtLink
              to="/admin/notices"
              class="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 rounded-md transition"
              :class="{ 'text-zinc-900 bg-zinc-100': route.path.startsWith('/admin/notices') }"
            >
              Notices
            </NuxtLink>
            <NuxtLink
              to="/admin/users"
              class="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 rounded-md transition"
              :class="{ 'text-zinc-900 bg-zinc-100': route.path.startsWith('/admin/users') }"
            >
              Users
            </NuxtLink>
            <NuxtLink
              to="/admin/stats"
              class="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 rounded-md transition"
              :class="{ 'text-zinc-900 bg-zinc-100': route.path.startsWith('/admin/stats') }"
            >
              Stats
            </NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="btn-ghost">
            <span class="text-sm">View site</span>
          </NuxtLink>
          <span class="hidden sm:inline text-sm text-zinc-500">{{ user?.email }}</span>
          <button class="btn-secondary" @click="onLogout">Logout</button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 sm:px-12 py-10">
      <slot />
    </main>
  </div>
</template>

<script setup>
const { user, clear } = useUserSession()
const router = useRouter()
const route = useRoute()

async function onLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  router.push('/')
}
</script>
