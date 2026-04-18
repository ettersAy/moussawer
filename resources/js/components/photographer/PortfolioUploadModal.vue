<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h2>{{ isEditing ? 'Edit Photo' : 'Upload New Photo' }}</h2>
      <form @submit.prevent="submitUpload">
        <div class="form-group">
          <label>Title</label>
          <input type="text" v-model="form.title" required placeholder="e.g. Summer Wedding" />
        </div>
        
        <div class="form-group">
          <label>Description (Optional)</label>
          <textarea v-model="form.description" rows="3" placeholder="Tell the story behind this photo..."></textarea>
        </div>

        <div class="form-row" style="display: flex; gap: 1rem;">
          <div class="form-group" style="flex: 1;">
            <label>Category (Optional)</label>
            <input type="text" v-model="form.category" placeholder="e.g. Portrait, Event" />
          </div>
          
          <div class="form-group" style="flex: 1;">
            <label>Tags (Optional)</label>
            <input type="text" v-model="form.tags" placeholder="e.g. outdoor, sunset, model (comma separated)" />
          </div>
        </div>
        
        <div class="form-group file-upload-group">
          <label>Photo</label>
          <div class="file-drop-area" :class="{ 'has-file': form.image }">
            <input type="file" @change="handleFileChange" accept="image/png, image/jpeg, image/webp" :required="!isEditing" class="file-input" />
            <div v-if="!form.image" class="file-prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <span>Click to browse images</span>
            </div>
            <div v-else class="file-selected">
              <span>{{ form.image.name }}</span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="uploading">
            {{ uploading ? 'Uploading...' : 'Publish Photo' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  item: Object
})

const emit = defineEmits(['close', 'save', 'error'])

const form = ref({
  title: '',
  description: '',
  category: '',
  tags: '',
  image: null
})

const uploading = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.item) {
      isEditing.value = true
      editingId.value = props.item.id
      form.value = {
        title: props.item.title,
        description: props.item.description || '',
        category: props.item.category || '',
        tags: props.item.tags ? props.item.tags.join(', ') : '',
        image: null
      }
    } else {
      isEditing.value = false
      editingId.value = null
      form.value = { title: '', description: '', category: '', tags: '', image: null }
    }
  }
})

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.value.image = file
  }
}

const closeModal = () => {
  emit('close')
}

const submitUpload = async () => {
  if (!form.value.image && !isEditing.value) return
  
  uploading.value = true
  
  const formData = new FormData()
  formData.append('title', form.value.title)
  if (form.value.description) formData.append('description', form.value.description)
  if (form.value.category) formData.append('category', form.value.category)
  if (form.value.tags) {
    const tagsArray = form.value.tags.split(',').map(t => t.trim()).filter(Boolean)
    formData.append('tags', JSON.stringify(tagsArray))
  }
  if (form.value.image) {
    formData.append('image', form.value.image)
  }

  try {
    emit('save', { formData, editingId: editingId.value })
  } catch (err) {
    emit('error', 'Failed to upload photo.')
  } finally {
    uploading.value = false
  }
}
</script>
