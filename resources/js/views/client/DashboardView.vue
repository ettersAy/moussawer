<template>
    <div>
        <h1>Client Dashboard</h1>
        <p>Welcome! Here's an overview of your photography bookings.</p>
        
        <div class="dashboard-stats-grid">
            <div class="dashboard-stat-card">
                <h3>Upcoming Bookings</h3>
                <p class="dashboard-stat-number">{{ upcomingBookings }}</p>
            </div>
            <div class="dashboard-stat-card">
                <h3>Completed Sessions</h3>
                <p class="dashboard-stat-number">{{ completedSessions }}</p>
            </div>
            <div class="dashboard-stat-card">
                <h3>Total Spent</h3>
                <p class="dashboard-stat-number">${{ totalSpent }}</p>
            </div>
            <div class="dashboard-stat-card">
                <h3>Favorite Photographers</h3>
                <p class="dashboard-stat-number">{{ favoritePhotographers }}</p>
            </div>
        </div>
        
        <div class="dashboard-quick-actions">
            <h2>Quick Actions</h2>
            <div class="dashboard-action-buttons">
                <router-link to="/client/bookings" class="dashboard-btn-action">
                    View My Bookings
                </router-link>
                <router-link to="/client/profile" class="dashboard-btn-action">
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
/* DashboardView specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
