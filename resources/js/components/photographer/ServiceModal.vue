<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ service ? 'Edit Service' : 'Add New Service' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        
        <form @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-group">
              <label>Service Name *</label>
              <input type="text" v-model="form.name" required placeholder="e.g., Wedding Package" />
            </div>
            <div class="form-group">
              <label>Price ($) *</label>
              <input type="number" v-model="form.price" required min="0" step="0.01" placeholder="200.00" />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Duration (minutes)</label>
              <input type="number" v-model="form.duration_minutes" min="15" max="480" step="15" placeholder="e.g., 240 (4 hours)" />
              <small class="text-muted">Leave empty for flexible duration</small>
            </div>
            <div class="form-group">
              <label>Minimum Hours *</label>
              <input type="number" v-model="form.minimum_hours" required min="1" max="24" placeholder="4" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Sort Order</label>
              <input type="number" v-model="form.sort_order" min="0" placeholder="0" />
              <small class="text-muted">Lower numbers appear first</small>
            </div>
            <div class="form-group">
              <label>Status</label>
              <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <input type="radio" v-model="form.is_active" :value="true" />
                  <span>Active</span>
                </label>
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <input type="radio" v-model="form.is_active" :value="false" />
                  <span>Inactive</span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" rows="3" placeholder="Describe your service package, what's included, etc."></textarea>
            <small class="text-muted">Optional, max 1000 characters</small>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : (service ? 'Update Service' : 'Create Service') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import '@css/components/modals.css'
import { ref, watch } from 'vue'
import api from '@/services/api'

const props = defineProps({
  show: Boolean,
  service: Object
})

const emit = defineEmits(['close', 'saved', 'error'])

const submitting = ref(false)
const form = ref({
  name: '',
  description: '',
  price: '',
  duration_minutes: '',
  minimum_hours: 1,
  is_active: true,
  sort_order: 0
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.service) {
      form.value = {
        name: props.service.name || '',
        description: props.service.description || '',
        price: props.service.price || '',
        duration_minutes: props.service.duration_minutes || '',
        minimum_hours: props.service.minimum_hours || 1,
        is_active: props.service.is_active !== undefined ? props.service.is_active : true,
        sort_order: props.service.sort_order || 0
      }
    } else {
      form.value = {
        name: '',
        description: '',
        price: '',
        duration_minutes: '',
        minimum_hours: 1,
        is_active: true,
        sort_order: 0
      }
    }
  }
})

const closeModal = () => {
  emit('close')
}

const submitForm = async () => {
  submitting.value = true
  
  try {
    const payload = { ...form.value }
    
    // Convert empty string to null for duration_minutes
    if (payload.duration_minutes === '') {
      payload.duration_minutes = null
    }
    
    // Convert string numbers to actual numbers
    payload.price = parseFloat(payload.price)
    payload.minimum_hours = parseInt(payload.minimum_hours)
    payload.sort_order = parseInt(payload.sort_order)
    if (payload.duration_minutes !== null) {
      payload.duration_minutes = parseInt(payload.duration_minutes)
    }

    if (props.service) {
      await api.put(`/photographer/services/${props.service.id}`, payload)
      emit('saved', 'Service updated successfully.')
    } else {
      await api.post('/photographer/services', payload)
      emit('saved', 'Service created successfully.')
    }
    closeModal()
  } catch (err) {
    const errorMessage = err.response?.data?.message || 
                        err.response?.data?.errors?.[0] || 
                        'Failed to save service.'
    emit('error', errorMessage)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
</style>
