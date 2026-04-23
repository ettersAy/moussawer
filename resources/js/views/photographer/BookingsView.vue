<template>
  <div class="bookings-view">
    <!-- Header -->
    <div class="photographer-page-header">
      <div class="header-titles">
        <h1>My Bookings</h1>
        <p class="subtitle">Manage your photography bookings, track revenue, and respond to client requests.</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Pending</span>
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-value">{{ stats.pending }}</div>
        <div class="stat-change">Awaiting your response</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Confirmed</span>
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="stat-value">{{ stats.confirmed }}</div>
        <div class="stat-change">Upcoming sessions</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Completed</span>
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="stat-value">{{ stats.completed }}</div>
        <div class="stat-change">Past sessions</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Monthly Revenue</span>
          <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="stat-value">{{ formatCurrency(stats.total_revenue_month) }}</div>
        <div class="stat-change">This month</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-panel">
      <select :value="filters.status" @input="updateFilter('status', $event.target.value)">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <select :value="filters.sort_by" @input="updateFilter('sort_by', $event.target.value)">
        <option value="scheduled_date">Sort by Date</option>
        <option value="created_at">Sort by Booking Created</option>
        <option value="price">Sort by Price</option>
        <option value="status">Sort by Status</option>
      </select>

      <select :value="filters.sort_direction" @input="updateFilter('sort_direction', $event.target.value)">
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>

      <input 
        type="date" 
        :value="filters.date_from" 
        @input="updateFilter('date_from', $event.target.value)"
        placeholder="From Date"
        class="date-filter"
      >
      
      <input 
        type="date" 
        :value="filters.date_to" 
        @input="updateFilter('date_to', $event.target.value)"
        placeholder="To Date"
        class="date-filter"
      >
    </div>

    <!-- Bookings Table -->
    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading bookings...</p>
      </div>
      
      <div class="table-responsive" v-else-if="bookings.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Booking Info</th>
              <th>Service & Price</th>
              <th>Client</th>
              <th>Date & Time</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookings" :key="booking.id">
              <td class="info-cell">
                <div class="info-row">
                  <span class="status-dot" :class="getStatusColor(booking.status)" :title="getStatusLabel(booking.status)"></span>
                  <span class="font-mono text-muted">#{{ booking.id }}</span>
                  <span class="status-badge" :class="getStatusColor(booking.status)">{{ getStatusLabel(booking.status) }}</span>
                </div>
                <div class="date-row text-muted" v-if="booking.location">
                  <small title="Location">📍 {{ booking.location }}</small>
                </div>
                <div class="date-row text-muted" v-if="booking.notes">
                  <small title="Notes">{{ booking.notes.substring(0, 40) }}{{ booking.notes.length > 40 ? '...' : '' }}</small>
                </div>
              </td>
              
              <td>
                <div class="service-info">
                  <span class="service-name">{{ booking.service?.name || 'Custom Service' }}</span>
                  <span class="service-price">{{ formatCurrency(booking.service?.price || 0) }}</span>
                </div>
              </td>
              
              <td>
                <div class="client-info">
                  <span class="client-name">{{ booking.client?.name || 'N/A' }}</span>
                  <span class="client-email">{{ booking.client?.email || '' }}</span>
                </div>
              </td>
              
              <td class="text-muted">
                {{ formatDate(booking.scheduled_date) }}
              </td>
              
              <td class="actions">
                <div class="btn-group">
                  <!-- View Details Button (Always visible) -->
                  <button class="btn-action view" @click="handleViewDetails(booking.id)" title="View Details">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  
                  <!-- Quick Actions based on status -->
                  <button v-if="booking.status === 'pending'" class="btn-action confirm" @click="openConfirmDialog(booking.id)" title="Confirm Booking">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                  
                  <button v-if="booking.status === 'confirmed'" class="btn-action complete" @click="openCompleteDialog(booking.id)" title="Mark Complete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </button>
                  
                  <button v-if="['pending', 'confirmed'].includes(booking.status)" class="btn-action cancel" @click="openCancelDialog(booking.id)" title="Cancel Booking">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <p>No bookings found matching your criteria.</p>
        <p class="text-muted mt-1">Try adjusting your filters or check back later.</p>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1 && !loading">
        <button 
          class="btn-page" 
          :disabled="currentPage === 1" 
          @click="changePage(currentPage - 1)">
          Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }} ({{ totalItems }} total bookings)</span>
        <button 
          class="btn-page" 
          :disabled="currentPage === totalPages" 
          @click="changePage(currentPage + 1)">
          Next
        </button>
      </div>
    </div>

    <!-- Booking Details Modal -->
    <BookingDetailsModal 
      :show="showDetailsModal"
      :booking-id="currentBookingId"
      @close="closeDetailsModal"
    />

    <!-- Confirmation Dialogs -->
    <ConfirmationDialog 
      :show="showConfirmDialog"
      title="Confirm Booking"
      message="Are you sure you want to confirm this booking? This will notify the client and mark the booking as confirmed."
      confirm-text="Confirm Booking"
      :loading="actionLoading"
      @confirm="handleConfirm"
      @cancel="closeConfirmDialog"
      @close="closeConfirmDialog"
    />

    <ConfirmationDialog 
      :show="showCompleteDialog"
      title="Mark Booking as Complete"
      message="Are you sure you want to mark this booking as complete? This will finalize the booking and allow the client to leave a review."
      confirm-text="Mark Complete"
      :loading="actionLoading"
      @confirm="handleComplete"
      @cancel="closeCompleteDialog"
      @close="closeCompleteDialog"
    />

    <ConfirmationDialog 
      :show="showCancelDialog"
      title="Cancel Booking"
      message="Are you sure you want to cancel this booking? This action cannot be undone and will notify the client."
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
import { usePhotographerBookings } from './bookings.js'
import ConfirmationDialog from '@/components/shared/ConfirmationDialog.vue'
import BookingDetailsModal from '@/components/photographer/BookingDetailsModal.vue'

const { 
  bookings, 
  loading, 
  currentPage, 
  totalPages, 
  totalItems,
  filters,
  stats,
  fetchBookings, 
  fetchStats,
  changePage,
  updateBookingStatus, 
  cancelBooking,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel
} = usePhotographerBookings()

// Modal states
const showDetailsModal = ref(false)
const showConfirmDialog = ref(false)
const showCompleteDialog = ref(false)
const showCancelDialog = ref(false)

// Current booking being acted upon
const currentBookingId = ref(null)
const actionLoading = ref(false)

const loadData = () => {
  fetchBookings()
  fetchStats()
}

const updateFilter = (key, value) => {
  filters.value[key] = value
  currentPage.value = 1
  fetchBookings()
}

// View Details
const handleViewDetails = (id) => {
  currentBookingId.value = id
  showDetailsModal.value = true
}

// Confirm Booking
const openConfirmDialog = (id) => {
  currentBookingId.value = id
  showConfirmDialog.value = true
}

const handleConfirm = async () => {
  actionLoading.value = true
  try {
    await updateBookingStatus(currentBookingId.value, 'confirmed')
    showConfirmDialog.value = false
  } catch (error) {
    console.error('Failed to confirm booking:', error)
  } finally {
    actionLoading.value = false
  }
}

// Complete Booking
const openCompleteDialog = (id) => {
  currentBookingId.value = id
  showCompleteDialog.value = true
}

const handleComplete = async () => {
  actionLoading.value = true
  try {
    await updateBookingStatus(currentBookingId.value, 'completed')
    showCompleteDialog.value = false
  } catch (error) {
    console.error('Failed to complete booking:', error)
  } finally {
    actionLoading.value = false
  }
}

// Cancel Booking
const openCancelDialog = (id) => {
  currentBookingId.value = id
  showCancelDialog.value = true
}

const handleCancel = async () => {
  actionLoading.value = true
  try {
    await cancelBooking(currentBookingId.value)
    showCancelDialog.value = false
  } catch (error) {
    console.error('Failed to cancel booking:', error)
  } finally {
    actionLoading.value = false
  }
}

// Close modals
const closeDetailsModal = () => {
  showDetailsModal.value = false
  currentBookingId.value = null
}

const closeConfirmDialog = () => {
  showConfirmDialog.value = false
  currentBookingId.value = null
}

const closeCompleteDialog = () => {
  showCompleteDialog.value = false
  currentBookingId.value = null
}

const closeCancelDialog = () => {
  showCancelDialog.value = false
  currentBookingId.value = null
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.date-filter {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
}

.date-filter:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
