import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/api', // adjust if needed
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  // withCredentials: false  // not needed for pure token auth
})

// Request interceptor - attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle common errors (401, etc.)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Optional: auto logout on 401
      const authStore = (await import('@/stores/auth')).useAuthStore()
      await authStore.logout()
      // You can also router.push('/login') here if you import router
    }
    return Promise.reject(error)
  }
)

export default api