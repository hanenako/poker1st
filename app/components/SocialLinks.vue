<template>
  <div v-if="links.length" class="flex items-center gap-1.5">
    <a
      v-for="link in links"
      :key="link.href"
      :href="link.href"
      target="_blank"
      rel="noopener noreferrer"
      :title="link.label"
      class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50 transition"
    >
      <!-- Globe / Website -->
      <svg v-if="link.type === 'web'" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      <!-- X / Twitter -->
      <svg v-else-if="link.type === 'twitter'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.622 5.907-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
      <!-- Instagram -->
      <svg v-else-if="link.type === 'instagram'" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
      <!-- YouTube -->
      <svg v-else-if="link.type === 'youtube'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
      <!-- Flickr -->
      <svg v-else-if="link.type === 'flickr'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="7" cy="12" r="5"/>
        <circle cx="17" cy="12" r="5"/>
      </svg>
    </a>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  websiteUrl:   { type: String, default: null },
  twitterUrl:   { type: String, default: null },
  instagramUrl: { type: String, default: null },
  youtubeUrl:   { type: String, default: null },
  flickrUrl:    { type: String, default: null }
})

const links = computed(() => {
  const out = []
  if (props.websiteUrl)   out.push({ type: 'web',       href: props.websiteUrl,   label: 'Website' })
  if (props.twitterUrl)   out.push({ type: 'twitter',   href: props.twitterUrl,   label: 'Twitter / X' })
  if (props.instagramUrl) out.push({ type: 'instagram', href: props.instagramUrl, label: 'Instagram' })
  if (props.youtubeUrl)   out.push({ type: 'youtube',   href: props.youtubeUrl,   label: 'YouTube' })
  if (props.flickrUrl)    out.push({ type: 'flickr',    href: props.flickrUrl,    label: 'Flickr' })
  return out
})
</script>
