<template>
  <div>
      <h1>My Bookings</h1>
      <p>View and manage your photography bookings.</p>
      
      <div class="bookings-header-actions">
          <router-link to="/client/photographers" class="bookings-btn-new-booking">
              Book New Session
          </router-link>
      </div>
      
      <BookingsList 
        :bookings="bookings"
        :loading="loading"
        @view="handleView"
        @cancel="handleCancel"
      />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookings } from '@/composables/useBookings'
import BookingsList from '@/components/client/BookingsList.vue'

const router = useRouter()
const { bookings, loading, fetchBookings, cancelBooking } = useBookings()

const handleView = (id) => {
  router.push(`/client/bookings/${id}`)
}

const handleCancel = async (id) => {
  if (confirm('Are you sure you want to cancel this booking?')) {
      await cancelBooking(id)
  }
}

onMounted(() => {
  fetchBookings()
})
</script>
