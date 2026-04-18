<template>
  <div class="portfolio-view">
    <div class="header">
      <div class="title">
        <h1>My Portfolio</h1>
        <p>Manage and showcase your best work</p>
      </div>
      <button class="btn-primary" @click="openUploadModal">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Upload Photo
      </button>
    </div>

    <!-- Feedback Toasts -->
    <div v-if="successMsg" class="toast success">{{ successMsg }}</div>
    <div v-if="errorMsg" class="toast error">{{ errorMsg }}</div>

    <PortfolioGrid 
      :items="items" 
      :loading="loading" 
      @edit="openEditModal" 
      @delete="handleDelete" 
    />

    <PortfolioUploadModal 
      :show="showUploadModal" 
      :item="editingItem"
      @close="closeUploadModal"
      @save="handleSave"
      @error="handleError"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePortfolio } from '@/composables/usePortfolio'
import PortfolioGrid from '@/components/photographer/PortfolioGrid.vue'
import PortfolioUploadModal from '@/components/photographer/PortfolioUploadModal.vue'

const { items, loading, fetchItems, deleteItem, saveItem } = usePortfolio()

const successMsg = ref('')
const errorMsg = ref('')

const showUploadModal = ref(false)
const editingItem = ref(null)

onMounted(() => {
  fetchItems().catch(err => {
    if (err.response?.status === 400) {
      errorMsg.value = err.response.data.message || 'Please complete your profile first.'
    } else {
      errorMsg.value = 'Failed to load portfolio items.'
    }
  })
})

const flashMessage = (type, msg) => {
  if (type === 'success') {
    successMsg.value = msg;
    setTimeout(() => successMsg.value = '', 4000);
  } else {
    errorMsg.value = msg;
    setTimeout(() => errorMsg.value = '', 4000);
  }
}

const openUploadModal = () => {
  editingItem.value = null
  showUploadModal.value = true
}

const openEditModal = (item) => {
  editingItem.value = item
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
  editingItem.value = null
}

const handleSave = async ({ formData, editingId }) => {
  try {
    const msg = await saveItem(formData, editingId)
    flashMessage('success', msg || 'Photo published successfully!')
    closeUploadModal()
  } catch (err) {
    flashMessage('error', err.response?.data?.message || 'Failed to upload photo.')
  }
}

const handleDelete = async (id) => {
  if (!confirm('Are you sure you want to permanently delete this photo?')) return
  try {
    const msg = await deleteItem(id)
    flashMessage('success', msg || 'Photo deleted successfully.')
  } catch (err) {
    flashMessage('error', 'Failed to delete photo.')
  }
}

const handleError = (msg) => {
  flashMessage('error', msg)
}
</script>

<style scoped>
/* File specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
