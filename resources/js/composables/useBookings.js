import { ref } from 'vue'
import api from '@/services/api'

export function useBookings() {
  const bookings = ref([])
  const loading = ref(true)

  const fetchBookings = async () => {
    loading.value = true
    try {
      const response = await api.get('/bookings')
      bookings.value = response.data.data || response.data
    } catch (err) {
      console.error('Failed to load bookings:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}`, { status })
      await fetchBookings()
    } catch (error) {
      console.error('Failed to update booking status:', error)
      throw error
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`)
      await fetchBookings()
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      throw error
    }
  }

  return {
    bookings,
    loading,
    fetchBookings,
    updateBookingStatus,
    cancelBooking
  }
}
