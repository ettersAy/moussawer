<template>

  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-icon">🔑</div>
        <h1 class="auth-title">Welcome Back</h1>
        <p class="auth-subtitle">Sign in to your Moussawer account</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input
            v-model="form.email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            class="form-input"
            :class="{ 'form-input-error': error }"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="form.password"
            type="password"
            name="password"
            required
            placeholder="Enter your password"
            class="form-input"
            :class="{ 'form-input-error': error }"
          />
        </div>

        <!-- Error feedback -->
        <div v-if="error" class="error-message">
          <div class="error-icon">⚠️</div>
          <div class="error-text">{{ error }}</div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="auth-submit-button"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Signing In...' : 'Sign In' }}
        </button>

        <div class="auth-footer">
          <p class="auth-footer-text">
            Don't have an account?
            <router-link to="/register" class="auth-footer-link">Create one here</router-link>
          </p>
        </div>
      </form>

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

    // Smart redirect based on role
    const dashboardMap = {
      admin: '/admin/dashboard',
      photographer: '/photographer/dashboard',
      client: '/client/dashboard',
    }
    const redirectPath = dashboardMap[authStore.user?.role] || '/'
    router.push(redirectPath)
  } catch (err) {
    error.value = authStore.error || err.response?.data?.message || 'Invalid credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* LoginView specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
