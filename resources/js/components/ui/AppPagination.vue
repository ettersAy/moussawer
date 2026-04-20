<template>
  <div class="pagination" v-if="totalPages > 1">
    <div class="page-info">
      Page {{ currentPage }} of {{ totalPages }} 
    </div>
    <div>
      <button 
        class="btn-page" 
        @click="$emit('change', currentPage - 1)" 
        :disabled="currentPage === 1"
      >
        Previous
      </button>
      <button 
        class="btn-page" 
        @click="$emit('change', currentPage + 1)" 
        :disabled="currentPage === totalPages"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentPage: Number,
  totalPages: Number
})
defineEmits(['change'])
</script>