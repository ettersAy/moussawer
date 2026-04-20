<template>
  <div class="photographer-services-view">
    <ServiceHeader 
      v-model="searchQuery"
      :total="totalItems"
      :count="services.length"
      @search="handleSearch"
      @clear="clearSearch"
      @add="openCreateModal"
    />

    <ServiceFilters 
      :filters="filters"
      @change="handleFilterChange"
    />

    <div class="toast-container">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </transition-group>
    </div>

    <ServiceTable 
      :services="services"
      :loading="loading"
      @edit="openEditModal"
      @delete="confirmDeleteService"
      @toggle="handleToggleServiceStatus"
      @add="openCreateModal"
    />

    <AppPagination 
      :current-page="currentPage"
      :total-pages="totalPages"
      @change="changePage"
    />

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
import ServiceHeader from '@/components/photographer/ServiceHeader.vue' 
import ServiceFilters from '@/components/photographer/ServiceFilters.vue'
import ServiceTable from '@/components/photographer/ServiceTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import ServiceModal from '@/components/photographer/ServiceModal.vue'

const {
  services, loading, currentPage, totalPages, totalItems,
  searchQuery, filters, fetchServices, handleSearch,
  clearSearch, changePage, updateService, deleteService
} = usePhotographerServices()

const { toasts, showToast } = useToast()

const showModal = ref(false)
const editingService = ref(null)

onMounted(() => {
  fetchServices()
})

const handleFilterChange = (newFilters) => {
  Object.assign(filters, newFilters)
  handleSearch()
}

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
  if (!confirm('Are you sure you want to delete this service?')) return
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
