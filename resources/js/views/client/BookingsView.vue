<template>
    <div>
        <h1>My Bookings</h1>
        <p>View and manage your photography bookings.</p>
        
        <div class="header-actions">
            <router-link to="/client/photographers" class="btn-new-booking">
                Book New Session
            </router-link>
        </div>
        
        <div v-if="loading" class="loading">
            <p>Loading bookings...</p>
        </div>
        
        <div v-else-if="bookings.length === 0" class="empty-state">
            <p>You haven't booked any sessions yet.</p>
            <router-link to="/client/photographers" class="btn-link">
                Browse photographers
            </router-link>
        </div>
        
        <div v-else class="bookings-grid">
            <div v-for="booking in bookings" :key="booking.id" class="booking-card">
                <h3>{{ booking.photographer_name }}</h3>
                <p><strong>Schedule:</strong> {{ formatDate(booking.scheduled_at) }}</p>
                <p><strong>Status:</strong> <span class="status" :class="booking.status">{{ booking.status }}</span></p>
                <p v-if="booking.notes"><strong>Notes:</strong> {{ booking.notes }}</p>
                <div class="actions">
                    <button @click="viewDetails(booking.id)" class="btn-view">
                        View Details
                    </button>
                    <button v-if="booking.status === 'pending'" @click="cancelBooking(booking.id)" class="btn-cancel">
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
.header-actions {
    margin: 20px 0;
}

.btn-new-booking {
    display: inline-block;
    background-color: #28a745;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    text-decoration: none;
    font-weight: bold;
    transition: opacity 0.3s;
}

.btn-new-booking:hover {
    opacity: 0.8;
}

.bookings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.booking-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border-left: 4px solid #28a745;
}

.booking-card h3 {
    margin: 0 0 15px 0;
    color: #333;
}

.booking-card p {
    margin: 10px 0;
    color: #666;
}

.status {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
}

.status.pending {
    background-color: #fff3cd;
    color: #856404;
}

.status.confirmed {
    background-color: #d4edda;
    color: #155724;
}

.status.completed {
    background-color: #d1ecf1;
    color: #0c5460;
}

.status.cancelled {
    background-color: #f8d7da;
    color: #721c24;
}

.actions {
    margin-top: 15px;
    display: flex;
    gap: 8px;
}

.actions button,
.actions a {
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: bold;
    transition: opacity 0.3s;
    text-decoration: none;
    text-align: center;
}

.btn-view {
    background-color: #007bff;
    color: white;
}

.btn-view:hover {
    opacity: 0.8;
}

.btn-cancel {
    background-color: #dc3545;
    color: white;
}

.btn-cancel:hover {
    opacity: 0.8;
}

.loading,
.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #666;
}

.btn-link {
    color: #007bff;
    text-decoration: none;
    font-weight: bold;
}

.btn-link:hover {
    text-decoration: underline;
}
</style>
