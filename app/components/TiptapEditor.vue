<template>
  <div class="tiptap-wrapper border border-zinc-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
    <!-- 툴바 -->
    <div class="flex flex-wrap gap-0.5 px-2 py-1.5 border-b border-zinc-100 bg-zinc-50">
      <button
        v-for="btn in toolbar"
        :key="btn.label"
        type="button"
        class="px-2 py-1 text-xs rounded hover:bg-zinc-200 transition"
        :class="btn.active?.() ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-600'"
        :title="btn.label"
        @click="btn.action"
      >
        {{ btn.icon }}
      </button>
    </div>

    <!-- 에디터 -->
    <EditorContent :editor="editor" class="prose prose-sm max-w-none px-3 py-2 min-h-[160px] focus:outline-none" />
  </div>
</template>

<script setup>
import { watch, onBeforeUnmount, computed } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false })
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

onBeforeUnmount(() => editor.value?.destroy())

const toolbar = computed(() => [
  { icon: 'B',  label: 'Bold',        action: () => editor.value?.chain().focus().toggleBold().run(),        active: () => editor.value?.isActive('bold') },
  { icon: 'I',  label: 'Italic',      action: () => editor.value?.chain().focus().toggleItalic().run(),      active: () => editor.value?.isActive('italic') },
  { icon: 'S',  label: 'Strike',      action: () => editor.value?.chain().focus().toggleStrike().run(),      active: () => editor.value?.isActive('strike') },
  { icon: '—',  label: 'Divider', action: () => {} },
  { icon: 'H2', label: 'Heading 2',   action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(), active: () => editor.value?.isActive('heading', { level: 2 }) },
  { icon: 'H3', label: 'Heading 3',   action: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(), active: () => editor.value?.isActive('heading', { level: 3 }) },
  { icon: '≡',  label: 'Bullet list', action: () => editor.value?.chain().focus().toggleBulletList().run(),  active: () => editor.value?.isActive('bulletList') },
  { icon: '1.', label: 'Ordered list',action: () => editor.value?.chain().focus().toggleOrderedList().run(), active: () => editor.value?.isActive('orderedList') },
  { icon: '❝',  label: 'Blockquote',  action: () => editor.value?.chain().focus().toggleBlockquote().run(),  active: () => editor.value?.isActive('blockquote') },
  { icon: '—',  label: 'Divider', action: () => {} },
  { icon: '↩',  label: 'Undo',        action: () => editor.value?.chain().focus().undo().run() },
  { icon: '↪',  label: 'Redo',        action: () => editor.value?.chain().focus().redo().run() },
])
</script>

<style>
.tiptap-wrapper .ProseMirror {
  outline: none;
}
.tiptap-wrapper .ProseMirror h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.25rem; }
.tiptap-wrapper .ProseMirror h3 { font-size: 1.1rem;  font-weight: 600; margin: 0.5rem 0 0.25rem; }
.tiptap-wrapper .ProseMirror p  { margin: 0.25rem 0; }
.tiptap-wrapper .ProseMirror ul { list-style: disc;    padding-left: 1.5rem; }
.tiptap-wrapper .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; }
.tiptap-wrapper .ProseMirror blockquote { border-left: 3px solid #e4e4e7; padding-left: 1rem; color: #71717a; margin: 0.5rem 0; }
.tiptap-wrapper .ProseMirror strong { font-weight: 700; }
.tiptap-wrapper .ProseMirror em     { font-style: italic; }
.tiptap-wrapper .ProseMirror s      { text-decoration: line-through; }
</style>
