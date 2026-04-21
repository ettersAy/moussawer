import { ref, reactive } from 'vue'
import api from '@/services/api'

export function usePhotographerSearch() {
  const photographers = ref([])
  const loading = ref(false)
  const errors = ref(null)

  const filters = reactive({
    location: '',
    category: '',
    min_price: '',
    max_price: '',
  })

  const fetchPhotographers = async () => {
    loading.value = true
    errors.value = null

    try {
      const response = await api.get('/photographers', {
        params: {
          ...filters,
        },
      })
      photographers.value = response.data.data
    } catch (err) {
      console.error('Failed to fetch photographers:', err)
      errors.value = err.response?.data?.message || 'Failed to load photographers.'
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters) => {
    Object.assign(filters, newFilters)
    fetchPhotographers()
  }

  const clearFilters = () => {
    filters.location = ''
    filters.category = ''
    filters.min_price = ''
    filters.max_price = ''
    fetchPhotographers()
  }

  return {
    photographers,
    filters,
    loading,
    errors,
    fetchPhotographers,
    updateFilters,
    clearFilters,
  }
}
