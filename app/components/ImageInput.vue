<!--
  ImageInput.vue
  URL 직접 입력 or S3 파일 업로드 — 둘 다 지원.

  Props:
    modelValue: string  — 현재 이미지 URL
    folder: string      — S3 저장 폴더 (default: 'uploads')
    placeholder: string

  Emits:
    update:modelValue
-->
<template>
  <div class="space-y-2">
    <!-- 탭 -->
    <div class="flex gap-1 text-xs font-medium">
      <button
        type="button"
        class="px-3 py-1 rounded-md transition"
        :class="mode === 'url' ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-500 hover:text-zinc-800'"
        @click="mode = 'url'"
      >URL 입력</button>
      <button
        type="button"
        class="px-3 py-1 rounded-md transition"
        :class="mode === 'upload' ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-500 hover:text-zinc-800'"
        @click="mode = 'upload'"
      >파일 업로드</button>
    </div>

    <!-- URL 입력 -->
    <div v-if="mode === 'url'">
      <input
        :value="modelValue"
        type="text"
        :placeholder="placeholder || 'https://...'"
        class="input-base"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>

    <!-- 파일 업로드 -->
    <div v-else>
      <div
        class="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 cursor-pointer hover:bg-zinc-100 transition"
        @click="fileInput?.click()"
      >
        <span class="text-zinc-400 text-lg">🖼️</span>
        <span class="text-sm text-zinc-600 flex-1">
          {{ uploading ? '업로드 중...' : (uploadedName || '클릭해서 이미지 선택') }}
        </span>
        <span v-if="uploading" class="text-xs text-indigo-500">잠시만요...</span>
        <span v-else-if="uploadedName" class="text-xs text-emerald-600">✓ 완료</span>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileChange"
      />
      <p v-if="uploadError" class="text-xs text-red-500 mt-1">{{ uploadError }}</p>
    </div>

    <!-- 현재 이미지 미리보기 -->
    <div v-if="modelValue" class="mt-2">
      <img
        :src="modelValue"
        alt="미리보기"
        class="max-h-40 rounded-lg object-contain border border-zinc-200"
        @error="$event.target.style.display = 'none'"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue:  { type: String, default: '' },
  folder:      { type: String, default: 'uploads' },
  placeholder: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const mode         = ref('url')
const fileInput    = ref(null)
const uploading    = ref(false)
const uploadError  = ref('')
const uploadedName = ref('')

async function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  uploading.value   = true
  uploadError.value = ''

  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', props.folder)

    const res = await $fetch('/api/admin/upload', { method: 'POST', body: fd })
    emit('update:modelValue', res.url)
    uploadedName.value = file.name
  } catch (err) {
    uploadError.value = err?.data?.statusMessage || '업로드 실패'
  } finally {
    uploading.value = false
    // input 초기화 (같은 파일 재업로드 허용)
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>
