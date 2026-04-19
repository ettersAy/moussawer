import { ref } from 'vue'
import api from '@/services/api'

export function useBookings() {
  const bookings = ref([])
  const loading = ref(true)
  const currentPage = ref(1)
  const totalPages = ref(1)

  const fetchBookings = async (params = {}) => {
    loading.value = true
    try {
      const response = await api.get('/bookings', { params })
      bookings.value = response.data.data
      if (response.data.meta) {
        currentPage.value = response.data.meta.current_page
        totalPages.value = response.data.meta.last_page
      }
    } catch (err) {
      console.error('Failed to load bookings:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status })
    } catch (error) {
      console.error('Failed to update booking status:', error)
      throw error
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`)
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      throw error
    }
  }

  return {
    bookings,
    loading,
    currentPage,
    totalPages,
    fetchBookings,
    updateBookingStatus,
    cancelBooking
  }
}
