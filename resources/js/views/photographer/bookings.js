import { ref, watch } from 'vue'
import api from '@/services/api'

export function usePhotographerBookings() {
  const bookings = ref([])
  const loading = ref(true)
  
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  
  const filters = ref({
    status: '',
    sort_by: 'scheduled_date',
    sort_direction: 'desc',
    date_from: '',
    date_to: ''
  })

  const stats = ref({
    pending: 0,
    confirmed: 0,
    completed: 0,
    total_revenue_month: 0
  })

  const fetchBookings = async (page = 1) => {
    loading.value = true
    try {
      const response = await api.get('/bookings', {
        params: { 
          page,
          ...filters.value
        }
      })
      bookings.value = response.data.data
      if (response.data.meta) {
        currentPage.value = response.data.meta.current_page
        totalPages.value = response.data.meta.last_page
        totalItems.value = response.data.meta.total
      } else {
        totalItems.value = bookings.value.length
      }
    } catch (err) {
      console.error('Failed to load bookings:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/bookings/stats')
      stats.value = response.data
    } catch (err) {
      console.error('Failed to load booking stats:', err)
    }
  }

  const handleFilterChange = () => {
    currentPage.value = 1
    fetchBookings(1)
  }

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      fetchBookings(page)
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status })
      await fetchBookings(currentPage.value)
      await fetchStats()
    } catch (error) {
      console.error('Failed to update booking status:', error)
      throw error
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`)
      await fetchBookings(currentPage.value)
      await fetchStats()
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      throw error
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

  return {
    bookings,
    loading,
    currentPage,
    totalPages,
    totalItems,
    filters,
    stats,
    fetchBookings,
    fetchStats,
    handleFilterChange,
    changePage,
    updateBookingStatus,
    cancelBooking,
    formatCurrency,
    formatDate,
    getStatusColor,
    getStatusLabel
  }
}