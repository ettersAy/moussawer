<template>
    <div>
        <h1>My Profile</h1>
        <p>Manage your photographer profile and availability.</p>
        
        <div v-if="loading" class="loading">
            <p>Loading profile...</p>
        </div>
        
        <div v-else class="profile-container">
            <form @submit.prevent="updateProfile" class="profile-form">
                <div class="form-group">
                    <label for="bio">Bio</label>
                    <textarea 
                        id="bio"
                        v-model="profile.bio"
                        placeholder="Tell clients about your photography style"
                        rows="4"
                    ></textarea>
                </div>
                
                <div class="form-group">
                    <label for="portfolio_url">Portfolio URL</label>
                    <input 
                        id="portfolio_url"
                        v-model="profile.portfolio_url"
                        type="url"
                        placeholder="https://yourportfolio.com"
                    />
                </div>
                
                <div class="form-group">
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
                
                <div class="form-group">
                    <label for="availability_status">Availability Status</label>
                    <select id="availability_status" v-model="profile.availability_status">
                        <option value="available">Available for Bookings</option>
                        <option value="busy">Temporarily Busy</option>
                        <option value="unavailable">Unavailable</option>
                    </select>
                </div>
                
                <div v-if="error" class="error-message">
                    {{ error }}
                </div>
                
                <div v-if="success" class="success-message">
                    Profile updated successfully!
                </div>
                
                <button type="submit" :disabled="updating" class="btn-submit">
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
.profile-container {
    max-width: 600px;
    margin: 0 auto;
}

.profile-form {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
    box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.form-group textarea {
    resize: vertical;
}

.error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 15px;
    border: 1px solid #f5c6cb;
}

.success-message {
    background-color: #d4edda;
    color: #155724;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 15px;
    border: 1px solid #c3e6cb;
}

.btn-submit {
    background-color: #007bff;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: opacity 0.3s;
    width: 100%;
}

.btn-submit:hover:not(:disabled) {
    opacity: 0.8;
}

.btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.loading {
    text-align: center;
    padding: 40px 20px;
    color: #666;
}
</style>
