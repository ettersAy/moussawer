<template>
  <div class="table-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>
    
    <table class="data-table" v-else-if="users.length > 0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Portfolio Count</th>
          <th>Total Bookings</th>
          <th>Joined Date</th>
          <th class="actions-col">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td class="font-mono text-muted">#{{ user.id }}</td>
          <td class="font-medium">{{ user.name }}</td>
          <td class="text-muted">{{ user.email }}</td>
          <td>
            <span class="role-badge" :class="user.role">{{ user.role }}</span>
          </td>
          <td>
            <span class="status-badge" :class="user.status || 'active'">{{ user.status || 'active' }}</span>
          </td>
          <td class="text-center">{{ user.portfolio_count ?? '-' }}</td>
          <td class="text-center">{{ user.bookings_count ?? 0 }}</td>
          <td class="text-muted">{{ new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) }}</td>
          <td class="actions">
            <button v-if="user.role === 'photographer'" class="btn-action view" @click="$emit('view-portfolio', user.id)" title="View Portfolio">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </button>
            <button class="btn-action edit" @click="$emit('edit', user)" title="Edit User">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-action delete" @click="$emit('delete', user.id)" :disabled="user.id === currentUserId" title="Delete User">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    
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
  </div>
</template>

<script setup>
defineProps({
  users: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  searchActive: { type: Boolean, default: false },
  currentUserId: { type: [Number, String], default: null }
})

defineEmits(['view-portfolio', 'edit', 'delete', 'clear-search', 'page-change'])
</script>
