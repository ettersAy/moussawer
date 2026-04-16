<template>
  <div class="portfolio-view">
    <div class="header">
      <div class="title">
        <h1>My Portfolio</h1>
        <p>Manage and showcase your best work</p>
      </div>
      <button class="btn-primary" @click="showUploadModal = true">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Upload Photo
      </button>
    </div>

    <!-- Feedback Toasts -->
    <div v-if="successMsg" class="toast success">{{ successMsg }}</div>
    <div v-if="errorMsg" class="toast error">{{ errorMsg }}</div>

    <div v-if="loading" class="loading">Loading your portfolio...</div>
    
    <div v-else-if="items.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
      <h3>No photos yet</h3>
      <p>Upload your first photo to start building your portfolio.</p>
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

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
      <div class="modal-content">
        <h2>Upload New Photo</h2>
        <form @submit.prevent="submitUpload">
          <div class="form-group">
            <label>Title</label>
            <input type="text" v-model="uploadForm.title" required placeholder="e.g. Summer Wedding" />
          </div>
          
          <div class="form-group">
            <label>Description (Optional)</label>
            <textarea v-model="uploadForm.description" rows="3" placeholder="Tell the story behind this photo..."></textarea>
          </div>
          
          <div class="form-group file-upload-group">
            <label>Photo</label>
            <div class="file-drop-area" :class="{ 'has-file': uploadForm.image }">
              <input type="file" @change="handleFileChange" accept="image/png, image/jpeg, image/webp" required class="file-input" />
              <div v-if="!uploadForm.image" class="file-prompt">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <span>Click to browse images</span>
              </div>
              <div v-else class="file-selected">
                <span>{{ uploadForm.image.name }}</span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeUploadModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="uploading">
              {{ uploading ? 'Uploading...' : 'Publish Photo' }}
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

const items = ref([])
const loading = ref(true)
const successMsg = ref('')
const errorMsg = ref('')

const showUploadModal = ref(false)
const uploading = ref(false)
const uploadForm = ref({
  title: '',
  description: '',
  image: null
})

const fetchItems = async () => {
  loading.value = true
  try {
    const response = await api.get('/photographer/portfolios')
    items.value = response.data.data
  } catch (err) {
    if (err.response?.status === 400) {
      errorMsg.value = err.response.data.message || 'Please complete your profile first.'
    } else {
      errorMsg.value = 'Failed to load portfolio items.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
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

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    uploadForm.value.image = file
  }
}

const closeUploadModal = () => {
  showUploadModal.value = false
  uploadForm.value = { title: '', description: '', image: null }
}

const submitUpload = async () => {
  if (!uploadForm.value.image) return
  
  uploading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  const formData = new FormData()
  formData.append('title', uploadForm.value.title)
  if (uploadForm.value.description) {
    formData.append('description', uploadForm.value.description)
  }
  formData.append('image', uploadForm.value.image)

  try {
    const response = await api.post('/photographer/portfolios', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    flashMessage('success', response.data.message || 'Photo published successfully!')
    closeUploadModal()
    fetchItems()
  } catch (err) {
    flashMessage('error', err.response?.data?.message || 'Failed to upload photo.')
  } finally {
    uploading.value = false
  }
}

const deleteItem = async (id) => {
  if (!confirm('Are you sure you want to permanently delete this photo?')) return
  
  try {
    const response = await api.delete(`/photographer/portfolios/${id}`)
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
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.title h1 {
  margin: 0;
  font-size: 2rem;
  letter-spacing: -0.02em;
}

.title p {
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #1e293b;
  transform: translateY(-1px);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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
  group: hover;
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

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}

.modal-content h2 { margin: 0 0 1.5rem 0; }

.form-group { margin-bottom: 1.25rem; }

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--primary);
}

.form-group input[type="text"], .form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: inherit;
}

.file-drop-area {
  position: relative;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s;
  background: #f8fafc;
}

.file-drop-area:hover {
  border-color: var(--accent);
  background: #eff6ff;
}

.file-drop-area.has-file {
  border: 2px solid var(--accent);
  background: #eff6ff;
}

.file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-prompt {
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.file-selected {
  font-weight: 500;
  color: var(--primary);
  word-break: break-all;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel {
  background: white;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}
.btn-cancel:hover { background: #f8fafc; }
</style>
