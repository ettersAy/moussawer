<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-icon">📸</div>
        <h1 class="auth-title">Join Moussawer</h1>
        <p class="auth-subtitle">Create your account to connect with photographers</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <!-- Name field -->
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Your full name"
            required
            class="form-input"
            :class="{ 'form-input-error': fieldErrors.name }"
          />
          <p v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name[0] }}</p>
        </div>

        <!-- Email field -->
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
            required
            class="form-input"
            :class="{ 'form-input-error': fieldErrors.email }"
          />
          <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email[0] }}</p>
        </div>

        <!-- Role selection -->
        <div class="form-group">
          <label class="form-label">I am a</label>
          <select
            v-model="form.role"
            required
            class="form-input"
            :class="{ 'form-input-error': fieldErrors.role }"
          >
            <option value="" disabled>Select your role</option>
            <option value="client">Client (I want to book photographers)</option>
            <option value="photographer">Photographer (I offer photography services)</option>
          </select>
          <p v-if="fieldErrors.role" class="field-error">{{ fieldErrors.role[0] }}</p>
        </div>

        <!-- Password field -->
        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Minimum 8 characters"
            required
            class="form-input"
            :class="{ 'form-input-error': fieldErrors.password }"
          />
          <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password[0] }}</p>
        </div>

        <!-- Password confirmation -->
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input
            v-model="form.password_confirmation"
            type="password"
            placeholder="Repeat your password"
            required
            class="form-input"
            :class="{ 'form-input-error': fieldErrors.password_confirmation }"
          />
          <p v-if="fieldErrors.password_confirmation" class="field-error">{{ fieldErrors.password_confirmation[0] }}</p>
        </div>

        <!-- General error feedback -->
        <div v-if="generalError" class="error-message">
          <div class="error-icon">⚠️</div>
          <div class="error-text">{{ generalError }}</div>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="loading"
          class="auth-submit-button"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>

        <!-- Link to login -->
        <div class="auth-footer">
          <p class="auth-footer-text">
            Already have an account?
            <router-link to="/login" class="auth-footer-link">Sign in here</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: '',
})

const loading = ref(false)
const generalError = ref('')
const fieldErrors = reactive({
  name: null,
  email: null,
  password: null,
  password_confirmation: null,
  role: null,
})

const clearFieldErrors = () => {
  fieldErrors.name = null
  fieldErrors.email = null
  fieldErrors.password = null
  fieldErrors.password_confirmation = null
  fieldErrors.role = null
}

const handleRegister = async () => {
  loading.value = true
  generalError.value = ''
  clearFieldErrors()

  try {
    // Call register API
    const response = await api.post('/register', {
      name: form.name,
      email: form.email,
      password: form.password,
      password_confirmation: form.password_confirmation,
      role: form.role,
    })

    // Store token and user in auth store
    authStore.token = response.data.token
    authStore.user = response.data.user
    localStorage.setItem('auth_token', response.data.token)
    localStorage.setItem('auth_user', JSON.stringify(response.data.user))

    // Redirect based on role
    const redirectPath = response.data.user.role === 'admin' ? '/admin' : '/dashboard'
    router.push(redirectPath)
  } catch (err) {
    // Extract validation errors
    if (err.response?.status === 422) {
      const errors = err.response.data.errors || {}
      Object.keys(errors).forEach(field => {
        fieldErrors[field] = errors[field]
      })
      generalError.value = 'Please correct the errors below.'
    } else {
      generalError.value = err.response?.data?.message || 'Registration failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* RegisterView specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
