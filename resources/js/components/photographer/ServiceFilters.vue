<template>
  <div class="filters-panel">
    <select :value="filters.status" @change="updateFilter('status', $event.target.value)">
      <option value="">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
    <select :value="filters.sort_by" @change="updateFilter('sort_by', $event.target.value)">
      <option value="sort_order">Sort by Order </option>
      <option value="name">Sort by Name</option>
      <option value="price">Sort by Price</option>
      <option value="created_at">Sort by Date</option>
    </select>
    <select :value="filters.sort_direction" @change="updateFilter('sort_direction', $event.target.value)">
      <option value="asc">Ascending </option>
      <option value="desc">Descending</option>
    </select>
  </div>
</template>

<script setup>
const props = defineProps({
  filters: Object
})
const emit = defineEmits(['change'])

const updateFilter = (key, value) => {
  const newFilters = { ...props.filters, [key]: value }
  emit('change', newFilters)
}
</script>