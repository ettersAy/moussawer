<template>
    <div>
        <h1>My Bookings</h1>
        <p>Manage your photography bookings and sessions.</p>
        
        <div v-if="loading" class="loading">
            <p>Loading bookings...</p>
        </div>
        
        <div v-else-if="bookings.length === 0" class="empty-state">
            <p>No bookings yet. Your future bookings will appear here.</p>
        </div>
        
        <div v-else class="bookings-grid">
            <div v-for="booking in bookings" :key="booking.id" class="booking-card">
                <h3>{{ booking.client_name }}</h3>
                <p><strong>Date:</strong> {{ formatDate(booking.scheduled_at) }}</p>
                <p><strong>Status:</strong> <span class="status" :class="booking.status">{{ booking.status }}</span></p>
                <p v-if="booking.location"><strong>Location:</strong> {{ booking.location }}</p>
                <div class="actions">
                    <button v-if="booking.status === 'pending'" @click="confirmBooking(booking.id)" class="btn-confirm">
                        Confirm
                    </button>
                    <button v-if="booking.status === 'confirmed'" @click="markComplete(booking.id)" class="btn-complete">
                        Mark Complete
                    </button>
                    <button @click="cancelBooking(booking.id)" class="btn-cancel">
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
    border-left: 4px solid #007bff;
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
    flex-wrap: wrap;
}

.actions button {
    flex: 1;
    min-width: 80px;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: bold;
    transition: opacity 0.3s;
}

.btn-confirm {
    background-color: #28a745;
    color: white;
}

.btn-confirm:hover {
    opacity: 0.8;
}

.btn-complete {
    background-color: #007bff;
    color: white;
}

.btn-complete:hover {
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
</style>
