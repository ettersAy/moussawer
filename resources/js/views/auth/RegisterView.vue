<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-6 text-center">Join Moussawer</h1>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <!-- Name field -->
      <div>
        <label class="block text-sm font-medium mb-1">Full Name</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="Your full name"
          required
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': fieldErrors.name }"
        />
        <p v-if="fieldErrors.name" class="text-red-600 text-xs mt-1">{{ fieldErrors.name[0] }}</p>
      </div>

      <!-- Email field -->
      <div>
        <label class="block text-sm font-medium mb-1">Email</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="your@email.com"
          required
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': fieldErrors.email }"
        />
        <p v-if="fieldErrors.email" class="text-red-600 text-xs mt-1">{{ fieldErrors.email[0] }}</p>
      </div>

      <!-- Role selection -->
      <div>
        <label class="block text-sm font-medium mb-1">I am a</label>
        <select
          v-model="form.role"
          required
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': fieldErrors.role }"
        >
          <option value="" disabled>Select your role</option>
          <option value="client">Client (I want to book photographers)</option>
          <option value="photographer">Photographer (I offer photography services)</option>
        </select>
        <p v-if="fieldErrors.role" class="text-red-600 text-xs mt-1">{{ fieldErrors.role[0] }}</p>
      </div>

      <!-- Password field -->
      <div>
        <label class="block text-sm font-medium mb-1">Password</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="Min. 8 characters"
          required
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': fieldErrors.password }"
        />
        <p v-if="fieldErrors.password" class="text-red-600 text-xs mt-1">{{ fieldErrors.password[0] }}</p>
      </div>

      <!-- Password confirmation -->
      <div>
        <label class="block text-sm font-medium mb-1">Confirm Password</label>
        <input
          v-model="form.password_confirmation"
          type="password"
          placeholder="Repeat your password"
          required
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': fieldErrors.password_confirmation }"
        />
        <p v-if="fieldErrors.password_confirmation" class="text-red-600 text-xs mt-1">{{ fieldErrors.password_confirmation[0] }}</p>
      </div>

      <!-- General error feedback -->
      <div v-if="generalError" class="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
        {{ generalError }}
      </div>

      <!-- Submit button -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
      >
        <span v-if="loading" class="animate-spin mr-2">⟳</span>
        {{ loading ? 'Creating account...' : 'Sign Up' }}
      </button>

      <!-- Link to login -->
      <p class="text-center text-sm text-gray-600 mt-4">
        Already have an account?
        <router-link to="/login" class="text-blue-600 hover:underline">Login here</router-link>
      </p>
    </form>
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
/* Optional: add password strength indicator or animations here */
</style>
