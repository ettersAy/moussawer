<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-6 text-center">Login to Moussawer</h1>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Email</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': error }"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Password</label>
        <input
          v-model="form.password"
          type="password"
          required
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': error }"
        />
      </div>

      <!-- Error feedback -->
      <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
        {{ error }}
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
      >
        <span v-if="loading" class="animate-spin mr-2">⟳</span>
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    await authStore.login(form.value)
    await authStore.fetchUser() // optional extra safety

    // Redirect based on role or to dashboard
    router.push(authStore.user?.role === 'admin' ? '/admin' : '/dashboard')
  } catch (err) {
    error.value = authStore.error || err.response?.data?.message || 'Invalid credentials.'
  } finally {
    loading.value = false
  }
}
</script>