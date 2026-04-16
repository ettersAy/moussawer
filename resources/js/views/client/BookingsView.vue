<template>
    <div>
        <h1>My Bookings</h1>
        <p>View and manage your photography bookings.</p>
        
        <div class="bookings-header-actions">
            <router-link to="/client/photographers" class="bookings-btn-new-booking">
                Book New Session
            </router-link>
        </div>
        
        <div v-if="loading" class="bookings-loading">
            <p>Loading bookings...</p>
        </div>
        
        <div v-else-if="bookings.length === 0" class="bookings-empty-state">
            <p>You haven't booked any sessions yet.</p>
            <router-link to="/client/photographers" class="bookings-btn-link">
                Browse photographers
            </router-link>
        </div>
        
        <div v-else class="bookings-grid">
            <div v-for="booking in bookings" :key="booking.id" class="booking-card">
                <h3>{{ booking.photographer_name }}</h3>
                <p><strong>Schedule:</strong> {{ formatDate(booking.scheduled_at) }}</p>
                <p><strong>Status:</strong> <span class="booking-status" :class="booking.status">{{ booking.status }}</span></p>
                <p v-if="booking.notes"><strong>Notes:</strong> {{ booking.notes }}</p>
                <div class="booking-actions">
                    <button @click="viewDetails(booking.id)" class="booking-btn-view">
                        View Details
                    </button>
                    <button v-if="booking.status === 'pending'" @click="cancelBooking(booking.id)" class="booking-btn-cancel">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
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

const viewDetails = (bookingId) => {
    router.push(`/client/bookings/${bookingId}`)
}

const cancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return
    }
    
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
/* BookingsView specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
