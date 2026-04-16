<template>
    <nav class="main-nav">
        <div class="nav-container">
            <div class="nav-brand">
                <router-link to="/" class="brand-link">
                    <span class="brand-icon">📷</span>
                    <span class="brand-text">Moussawer</span>
                </router-link>
            </div>
            
            <div class="nav-links">
                <router-link to="/" class="nav-item" active-class="active">Home</router-link>
                <router-link to="/contact" class="nav-item" active-class="active">Contact</router-link>
            </div>
            
            <div class="nav-auth">
                <template v-if="!isAuthenticated">
                    <router-link to="/login" class="auth-link login-link">Login</router-link>
                    <router-link to="/register" class="auth-link register-link">Register</router-link>
                </template>
                <template v-else>
                    <div class="auth-user-info" style="display: flex; align-items: center; gap: 1rem;">
                        <div class="text-right hidden sm:block">
                            <p class="text-sm font-medium">{{ authStore.user?.name }}</p>
                            <p class="text-xs opacity-75">{{ formatRole(authStore.user?.role) }}</p>
                        </div>
                        <LogoutButton />
                    </div>
                </template>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LogoutButton from '@/components/shared/auth/LogoutButton.vue'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated())

const formatRole = (role) => {
  const roles = {
    admin: 'Administrator',
    photographer: 'Photographer',
    client: 'Client'
  }
  return roles[role] || role
}
</script>

<style scoped>
/* Navbar specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
