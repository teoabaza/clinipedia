<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 class="font-semibold text-base text-slate-900">
            {{ existing ? `Edit ${label}` : `New ${label}` }}
          </h3>
          <button @click="$emit('close')" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 flex flex-col gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              v-model="title"
              type="text"
              :placeholder="`${label} name`"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @keydown.enter="save"
              ref="titleInput"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Colour</label>
            <ColorPicker v-model="color" />
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50">
          <button @click="$emit('close')" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button @click="save" class="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ColorPicker from './ColorPicker.vue'

const props = defineProps({
  type: { type: String, default: 'category' },
  existing: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const label = computed(() => props.type === 'category' ? 'Category' : 'Subcategory')
const title = ref(props.existing?.title || '')
const color = ref(props.existing?.color || '#2563eb')
const titleInput = ref(null)

onMounted(() => setTimeout(() => titleInput.value?.focus(), 50))

function save() {
  if (!title.value.trim()) return
  emit('saved', { title: title.value.trim(), color: color.value })
}
</script>
