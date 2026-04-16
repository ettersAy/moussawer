<template>
    <div>
        <h1>My Profile</h1>
        <p>Manage your photographer profile and availability.</p>
        
        <div v-if="loading" class="profile-loading">
            <p>Loading profile...</p>
        </div>
        
        <div v-else class="profile-container">
            <form @submit.prevent="updateProfile" class="profile-form">
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
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const profile = ref({
    bio: '',
    portfolio_url: '',
    hourly_rate: 0,
    availability_status: 'available'
})
const loading = ref(true)
const updating = ref(false)
const error = ref('')
const success = ref('')

const fetchProfile = async () => {
    try {
        loading.value = true
        const response = await fetch('/api/photographers/me', {
            headers: {
                'Authorization': `Bearer ${authStore.token}`,
            }
        })
        if (response.ok) {
            const data = await response.json()
            profile.value = data.data || data
        }
    } catch (err) {
        console.error('Failed to load profile:', err)
        error.value = 'Failed to load profile'
    } finally {
        loading.value = false
    }
}

const updateProfile = async () => {
    error.value = ''
    success.value = ''
    
    try {
        updating.value = true
        const response = await fetch('/api/photographers/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify(profile.value)
        })
        
        if (response.ok) {
            success.value = 'Profile updated successfully!'
            setTimeout(() => {
                success.value = ''
            }, 3000)
        } else {
            const data = await response.json()
            error.value = data.message || 'Failed to update profile'
        }
    } catch (err) {
        console.error('Failed to update profile:', err)
        error.value = 'An error occurred while updating profile'
    } finally {
        updating.value = false
    }
}

onMounted(() => {
    fetchProfile()
})
</script>

<style scoped>
/* PhotographerProfileView specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
