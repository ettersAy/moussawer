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
    const status = error.response?.status

    if (status === 401) {
      // IMPORTANT: Do NOT call logout() from inside the response interceptor
      // It can cause infinite loops because logout() itself makes an API call (/logout)
      // Instead, just clear the local state and let the component/router handle redirect

      try {
        // Dynamically import to avoid circular dependency at module load time
        const { useAuthStore } = await import('@/stores/auth')
        const authStore = useAuthStore()

        // Clear state and storage WITHOUT calling the /logout endpoint here
        authStore.token = null
        authStore.user = null
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      } catch (e) {
        console.error('Failed to clear auth on 401', e)
      }

      // Optional: You can emit an event or just let the 401 bubble up
      // The login component or router guard will handle redirect to /login
    }

    return Promise.reject(error)
  }
);

export default api