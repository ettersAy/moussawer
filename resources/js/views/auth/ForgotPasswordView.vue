<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-icon">🔒</div>
        <h1 class="auth-title">Reset Password</h1>
        <p class="auth-subtitle">Enter your email and we'll send you a reset link</p>
      </div>

      <!-- Success state -->
      <div v-if="submitted" class="success-message">
        <div class="success-icon">✅</div>
        <div class="success-text">
          If an account with that email exists, we've sent a password reset link to it. Please check your email inbox.
        </div>
        <div class="auth-footer" style="border-top: none; margin-top: 1rem; padding-top: 0;">
          <router-link to="/login" class="auth-footer-link">Back to Login</router-link>
        </div>
      </div>

      <!-- Form state -->
      <form v-else @submit.prevent="handleForgotPassword" class="auth-form">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input
            v-model="form.email"
            type="email"
            name="email"
            data-testid="email-input"
            required
            placeholder="you@example.com"
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
          {{ loading ? 'Sending Link...' : 'Send Reset Link' }}
        </button>

        <div class="auth-footer">
          <p class="auth-footer-text">
            Remember your password?
            <router-link to="/login" class="auth-footer-link">Sign in here</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import api from '@/services/api'

const form = reactive({
  email: '',
})

const loading = ref(false)
const error = ref('')
const submitted = ref(false)

const handleForgotPassword = async () => {
  loading.value = true
  error.value = ''

  try {
    await api.post('/forgot-password', form)
    submitted.value = true
  } catch (err) {
    // The API returns a success message even if the email doesn't exist
    // to prevent email enumeration. But if there's a network/server error:
    if (err.response?.status === 429) {
      error.value = 'Too many requests. Please try again later.'
    } else if (err.response?.status === 422) {
      const errors = err.response.data.errors || {}
      const messages = Object.values(errors).flat()
      error.value = messages[0] || 'Please provide a valid email address.'
    } else {
      error.value = 'Something went wrong. Please try again later.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1rem;
  text-align: center;
}

.success-icon {
  font-size: 3rem;
}

.success-text {
  color: #374151;
  font-size: 0.9375rem;
  line-height: 1.6;
}
</style>
