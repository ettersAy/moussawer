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
      @view="handleViewDetails"
      @cancel="openCancelDialog"
      @page-change="handlePageChange"
    />

    <!-- Booking Details Modal -->
    <BookingDetailsModal 
      :show="showDetailsModal"
      :booking-id="currentBookingId"
      @close="closeDetailsModal"
      @cancel="openCancelDialogFromModal"
    />

    <!-- Confirmation Dialog -->
    <ConfirmationDialog 
      :show="showCancelDialog"
      title="Cancel Booking"
      message="Are you sure you want to cancel this booking? This action cannot be undone and may be subject to cancellation fees."
      confirm-text="Cancel Booking"
      variant="danger"
      :loading="actionLoading"
      @confirm="handleCancel"
      @cancel="closeCancelDialog"
      @close="closeCancelDialog"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBookings } from '@/composables/useBookings'
import BookingFilters from '@/components/shared/BookingFilters.vue'
import BookingsTable from '@/components/shared/BookingsTable.vue'
import ConfirmationDialog from '@/components/shared/ConfirmationDialog.vue'
import BookingDetailsModal from '@/components/client/BookingDetailsModal.vue'

const { bookings, loading, currentPage, totalPages, fetchBookings, cancelBooking } = useBookings()

const filters = ref({
  status: '',
  sort_by: 'scheduled_date',
  sort_direction: 'desc'
})

// Modal states
const showDetailsModal = ref(false)
const showCancelDialog = ref(false)
const currentBookingId = ref(null)
const actionLoading = ref(false)

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

const handleViewDetails = (id) => {
  currentBookingId.value = id
  showDetailsModal.value = true
}

const openCancelDialog = (id) => {
  currentBookingId.value = id
  showCancelDialog.value = true
}

const openCancelDialogFromModal = (id) => {
  showDetailsModal.value = false
  openCancelDialog(id)
}

const handleCancel = async () => {
  actionLoading.value = true
  try {
    await cancelBooking(currentBookingId.value)
    showCancelDialog.value = false
    loadBookings()
  } catch (error) {
    console.error('Failed to cancel booking:', error)
  } finally {
    actionLoading.value = false
  }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  currentBookingId.value = null
}

const closeCancelDialog = () => {
  showCancelDialog.value = false
  currentBookingId.value = null
}

onMounted(() => {
  loadBookings()
})
</script>
