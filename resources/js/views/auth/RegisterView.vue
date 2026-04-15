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
          class="submit-button"
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
.auth-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.auth-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  padding: 3rem;
  width: 100%;
  max-width: 480px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.auth-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: inline-block;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.auth-subtitle {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.form-input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.5em 1.5em;
  padding-right: 3rem;
}

.field-error {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.error-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 0.875rem;
  line-height: 1.4;
}

.error-icon {
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.error-text {
  flex: 1;
}

.submit-button {
  padding: 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.auth-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.auth-footer-text {
  color: #6b7280;
  font-size: 0.875rem;
}

.auth-footer-link {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.auth-footer-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 640px) {
  .auth-card {
    padding: 2rem 1.5rem;
    margin: 0 1rem;
  }

  .auth-title {
    font-size: 1.75rem;
  }

  .auth-icon {
    font-size: 2.5rem;
  }
}
</style>