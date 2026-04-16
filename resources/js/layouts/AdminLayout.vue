<template>
    <div class="admin-layout">
        <nav class="admin-navbar">
            <div class="admin-navbar-brand">
                <router-link to="/admin/dashboard" class="admin-brand-link">
                    Moussawer Admin
                </router-link>
            </div>
            
            <div class="admin-navbar-content">
                <div class="admin-nav-menu">
                    <router-link to="/admin/dashboard" class="admin-nav-link" active-class="active">
                        Dashboard
                    </router-link>
                </div>
                
                <div class="admin-nav-user">
                    <div class="admin-user-menu">
                        <span class="admin-user-name">{{ authStore.user?.name }}</span>
                        <button @click="logout" class="admin-btn-logout">Logout</button>
                    </div>
                </div>
            </div>
        </nav>
        
        <main class="admin-main-content">
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
/* AdminLayout specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
