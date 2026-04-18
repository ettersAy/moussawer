<template>
  <div class="filters-panel">
    <select :value="modelValue.role" @input="updateFilter('role', $event.target.value)">
      <option value="">All Roles</option>
      <option value="admin">Admin</option>
      <option value="photographer">Photographer</option>
      <option value="client">Client</option>
    </select>

    <select :value="modelValue.status" @input="updateFilter('status', $event.target.value)">
      <option value="">All Statuses</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>

    <select 
      :value="modelValue.has_portfolio" 
      @input="updateFilter('has_portfolio', $event.target.value)"
      v-if="modelValue.role === 'photographer' || modelValue.role === ''"
    >
      <option value="">Portfolio Status</option>
      <option value="true">Has Portfolio</option>
      <option value="false">No Portfolio</option>
    </select>

    <select :value="modelValue.sort_by" @input="updateFilter('sort_by', $event.target.value)">
      <option value="created_at">Sort by Date</option>
      <option value="name">Sort by Name</option>
      <option value="portfolio_count">Sort by Portfolio Size</option>
      <option value="total_bookings">Sort by Bookings</option>
    </select>

    <select :value="modelValue.sort_direction" @input="updateFilter('sort_direction', $event.target.value)">
      <option value="desc">Descending</option>
      <option value="asc">Ascending</option>
    </select>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const updateFilter = (key, value) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
  emit('change')
}
</script>
