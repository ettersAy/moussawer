import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useProfile() {
    const authStore = useAuthStore()
    const profile = ref({
        bio: '',
        portfolio_url: '',
        hourly_rate: 0,
        availability_status: 'available'
    })
    const loading = ref(true)
    const updating = ref(false)

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
            const response = await fetch('/api/photographers/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`,
                },
                body: JSON.stringify(profile.value)
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
