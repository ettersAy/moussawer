<template>
  <button
    @click="handleLogout"
    :disabled="isLoading"
    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
    :aria-busy="isLoading"
    :aria-label="isLoading ? 'Logging out' : 'Logout'"
  >
    <span v-if="isLoading" class="inline-block animate-spin">⟳</span>
    {{ isLoading ? 'Logging out...' : 'Logout' }}
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isLoading = computed(() => authStore.loading)

const handleLogout = async () => {
  try {
    await authStore.logout()
  } catch (err) {
    console.error('Logout failed', err)
  }
}
</script>

<style scoped>
.spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: 6px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>