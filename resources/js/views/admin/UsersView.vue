<template>
  <div>
    <div class="admin-page-header">
      <h1>Manage Users</h1>
      <button class="btn-primary" @click="openCreateModal">Add New User</button>
    </div>

    <!-- Error/Success Messages -->
    <div v-if="error" class="alert-error">{{ error }}</div>
    <div v-if="success" class="alert-success">{{ success }}</div>

    <!-- Users Table -->
    <div class="table-container">
      <table class="data-table" v-if="!loading">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">{{ user.role }}</span>
            </td>
            <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
            <td class="actions">
              <button class="btn-action edit" @click="openEditModal(user)">Edit</button>
              <button class="btn-action delete" @click="deleteUser(user.id)" :disabled="user.id === authStore.user?.id">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="loading-state">Loading users...</div>
    </div>

    <!-- User Modal (Create/Edit) -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ editingUser ? 'Edit User' : 'Add New User' }}</h2>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>Name</label>
            <input type="text" v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="form.email" required />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="form.role" required>
              <option value="admin">Admin</option>
              <option value="photographer">Photographer</option>
              <option value="client">Client</option>
            </select>
          </div>
          <!-- Password fields -->
          <div class="form-group">
            <label>{{ editingUser ? 'New Password (leave blank to keep current)' : 'Password' }}</label>
            <input type="password" v-model="form.password" :required="!editingUser" minlength="8" />
          </div>
          <div class="form-group" v-if="form.password">
            <label>Confirm Password</label>
            <input type="password" v-model="form.password_confirmation" required minlength="8" />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Save User' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const users = ref([])
const loading = ref(true)
const error = ref('')
const success = ref('')

const showModal = ref(false)
const editingUser = ref(null)
const submitting = ref(false)

const form = ref({
  name: '',
  email: '',
  role: 'client',
  password: '',
  password_confirmation: ''
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/users')
    users.value = response.data.data
  } catch (err) {
    error.value = 'Failed to load users.'
  } finally {
    loading.value = false
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
  error.value = ''
  success.value = ''
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
  error.value = ''
  success.value = ''
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  submitting.value = true
  error.value = ''
  
  try {
    // Only send password if it has been typed (for update)
    const payload = { ...form.value }
    if (editingUser.value && !payload.password) {
      delete payload.password
      delete payload.password_confirmation
    }

    if (editingUser.value) {
      await api.put(`/admin/users/${editingUser.value.id}`, payload)
      success.value = 'User updated successfully.'
    } else {
      await api.post('/admin/users', payload)
      success.value = 'User created successfully.'
    }
    closeModal()
    fetchUsers()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to save user.'
  } finally {
    submitting.value = false
  }
}

const deleteUser = async (id) => {
  if (!confirm('Are you sure you want to delete this user?')) return
  
  try {
    await api.delete(`/admin/users/${id}`)
    success.value = 'User deleted successfully.'
    fetchUsers()
  } catch (err) {
    error.value = 'Failed to delete user.'
  }
}
</script>

<style scoped>
.admin-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.role-badge.admin { background: #fee2e2; color: #991b1b; }
.role-badge.photographer { background: #e0e7ff; color: #3730a3; }
.role-badge.client { background: #dcfce7; color: #166534; }

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary {
  background: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary:hover { background: #d1d5db; }

.btn-action {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-action.edit { background: #f3f4f6; color: #1f2937; }
.btn-action.edit:hover { background: #e5e7eb; }

.btn-action.delete { background: #fee2e2; color: #dc2626; }
.btn-action.delete:hover { background: #fca5a5; }
.btn-action.delete:disabled { opacity: 0.5; cursor: not-allowed; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.modal-content h2 {
  margin-bottom: 1.5rem;
  margin-top: 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.alert-error {
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-success {
  background: #dcfce7;
  color: #166534;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.loading-state {
  padding: 2rem;
  text-align: center;
  color: #666;
}
</style>
