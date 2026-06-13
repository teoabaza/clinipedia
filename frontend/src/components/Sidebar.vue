<template>
  <aside class="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 overflow-hidden border-r border-white/5">

    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-4 border-b border-white/10">
      <div class="flex items-center gap-2">
        <img src="/clinipedia-logo.png" alt="Clinipedia" class="h-7 w-auto" />
        <span class="font-semibold text-slate-100 text-sm">Clinipedia</span>
      </div>
      <button
        @click="store.logout()"
        class="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
        title="Sign out"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>

    <!-- Breadcrumb trail -->
    <nav class="px-3 pt-3 pb-1 flex flex-col gap-0.5">
      <!-- Home -->
      <button
        @click="store.navigate(null)"
        class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors w-full text-left"
        :class="store.currentParentId === null ? 'text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-white/7'"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        Home
      </button>

      <!-- Ancestor nodes -->
      <button
        v-for="(node, i) in store.breadcrumb"
        :key="node.id"
        @click="store.navigate(node.id)"
        class="flex items-center gap-2 py-1.5 rounded-md text-xs transition-colors w-full text-left truncate"
        :style="{ paddingLeft: `${(i + 1) * 10 + 10}px` }"
        :class="i === store.breadcrumb.length - 1 ? 'text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-white/7'"
      >
        <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: node.color }"></span>
        <span class="truncate">{{ node.title || 'Untitled' }}</span>
      </button>
    </nav>

    <!-- Sibling nodes at current level -->
    <div class="flex-1 overflow-y-auto px-3 pb-3">
      <div
        v-for="node in siblingNodes"
        :key="node.id"
        @click="store.navigate(node.id)"
        class="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs cursor-pointer transition-colors"
        :class="node.id === store.currentParentId
          ? 'bg-blue-600/25 text-blue-200'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/7'"
        :style="{ paddingLeft: `${(store.breadcrumb.length) * 10 + 10}px` }"
      >
        <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: node.color }"></span>
        <span class="truncate">{{ node.title || 'Untitled' }}</span>
      </div>
    </div>

  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useKbStore } from '../stores/kb'
import { api } from '../api'

const store = useKbStore()
const siblingNodes = ref([])

async function loadSiblings() {
  const parentId = store.breadcrumb.length > 0
    ? store.breadcrumb[store.breadcrumb.length - 1].id
    : null
  const children = await api.getChildren(parentId)
  siblingNodes.value = children.filter(n => n.type !== 'fragment')
}

watch(() => [store.breadcrumb, store.nodes], loadSiblings, { immediate: true, deep: true })
</script>
