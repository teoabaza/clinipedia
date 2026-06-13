<template>
  <div class="flex h-screen overflow-hidden">

    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-20 lg:hidden"
      @click="sidebarOpen = false"
    />

    <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex flex-col flex-1 overflow-hidden">

      <!-- Mobile top bar -->
      <header class="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/10 shrink-0">
        <button @click="sidebarOpen = true" class="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <img src="/clinipedia-logo.png" alt="Clinipedia" class="h-7 w-auto" />
        <button @click="store.logout()" class="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </header>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">

        <!-- Header -->
        <div class="flex items-start justify-between mb-5 lg:mb-7 gap-3">
          <div class="min-w-0">
            <h2 class="text-xl lg:text-2xl font-semibold text-slate-900 truncate">
              {{ store.currentNode?.title || 'Home' }}
            </h2>
            <p class="text-sm text-slate-500 mt-0.5">
              {{ store.currentNode
                ? `${store.currentNode.type === 'category' ? 'Category' : 'Subcategory'} · ${store.nodes.length} item${store.nodes.length !== 1 ? 's' : ''}`
                : `${store.nodes.length} categor${store.nodes.length !== 1 ? 'ies' : 'y'}`
              }}
            </p>
          </div>

          <div class="flex gap-2 shrink-0">
            <button
              v-if="store.currentParentId === null"
              @click="openNodeModal('category')"
              class="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
            >
              <PlusIcon />
              <span class="hidden sm:inline">Add Category</span>
              <span class="sm:hidden">Add</span>
            </button>
            <template v-else>
              <button
                @click="openNodeModal('subcategory')"
                class="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <PlusIcon />
                <span class="hidden sm:inline">Add Subcategory</span>
                <span class="sm:hidden">Sub</span>
              </button>
              <button
                @click="openFragmentModal()"
                class="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <PlusIcon />
                <span class="hidden sm:inline">Add Fragment</span>
                <span class="sm:hidden">Fragment</span>
              </button>
            </template>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="store.loading" class="flex items-center justify-center h-48 text-slate-400 text-sm">
          Loading…
        </div>

        <template v-else>
          <!-- Subcategory / category grid -->
          <div v-if="store.subcategories.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 lg:gap-4 mb-5 lg:mb-6">
            <NodeCard
              v-for="node in store.subcategories"
              :key="node.id"
              :node="node"
              @click="store.navigate(node.id)"
              @edit="openNodeModal(node.type, node)"
              @delete="confirmDelete(node)"
            />
          </div>

          <!-- Fragments -->
          <div v-if="store.fragments.length" class="flex flex-col gap-3 lg:gap-4">
            <FragmentCard
              v-for="frag in store.fragments"
              :key="frag.id"
              :fragment="frag"
              @edit="openFragmentModal(frag)"
              @delete="confirmDelete(frag)"
            />
          </div>

          <!-- Empty state -->
          <div
            v-if="!store.subcategories.length && !store.fragments.length"
            class="flex flex-col items-center justify-center h-64 text-slate-400"
          >
            <svg class="mb-3 opacity-30" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <p class="text-sm">Nothing here yet — add something above</p>
          </div>
        </template>
      </main>
    </div>

    <!-- Modals -->
    <NodeModal
      v-if="nodeModal.open"
      :type="nodeModal.type"
      :existing="nodeModal.existing"
      @close="nodeModal.open = false"
      @saved="onNodeSaved"
    />

    <FragmentModal
      v-if="fragmentModal.open"
      :existing="fragmentModal.existing"
      @close="fragmentModal.open = false"
      @saved="onFragmentSaved"
    />

    <ConfirmModal
      v-if="deleteModal.open"
      :node="deleteModal.node"
      @close="deleteModal.open = false"
      @confirmed="onDeleteConfirmed"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useKbStore } from '../stores/kb'
import Sidebar from '../components/Sidebar.vue'
import NodeCard from '../components/NodeCard.vue'
import FragmentCard from '../components/FragmentCard.vue'
import NodeModal from '../components/NodeModal.vue'
import FragmentModal from '../components/FragmentModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import PlusIcon from '../components/icons/PlusIcon.vue'

const store = useKbStore()
const sidebarOpen = ref(false)

// Close sidebar on navigation (mobile)
const originalNavigate = store.navigate.bind(store)
store.navigate = async (id) => {
  sidebarOpen.value = false
  await originalNavigate(id)
}

// Node modal
const nodeModal = reactive({ open: false, type: 'category', existing: null })
function openNodeModal(type, existing = null) {
  nodeModal.type = type
  nodeModal.existing = existing
  nodeModal.open = true
}
async function onNodeSaved(data) {
  if (nodeModal.existing) {
    await store.updateNode(nodeModal.existing.id, data)
  } else {
    await store.createNode({ type: nodeModal.type, ...data })
  }
  nodeModal.open = false
}

// Fragment modal
const fragmentModal = reactive({ open: false, existing: null })
function openFragmentModal(existing = null) {
  fragmentModal.existing = existing
  fragmentModal.open = true
}
async function onFragmentSaved(data) {
  if (fragmentModal.existing) {
    await store.updateNode(fragmentModal.existing.id, data)
  } else {
    await store.createNode({ type: 'fragment', ...data })
  }
  fragmentModal.open = false
}

// Delete modal
const deleteModal = reactive({ open: false, node: null })
function confirmDelete(node) {
  deleteModal.node = node
  deleteModal.open = true
}
async function onDeleteConfirmed() {
  await store.deleteNode(deleteModal.node.id)
  deleteModal.open = false
}
</script>
