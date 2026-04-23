<template>
    <div class="photographer-layout">
        <nav class="photographer-navbar">
            <div class="photographer-navbar-brand">
                <router-link to="/photographer/dashboard" class="photographer-brand-link">
                    Moussawer
                </router-link>
            </div>
            
            <div class="photographer-navbar-content">
                <div class="photographer-nav-menu">
                    <router-link to="/photographer/dashboard" class="photographer-nav-link" active-class="active">
                        Dashboard
                    </router-link>
                    <router-link to="/photographer/bookings" class="photographer-nav-link" active-class="active">
                        Bookings
                    </router-link>
                    <router-link to="/photographer/portfolio" class="photographer-nav-link" active-class="active">
                        Portfolio
                    </router-link>
                    <router-link to="/photographer/services" class="photographer-nav-link" active-class="active">
                        Services & Rates
                    </router-link>
                    <router-link to="/photographer/availability" class="photographer-nav-link" active-class="active">
                        Availability
                    </router-link>
                    <router-link to="/photographer/profile" class="photographer-nav-link" active-class="active">
                        My Profile
                    </router-link>
                </div>
                
                <div class="photographer-nav-user">
                    <div class="photographer-user-menu">
                        <span class="photographer-user-name">{{ authStore.user?.name }}</span>
                        <button @click="logout" class="photographer-btn-logout">Logout</button>
                    </div>
                </div>
            </div>
        </nav>
        
        <main class="photographer-main-content">
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
/* PhotographerLayout specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
