<template>
  <div class="view-container">
    <div class="view-header">
      <div>
        <h1>My Bookings</h1>
        <p>View and manage your photography bookings.</p>
      </div>
      <div class="header-actions">
        <router-link to="/client/photographers" class="btn-primary">
          Book New Session
        </router-link>
      </div>
    </div>
    
    <BookingFilters 
      v-model="filters" 
      @change="handleFilterChange" 
    />
    
    <BookingsTable 
      :bookings="bookings"
      :loading="loading"
      role="client"
      :current-page="currentPage"
      :total-pages="totalPages"
      @view="handleView"
      @cancel="handleCancel"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookings } from '@/composables/useBookings'
import BookingFilters from '@/components/shared/BookingFilters.vue'
import BookingsTable from '@/components/shared/BookingsTable.vue'

const router = useRouter()
const { bookings, loading, currentPage, totalPages, fetchBookings, cancelBooking } = useBookings()

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

const handleView = (id) => {
  router.push(`/client/bookings/${id}`)
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
