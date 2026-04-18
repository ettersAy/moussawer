<template>
  <div v-if="loading" class="bookings-loading">
      <p>Loading bookings...</p>
  </div>
  
  <div v-else-if="bookings.length === 0" class="bookings-empty-state">
      <p>You haven't booked any sessions yet.</p>
      <router-link to="/client/photographers" class="bookings-btn-link">
          Browse photographers
      </router-link>
  </div>
  
  <div v-else class="bookings-grid">
      <div v-for="booking in bookings" :key="booking.id" class="booking-card">
          <h3>{{ booking.photographer_name }}</h3>
          <p><strong>Schedule:</strong> {{ formatDate(booking.scheduled_at) }}</p>
          <p><strong>Status:</strong> <span class="booking-status" :class="booking.status">{{ booking.status }}</span></p>
          <p v-if="booking.notes"><strong>Notes:</strong> {{ booking.notes }}</p>
          <div class="booking-actions">
              <button @click="$emit('view', booking.id)" class="booking-btn-view">
                  View Details
              </button>
              <button v-if="booking.status === 'pending'" @click="$emit('cancel', booking.id)" class="booking-btn-cancel">
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

defineEmits(['view', 'cancel'])

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
