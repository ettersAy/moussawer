<template>
  <div v-if="loading" class="bookings-loading">
      <p>Loading bookings...</p>
  </div>
  
  <div v-else-if="bookings.length === 0" class="bookings-empty-state">
      <p>No bookings yet. Your future bookings will appear here.</p>
  </div>
  
  <div v-else class="bookings-grid">
      <div v-for="booking in bookings" :key="booking.id" class="booking-card">
          <h3>{{ booking.client_name }}</h3>
          <p><strong>Date:</strong> {{ formatDate(booking.scheduled_at) }}</p>
          <p><strong>Status:</strong> <span class="booking-status" :class="booking.status">{{ booking.status }}</span></p>
          <p v-if="booking.location"><strong>Location:</strong> {{ booking.location }}</p>
          <div class="booking-actions">
              <button v-if="booking.status === 'pending'" @click="$emit('confirm', booking.id)" class="booking-btn-confirm" style="background-color: #28a745; color: white;">
                  Confirm
              </button>
              <button v-if="booking.status === 'confirmed'" @click="$emit('complete', booking.id)" class="booking-btn-complete" style="background-color: #17a2b8; color: white;">
                  Mark Complete
              </button>
              <button v-if="['pending', 'confirmed'].includes(booking.status)" @click="$emit('cancel', booking.id)" class="booking-btn-cancel">
                  Cancel
              </button>
          </div>
      </div>
  </div>
</template>

<script setup>
defineProps({
  bookings: {
      type: Array,
      required: true
  },
  loading: {
      type: Boolean,
      default: false
  }
})

defineEmits(['confirm', 'complete', 'cancel'])

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
  })
}
</script>
