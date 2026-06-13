<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-slate-900/50 flex items-end sm:items-center justify-center z-50 sm:p-4" @click.self="$emit('close')">
      <div class="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden">

        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 class="font-semibold text-base text-slate-900">Confirm delete</h3>
          <button @click="$emit('close')" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="px-5 py-4 text-sm text-slate-700">
          <p v-if="node?.type === 'fragment'">
            Are you sure you want to delete this text fragment?
          </p>
          <p v-else>
            Are you sure you want to delete <strong>"{{ node?.title }}"</strong>?
            This will also delete all subcategories and fragments inside it.
          </p>
        </div>

        <div class="flex gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50">
          <button @click="$emit('close')" class="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button @click="$emit('confirmed')" class="flex-1 px-4 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({ node: Object })
defineEmits(['close', 'confirmed'])
</script>
