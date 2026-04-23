<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content booking-details-modal" style="max-width: 700px;">
        <div class="modal-header">
          <h2>Booking Details #{{ booking?.id || '' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        
        <div class="modal-body">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading booking details...</p>
          </div>
          
          <div v-else-if="booking" class="booking-details">
            <!-- Status & Basic Info -->
            <div class="details-section">
              <div class="section-header">
                <h3>Booking Information</h3>
                <span class="status-badge" :class="getStatusColor(booking.status)">
                  {{ getStatusLabel(booking.status) }}
                </span>
              </div>
              
              <div class="info-grid">
                <div class="info-item">
                  <label>Booking ID</label>
                  <span class="info-value">#{{ booking.id }}</span>
                </div>
                <div class="info-item">
                  <label>Created</label>
                  <span class="info-value">{{ formatDate(booking.created_at) }}</span>
                </div>
                <div class="info-item">
                  <label>Last Updated</label>
                  <span class="info-value">{{ formatDate(booking.updated_at) }}</span>
                </div>
              </div>
            </div>

            <!-- Photographer Information -->
            <div class="details-section">
              <h3>Photographer Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Photographer Name</label>
                  <span class="info-value">{{ booking.photographer?.user?.name || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Email</label>
                  <span class="info-value">{{ booking.photographer?.user?.email || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Phone</label>
                  <span class="info-value">{{ booking.photographer?.phone || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <label>Specialty</label>
                  <span class="info-value">{{ booking.photographer?.specialty || 'General Photography' }}</span>
                </div>
              </div>
            </div>

            <!-- Service Details -->
            <div class="details-section">
              <h3>Service Details</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Service Name</label>
                  <span class="info-value">{{ booking.service?.name || 'Custom Service' }}</span>
                </div>
                <div class="info-item">
                  <label>Price</label>
                  <span class="info-value">{{ formatCurrency(booking.service?.price || 0) }}</span>
                </div>
                <div class="info-item">
                  <label>Duration</label>
                  <span class="info-value">
                    {{ booking.service?.duration_minutes ? `${booking.service.duration_minutes} minutes` : 'Flexible' }}
                  </span>
                </div>
                <div class="info-item">
                  <label>Minimum Hours</label>
                  <span class="info-value">{{ booking.service?.minimum_hours || 1 }} hours</span>
                </div>
              </div>
              <div v-if="booking.service?.description" class="info-item full-width">
                <label>Description</label>
                <div class="info-value description-text">{{ booking.service.description }}</div>
              </div>
            </div>

            <!-- Session Details -->
            <div class="details-section">
              <h3>Session Details</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Scheduled Date & Time</label>
                  <span class="info-value">{{ formatDate(booking.scheduled_date) }}</span>
                </div>
                <div class="info-item">
                  <label>Location</label>
                  <span class="info-value">{{ booking.location || 'Not specified' }}</span>
                </div>
                <div class="info-item">
                  <label>Event Type</label>
                  <span class="info-value">{{ booking.event_type || 'Not specified' }}</span>
                </div>
                <div class="info-item">
                  <label>Number of Guests</label>
                  <span class="info-value">{{ booking.guest_count || 'Not specified' }}</span>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="booking.notes" class="details-section">
              <h3>Notes</h3>
              <div class="notes-content">
                {{ booking.notes }}
              </div>
            </div>

            <!-- Payment Information -->
            <div v-if="booking.payment" class="details-section">
              <h3>Payment Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Payment Status</label>
                  <span class="info-value" :class="{
                    'text-success': booking.payment.status === 'completed',
                    'text-warning': booking.payment.status === 'pending',
                    'text-danger': booking.payment.status === 'failed'
                  }">
                    {{ booking.payment.status?.toUpperCase() || 'N/A' }}
                  </span>
                </div>
                <div class="info-item">
                  <label>Amount Paid</label>
                  <span class="info-value">{{ formatCurrency(booking.payment.amount || 0) }}</span>
                </div>
                <div class="info-item">
                  <label>Payment Method</label>
                  <span class="info-value">{{ booking.payment.method || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Transaction ID</label>
                  <span class="info-value">{{ booking.payment.transaction_id || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <!-- Actions for pending bookings -->
            <div v-if="booking.status === 'pending'" class="details-section">
              <h3>Actions</h3>
              <div class="action-buttons">
                <button class="btn-danger" @click="$emit('cancel', booking.id)" :disabled="actionLoading">
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <p>Unable to load booking details.</p>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="closeModal">
            Close
          </button>
        </div>
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
  bookingId: Number
})

const emit = defineEmits(['close', 'cancel'])

const booking = ref(null)
const loading = ref(false)
const actionLoading = ref(false)

const closeModal = () => {
  emit('close')
}

const fetchBookingDetails = async () => {
  if (!props.bookingId) return
  
  loading.value = true
  try {
    const response = await api.get(`/bookings/${props.bookingId}`)
    // Laravel JsonResource wraps in 'data' key, so unwrap it
    booking.value = response.data.data || response.data
  } catch (err) {
    console.error('Failed to load booking details:', err)
    booking.value = null
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'pending',
    confirmed: 'confirmed',
    completed: 'completed',
    cancelled: 'cancelled'
  }
  return colors[status] || 'pending'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return labels[status] || status
}

// Close on Escape key
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.show) {
    closeModal()
  }
}

// Watch for show changes
watch(() => props.show, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleKeydown)
    if (props.bookingId) {
      fetchBookingDetails()
    }
  } else {
    document.removeEventListener('keydown', handleKeydown)
    booking.value = null
  }
})
</script>
