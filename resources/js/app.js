import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')

// Load auth state after Pinia is ready
const authStore = useAuthStore()
authStore.loadFromStorage()

// Optional: fetch user if token exists
if (authStore.token) {
  authStore.fetchUser()
}