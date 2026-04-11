<template>
    <div>
        <h1>Client Dashboard</h1>
        <p>Welcome! Here's an overview of your photography bookings.</p>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Upcoming Bookings</h3>
                <p class="stat-number">{{ upcomingBookings }}</p>
            </div>
            <div class="stat-card">
                <h3>Completed Sessions</h3>
                <p class="stat-number">{{ completedSessions }}</p>
            </div>
            <div class="stat-card">
                <h3>Total Spent</h3>
                <p class="stat-number">${{ totalSpent }}</p>
            </div>
            <div class="stat-card">
                <h3>Favorite Photographers</h3>
                <p class="stat-number">{{ favoritePhotographers }}</p>
            </div>
        </div>
        
        <div class="quick-actions">
            <h2>Quick Actions</h2>
            <div class="action-buttons">
                <router-link to="/client/bookings" class="btn-action">
                    View My Bookings
                </router-link>
                <router-link to="/client/profile" class="btn-action">
                    Update Profile
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const upcomingBookings = ref(0)
const completedSessions = ref(0)
const totalSpent = ref(0)
const favoritePhotographers = ref(0)

onMounted(() => {
    // Load statistics from API or mock data
    // For now using placeholder values
    upcomingBookings.value = 2
    completedSessions.value = 5
    totalSpent.value = 850.00
    favoritePhotographers.value = 3
})
</script>

<style scoped>
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
    margin-bottom: 40px;
}

.stat-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border-left: 4px solid #28a745;
}

.stat-card h3 {
    margin: 0 0 10px 0;
    color: #666;
    font-size: 14px;
    text-transform: uppercase;
}

.stat-number {
    margin: 0;
    font-size: 28px;
    font-weight: bold;
    color: #333;
}

.quick-actions {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.quick-actions h2 {
    margin-top: 0;
}

.action-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.btn-action {
    display: inline-block;
    background-color: #28a745;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    text-decoration: none;
    font-weight: bold;
    transition: opacity 0.3s;
}

.btn-action:hover {
    opacity: 0.8;
}
</style>
