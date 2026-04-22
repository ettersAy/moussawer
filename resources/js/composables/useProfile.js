import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useProfile() {
    const authStore = useAuthStore()
    const profile = ref({
        bio: '',
        portfolio_url: '',
        hourly_rate: 0,
        availability_status: 'available',
        user: {
            name: '',
            email: ''
        }
    })
    const loading = ref(true)
    const updating = ref(false)

    const fetchProfile = async () => {
        try {
            loading.value = true
            const response = await fetch('/api/photographer/profile', {
                headers: {
                    'Authorization': `Bearer ${authStore.token}`,
                }
            })
            if (response.ok) {
                const data = await response.json()
                profile.value = data.data || data
            } else {
                throw new Error('Failed to load profile')
            }
        } finally {
            loading.value = false
        }
    }

    const updateProfile = async () => {
        try {
            updating.value = true
            // Only send photographer fields, not user data
            const updateData = {
                bio: profile.value.bio,
                portfolio_url: profile.value.portfolio_url,
                hourly_rate: profile.value.hourly_rate,
                availability_status: profile.value.availability_status
            }
            
            const response = await fetch('/api/photographer/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`,
                },
                body: JSON.stringify(updateData)
            })
            
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || 'Failed to update profile')
            }
        } finally {
            updating.value = false
        }
    }

    return {
        profile,
        loading,
        updating,
        fetchProfile,
        updateProfile
    }
}
