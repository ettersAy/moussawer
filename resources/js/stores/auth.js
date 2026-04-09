import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'   // we'll create/update this next

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Load from localStorage on app start / page refresh
  function loadFromStorage() {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')

    if (savedToken) token.value = savedToken
    if (savedUser) user.value = JSON.parse(savedUser)
  }

  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/login', credentials)

      token.value = response.data.token
      user.value = response.data.user

      // Persist per Sanctum token best practice (localStorage is common for token-based)
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('auth_user', JSON.stringify(user.value))

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true;
    error.value = null;

    try {
      // Call logout endpoint (Sanctum will delete current token)
      await api.post('/logout');
    } catch (err) {
      // Ignore backend errors (network, expired token, etc.)
      console.warn('Backend logout failed, proceeding with local cleanup', err);
    } finally {
      // ALWAYS clear local state
      token.value = null;
      user.value = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      // Redirect to login (using router)
      const router = (await import('@/router')).default;
      await router.push({ name: 'login' });

      loading.value = false;
    }
  }

  async function fetchUser() {
    if (!token.value) return

    try {
      const response = await api.get('/user')
      user.value = response.data   // assuming MeController returns UserResource
    } catch (err) {
      console.error('Failed to fetch user', err)
      // Token probably expired → logout
      await logout()
    }
  }

  // Computed for convenience
  const isAuthenticated = () => !!token.value && !!user.value

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    fetchUser,
    isAuthenticated,
    loadFromStorage
  }
})