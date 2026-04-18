<template>
  <div v-if="loading" class="loading">Loading your portfolio...</div>
  
  <div v-else-if="items.length === 0" class="empty-state">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
    <h3>No photos yet</h3>
    <p>Upload your first photo to start building your portfolio.</p>
  </div>

  <div v-else class="portfolio-grid">
    <div v-for="item in items" :key="item.id" class="portfolio-item">
      <img :src="item.image_full_url" :alt="item.title" class="portfolio-image" />
      <div class="portfolio-overlay">
        <div class="portfolio-info">
          <h4>{{ item.title }}</h4>
          <p v-if="item.description">{{ item.description }}</p>
          <div class="portfolio-meta" v-if="item.category || (item.tags && item.tags.length)">
            <span class="category-badge" v-if="item.category">{{ item.category }}</span>
            <span class="tag-badge" v-for="tag in item.tags" :key="tag">#{{ tag }}</span>
          </div>
        </div>
        <div class="portfolio-actions">
          <button class="btn-edit" @click="$emit('edit', item)" title="Edit Photo">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-delete" @click="$emit('delete', item.id)" title="Delete Photo">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false }
})

defineEmits(['edit', 'delete'])
</script>
