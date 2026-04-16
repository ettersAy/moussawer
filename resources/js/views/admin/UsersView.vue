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

    <!-- Toast Notifications -->
    <div class="toast-container">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </transition-group>
    </div>

    <!-- Users Table -->
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
            <th>Registered</th>
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
            <td class="text-muted">{{ new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) }}</td>
            <td class="actions">
              <button class="btn-action edit" @click="openEditModal(user)" title="Edit User">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn-action delete" @click="deleteUser(user.id)" :disabled="user.id === authStore.user?.id" title="Delete User">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <p>No users found matching your criteria.</p>
        <button v-if="searchQuery" class="btn-secondary mt-1" @click="clearSearch">Clear Search</button>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1 && !loading">
        <button 
          class="btn-page" 
          :disabled="currentPage === 1" 
          @click="changePage(currentPage - 1)">
          Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button 
          class="btn-page" 
          :disabled="currentPage === totalPages" 
          @click="changePage(currentPage + 1)">
          Next
        </button>
      </div>
    </div>

    <!-- User Modal (Create/Edit) -->
    <transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editingUser ? 'Edit User' : 'Add New User' }}</h2>
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>
          
          <form @submit.prevent="submitForm">
            <div class="form-row">
              <div class="form-group">
                <label>Name</label>
                <input type="text" v-model="form.name" required placeholder="John Doe" />
              </div>
              <div class="form-group">
                <label>Role</label>
                <select v-model="form.role" required>
                  <option value="admin">Admin</option>
                  <option value="photographer">Photographer</option>
                  <option value="client">Client</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="form.email" required placeholder="john@example.com" />
            </div>
            
            <div class="form-divider"><span>Security</span></div>
            
            <div class="form-group">
              <label>{{ editingUser ? 'New Password (leave blank to keep current)' : 'Password' }}</label>
              <input type="password" v-model="form.password" :required="!editingUser" minlength="8" placeholder="••••••••" />
            </div>
            
            <transition name="fade">
              <div class="form-group" v-if="form.password">
                <label>Confirm Password</label>
                <input type="password" v-model="form.password_confirmation" required minlength="8" placeholder="••••••••" />
              </div>
            </transition>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? 'Saving...' : 'Save User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const users = ref([])
const loading = ref(true)

// Pagination & Search
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const searchQuery = ref('')
let searchTimeout = null

// Modals
const showModal = ref(false)
const editingUser = ref(null)
const submitting = ref(false)

// Toasts
const toasts = ref([])
let toastIdCount = 0

const form = ref({
  name: '',
  email: '',
  role: 'client',
  password: '',
  password_confirmation: ''
})

const showToast = (message, type = 'success') => {
  const id = toastIdCount++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 4000)
}

const fetchUsers = async (page = 1) => {
  loading.value = true
  try {
    const response = await api.get('/admin/users', {
      params: { 
        page,
        search: searchQuery.value || undefined
      }
    })
    users.value = response.data.data
    // Handle Laravel Default API Pagination format
    if (response.data.meta) {
      currentPage.value = response.data.meta.current_page
      totalPages.value = response.data.meta.last_page
      totalItems.value = response.data.meta.total
    } else {
      totalItems.value = users.value.length
    }
  } catch (err) {
    showToast('Failed to load users.', 'error')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUsers(1)
}

const clearSearch = () => {
  searchQuery.value = ''
  handleSearch()
}

// Auto search when stopped typing
watch(searchQuery, (newVal) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 500)
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchUsers(page)
  }
}

onMounted(() => {
  fetchUsers()
})

const openCreateModal = () => {
  editingUser.value = null
  form.value = {
    name: '',
    email: '',
    role: 'client',
    password: '',
    password_confirmation: ''
  }
  showModal.value = true
}

const openEditModal = (user) => {
  editingUser.value = user
  form.value = {
    name: user.name,
    email: user.email,
    role: user.role,
    password: '',
    password_confirmation: ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  submitting.value = true
  
  try {
    const payload = { ...form.value }
    if (editingUser.value && !payload.password) {
      delete payload.password
      delete payload.password_confirmation
    }

    if (editingUser.value) {
      await api.put(`/admin/users/${editingUser.value.id}`, payload)
      showToast('User updated successfully.')
    } else {
      await api.post('/admin/users', payload)
      showToast('User created successfully.')
    }
    closeModal()
    fetchUsers(currentPage.value)
  } catch (err) {
    showToast(err.response?.data?.message || 'Failed to save user.', 'error')
  } finally {
    submitting.value = false
  }
}

const deleteUser = async (id) => {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
  
  try {
    await api.delete(`/admin/users/${id}`)
    showToast('User deleted successfully.')
    fetchUsers(currentPage.value)
  } catch (err) {
    showToast('Failed to delete user.', 'error')
  }
}
</script>

<style scoped>
/* Base Variables & Typography */
.users-view {
  --primary: #0f172a;
  --primary-hover: #1e293b;
  --accent: #3b82f6;
  --bg-main: #f8fafc;
  --bg-surface: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --radius: 12px;
  
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--text-main);
  max-width: 1200px;
  margin: 0 auto;
}

.text-muted { color: var(--text-muted); }
.font-medium { font-weight: 500; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85em; }
.mt-1 { margin-top: 1rem; }

/* Header & Search */
.admin-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-titles h1 {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.025em;
}

.subtitle {
  color: var(--text-muted);
  margin: 0;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: var(--text-muted);
}

.search-box input {
  padding: 0.6rem 2.5rem 0.6rem 2.5rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 250px;
  transition: all 0.2s;
  font-size: 0.95rem;
  background: var(--bg-surface);
}

.search-box input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  width: 300px;
}

.clear-search {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-muted);
  cursor: pointer;
}

/* Table Container */
.table-container {
  background: var(--bg-surface);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 1.25rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table th {
  background: #f8fafc;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.data-table tbody tr {
  transition: background-color 0.15s;
}

.data-table tbody tr:hover {
  background-color: #f1f5f9;
}

.actions-col {
  text-align: right;
}

/* Badges */
.role-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-flex;
}

.role-badge.admin { background: #fee2e2; color: #991b1b; }
.role-badge.photographer { background: #e0e7ff; color: #3730a3; }
.role-badge.client { background: #dcfce7; color: #166534; }

/* Buttons */
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s, transform 0.1s;
}

.btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

.btn-secondary {
  background: white;
  color: var(--text-main);
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-secondary:hover { background: #f1f5f9; }

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-action {
  padding: 0.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: white;
  border: 1px solid var(--border);
  color: var(--text-muted);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-action:hover {
  background: #f1f5f9;
  color: var(--primary);
}

.btn-action.delete:hover {
  color: #dc2626;
  border-color: #fca5a5;
  background: #fee2e2;
}

.btn-action:disabled { opacity: 0.4; cursor: not-allowed; }

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid var(--border);
}

.page-info {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

.btn-page {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.btn-page:hover:not(:disabled) { background: #f1f5f9; }
.btn-page:disabled { opacity: 0.5; cursor: not-allowed; }

/* Loading & Empty States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: var(--accent);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-surface);
  border-radius: var(--radius);
  padding: 2rem;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 { margin: 0; font-size: 1.5rem; }

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--primary);
}

.form-group input, .form-group select {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #f8fafc;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: var(--accent);
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: var(--text-muted);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-divider::before, .form-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border);
}

.form-divider span {
  padding: 0 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

/* Toast Notifications */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  padding: 12px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  font-weight: 500;
  display: flex;
  align-items: center;
  border-left: 4px solid transparent;
  min-width: 250px;
}

.toast.success { border-left-color: #22c55e; color: #166534; }
.toast.error { border-left-color: #ef4444; color: #991b1b; }

/* Transitions */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s, transform 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95) translateY(-10px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(30px); }
.toast-leave-to { opacity: 0; transform: scale(0.9); }
</style>
