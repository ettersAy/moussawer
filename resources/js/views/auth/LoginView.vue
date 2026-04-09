<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900 mb-2">📸 Moussawer</h1>
        <p class="text-slate-600">Sign in to your account</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5" novalidate>
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="you@example.com"
            aria-label="Email address"
            :aria-invalid="!!error"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 placeholder-slate-500"
            :class="{ 'border-red-500 focus:ring-red-500': error }"
          />
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-slate-700 mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="••••••••"
            aria-label="Password"
            :aria-invalid="!!error"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 placeholder-slate-500"
            :class="{ 'border-red-500 focus:ring-red-500': error }"
          />
        </div>

        <!-- Error Alert -->
        <transition name="fade">
          <div 
            v-if="error" 
            class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
            role="alert"
          >
            <span class="text-red-600 text-xl flex-shrink-0">⚠️</span>
            <p class="text-red-700 text-sm font-medium">{{ error }}</p>
          </div>
        </transition>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          :aria-busy="loading"
        >
          <span v-if="loading" class="inline-block animate-spin">⟳</span>
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <!-- Footer -->
      <div class="mt-6 text-center text-sm text-slate-600">
        <p>Don't have an account? <router-link to="#" class="text-blue-600 hover:text-blue-700 font-medium">Sign up</router-link></p>
      </div>
    </div>
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

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>