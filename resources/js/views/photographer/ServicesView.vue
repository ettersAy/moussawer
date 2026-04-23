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

    <!-- Delete Service Confirmation Dialog -->
    <ConfirmationDialog 
      :show="showDeleteDialog"
      title="Delete Service"
      message="Are you sure you want to delete this service?"
      confirm-text="Delete Service"
      variant="danger"
      :loading="deleteLoading"
      @confirm="handleDeleteService"
      @cancel="closeDeleteDialog"
      @close="closeDeleteDialog"
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
import ConfirmationDialog from '@/components/shared/ConfirmationDialog.vue'

const {
  services, loading, currentPage, totalPages, totalItems,
  searchQuery, filters, fetchServices, handleSearch,
  clearSearch, changePage, updateService, deleteService
} = usePhotographerServices()

const { toasts, showToast } = useToast()

const showModal = ref(false)
const editingService = ref(null)
const showDeleteDialog = ref(false)
const deleteLoading = ref(false)
const serviceToDelete = ref(null)

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

const confirmDeleteService = (id) => {
  serviceToDelete.value = id
  showDeleteDialog.value = true
}

const handleDeleteService = async () => {
  deleteLoading.value = true
  try {
    await deleteService(serviceToDelete.value)
    showToast('Service deleted successfully.')
    showDeleteDialog.value = false
    fetchServices(currentPage.value)
  } catch (err) {
    showToast('Failed to delete service.', 'error')
  } finally {
    deleteLoading.value = false
    serviceToDelete.value = null
  }
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  serviceToDelete.value = null
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
