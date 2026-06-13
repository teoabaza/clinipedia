<template>
  <div
    class="relative bg-white border border-slate-200 rounded-r-xl p-5 group"
    :style="{ borderLeft: `4px solid ${fragment.color || '#94a3b8'}` }"
  >
    <div v-if="fragment.title" class="font-semibold text-sm text-slate-700 mb-2">
      {{ fragment.title }}
    </div>
    <div class="prose prose-sm max-w-none text-slate-700" v-html="fragment.content"></div>

    <!-- Actions -->
    <div class="absolute top-3 right-3 hidden group-hover:flex gap-1">
      <button
        @click="$emit('edit')"
        class="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors"
        title="Edit"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button
        @click="$emit('delete')"
        class="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors"
        title="Delete"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({ fragment: Object })
defineEmits(['edit', 'delete'])
</script>
