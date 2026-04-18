<template>
  <div class="portfolio-view">
    <div class="header">
      <div class="title">
        <button class="btn-cancel back-btn" @click="router.push('/admin/users')">
          &larr; Back to Users
        </button>
        <h1>{{ photographerName ? photographerName + "'s" : 'Photographer' }} Portfolio</h1>
        <p>Manage and review this user's portfolio items</p>
      </div>
    </div>

    <!-- Feedback Toasts -->
    <div v-if="successMsg" class="toast success">{{ successMsg }}</div>
    <div v-if="errorMsg" class="toast error">{{ errorMsg }}</div>

    <div v-if="loading" class="loading">Loading portfolio...</div>
    
    <div v-else-if="items.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
      <h3>No photos found</h3>
      <p>This photographer has no items in their portfolio.</p>
    </div>

    <div v-else class="portfolio-grid">
      <div v-for="item in items" :key="item.id" class="portfolio-item">
        <img :src="item.image_full_url" :alt="item.title" class="portfolio-image" />
        <div class="portfolio-overlay">
          <div class="portfolio-info">
            <h4>{{ item.title }}</h4>
            <p v-if="item.description">{{ item.description }}</p>
          </div>
          <button class="btn-delete" @click="deleteItem(item.id)" title="Delete Photo">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const userId = route.params.id

const items = ref([])
const photographerName = ref('')
const loading = ref(true)
const successMsg = ref('')
const errorMsg = ref('')

const fetchItems = async () => {
  loading.value = true
  try {
    const response = await api.get(`/admin/users/${userId}/portfolios`)
    items.value = response.data.data
    if (response.data.user) {
      photographerName.value = response.data.user.name
    }
  } catch (err) {
    if (err.response?.status === 400 || err.response?.status === 404) {
      errorMsg.value = err.response.data.message || 'Could not load portfolio.'
    } else {
      errorMsg.value = 'Failed to load portfolio items.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!userId) {
    router.push('/admin/users')
    return
  }
  fetchItems()
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

const deleteItem = async (id) => {
  if (!confirm('Are you sure you want to permanently delete this photo? This cannot be undone.')) return
  
  try {
    const response = await api.delete(`/admin/users/${userId}/portfolios/${id}`)
    flashMessage('success', response.data.message || 'Photo deleted successfully.')
    fetchItems()
  } catch (err) {
    flashMessage('error', 'Failed to delete photo.')
  }
}
</script>

<style scoped>
/* File specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
