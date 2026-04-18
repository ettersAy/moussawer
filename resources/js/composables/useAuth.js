import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const loading = ref(false)
  const error = ref('')
  
  const fieldErrors = reactive({
    name: null,
    email: null,
    password: null,
    password_confirmation: null,
    role: null,
  })

  const clearFieldErrors = () => {
    Object.keys(fieldErrors).forEach(key => fieldErrors[key] = null)
  }

  const login = async (form) => {
    loading.value = true
    error.value = ''

    try {
      await authStore.login(form)
      await authStore.fetchUser()

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

  const register = async (form) => {
    loading.value = true
    error.value = ''
    clearFieldErrors()

    try {
      const response = await api.post('/register', form)

      authStore.token = response.data.token
      authStore.user = response.data.user
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('auth_user', JSON.stringify(response.data.user))

      const redirectPath = response.data.user.role === 'admin' ? '/admin' : '/dashboard'
      router.push(redirectPath)
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors || {}
        Object.keys(errors).forEach(field => {
          fieldErrors[field] = errors[field]
        })
        error.value = 'Please correct the errors below.'
      } else {
        error.value = err.response?.data?.message || 'Registration failed. Please try again.'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fieldErrors,
    login,
    register
  }
}
