<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-icon">🔑</div>
        <h1 class="auth-title">Set New Password</h1>
        <p class="auth-subtitle">Choose a strong password for your account</p>
      </div>

      <!-- Success state -->
      <div v-if="submitted" class="success-message">
        <div class="success-icon">✅</div>
        <div class="success-text">
          Your password has been reset successfully! You can now sign in with your new password.
        </div>
        <router-link to="/login" class="auth-submit-button" style="text-decoration: none; margin-top: 1rem;">
          Sign In
        </router-link>
      </div>

      <!-- Form state -->
      <form v-else @submit.prevent="handleResetPassword" class="auth-form">
        <!-- Hidden token field - populated from query params -->
        <input
          v-model="form.token"
          type="hidden"
          name="token"
          data-testid="token-input"
        />

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
            :class="{ 'form-input-error': fieldErrors.email }"
          />
          <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email[0] }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">New Password</label>
          <input
            v-model="form.password"
            type="password"
            name="password"
            data-testid="password-input"
            required
            minlength="8"
            placeholder="Minimum 8 characters"
            class="form-input"
            :class="{ 'form-input-error': fieldErrors.password }"
          />
          <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password[0] }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">Confirm New Password</label>
          <input
            v-model="form.password_confirmation"
            type="password"
            name="password_confirmation"
            data-testid="password-confirmation-input"
            required
            placeholder="Repeat your new password"
            class="form-input"
            :class="{ 'form-input-error': fieldErrors.password_confirmation }"
          />
          <p v-if="fieldErrors.password_confirmation" class="field-error">{{ fieldErrors.password_confirmation[0] }}</p>
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
          {{ loading ? 'Resetting Password...' : 'Reset Password' }}
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
import { reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()

const form = reactive({
  email: '',
  token: '',
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const error = ref('')
const submitted = ref(false)

const fieldErrors = reactive({
  email: null,
  token: null,
  password: null,
  password_confirmation: null,
})

// On mount, pre-fill email and token from query parameters if available
onMounted(() => {
  if (route.query.email) {
    form.email = route.query.email
  }
  if (route.query.token) {
    form.token = route.query.token
  }
})

const clearFieldErrors = () => {
  Object.keys(fieldErrors).forEach(key => fieldErrors[key] = null)
}

const handleResetPassword = async () => {
  loading.value = true
  error.value = ''
  clearFieldErrors()

  try {
    await api.post('/reset-password', {
      email: form.email,
      token: form.token,
      password: form.password,
      password_confirmation: form.password_confirmation,
    })
    submitted.value = true
  } catch (err) {
    if (err.response?.status === 422) {
      const errors = err.response.data.errors || {}
      Object.keys(errors).forEach(field => {
        if (field in fieldErrors) {
          fieldErrors[field] = errors[field]
        }
      })
      if (Object.keys(errors).length > 0) {
        error.value = 'Please correct the errors below.'
      } else {
        error.value = err.response.data.message || 'Invalid or expired reset token.'
      }
    } else if (err.response?.status === 429) {
      error.value = 'Too many requests. Please try again later.'
    } else {
      error.value = err.response?.data?.message || 'Something went wrong. Please try again.'
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
