<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ user ? 'Edit User' : 'Add New User' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        
        <form @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-group">
              <label>Name</label>
              <input type="text" v-model="form.name" required placeholder="John Doe" />
            </div>
            <div class="form-group">
              <label>Role</label>
              <select v-model="form.role" required>
                <option value="admin">Admin</option>
                <option value="photographer">Photographer</option>
                <option value="client">Client</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status" required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="form.email" required placeholder="john@example.com" />
          </div>
          
          <div class="form-divider"><span>Security</span></div>
          
          <div class="form-group">
            <label>{{ user ? 'New Password (leave blank to keep current)' : 'Password' }}</label>
            <input type="password" v-model="form.password" :required="!user" minlength="8" placeholder="••••••••" />
          </div>
          
          <transition name="fade">
            <div class="form-group" v-if="form.password">
              <label>Confirm Password</label>
              <input type="password" v-model="form.password_confirmation" required minlength="8" placeholder="••••••••" />
            </div>
          </transition>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Save User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '@/services/api'

const props = defineProps({
  show: Boolean,
  user: Object
})

const emit = defineEmits(['close', 'saved', 'error'])

const submitting = ref(false)
const form = ref({
  name: '',
  email: '',
  role: 'client',
  status: 'active',
  password: '',
  password_confirmation: ''
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.user) {
      form.value = {
        name: props.user.name,
        email: props.user.email,
        role: props.user.role,
        status: props.user.status || 'active',
        password: '',
        password_confirmation: ''
      }
    } else {
      form.value = {
        name: '',
        email: '',
        role: 'client',
        status: 'active',
        password: '',
        password_confirmation: ''
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
    if (props.user && !payload.password) {
      delete payload.password
      delete payload.password_confirmation
    }

    if (props.user) {
      await api.put(`/admin/users/${props.user.id}`, payload)
      emit('saved', 'User updated successfully.')
    } else {
      await api.post('/admin/users', payload)
      emit('saved', 'User created successfully.')
    }
    closeModal()
  } catch (err) {
    emit('error', err.response?.data?.message || 'Failed to save user.')
  } finally {
    submitting.value = false
  }
}
</script>
