<script setup>
import { onMounted } from 'vue'
import { usePhotographerSearch } from '@/composables/usePhotographerSearch'
import SearchBar from '@/components/client/SearchBar.vue'
import SearchFilters from '@/components/client/SearchFilters.vue'
import PhotographerGrid from '@/components/client/PhotographerGrid.vue'

const {
  photographers,
  filters,
  loading,
  errors,
  fetchPhotographers,
  updateFilters,
  clearFilters
} = usePhotographerSearch()

onMounted(() => {
  fetchPhotographers()
})
</script>

<template>
  <div class="search-discovery">
    <header class="search-discovery__header">
      <h1 class="search-discovery__title">Discover Photographers</h1>
      <p class="search-discovery__subtitle">Find the perfect professional for your next shoot</p>
    </header>

    <div class="search-discovery__content">
      <aside class="search-discovery__sidebar">
        <SearchFilters
          :filters="filters"
          @update="updateFilters"
          @clear="clearFilters"
        />
      </aside>

      <main class="search-discovery__main">
        <SearchBar
          v-model:location="filters.location"
          @search="fetchPhotographers"
        />

        <div v-if="errors" class="alert alert--danger">
          {{ errors }}
        </div>

        <PhotographerGrid
          :photographers="photographers"
          :loading="loading"
        />
      </main>
    </div>
  </div>
</template>
