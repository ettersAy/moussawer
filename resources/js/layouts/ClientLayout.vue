<template>
    <div class="client-layout">
        <nav class="client-navbar">
            <div class="client-navbar-brand">
                <router-link to="/client/dashboard" class="client-brand-link">
                    Moussawer
                </router-link>
            </div>
            
            <div class="client-navbar-content">
                <div class="client-nav-menu">
                    <router-link to="/client/dashboard" class="client-nav-link" active-class="active">
                        Dashboard
                    </router-link>
                    <router-link to="/client/bookings" class="client-nav-link" active-class="active">
                        My Bookings
                    </router-link>
                    <router-link :to="{ name: 'photographer-discovery' }" class="client-nav-link" active-class="active">
                        Find Photographers
                    </router-link>
                    <router-link to="/client/profile" class="client-nav-link" active-class="active">
                        My Profile
                    </router-link>
                </div>
                
                <div class="client-nav-user">
                    <div class="client-user-menu">
                        <span class="client-user-name">{{ authStore.user?.name }}</span>
                        <button @click="logout" class="client-btn-logout">Logout</button>
                    </div>
                </div>
            </div>
        </nav>
        
        <main class="client-main-content">
            <slot />
        </main>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
    await authStore.logout()
    router.push({ name: 'login' })
}
</script>

<style scoped>
/* ClientLayout specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
