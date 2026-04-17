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
.portfolio-view {
  --primary: #0f172a;
  --accent: #3b82f6;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

.header {
  margin-bottom: 2rem;
}

.title h1 {
  margin: 0.5rem 0 0 0;
  font-size: 2rem;
  letter-spacing: -0.02em;
}

.title p {
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

.back-btn {
  margin-bottom: 1rem;
  display: inline-block;
}

.btn-cancel {
  background: white;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}
.btn-cancel:hover { background: #f8fafc; }

.toast {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 500;
}
.toast.success { background: #dcfce7; color: #166534; }
.toast.error { background: #fee2e2; color: #991b1b; }

.loading {
  text-align: center;
  padding: 4rem;
  color: #64748b;
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  border: 1px dashed #cbd5e1;
  color: #64748b;
}
.empty-state svg {
  color: #94a3b8;
  margin-bottom: 1rem;
}
.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary);
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.portfolio-item {
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  aspect-ratio: 4/3;
}

.portfolio-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.portfolio-item:hover .portfolio-image {
  transform: scale(1.05);
}

.portfolio-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.25rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.portfolio-item:hover .portfolio-overlay {
  opacity: 1;
}

.portfolio-info {
  color: white;
}
.portfolio-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
}
.portfolio-info p {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-delete {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-delete:hover {
  background: #ef4444;
}
</style>
