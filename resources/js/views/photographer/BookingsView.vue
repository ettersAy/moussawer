<template>
  <div>
      <h1>My Bookings</h1>
      <p>Manage your photography bookings and sessions.</p>
      
      <BookingsList 
        :bookings="bookings"
        :loading="loading"
        @confirm="handleConfirm"
        @complete="handleComplete"
        @cancel="handleCancel"
      />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useBookings } from '@/composables/useBookings'
import BookingsList from '@/components/photographer/BookingsList.vue'

const { bookings, loading, fetchBookings, updateBookingStatus, cancelBooking } = useBookings()

const handleConfirm = async (id) => {
  await updateBookingStatus(id, 'confirmed')
}

const handleComplete = async (id) => {
  await updateBookingStatus(id, 'completed')
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
