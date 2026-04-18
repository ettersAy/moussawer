import { ref } from 'vue'

export function useToast() {
  const toasts = ref([])
  let toastIdCount = 0

  const showToast = (message, type = 'success') => {
    const id = toastIdCount++
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 4000)
  }

  return {
    toasts,
    showToast
  }
}
