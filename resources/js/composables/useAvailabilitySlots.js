import { ref } from 'vue'
import api from '@/services/api'

export function useAvailabilitySlots() {
  const slots = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentMonth = ref(new Date().getMonth() + 1)
  const currentYear = ref(new Date().getFullYear())

  const fetchSlots = async (from, to) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/photographer/availability', {
        params: { from, to }
      })
      slots.value = response.data.data || []
    } catch (err) {
      console.error('Failed to load availability slots:', err)
      error.value = err.response?.data?.message || 'Failed to load availability slots'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createSlot = async (data) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/photographer/availability', { slots: [data] })
      return response.data.data
    } catch (err) {
      console.error('Failed to create availability slot:', err)
      error.value = err.response?.data?.message || 'Failed to create availability slot'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createSlots = async (slotsArray) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/photographer/availability', { slots: slotsArray })
      return response.data.data
    } catch (err) {
      console.error('Failed to create availability slots:', err)
      error.value = err.response?.data?.message || 'Failed to create availability slots'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSlot = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/photographer/availability/${id}`, data)
      return response.data.data
    } catch (err) {
      console.error('Failed to update availability slot:', err)
      error.value = err.response?.data?.message || 'Failed to update availability slot'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSlot = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/photographer/availability/${id}`)
    } catch (err) {
      console.error('Failed to delete availability slot:', err)
      error.value = err.response?.data?.message || 'Failed to delete availability slot'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCalendar = async (month, year) => {
    loading.value = true
    error.value = null
    try {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`
      const response = await api.get('/photographer/availability/calendar', {
        params: { month: monthStr }
      })
      return response.data
    } catch (err) {
      console.error('Failed to load calendar:', err)
      error.value = err.response?.data?.message || 'Failed to load calendar'
      throw err
    } finally {
      loading.value = false
    }
  }

  const navigateMonth = (direction) => {
    let month = currentMonth.value + direction
    let year = currentYear.value
    if (month < 1) {
      month = 12
      year--
    } else if (month > 12) {
      month = 1
      year++
    }
    currentMonth.value = month
    currentYear.value = year
  }

  const goToToday = () => {
    const now = new Date()
    currentMonth.value = now.getMonth() + 1
    currentYear.value = now.getFullYear()
  }

  return {
    slots,
    loading,
    error,
    currentMonth,
    currentYear,
    fetchSlots,
    createSlot,
    createSlots,
    updateSlot,
    deleteSlot,
    fetchCalendar,
    navigateMonth,
    goToToday,
  }
}
