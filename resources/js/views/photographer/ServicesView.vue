<template>
  <div class="photographer-services-view">
    <div class="admin-page-header">
      <div class="header-titles">
        <h1>Manage Services & Rates</h1>
        <p class="subtitle" v-if="totalItems">Showing {{ services.length }} of {{ totalItems }} services</p>
      </div>
      
      <div class="header-actions">
        <div class="search-box">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search service name..." 
            @keyup.enter="handleSearch"
          />
          <button v-if="searchQuery" class="clear-search" @click="clearSearch">&times;</button>
        </div>
        <button class="btn-primary" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Service
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-panel">
      <select v-model="filters.status" @change="handleSearch">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select v-model="filters.sort_by" @change="handleSearch">
        <option value="sort_order">Sort by Order</option>
        <option value="name">Sort by Name</option>
        <option value="price">Sort by Price</option>
        <option value="created_at">Sort by Date</option>
      </select>
      <select v-model="filters.sort_direction" @change="handleSearch">
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </transition-group>
    </div>

    <!-- Services Table -->
    <div class="table-container">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Minimum Hours</th>
              <th>Status</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6">
                <div class="loading-state">
                  <div class="spinner"></div>
                  <p>Loading services...</p>
                </div>
              </td>
            </tr>
            <tr v-else-if="services.length === 0">
              <td colspan="6">
                <div class="empty-state">
                  <p>No services found.</p>
                  <button class="btn-secondary mt-1" @click="openCreateModal">Create your first service</button>
                </div>
              </td>
            </tr>
            <tr v-else v-for="service in services" :key="service.id">
              <td>
                <div class="info-cell">
                  <div class="info-row">
                    <span class="font-medium">{{ service.name }}</span>
                    <span class="status-dot" :class="service.is_active ? 'active' : 'inactive'"></span>
                  </div>
                  <div class="text-muted" v-if="service.description">{{ service.description }}</div>
                  <div class="date-row text-muted">
                    Created {{ formatDate(service.created_at) }}
                  </div>
                </div>
              </td>
              <td>
                <span class="price-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  ${{ service.price }}
                </span>
              </td>
              <td>
                <span class="duration-badge" v-if="service.duration_minutes">
                  {{ formatDuration(service.duration_minutes) }}
                </span>
                <span class="text-muted" v-else>Flexible</span>
              </td>
              <td>
                <span class="duration-badge">
                  {{ service.minimum_hours }} hour{{ service.minimum_hours !== 1 ? 's' : '' }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="service.is_active ? 'active' : 'inactive'">
                  {{ service.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="actions-col">
                <div class="actions">
                  <div class="btn-group">
                    <button class="btn-action" @click="openEditModal(service)" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-action delete" @click="confirmDeleteService(service.id)" title="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><line x1="10" y1="4" x2="14" y2="4"></line></svg>
                    </button>
                  </div>
                  <button 
                    class="btn-action" 
                    @click="handleToggleServiceStatus(service)"
                    :title="service.is_active ? 'Deactivate' : 'Activate'"
                  >
                    <svg v-if="service.is_active" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <div class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div>
          <button class="btn-page" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
            Previous
          </button>
          <button class="btn-page" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Service Modal (Create/Edit) -->
    <ServiceModal 
      :show="showModal"
      :service="editingService"
      @close="closeModal"
      @saved="handleServiceSaved"
      @error="handleServiceError"
    />
  </div>
</template>

<script setup>
import '@css/views/photographer/services.css'
import { ref, onMounted } from 'vue'
import { usePhotographerServices } from '@/composables/usePhotographerServices'
import { useToast } from '@/composables/useToast'
import ServiceModal from '@/components/photographer/ServiceModal.vue'


const {
  services, loading, currentPage, totalPages, totalItems,
  searchQuery, filters, fetchServices, handleSearch,
  clearSearch, changePage, createService, updateService,
  deleteService
} = usePhotographerServices()

const { toasts, showToast } = useToast()

const showModal = ref(false)
const editingService = ref(null)

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`
  return `${hours}h ${remainingMinutes}m`
}

onMounted(() => {
  fetchServices()
})

const openCreateModal = () => {
  editingService.value = null
  showModal.value = true
}

const openEditModal = (service) => {
  editingService.value = { ...service }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleServiceSaved = (message) => {
  showToast(message, 'success')
  fetchServices(currentPage.value)
}

const handleServiceError = (message) => {
  showToast(message, 'error')
}

const confirmDeleteService = async (id) => {
  if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) return
  try {
    await deleteService(id)
    showToast('Service deleted successfully.')
  } catch (err) {
    showToast('Failed to delete service.', 'error')
  }
}

const handleToggleServiceStatus = async (service) => {
  try {
    const newStatus = !service.is_active
    await updateService(service.id, { is_active: newStatus })
    showToast(`Service ${newStatus ? 'activated' : 'deactivated'} successfully.`)
    fetchServices(currentPage.value)
  } catch (err) {
    showToast('Failed to update service status.', 'error')
  }
}
</script>

<style scoped>
</style>
