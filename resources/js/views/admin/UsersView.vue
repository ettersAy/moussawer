<template>
  <div class="users-view">
    <div class="admin-page-header">
      <div class="header-titles">
        <h1>Manage Users</h1>
        <p class="subtitle" v-if="totalItems">Showing {{ users.length }} of {{ totalItems }} users</p>
      </div>
      
      <div class="header-actions">
        <div class="search-box">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search name or email..." 
            @keyup.enter="handleSearch"
          />
          <button v-if="searchQuery" class="clear-search" @click="clearSearch">&times;</button>
        </div>
        <button class="btn-primary" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add User
        </button>
      </div>
    </div>

    <!-- Filters -->
    <UserFilters v-model="filters" @change="handleSearch" />

    <!-- Toast Notifications -->
    <div class="toast-container">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </transition-group>
    </div>

    <!-- Users Table -->
    <UsersTable 
      :users="users"
      :loading="loading"
      :current-page="currentPage"
      :total-pages="totalPages"
      :search-active="!!searchQuery"
      :current-user-id="authStore.user?.id"
      @view-portfolio="viewPortfolio"
      @edit="openEditModal"
      @delete="confirmDeleteUser"
      @clear-search="clearSearch"
      @page-change="changePage"
    />

    <!-- User Modal (Create/Edit) -->
    <UserModal 
      :show="showModal"
      :user="editingUser"
      @close="closeModal"
      @saved="handleUserSaved"
      @error="handleUserError"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUsers } from '@/composables/useUsers'
import { useToast } from '@/composables/useToast'
import UserFilters from '@/components/admin/UserFilters.vue'
import UsersTable from '@/components/admin/UsersTable.vue'
import UserModal from '@/components/admin/UserModal.vue'

const authStore = useAuthStore()
const router = useRouter()

const {
  users, loading, currentPage, totalPages, totalItems,
  searchQuery, filters, fetchUsers, handleSearch,
  clearSearch, changePage, deleteUser
} = useUsers()

const { toasts, showToast } = useToast()

const showModal = ref(false)
const editingUser = ref(null)

const viewPortfolio = (userId) => {
  router.push(`/admin/users/${userId}/portfolio`)
}

onMounted(() => {
  fetchUsers()
})

const openCreateModal = () => {
  editingUser.value = null
  showModal.value = true
}

const openEditModal = (user) => {
  editingUser.value = user
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleUserSaved = (message) => {
  showToast(message, 'success')
  fetchUsers(currentPage.value)
}

const handleUserError = (message) => {
  showToast(message, 'error')
}

const confirmDeleteUser = async (id) => {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
  try {
    await deleteUser(id)
    showToast('User deleted successfully.')
  } catch (err) {
    showToast('Failed to delete user.', 'error')
  }
}
</script>

<style scoped>
/* File specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
