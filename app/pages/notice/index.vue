<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
    <header class="mb-8">
      <h1 class="page-title">Notice</h1>
      <p class="mt-2 text-zinc-600">공지사항.</p>
    </header>

    <div v-if="pending" class="muted text-sm">Loading...</div>

    <div v-else-if="!notices?.length" class="surface-card p-10 text-center muted">
      아직 등록된 공지가 없습니다.
    </div>

    <div v-else class="space-y-3">
      <NuxtLink
        v-for="n in notices"
        :key="n.id"
        :to="`/notice/${n.id}`"
        class="surface-card p-5 block hover:bg-zinc-50 transition"
      >
        <div class="flex items-start gap-3">
          <span v-if="n.pinned" class="badge-ongoing mt-0.5 shrink-0">공지</span>
          <div class="flex-1 min-w-0">
            <h2 class="font-semibold text-zinc-900">{{ n.title }}</h2>
            <p class="mt-1.5 text-sm text-zinc-500 line-clamp-2">{{ stripHtml(n.body) }}</p>
            <div class="mt-2 text-xs text-zinc-400">
              {{ fmtDate(n.publishedAt) }}
              <span v-if="n.author"> · {{ n.author.name || n.author.email }}</span>
            </div>
          </div>
          <span v-if="n.videoUrl || n.coverImageUrl" class="text-zinc-300 text-xs shrink-0 mt-0.5">
            {{ n.videoUrl ? '▶' : '🖼' }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Notice',
  description: 'PokerTripJP 공지사항.',
  ogTitle: 'Notice | PokerTripJP',
  ogDescription: 'PokerTripJP 공지사항.'
})

const { data: notices, pending } = await useFetch('/api/notices')

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function fmtDate(d) {
  return d ? String(d).slice(0, 10) : ''
}
</script>
