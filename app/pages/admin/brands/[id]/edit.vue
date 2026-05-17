<template>
  <div>
    <header class="mb-6">
      <div class="mb-2">
        <NuxtLink to="/admin/brands" class="text-sm text-zinc-500 hover:text-zinc-900">← Brands</NuxtLink>
      </div>
      <h1 class="page-title">Edit brand</h1>
    </header>

    <div v-if="pending" class="muted text-sm">Loading...</div>

    <form v-else-if="brand" class="space-y-5 max-w-xl" @submit.prevent="onSubmit">
      <div class="surface-card p-5 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label-base">Slug <span class="text-red-500">*</span></label>
            <input v-model="form.slug" required class="input-base font-mono" />
          </div>
          <div>
            <label class="label-base">Country</label>
            <select v-model="form.countryCode" class="input-base">
              <option value="JP">Japan</option>
              <option value="KR">Korea</option>
              <option value="TW">Taiwan</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="label-base">Name <span class="text-red-500">*</span></label>
            <input v-model="form.name" required class="input-base" />
          </div>
          <div>
            <label class="label-base">Name (한국어)</label>
            <input v-model="form.nameKo" class="input-base" />
          </div>
          <div>
            <label class="label-base">Name (일본어)</label>
            <input v-model="form.nameJa" class="input-base" />
          </div>
        </div>

        <!-- 로고 미리보기 -->
        <div>
          <label class="label-base">Logo URL</label>
          <div class="flex items-center gap-3">
            <input v-model="form.logoUrl" type="text" placeholder="https://... 또는 /images/logo.jpg" class="input-base" />
            <div v-if="form.logoUrl" class="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 shrink-0 overflow-hidden">
              <img :src="form.logoUrl" class="h-8 w-8 object-contain" @error="e => e.target.style.display='none'" />
            </div>
          </div>
        </div>

        <div>
          <label class="label-base">Website URL</label>
          <input v-model="form.websiteUrl" type="text" placeholder="https://example.com" class="input-base" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="label-base">Twitter / X URL</label>
            <input v-model="form.twitterUrl" type="text" placeholder="https://x.com/handle" class="input-base" />
          </div>
          <div>
            <label class="label-base">Instagram URL</label>
            <input v-model="form.instagramUrl" type="text" placeholder="https://instagram.com/handle" class="input-base" />
          </div>
          <div>
            <label class="label-base">YouTube URL</label>
            <input v-model="form.youtubeUrl" type="text" placeholder="https://youtube.com/@handle" class="input-base" />
          </div>
          <div>
            <label class="label-base">Flickr URL</label>
            <input v-model="form.flickrUrl" type="text" placeholder="https://flickr.com/photos/..." class="input-base" />
          </div>
        </div>

        <div>
          <label class="label-base">Description (한국어)</label>
          <textarea v-model="form.descriptionKo" rows="2" class="input-base" />
        </div>
        <div>
          <label class="label-base">Description (日本語)</label>
          <textarea v-model="form.descriptionJa" rows="2" class="input-base" />
        </div>
        <div>
          <label class="label-base">Description (English)</label>
          <textarea v-model="form.description" rows="2" class="input-base" />
        </div>
      </div>

      <div v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</div>

      <div class="flex gap-3">
        <button type="submit" :disabled="submitting" class="btn-primary">
          {{ submitting ? 'Saving...' : 'Save' }}
        </button>
        <NuxtLink to="/admin/brands" class="btn-ghost">Cancel</NuxtLink>
      </div>
    </form>

    <div v-else class="surface-card p-10 text-center muted">브랜드를 찾을 수 없습니다.</div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

definePageMeta({ layout: 'admin' })

const route      = useRoute()
const id         = Number(route.params.id)
const submitting = ref(false)
const errorMsg   = ref('')

const { data: brand, pending } = await useFetch(`/api/admin/brands/${id}`)

const form = reactive({
  slug: '', name: '', nameKo: '', nameJa: '',
  countryCode: 'JP', logoUrl: '', websiteUrl: '', twitterUrl: '', instagramUrl: '', youtubeUrl: '', flickrUrl: '',
  description: '', descriptionKo: '', descriptionJa: ''
})

watch(brand, (b) => {
  if (!b) return
  form.slug         = b.slug         ?? ''
  form.name         = b.name         ?? ''
  form.nameKo       = b.nameKo       ?? ''
  form.nameJa       = b.nameJa       ?? ''
  form.countryCode  = b.countryCode  ?? 'JP'
  form.logoUrl      = b.logoUrl      ?? ''
  form.websiteUrl   = b.websiteUrl   ?? ''
  form.twitterUrl   = b.twitterUrl   ?? ''
  form.instagramUrl = b.instagramUrl ?? ''
  form.youtubeUrl    = b.youtubeUrl    ?? ''
  form.flickrUrl     = b.flickrUrl     ?? ''
  form.description   = b.description   ?? ''
  form.descriptionKo = b.descriptionKo ?? ''
  form.descriptionJa = b.descriptionJa ?? ''
}, { immediate: true })

async function onSubmit() {
  submitting.value = true
  errorMsg.value   = ''
  try {
    await $fetch(`/api/admin/brands/${id}`, { method: 'PUT', body: form })
    alert('저장되었습니다.')
  } catch (e) {
    errorMsg.value = e?.data?.statusMessage || e?.statusMessage || '저장 실패'
  } finally {
    submitting.value = false
  }
}
</script>
