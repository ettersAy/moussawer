<template>
  <tr>
    <td>
      <div class="info-cell">
        <div class="info-row">
          <span class="font-medium">{{ service.name }}</span>
          <span class="status-dot" :class="service.is_active ? 'active' : 'inactive'"></span>
        </div>
        <div class="text-muted" v-if="service.description">{{ service.description }}</div>
        <div class="date-row text-muted">
          Created {{ formatDate(service.created_at) }} 
        </div>
      </div>
    </td>
    <td>
      <span class="price-badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        ${{ service.price }}
      </span>
    </td>
    <td>
      <span class="duration-badge" v-if="service.duration_minutes">
        {{ formatDuration(service.duration_minutes) }} 
      </span>
      <span class="text-muted" v-else>Flexible</span>
    </td>
    <td>
      <span class="duration-badge">
        {{ service.minimum_hours }} hour{{ service.minimum_hours !== 1 ? 's' : '' }}
      </span>
    </td>
    <td>
      <span class="status-badge" :class="service.is_active ? 'active' : 'inactive'">
        {{ service.is_active ? 'Active' : 'Inactive' }}
      </span>
    </td>
    <td class="actions-col">
      <div class="actions">
        <div class="btn-group">
          <button class="btn-action" @click="$emit('edit', service)" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-action delete" @click="$emit('delete', service.id)" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><line x1="10" y1="4" x2="14" y2="4"></line></svg>
          </button>
        </div>
        <button 
          class="btn-action" 
          @click="$emit('toggle', service)"
          :title="service.is_active ? 'Deactivate' : 'Activate'"
        >
          <svg v-if="service.is_active" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
defineProps({
  service: Object
})
defineEmits(['edit', 'delete', 'toggle'])

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric' 
  })
}

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`
  return `${hours}h ${remainingMinutes}m`
}
</script>