import { ref, watch } from 'vue'
import api from '@/services/api'

export function usePhotographerServices() {
  const services = ref([])
  const loading = ref(true)
  
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const searchQuery = ref('')
  let searchTimeout = null

  const filters = ref({
    status: '',
    sort_by: 'sort_order',
    sort_direction: 'asc'
  })

  const fetchServices = async (page = 1) => {
    loading.value = true
    try {
      const response = await api.get('/photographer/services', {
        params: { 
          page,
          search: searchQuery.value || undefined,
          ...filters.value
        }
      })
      services.value = response.data.data
      if (response.data.meta) {
        currentPage.value = response.data.meta.current_page
        totalPages.value = response.data.meta.last_page
        totalItems.value = response.data.meta.total
      } else {
        totalItems.value = services.value.length
      }
    } catch (err) {
      throw err
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    currentPage.value = 1
    fetchServices(1)
  }

  const clearSearch = () => {
    searchQuery.value = ''
    handleSearch()
  }

  watch(searchQuery, (newVal) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      handleSearch()
    }, 500)
  })

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      fetchServices(page)
    }
  }

  const createService = async (serviceData) => {
    const response = await api.post('/photographer/services', serviceData)
    return response.data.data
  }

  const updateService = async (id, serviceData) => {
    const response = await api.put(`/photographer/services/${id}`, serviceData)
    return response.data.data
  }

  const deleteService = async (id) => {
    await api.delete(`/photographer/services/${id}`)
    await fetchServices(currentPage.value)
  }

  return {
    services,
    loading,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    filters,
    fetchServices,
    handleSearch,
    clearSearch,
    changePage,
    createService,
    updateService,
    deleteService
  }
}