<template>
    <div>
        <h1>My Bookings</h1>
        <p>Manage your photography bookings and sessions.</p>
        
        <div v-if="loading" class="bookings-loading">
            <p>Loading bookings...</p>
        </div>
        
        <div v-else-if="bookings.length === 0" class="bookings-empty-state">
            <p>No bookings yet. Your future bookings will appear here.</p>
        </div>
        
        <div v-else class="bookings-grid">
            <div v-for="booking in bookings" :key="booking.id" class="booking-card">
                <h3>{{ booking.client_name }}</h3>
                <p><strong>Date:</strong> {{ formatDate(booking.scheduled_at) }}</p>
                <p><strong>Status:</strong> <span class="booking-status" :class="booking.status">{{ booking.status }}</span></p>
                <p v-if="booking.location"><strong>Location:</strong> {{ booking.location }}</p>
                <div class="booking-actions">
                    <button v-if="booking.status === 'pending'" @click="confirmBooking(booking.id)" class="booking-btn-confirm">
                        Confirm
                    </button>
                    <button v-if="booking.status === 'confirmed'" @click="markComplete(booking.id)" class="booking-btn-complete">
                        Mark Complete
                    </button>
                    <button @click="cancelBooking(booking.id)" class="booking-btn-cancel">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const bookings = ref([])
const loading = ref(true)

const fetchBookings = async () => {
    try {
        loading.value = true
        const response = await fetch('/api/bookings', {
            headers: {
                'Authorization': `Bearer ${authStore.token}`,
            }
        })
        if (response.ok) {
            const data = await response.json()
            bookings.value = data.data || data
        }
    } catch (error) {
        console.error('Failed to load bookings:', error)
    } finally {
        loading.value = false
    }
}

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const confirmBooking = async (bookingId) => {
    try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({ status: 'confirmed' })
        })
        if (response.ok) {
            await fetchBookings()
        }
    } catch (error) {
        console.error('Failed to confirm booking:', error)
    }
}

const markComplete = async (bookingId) => {
    try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({ status: 'completed' })
        })
        if (response.ok) {
            await fetchBookings()
        }
    } catch (error) {
        console.error('Failed to mark booking complete:', error)
    }
}

const cancelBooking = async (bookingId) => {
    try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authStore.token}`,
            }
        })
        if (response.ok) {
            await fetchBookings()
        }
    } catch (error) {
        console.error('Failed to cancel booking:', error)
    }
}

onMounted(() => {
    fetchBookings()
})
</script>

<style scoped>
/* PhotographerBookingsView specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
