import { ref } from 'vue'
import api from '@/services/api'

export function useProfile() {
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
    const noProfile = ref(false)

    const fetchProfile = async () => {
        try {
            loading.value = true
            noProfile.value = false
            const response = await api.get('/photographer/profile')
            if (response.data.data === null) {
                // No profile exists yet (freshly registered photographer)
                noProfile.value = true
                profile.value = {
                    bio: '',
                    portfolio_url: '',
                    hourly_rate: 0,
                    availability_status: 'available',
                    user: {
                        name: '',
                        email: ''
                    }
                }
            } else {
                profile.value = response.data.data
            }
        } catch (err) {
            console.error('Failed to load profile:', err)
            noProfile.value = true
            throw err
        } finally {
            loading.value = false
        }
    }

    const createProfile = async () => {
        try {
            updating.value = true
            const createData = {
                bio: profile.value.bio,
                portfolio_url: profile.value.portfolio_url,
                hourly_rate: profile.value.hourly_rate,
                availability_status: profile.value.availability_status
            }
            const response = await api.post('/photographer/profile', createData)
            profile.value = response.data.data
            noProfile.value = false
            return response.data
        } catch (err) {
            console.error('Failed to create profile:', err)
            throw err
        } finally {
            updating.value = false
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
            const response = await api.put('/photographer/profile', updateData)
            profile.value = response.data.data
        } catch (err) {
            console.error('Failed to update profile:', err)
            throw err
        } finally {
            updating.value = false
        }
    }

    return {
        profile,
        loading,
        updating,
        noProfile,
        fetchProfile,
        createProfile,
        updateProfile
    }
}
