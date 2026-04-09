<template>
  <nav class="bg-slate-900 shadow-lg border-b border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Brand -->
        <router-link to="/" class="text-xl font-bold text-white hover:text-slate-300 transition">
          📸 Moussawer
        </router-link>

        <!-- Nav Links -->
        <div class="hidden md:flex items-center gap-6">
          <router-link 
            to="/" 
            class="text-slate-300 hover:text-white transition font-medium" 
            active-class="text-white"
          >
            Home
          </router-link>
          <router-link 
            to="/contact" 
            class="text-slate-300 hover:text-white transition font-medium" 
            active-class="text-white"
          >
            Contact
          </router-link>
        </div>

        <!-- Auth Section -->
        <div class="flex items-center gap-4">
          <!-- Guest: Show Login Button -->
          <router-link 
            v-if="!isAuthenticated" 
            to="/login" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Login
          </router-link>

          <!-- Authenticated: Show User Info + Logout -->
          <div v-else class="flex items-center gap-3">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-medium text-white">{{ authStore.user?.name }}</p>
              <p class="text-xs text-slate-400">{{ formatRole(authStore.user?.role) }}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
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