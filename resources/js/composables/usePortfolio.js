import { ref } from 'vue'
import api from '@/services/api'

export function usePortfolio() {
  const items = ref([])
  const loading = ref(true)

  const fetchItems = async () => {
    loading.value = true
    try {
      const response = await api.get('/photographer/portfolios')
      items.value = response.data.data
    } catch (err) {
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteItem = async (id) => {
    const response = await api.delete(`/photographer/portfolios/${id}`)
    await fetchItems()
    return response.data.message
  }

  const saveItem = async (formData, editingId = null) => {
    let response;
    if (editingId) {
      formData.append('_method', 'PUT')
      response = await api.post(`/photographer/portfolios/${editingId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } else {
      response = await api.post('/photographer/portfolios', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    await fetchItems()
    return response.data.message
  }

  return {
    items,
    loading,
    fetchItems,
    deleteItem,
    saveItem
  }
}
