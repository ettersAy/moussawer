<template>
    <div>
        <h1>Photographer Dashboard</h1>
        <p>Welcome back! Here's your photography business overview.</p>
        
        <div class="dashboard-stats-grid">
            <div class="dashboard-stat-card">
                <h3>Active Bookings</h3>
                <p class="dashboard-stat-number">{{ activeBookings }}</p>
            </div>
            <div class="dashboard-stat-card">
                <h3>Pending Requests</h3>
                <p class="dashboard-stat-number">{{ pendingRequests }}</p>
            </div>
            <div class="dashboard-stat-card">
                <h3>Total Earnings</h3>
                <p class="dashboard-stat-number">${{ totalEarnings }}</p>
            </div>
            <div class="dashboard-stat-card">
                <h3>Completed Sessions</h3>
                <p class="dashboard-stat-number">{{ completedSessions }}</p>
            </div>
        </div>
        
        <div class="dashboard-quick-actions">
            <h2>Quick Actions</h2>
            <div class="dashboard-action-buttons">
                <router-link to="/photographer/bookings" class="dashboard-btn-action">
                    View All Bookings
                </router-link>
                <router-link to="/photographer/profile" class="dashboard-btn-action">
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
const activeBookings = ref(0)
const pendingRequests = ref(0)
const totalEarnings = ref(0)
const completedSessions = ref(0)

onMounted(() => {
    // Load statistics from API or mock data
    // For now using placeholder values
    activeBookings.value = 3
    pendingRequests.value = 1
    totalEarnings.value = 1250.50
    completedSessions.value = 28
})
</script>

<style scoped>
/* PhotographerDashboardView specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
