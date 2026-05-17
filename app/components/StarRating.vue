<template>
  <div class="inline-flex items-center gap-0.5" :class="sizeClass">
    <button
      v-for="i in 5"
      :key="i"
      type="button"
      :disabled="readonly"
      class="leading-none transition-colors"
      :class="[
        readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
        i <= hovered ? 'text-amber-400' : i <= current ? 'text-amber-400' : 'text-zinc-300'
      ]"
      @mouseenter="!readonly && (hovered = i)"
      @mouseleave="!readonly && (hovered = 0)"
      @click="!readonly && select(i)"
    >★</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  value:      { type: Number, default: 0 },   // readonly용
  readonly:   { type: Boolean, default: false },
  size:       { type: String, default: 'md' }  // xs | sm | md | lg
})
const emit = defineEmits(['update:modelValue'])

const hovered = ref(0)
const current = computed(() => props.readonly ? props.value : props.modelValue)

const sizeClass = computed(() => ({
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl'
}[props.size] ?? 'text-base'))

function select(i) {
  emit('update:modelValue', i)
}
</script>
