<template>
  <div class="flex items-center gap-2 flex-wrap mt-1">
    <button
      v-for="color in presets"
      :key="color"
      type="button"
      @click="select(color)"
      class="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
      :style="{ background: color, borderColor: modelValue === color ? '#1e293b' : 'transparent' }"
      :title="color"
    />
    <input
      type="color"
      :value="modelValue"
      @input="select($event.target.value)"
      class="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent"
      title="Custom colour"
    />
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])

const presets = [
  '#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c',
  '#ca8a04', '#16a34a', '#0891b2', '#475569',
]

function select(color) {
  emit('update:modelValue', color)
}
</script>
