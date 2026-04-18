import { ref, watch } from 'vue'
import api from '@/services/api'

export function useUsers() {
  const users = ref([])
  const loading = ref(true)
  
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const searchQuery = ref('')
  let searchTimeout = null

  const filters = ref({
    role: '',
    status: '',
    has_portfolio: '',
    sort_by: 'created_at',
    sort_direction: 'desc'
  })

  const fetchUsers = async (page = 1) => {
    loading.value = true
    try {
      const response = await api.get('/admin/users', {
        params: { 
          page,
          search: searchQuery.value || undefined,
          ...filters.value
        }
      })
      users.value = response.data.data
      if (response.data.meta) {
        currentPage.value = response.data.meta.current_page
        totalPages.value = response.data.meta.last_page
        totalItems.value = response.data.meta.total
      } else {
        totalItems.value = users.value.length
      }
    } catch (err) {
      throw err
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    currentPage.value = 1
    fetchUsers(1)
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
      fetchUsers(page)
    }
  }

  const deleteUser = async (id) => {
    await api.delete(`/admin/users/${id}`)
    await fetchUsers(currentPage.value)
  }

  return {
    users,
    loading,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    filters,
    fetchUsers,
    handleSearch,
    clearSearch,
    changePage,
    deleteUser
  }
}
