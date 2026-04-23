<template>
    <div>
        <h1>My Profile</h1>
        <p v-if="!noProfile">Manage your client profile and contact information.</p>
        <p v-else>Set up your client profile to get started.</p>
        
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
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()

const displayName = computed(() => authStore.user?.name || '')
const displayEmail = computed(() => authStore.user?.email || '')

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
const noProfile = ref(false)
const error = ref('')
const success = ref('')

const fetchProfile = async () => {
    try {
        loading.value = true
        error.value = ''
        noProfile.value = false
        
        const response = await api.get('/client/profile')
        
        if (response.data.data === null) {
            noProfile.value = true
            profile.value = {
                name: authStore.user?.name || '',
                email: authStore.user?.email || '',
                phone: '',
                address: '',
                city: '',
                province: '',
                postal_code: '',
                preferred_contact: 'email'
            }
        } else {
            const profileData = response.data.data
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
        }
    } catch (err) {
        console.error('Failed to load profile:', err)
        noProfile.value = true
        profile.value = {
            name: authStore.user?.name || '',
            email: authStore.user?.email || '',
            phone: '',
            address: '',
            city: '',
            province: '',
            postal_code: '',
            preferred_contact: 'email'
        }
    } finally {
        loading.value = false
    }
}

const createProfile = async () => {
    const createData = {
        phone: profile.value.phone,
        address: profile.value.address,
        city: profile.value.city,
        province: profile.value.province,
        postal_code: profile.value.postal_code,
        preferred_contact: profile.value.preferred_contact
    }
    const response = await api.post('/client/profile', createData)
    profile.value = {
        ...profile.value,
        ...response.data.data
    }
    noProfile.value = false
}

const updateProfile = async () => {
    const updateData = {
        phone: profile.value.phone,
        address: profile.value.address,
        city: profile.value.city,
        province: profile.value.province,
        postal_code: profile.value.postal_code,
        preferred_contact: profile.value.preferred_contact
    }
    await api.put('/client/profile', updateData)
}

const handleSubmit = async () => {
    error.value = ''
    success.value = ''
    try {
        updating.value = true
        if (noProfile.value) {
            await createProfile()
            success.value = 'Profile created successfully!'
        } else {
            await updateProfile()
            success.value = 'Profile updated successfully!'
        }
        setTimeout(() => { success.value = '' }, 3000)
    } catch (err) {
        error.value = err.response?.data?.message || err.message || 'An error occurred'
    } finally {
        updating.value = false
    }
}

onMounted(() => { fetchProfile() })
</script>

<style scoped>
/* ProfileView specific styles that need to remain scoped */
/* Most styles have been extracted to CSS modules */
</style>
