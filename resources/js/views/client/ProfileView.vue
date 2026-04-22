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
                        <label for="province">Province</label>
                        <input 
                            id="province"
                            v-model="profile.province"
                            type="text"
                            placeholder="State/Province"
                        />
                    </div>
                    
                    <div class="profile-form-group">
                        <label for="postal_code">Postal Code</label>
                        <input 
                            id="postal_code"
                            v-model="profile.postal_code"
                            type="text"
                            placeholder="A1A 1A1"
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
    province: '',
    postal_code: '',
    preferred_contact: 'email'
})
const loading = ref(true)
const updating = ref(false)
const error = ref('')
const success = ref('')

const fetchProfile = async () => {
    try {
        loading.value = true
        error.value = ''
        
        const response = await fetch('/api/client/profile', {
            headers: {
                'Authorization': `Bearer ${authStore.token}`,
            }
        })
        
        if (response.ok) {
            const data = await response.json()
            // The API returns { data: { ...profileData, user: { ...userData } } }
            const profileData = data.data || data
            
            // Map the API response to our form fields
            profile.value = {
                name: profileData.user?.name || authStore.user?.name || '',
                email: profileData.user?.email || authStore.user?.email || '',
                phone: profileData.phone || '',
                address: profileData.address || '',
                city: profileData.city || '',
                province: profileData.province || '',
                postal_code: profileData.postal_code || '',
                preferred_contact: profileData.preferred_contact || 'email'
            }
        } else {
            const data = await response.json()
            error.value = data.message || 'Failed to load profile'
            
            // If no profile exists yet, initialize with user data
            if (authStore.user) {
                profile.value = {
                    name: authStore.user.name || '',
                    email: authStore.user.email || '',
                    phone: '',
                    address: '',
                    city: '',
                    province: '',
                    postal_code: '',
                    preferred_contact: 'email'
                }
            }
        }
    } catch (err) {
        console.error('Failed to load profile:', err)
        error.value = 'An error occurred while loading profile'
        
        // Initialize with user data as fallback
        if (authStore.user) {
            profile.value = {
                name: authStore.user.name || '',
                email: authStore.user.email || '',
                phone: '',
                address: '',
                city: '',
                province: '',
                postal_code: '',
                preferred_contact: 'email'
            }
        }
    } finally {
        loading.value = false
    }
}

const updateProfile = async () => {
    error.value = ''
    success.value = ''
    
    try {
        updating.value = true
        
        // Prepare data for API (match the expected fields)
        const updateData = {
            phone: profile.value.phone,
            address: profile.value.address,
            city: profile.value.city,
            province: profile.value.province,
            postal_code: profile.value.postal_code,
            preferred_contact: profile.value.preferred_contact
        }
        
        const response = await fetch('/api/client/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
            },
            body: JSON.stringify(updateData)
        })
        
        if (response.ok) {
            const data = await response.json()
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
