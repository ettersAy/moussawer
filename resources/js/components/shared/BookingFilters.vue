<template>
  <div class="filters-panel">
    <select :value="modelValue.status" @input="updateFilter('status', $event.target.value)">
      <option value="">All Statuses</option>
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>

    <select :value="modelValue.sort_by" @input="updateFilter('sort_by', $event.target.value)">
      <option value="scheduled_date">Sort by Date</option>
      <option value="created_at">Sort by Booking Created</option>
      <option value="status">Sort by Status</option>
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
