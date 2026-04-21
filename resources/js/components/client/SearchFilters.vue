<script setup>
const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'clear'])

// Mock categories for now, could be fetched from API in a real app
const categories = [
  'Wedding',
  'Portrait',
  'Event',
  'Product',
  'Fashion',
  'Real Estate'
]

const onFilterChange = () => {
  emit('update', props.filters)
}
</script>

<template>
  <div class="search-filters">
    <h2 class="search-filters__title">Filters</h2>

    <div class="search-filters__group">
      <label class="search-filters__label">Category</label>
      <select
        class="search-filters__select"
        v-model="filters.category"
        @change="onFilterChange"
      >
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
    </div>

    <div class="search-filters__group">
      <label class="search-filters__label">Price Range (per hour)</label>
      <div class="search-filters__price-inputs">
        <input
          type="number"
          class="search-filters__input"
          placeholder="Min"
          v-model="filters.min_price"
          @change="onFilterChange"
        >
        <input
          type="number"
          class="search-filters__input"
          placeholder="Max"
          v-model="filters.max_price"
          @change="onFilterChange"
        >
      </div>
    </div>

    <div class="search-filters__actions">
      <button class="btn btn--outline" @click="emit('clear')">
        Clear All Filters
      </button>
    </div>
  </div>
</template>
