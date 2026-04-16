<template>
    <div>
        <h1>My Profile</h1>
        <p>Manage your client profile and contact information.</p>
        
        <div v-if="loading" class="profile-loading">
            <p>Loading profile...</p>
        </div>
        
        <div v-else class="profile-container">
            <form @submit.prevent="updateProfile" class="profile-form">
                <div class="profile-form-group">
                    <label for="name">Name</label>
                    <input 
                        id="name"
                        v-model="profile.name"
                        type="text"
                        placeholder="Your full name"
                        required
                    />
                </div>
                
                <div class="profile-form-group">
                    <label for="email">Email</label>
                    <input 
                        id="email"
                        v-model="profile.email"
                        type="email"
                        placeholder="your@email.com"
                        required
                    />
                </div>
                
                <div class="profile-form-group">
                    <label for="phone">Phone Number</label>
                    <input 
                        id="phone"
                        v-model="profile.phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                    />
                </div>
                
                <div class="profile-form-group">
                    <label for="address">Address</label>
                    <input 
                        id="address"
                        v-model="profile.address"
                        type="text"
                        placeholder="Street address"
                    />
                </div>
                
                <div class="profile-form-group">
                    <label for="city">City</label>
                    <input 
                        id="city"
                        v-model="profile.city"
                        type="text"
                        placeholder="City"
                    />
                </div>
                
                <div class="profile-form-row">
                    <div class="profile-form-group">
                        <label for="state">State</label>
                        <input 
                            id="state"
                            v-model="profile.state"
                            type="text"
                            placeholder="State/Province"
                        />
                    </div>
                    
                    <div class="profile-form-group">
                        <label for="zip">ZIP/Postal Code</label>
                        <input 
                            id="zip"
                            v-model="profile.zip"
                            type="text"
                            placeholder="12345"
                        />
                    </div>
                </div>
                
                <div class="profile-form-group">
                    <label for="preferred_contact">Preferred Contact Method</label>
                    <select id="preferred_contact" v-model="profile.preferred_contact">
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
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
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    preferred_contact: 'email'
})
const loading = ref(true)
const updating = ref(false)
const error = ref('')
const success = ref('')

const fetchProfile = async () => {
    try {
        loading.value = true
        // Initialize with authenticated user's data
        if (authStore.user) {
            profile.value = {
                name: authStore.user.name || '',
                email: authStore.user.email || '',
                phone: authStore.user.phone || '',
                address: authStore.user.address || '',
                city: authStore.user.city || '',
                state: authStore.user.state || '',
                zip: authStore.user.zip || '',
                preferred_contact: authStore.user.preferred_contact || 'email'
            }
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
        const response = await fetch('/api/profile', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify(profile.value)
        })
        
        if (response.ok) {
            const data = await response.json()
            authStore.user = data.data || data
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
/* ProfileView specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
