<template>
    <div>
        <h1>My Profile</h1>
        <p v-if="!noProfile">Manage your photographer profile and availability.</p>
        <p v-else>Set up your photographer profile to get started.</p>
        
        <div v-if="loading" class="profile-loading">
            <p>Loading profile...</p>
        </div>
        
        <div v-else class="profile-container">
            <form @submit.prevent="handleSubmit" class="profile-form">
                <div class="profile-form-group">
                    <label for="name">Name</label>
                    <input 
                        id="name"
                        :value="displayName"
                        type="text"
                        placeholder="Your full name"
                        readonly
                        class="readonly-field"
                    />
                </div>
                
                <div class="profile-form-group">
                    <label for="email">Email</label>
                    <input 
                        id="email"
                        :value="displayEmail"
                        type="email"
                        placeholder="your@email.com"
                        readonly
                        class="readonly-field"
                    />
                </div>
                
                <div class="profile-form-group">
                    <label for="bio">Bio</label>
                    <textarea 
                        id="bio"
                        v-model="profile.bio"
                        placeholder="Tell clients about your photography style"
                        rows="4"
                    ></textarea>
                </div>
                
                <div class="profile-form-group">
                    <label for="portfolio_url">Portfolio URL</label>
                    <input 
                        id="portfolio_url"
                        v-model="profile.portfolio_url"
                        type="url"
                        placeholder="https://yourportfolio.com"
                    />
                </div>
                
                <div class="profile-form-group">
                    <label for="hourly_rate">Hourly Rate ($)</label>
                    <input 
                        id="hourly_rate"
                        v-model.number="profile.hourly_rate"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="50.00"
                    />
                </div>
                
                <div class="profile-form-group">
                    <label for="availability_status">Availability Status</label>
                    <select id="availability_status" v-model="profile.availability_status">
                        <option value="available">Available for Bookings</option>
                        <option value="busy">Temporarily Busy</option>
                        <option value="unavailable">Unavailable</option>
                    </select>
                </div>
                
                <div v-if="error" class="profile-error-message">
                    {{ error }}
                </div>
                
                <div v-if="success" class="profile-success-message">
                    {{ success }}
                </div>
                
                <button type="submit" :disabled="updating" class="profile-btn-submit">
                    <span v-if="updating" class="loading-spinner"></span>
                    {{ updating ? (noProfile ? 'Creating...' : 'Updating...') : (noProfile ? 'Create Profile' : 'Update Profile') }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const displayName = computed(() => {
    return authUser.value?.name || profile.value.user?.name || ''
})

const displayEmail = computed(() => {
    return authUser.value?.email || profile.value.user?.email || ''
})

import { useProfile } from '@/composables/useProfile'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const authUser = computed(() => authStore.user)

const { profile, loading, updating, noProfile, fetchProfile, createProfile, updateProfile } = useProfile()

const error = ref('')
const success = ref('')

onMounted(async () => {
    try {
        await fetchProfile()
    } catch (err) {
        // Silently handle - noProfile flag is set by the composable
    }
})

const handleSubmit = async () => {
    error.value = ''
    success.value = ''
    
    try {
        if (noProfile.value) {
            await createProfile()
            success.value = 'Profile created successfully!'
        } else {
            await updateProfile()
            success.value = 'Profile updated successfully!'
        }
        setTimeout(() => {
            success.value = ''
        }, 3000)
    } catch (err) {
        error.value = err.response?.data?.message || err.message || 'An error occurred'
    }
}
</script>

<style scoped>
/* PhotographerProfileView specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
