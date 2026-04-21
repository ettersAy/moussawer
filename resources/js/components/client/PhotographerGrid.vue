<script setup>
import PhotographerCard from './PhotographerCard.vue'

const props = defineProps({
  photographers: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="photographer-grid">
    <template v-if="loading">
      <div
        v-for="i in 6"
        :key="i"
        class="photographer-card skeleton skeleton-card"
      ></div>
    </template>

    <template v-else-if="photographers.length > 0">
      <PhotographerCard
        v-for="photographer in photographers"
        :key="photographer.id"
        :photographer="photographer"
      />
    </template>

    <div v-else class="photographer-grid__empty">
      <p>No photographers found matching your criteria.</p>
    </div>
  </div>
</template>
