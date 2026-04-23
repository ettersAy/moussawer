<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content" style="max-width: 700px;">
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

            <!-- Client Information -->
            <div class="details-section">
              <h3>Client Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Client Name</label>
                  <span class="info-value">{{ booking.client?.name || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Email</label>
                  <span class="info-value">{{ booking.client?.email || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Phone</label>
                  <span class="info-value">{{ booking.client?.phone || 'Not provided' }}</span>
                </div>
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

            <!-- Review -->
            <div v-if="booking.review" class="details-section">
              <h3>Client Review</h3>
              <div class="review-content">
                <div class="rating">
                  <span class="stars">
                    ★★★★★
                    <span class="filled-stars" :style="{ width: `${(booking.review.rating / 5) * 100}%` }">★★★★★</span>
                  </span>
                  <span class="rating-value">{{ booking.review.rating }}/5</span>
                </div>
                <div class="review-text" v-if="booking.review.comment">
                  "{{ booking.review.comment }}"
                </div>
                <div class="review-date">
                  Reviewed on {{ formatDate(booking.review.created_at) }}
                </div>
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

const emit = defineEmits(['close'])

const booking = ref(null)
const loading = ref(false)

const closeModal = () => {
  emit('close')
}

const fetchBookingDetails = async () => {
  if (!props.bookingId) return
  
  loading.value = true
  try {
    const response = await api.get(`/bookings/${props.bookingId}`)
    booking.value = response.data
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

<style scoped>
.modal-body {
  padding: 1.5rem 0;
  max-height: 70vh;
  overflow-y: auto;
}

.details-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.details-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.completed {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 0.95rem;
  color: #0f172a;
  font-weight: 500;
}

.description-text {
  white-space: pre-wrap;
  line-height: 1.5;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin-top: 0.5rem;
}

.notes-content {
  white-space: pre-wrap;
  line-height: 1.5;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.review-content {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.stars {
  position: relative;
  color: #e2e8f0;
  font-size: 1.25rem;
  letter-spacing: 2px;
}

.filled-stars {
  position: absolute;
  top: 0;
  left: 0;
  color: #fbbf24;
  overflow: hidden;
  white-space: nowrap;
}

.rating-value {
  font-weight: 600;
  color: #0f172a;
}

.review-text {
  font-style: italic;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.review-date {
  font-size: 0.8rem;
  color: #64748b;
}

.text-success {
  color: #059669;
}

.text-warning {
  color: #d97706;
}

.text-danger {
  color: #dc2626;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-state .spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>