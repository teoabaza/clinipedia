<template>
  <div
    class="relative bg-white border border-slate-200 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 group overflow-hidden"
    @click="$emit('click')"
  >
    <!-- Colour bar -->
    <div class="absolute top-0 left-0 right-0 h-1 rounded-t-xl" :style="{ background: node.color }"></div>

    <!-- Action buttons — always visible on touch, hover on desktop -->
    <div class="absolute top-2.5 right-2.5 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
      <button
        @click.stop="$emit('edit')"
        class="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors shadow-sm"
        title="Edit"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button
        @click.stop="$emit('delete')"
        class="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
        title="Delete"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>

    <!-- Icon -->
    <div
      class="w-9 h-9 rounded-lg flex items-center justify-center mb-3 mt-1"
      :style="{ background: hexToRgba(node.color, 0.1) }"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" :stroke="node.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path v-if="node.type === 'category'" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        <template v-else>
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M9 3v18M3 9h6M3 15h6"/>
        </template>
      </svg>
    </div>

    <div class="font-semibold text-sm text-slate-800 mb-0.5 break-words pr-14">{{ node.title || 'Untitled' }}</div>
    <div class="text-xs text-slate-400">{{ node.type === 'category' ? 'Category' : 'Subcategory' }}</div>
  </div>
</template>

<script setup>
defineProps({ node: Object })
defineEmits(['click', 'edit', 'delete'])

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
</script>
