<template>
  <div class="view-container">
    <div class="view-header">
      <div>
        <h1>My Bookings</h1>
        <p>Manage your photography bookings and sessions.</p>
      </div>
    </div>
    
    <BookingFilters 
      v-model="filters" 
      @change="handleFilterChange" 
    />
    
    <BookingsTable 
      :bookings="bookings"
      :loading="loading"
      role="photographer"
      :current-page="currentPage"
      :total-pages="totalPages"
      @confirm="handleConfirm"
      @complete="handleComplete"
      @cancel="handleCancel"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBookings } from '@/composables/useBookings'
import BookingFilters from '@/components/shared/BookingFilters.vue'
import BookingsTable from '@/components/shared/BookingsTable.vue'

const { bookings, loading, currentPage, totalPages, fetchBookings, updateBookingStatus, cancelBooking } = useBookings()

const filters = ref({
  status: '',
  sort_by: 'scheduled_date',
  sort_direction: 'desc'
})

const loadBookings = () => {
  fetchBookings({
    page: currentPage.value,
    ...filters.value
  })
}

const handleFilterChange = () => {
  currentPage.value = 1
  loadBookings()
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadBookings()
}

const handleConfirm = async (id) => {
  await updateBookingStatus(id, 'confirmed')
  loadBookings()
}

const handleComplete = async (id) => {
  await updateBookingStatus(id, 'completed')
  loadBookings()
}

const handleCancel = async (id) => {
  if (confirm('Are you sure you want to cancel this booking?')) {
    await cancelBooking(id)
    loadBookings()
  }
}

onMounted(() => {
  loadBookings()
})
</script>
