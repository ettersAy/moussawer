<template>
  <div class="table-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>
    
    <div class="table-responsive" v-else-if="users.length > 0">
      <table class="data-table">
        <thead>
          <tr>
            <th>Info</th>
            <th>Name</th>
            <th>Email</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="info-cell">
              <div class="info-row">
                <span class="status-dot" :class="user.status || 'active'" :title="user.status || 'active'"></span>
                <span class="font-mono text-muted">#{{ user.id }}</span>
                <span class="role-badge" :class="user.role">{{ user.role }}</span>
              </div>
              <div class="date-row text-muted">
                Joined {{ new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) }}
              </div>
            </td>
            <td class="font-medium copyable" @dblclick="copyToClipboard(user.name, 'Name')" title="Double-click to copy">
              {{ user.name }}
            </td>
            <td class="text-muted copyable" @dblclick="copyToClipboard(user.email, 'Email')" title="Double-click to copy">
              {{ user.email }}
            </td>
            
            <td class="actions">
              <div class="stats-group">
                <div v-if="user.role === 'photographer' || user.role === 'client'" class="stat-badge" title="Total Bookings">
                  <span class="stat-icon">📚</span> {{ user.bookings_count ?? 0 }}
                </div>
                <div v-if="user.role === 'photographer'" class="stat-badge cursor-pointer" @click="$emit('view-portfolio', user.id)" title="View Portfolio">
                  <span class="stat-icon">🗂️</span> {{ user.portfolio_count ?? '-' }}
                </div>
              </div>
              <div class="btn-group">
                <button class="btn-action edit" @click="$emit('edit', user)" title="Edit User">
                  📝
                </button>
                <button class="btn-action delete" @click="$emit('delete', user.id)" :disabled="user.id === currentUserId" title="Delete User">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-else class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <p>No users found matching your criteria.</p>
      <button v-if="searchActive" class="btn-secondary mt-1" @click="$emit('clear-search')">Clear Search</button>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1 && !loading">
      <button 
        class="btn-page" 
        :disabled="currentPage === 1" 
        @click="$emit('page-change', currentPage - 1)">
        Previous
      </button>
      <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
      <button 
        class="btn-page" 
        :disabled="currentPage === totalPages" 
        @click="$emit('page-change', currentPage + 1)">
        Next
      </button>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast" class="toast-container">
        <div class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  users: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  searchActive: { type: Boolean, default: false },
  currentUserId: { type: [Number, String], default: null }
})

const emit = defineEmits(['view-portfolio', 'edit', 'delete', 'clear-search', 'page-change'])

const toast = ref(null)

const copyToClipboard = async (text, type) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    toast.value = { message: `${type} copied to clipboard!`, type: 'success' }
  } catch (err) {
    toast.value = { message: `Failed to copy ${type}`, type: 'error' }
  }
  setTimeout(() => {
    toast.value = null
  }, 2500)
}
</script>
