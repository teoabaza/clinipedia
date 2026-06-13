import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api'

export const useKbStore = defineStore('kb', () => {
  // Auth
  const token = ref(localStorage.getItem('token'))
  const isAuthenticated = computed(() => !!token.value)

  async function login(username, password) {
    const data = await api.login(username, password)
    if (data.error) throw new Error(data.error)
    token.value = data.token
    localStorage.setItem('token', data.token)
  }

  function logout() {
    token.value = null
    localStorage.removeItem('token')
    currentParentId.value = null
    breadcrumb.value = []
    nodes.value = []
  }

  async function verifyToken() {
    try {
      await api.verify()
      return true
    } catch {
      logout()
      return false
    }
  }

  // Navigation
  const currentParentId = ref(null)
  const breadcrumb = ref([]) // [{ id, title, type }]
  const nodes = ref([])
  const loading = ref(false)

  const subcategories = computed(() => nodes.value.filter(n => n.type !== 'fragment'))
  const fragments = computed(() => nodes.value.filter(n => n.type === 'fragment'))
  const currentNode = computed(() => breadcrumb.value[breadcrumb.value.length - 1] || null)

  async function navigate(parentId) {
    loading.value = true
    currentParentId.value = parentId

    if (parentId === null) {
      breadcrumb.value = []
    } else {
      try {
        const ancestors = await api.getBreadcrumb(parentId)
        breadcrumb.value = ancestors.map(n => ({ id: n.id, title: n.title, type: n.type, color: n.color }))
      } catch {
        // keep existing breadcrumb
      }
    }

    await loadChildren()
    loading.value = false
  }

  async function loadChildren() {
    nodes.value = await api.getChildren(currentParentId.value)
  }

  async function createNode(data) {
    await api.createNode({ ...data, parent_id: currentParentId.value })
    await loadChildren()
  }

  async function updateNode(id, data) {
    await api.updateNode(id, data)
    await loadChildren()
  }

  async function deleteNode(id) {
    await api.deleteNode(id)
    // If we deleted the current node, go up
    if (id === currentParentId.value) {
      const parent = breadcrumb.value[breadcrumb.value.length - 2] || null
      await navigate(parent ? parent.id : null)
    } else {
      await loadChildren()
    }
  }

  return {
    // auth
    token, isAuthenticated, login, logout, verifyToken,
    // nav
    currentParentId, breadcrumb, nodes, loading,
    subcategories, fragments, currentNode,
    navigate, loadChildren, createNode, updateNode, deleteNode,
  }
})
