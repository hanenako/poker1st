<template>
  <div>
    <header class="mb-6">
      <div class="mb-2">
        <NuxtLink to="/admin/brands" class="text-sm text-zinc-500 hover:text-zinc-900">← Brands</NuxtLink>
      </div>
      <h1 class="page-title">Create brand</h1>
    </header>

    <form class="space-y-5 max-w-xl" @submit.prevent="onSubmit">
      <div class="surface-card p-5 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label-base">Slug <span class="text-red-500">*</span></label>
            <input v-model="form.slug" required placeholder="jopt" class="input-base font-mono" />
            <p class="hint">영문 소문자/숫자/하이픈</p>
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
          <div class="sm:col-span-1">
            <label class="label-base">Name <span class="text-red-500">*</span></label>
            <input v-model="form.name" required placeholder="JOPT" class="input-base" />
          </div>
          <div>
            <label class="label-base">Name (한국어)</label>
            <input v-model="form.nameKo" placeholder="제이오피티" class="input-base" />
          </div>
          <div>
            <label class="label-base">Name (일본어)</label>
            <input v-model="form.nameJa" placeholder="JOPT" class="input-base" />
          </div>
        </div>

        <div>
          <label class="label-base">Logo URL</label>
          <input v-model="form.logoUrl" type="text" placeholder="https://... 또는 /images/logo.jpg" class="input-base" />
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
          {{ submitting ? 'Saving...' : 'Create' }}
        </button>
        <NuxtLink to="/admin/brands" class="btn-ghost">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

definePageMeta({ layout: 'admin' })

const router     = useRouter()
const submitting = ref(false)
const errorMsg   = ref('')

const form = reactive({
  slug: '', name: '', nameKo: '', nameJa: '',
  countryCode: 'JP', logoUrl: '', websiteUrl: '', twitterUrl: '', instagramUrl: '', youtubeUrl: '', flickrUrl: '',
  description: '', descriptionKo: '', descriptionJa: ''
})

async function onSubmit() {
  submitting.value = true
  errorMsg.value   = ''
  try {
    const created = await $fetch('/api/admin/brands', { method: 'POST', body: form })
    router.push(`/admin/brands/${created.id}/edit`)
  } catch (e) {
    errorMsg.value = e?.data?.statusMessage || e?.statusMessage || '저장 실패'
  } finally {
    submitting.value = false
  }
}
</script>
