<template>
    <div>
        <h1>My Profile</h1>
        <p>Manage your client profile and contact information.</p>
        
        <div v-if="loading" class="loading">
            <p>Loading profile...</p>
        </div>
        
        <div v-else class="profile-container">
            <form @submit.prevent="updateProfile" class="profile-form">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input 
                        id="name"
                        v-model="profile.name"
                        type="text"
                        placeholder="Your full name"
                        required
                    />
                </div>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input 
                        id="email"
                        v-model="profile.email"
                        type="email"
                        placeholder="your@email.com"
                        required
                    />
                </div>
                
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input 
                        id="phone"
                        v-model="profile.phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                    />
                </div>
                
                <div class="form-group">
                    <label for="address">Address</label>
                    <input 
                        id="address"
                        v-model="profile.address"
                        type="text"
                        placeholder="Street address"
                    />
                </div>
                
                <div class="form-group">
                    <label for="city">City</label>
                    <input 
                        id="city"
                        v-model="profile.city"
                        type="text"
                        placeholder="City"
                    />
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="state">State</label>
                        <input 
                            id="state"
                            v-model="profile.state"
                            type="text"
                            placeholder="State/Province"
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="zip">ZIP/Postal Code</label>
                        <input 
                            id="zip"
                            v-model="profile.zip"
                            type="text"
                            placeholder="12345"
                        />
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="preferred_contact">Preferred Contact Method</label>
                    <select id="preferred_contact" v-model="profile.preferred_contact">
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
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

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #333;
}

.form-group input,
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
.form-group select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
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

@media (max-width: 600px) {
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .profile-form {
        padding: 20px;
    }
}
</style>
