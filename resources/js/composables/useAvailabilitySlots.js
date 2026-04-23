import { ref } from 'vue'
import axios from 'axios'

export function useAvailabilitySlots() {
    const slots = ref([])
    const loading = ref(false)
    const error = ref(null)

    /**
     * Fetch availability slots for a given month/year.
     */
    async function fetchSlots(month, year) {
        loading.value = true
        error.value = null

        try {
            const response = await axios.get('/api/photographer/availability-slots', {
                params: { month, year },
            })
            slots.value = response.data.data || []
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to load availability slots.'
            console.error('Error fetching availability slots:', err)
        } finally {
            loading.value = false
        }
    }

    /**
     * Create a new availability slot.
     */
    async function createSlot(slotData) {
        loading.value = true
        error.value = null

        try {
            const response = await axios.post('/api/photographer/availability-slots', slotData)
            slots.value.push(response.data.data)
            return response.data.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to create availability slot.'
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Update an existing availability slot.
     */
    async function updateSlot(id, slotData) {
        loading.value = true
        error.value = null

        try {
            const response = await axios.put(`/api/photographer/availability-slots/${id}`, slotData)
            const index = slots.value.findIndex(s => s.id === id)
            if (index !== -1) {
                slots.value[index] = response.data.data
            }
            return response.data.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to update availability slot.'
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Delete an availability slot.
     */
    async function deleteSlot(id) {
        loading.value = true
        error.value = null

        try {
            await axios.delete(`/api/photographer/availability-slots/${id}`)
            slots.value = slots.value.filter(s => s.id !== id)
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to delete availability slot.'
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Bulk update availability slots (e.g., mark multiple dates as unavailable).
     */
    async function bulkUpdateSlots(dates, status, startTime = null, endTime = null, notes = null) {
        loading.value = true
        error.value = null

        try {
            const response = await axios.post('/api/photographer/availability-slots/bulk', {
                dates,
                status,
                start_time: startTime,
                end_time: endTime,
                notes,
            })
            // Refresh slots after bulk update
            await fetchSlots(new Date().getMonth() + 1, new Date().getFullYear())
            return response.data.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to bulk update availability slots.'
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        slots,
        loading,
        error,
        fetchSlots,
        createSlot,
        updateSlot,
        deleteSlot,
        bulkUpdateSlots,
    }
}
