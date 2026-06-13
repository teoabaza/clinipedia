<template>
  <div class="h-screen overflow-hidden">
    <LoginScreen v-if="!store.isAuthenticated" />
    <AppShell v-else />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useKbStore } from './stores/kb'
import LoginScreen from './views/LoginScreen.vue'
import AppShell from './views/AppShell.vue'

const store = useKbStore()

onMounted(async () => {
  if (store.token) {
    const valid = await store.verifyToken()
    if (valid) store.navigate(null)
  }
})
</script>
