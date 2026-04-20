<template>
  <div class="admin-page-header">
    <div class="header-titles">
      <h1>Manage Services & Rates</h1>
      <p class="subtitle" v-if="total">Showing {{ count }} of {{ total }} services</p>
    </div>
    
    <div class="header-actions">
      <div class="search-box">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          type="text" 
          :value="modelValue" 
          @input="$emit('update:modelValue', $event.target.value)"
          placeholder="Search service name..." 
          @keyup.enter="$emit('search')"
        />
        <button v-if="modelValue" class="clear-search" @click="$emit('clear')">&times;</button>
      </div>
      <button class="btn-primary" @click="$emit('add')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Service
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  total: Number,
  count: Number
})
defineEmits(['update:modelValue', 'search', 'clear', 'add'])
</script>