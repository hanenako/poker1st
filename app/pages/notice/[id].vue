<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">

    <div v-if="pending" class="muted text-sm py-12">Loading...</div>

    <template v-else-if="notice">
      <div class="mb-6">
        <NuxtLink to="/notice" class="text-sm text-zinc-500 hover:text-zinc-900">← 공지사항</NuxtLink>
      </div>

      <!-- 커버 이미지 -->
      <div v-if="notice.coverImageUrl" class="surface-card overflow-hidden mb-6">
        <img :src="notice.coverImageUrl" :alt="notice.title" class="w-full object-cover max-h-80" />
      </div>

      <article class="surface-card p-6 sm:p-8">
        <!-- 헤더 -->
        <div class="mb-6">
          <div class="flex items-center gap-2 mb-3">
            <span v-if="notice.pinned" class="badge-ongoing">공지</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-semibold text-zinc-900 leading-tight">
            {{ notice.title }}
          </h1>
          <div class="mt-3 text-sm text-zinc-400">
            {{ fmtDate(notice.publishedAt) }}
            <span v-if="notice.author"> · {{ notice.author.name || notice.author.email }}</span>
          </div>
        </div>

        <hr class="border-zinc-100 mb-6" />

        <!-- 본문 -->
        <div class="prose prose-zinc max-w-none" v-html="notice.body" />

        <!-- 유튜브 embed -->
        <div v-if="embedUrl" class="mt-8">
          <div class="aspect-video rounded-lg overflow-hidden">
            <iframe
              :src="embedUrl"
              class="w-full h-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
        </div>
      </article>
    </template>

    <div v-else class="surface-card p-10 text-center muted">
      공지사항을 찾을 수 없습니다.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const route = useRoute()
const { data: notice, pending } = await useFetch(
  () => `/api/notices/${route.params.id}`
)

useSeoMeta({
  title:       computed(() => notice.value?.title ?? '공지사항'),
  description: computed(() => stripHtml(notice.value?.body ?? '').slice(0, 120)),
  ogTitle:     computed(() => `${notice.value?.title ?? '공지사항'} | PokerTripJP`)
})

// JSON-LD
useHead(computed(() => {
  const n = notice.value
  if (!n) return {}
  return {
    script: [{
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context':        'https://schema.org',
        '@type':           'NewsArticle',
        headline:           n.title,
        datePublished:      n.publishedAt ? String(n.publishedAt).slice(0, 10) : undefined,
        dateModified:       String(n.updatedAt || n.publishedAt || '').slice(0, 10) || undefined,
        publisher: {
          '@type': 'Organization',
          name:    'PokerTripJP'
        }
      })
    }]
  }
}))

const embedUrl = computed(() => {
  const url = notice.value?.videoUrl
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
})

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function fmtDate(d) {
  return d ? String(d).slice(0, 10) : ''
}
</script>
