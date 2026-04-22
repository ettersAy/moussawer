<template>
    <div>
        <h1>My Profile</h1>
        <p>Manage your photographer profile and availability.</p>
        
        <div v-if="loading" class="profile-loading">
            <p>Loading profile...</p>
        </div>
        
        <div v-else class="profile-container">
            <form @submit.prevent="handleUpdate" class="profile-form">
                <div class="profile-form-group">
                    <label for="name">Name</label>
                    <input 
                        id="name"
                        v-model="profile.user.name"
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
                        v-model="profile.user.email"
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
                    Profile updated successfully!
                </div>
                
                <button type="submit" :disabled="updating" class="profile-btn-submit">
                    {{ updating ? 'Updating...' : 'Update Profile' }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProfile } from '@/composables/useProfile'

const { profile, loading, updating, fetchProfile, updateProfile } = useProfile()

const error = ref('')
const success = ref('')

onMounted(async () => {
    try {
        await fetchProfile()
    } catch (err) {
        error.value = 'Failed to load profile'
    }
})

const handleUpdate = async () => {
    error.value = ''
    success.value = ''
    
    try {
        await updateProfile()
        success.value = 'Profile updated successfully!'
        setTimeout(() => {
            success.value = ''
        }, 3000)
    } catch (err) {
        error.value = err.message || 'An error occurred while updating profile'
    }
}
</script>

<style scoped>
/* PhotographerProfileView specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
