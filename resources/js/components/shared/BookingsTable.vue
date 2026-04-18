<template>
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
            <th>{{ role === 'client' ? 'Photographer' : 'Client' }}</th>
            <th>Date & Time</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in bookings" :key="booking.id">
            <td class="info-cell">
              <div class="info-row">
                <span class="status-dot" :class="booking.status" :title="booking.status"></span>
                <span class="font-mono text-muted">#{{ booking.id }}</span>
              </div>
              <div class="date-row text-muted" v-if="booking.notes">
                <small title="Notes">{{ booking.notes.substring(0, 30) }}{{ booking.notes.length > 30 ? '...' : '' }}</small>
              </div>
            </td>
            <td class="font-medium">
              {{ role === 'client' ? booking.photographer?.user?.name : booking.client?.name }}
            </td>
            <td class="text-muted">
              {{ formatDate(booking.scheduled_date) }}
            </td>
            
            <td class="actions">
              <div class="btn-group">
                <!-- Client Actions -->
                <button v-if="role === 'client'" class="btn-action view" @click="$emit('view', booking.id)" title="View Details">
                  👁️
                </button>
                <button v-if="role === 'client' && booking.status === 'pending'" class="btn-action delete" @click="$emit('cancel', booking.id)" title="Cancel Booking">
                  ❌
                </button>

                <!-- Photographer Actions -->
                <button v-if="role === 'photographer' && booking.status === 'pending'" class="btn-action edit" @click="$emit('confirm', booking.id)" title="Confirm Booking">
                  ✅
                </button>
                <button v-if="role === 'photographer' && booking.status === 'confirmed'" class="btn-action view" @click="$emit('complete', booking.id)" title="Mark Complete">
                  🏁
                </button>
                <button v-if="role === 'photographer' && ['pending', 'confirmed'].includes(booking.status)" class="btn-action delete" @click="$emit('cancel', booking.id)" title="Cancel Booking">
                  ❌
                </button>

                <!-- Admin Actions -->
                <button v-if="role === 'admin'" class="btn-action view" @click="$emit('view', booking.id)" title="View Details">
                  👁️
                </button>
                <button v-if="role === 'admin' && ['pending', 'confirmed'].includes(booking.status)" class="btn-action delete" @click="$emit('cancel', booking.id)" title="Cancel Booking">
                  ❌
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-else class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      <p>No bookings found matching your criteria.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1 && !loading">
      <button 
        class="btn-page" 
        :disabled="currentPage === 1" 
        @click="$emit('page-change', currentPage - 1)">
        Previous
      </button>
      <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
      <button 
        class="btn-page" 
        :disabled="currentPage === totalPages" 
        @click="$emit('page-change', currentPage + 1)">
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  bookings: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  role: { type: String, required: true },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 }
})

defineEmits(['view', 'confirm', 'complete', 'cancel', 'page-change'])

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
</script>
