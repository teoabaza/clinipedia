<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-sky-100">
    <div class="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 w-full max-w-sm">

      <!-- Logo -->
      <div class="flex justify-center mb-2">
        <img src="/clinipedia-logo.png" alt="Clinipedia" class="home-logo w-auto" />
      </div>

      <p class="home-logo-text text-sm text-slate-500 mb-7">Your clinical knowledge base</p>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            required
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div class="mb-5">
          <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div v-if="error" class="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
        >
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useKbStore } from '../stores/kb'

const store = useKbStore()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await store.login(username.value, password.value)
    await store.navigate(null)
  } catch (e) {
    error.value = e.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.home-logo {
  height: 80px;
}
.home-logo-text {
  font-size: 13px;
  text-align: center;
}
</style>
