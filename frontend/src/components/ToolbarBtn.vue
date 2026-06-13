<template>
  <button
    type="button"
    :title="title"
    @click="$emit('click')"
    class="w-7 h-7 flex items-center justify-center rounded transition-colors"
    :class="active
      ? 'bg-blue-100 text-blue-700'
      : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  title: String,
  active: { type: Boolean, default: false },
})
defineEmits(['click'])
</script>
